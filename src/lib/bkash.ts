import config from "@/lib/config";
import { connectRedis } from "@/lib/radis";

export const REDIS_BKASH_TOKEN_KEY = "bkash:access-token";
const DEFAULT_TOKEN_TTL_SECONDS = 3500; // ~58 minutes (bKash token expires in 1 hour)

export type BkashConfig = {
  baseUrl: string;
  appKey: string;
  appSecret: string;
  username: string;
  password: string;
};

export type BkashToken = {
  token: string;
  expiresIn: number;
};

export type BkashPaymentIntent = {
  paymentID: string;
  bkashURL: string;
  callbackURL?: string;
  successCallbackURL?: string;
  failureCallbackURL?: string;
  cancelledCallbackURL?: string;
  amount: string;
  currency: string;
  intent: string;
  merchantInvoiceNumber: string;
  transactionStatus: string;
  statusCode?: string;
  statusMessage?: string;
};

export type BkashExecutedPayment = {
  paymentID: string;
  trxID: string;
  transactionStatus: string;
  amount: string;
  currency: string;
  intent: string;
  merchantInvoiceNumber?: string;
  customerMsisdn?: string;
  payerReference?: string;
  paymentExecuteTime?: string;
  statusCode?: string;
  statusMessage?: string;
};

export type BkashQueriedPayment = {
  paymentID: string;
  trxID?: string;
  transactionStatus: string;
  amount: string;
  currency: string;
  intent?: string;
  merchantInvoice?: string;
  verificationStatus?: string;
  payerReference?: string;
  paymentCreateTime?: string;
  statusCode?: string;
  statusMessage?: string;
};

export type BkashRefundedPayment = {
  refundTrxID?: string;
  trxID?: string;
  transactionStatus: string;
  amount: string;
  currency: string;
  statusCode?: string;
  statusMessage?: string;
};

export class BkashApiError extends Error {
  statusCode?: string;
  statusMessage?: string;
  rawResponse?: unknown;

  constructor(message: string, statusCode?: string, statusMessage?: string, rawResponse?: unknown) {
    super(message);
    this.name = "BkashApiError";
    this.statusCode = statusCode;
    this.statusMessage = statusMessage;
    this.rawResponse = rawResponse;
  }
}

// ---------------------------------------------------------------------------
// Reads bKash merchant credentials from environment variables
// ---------------------------------------------------------------------------
export function getBkashConfig(): BkashConfig | null {
  const baseUrl = config.bkash_base_url;
  const appKey = config.bkash_app_key;
  const appSecret = config.bkash_app_secret;
  const username = config.bkash_username;
  const password = config.bkash_password;

  if (!baseUrl || !appKey || !appSecret || !username || !password) {
    return null;
  }

  return { baseUrl, appKey, appSecret, username, password };
}

// In-flight token request promise to prevent race condition when multiple requests
// need a token simultaneously on cold cache.
let inFlightTokenPromise: Promise<BkashToken> | null = null;

// ---------------------------------------------------------------------------
// Remove cached token from Redis
// ---------------------------------------------------------------------------
export async function clearCachedBkashToken(): Promise<void> {
  try {
    const redis = await connectRedis();
    await redis.del(REDIS_BKASH_TOKEN_KEY);
    console.log("[bKash] Evicted cached token from Redis");
  } catch (error) {
    console.error("[bKash] Error evicting token from Redis:", error);
  }
}

// ---------------------------------------------------------------------------
// Get bKash access token (checks Redis first, fetches from bKash if expired/missing)
// ---------------------------------------------------------------------------
export async function getBkashToken(forceRefresh = false): Promise<BkashToken> {
  const bkashConfig = getBkashConfig();

  if (!bkashConfig) {
    throw new BkashApiError("bKash credentials are not configured", "CONFIG_MISSING");
  }

  // 1. Check Redis if not forcing refresh
  if (!forceRefresh) {
    try {
      const redis = await connectRedis();
      const cached = await redis.get(REDIS_BKASH_TOKEN_KEY);

      if (cached) {
        const parsed = JSON.parse(cached) as BkashToken;
        if (parsed?.token) {
          return parsed;
        }
      }
    } catch (redisError) {
      console.warn("[bKash] Redis read token warning (falling back to API):", redisError);
    }
  }

  // 2. Handle concurrent in-flight requests
  if (inFlightTokenPromise) {
    return inFlightTokenPromise;
  }

  inFlightTokenPromise = (async () => {
    try {
      // Double check Redis after entering lock
      if (!forceRefresh) {
        try {
          const redis = await connectRedis();
          const cached = await redis.get(REDIS_BKASH_TOKEN_KEY);
          if (cached) {
            const parsed = JSON.parse(cached) as BkashToken;
            if (parsed?.token) {
              return parsed;
            }
          }
        } catch {
          // ignore redis error and proceed to grant
        }
      }

      console.log("[bKash] Requesting new access token from bKash API...");
      const grantUrl = `${bkashConfig.baseUrl.replace(/\/+$/, "")}/tokenized/checkout/token/grant`;

      const response = await fetch(grantUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          username: bkashConfig.username,
          password: bkashConfig.password,
        },
        body: JSON.stringify({
          app_key: bkashConfig.appKey,
          app_secret: bkashConfig.appSecret,
        }),
        cache: "no-store",
      });

      const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;

      if (!response.ok || !data.id_token || (data.statusCode && data.statusCode !== "0000")) {
        const message =
          (data.statusMessage as string) ||
          (data.message as string) ||
          "Failed to grant bKash access token";
        console.error("[bKash] Token grant failed:", response.status, data);
        throw new BkashApiError(message, data.statusCode as string, data.statusMessage as string, data);
      }

      const idToken = String(data.id_token);
      const expiresIn = Number(data.expires_in ?? 3600);
      const ttl = Math.max(300, expiresIn > 120 ? expiresIn - 120 : DEFAULT_TOKEN_TTL_SECONDS);

      const tokenData: BkashToken = {
        token: idToken,
        expiresIn: ttl,
      };

      // Store in Redis
      try {
        const redis = await connectRedis();
        await redis.set(REDIS_BKASH_TOKEN_KEY, JSON.stringify(tokenData), {
          expiration: {
            type: "EX",
            value: ttl,
          },
        });
        console.log(`[bKash] Cached new token in Redis with TTL: ${ttl}s`);
      } catch (redisWriteError) {
        console.error("[bKash] Failed to cache token in Redis:", redisWriteError);
      }

      return tokenData;
    } finally {
      inFlightTokenPromise = null;
    }
  })();

  return inFlightTokenPromise;
}

// ---------------------------------------------------------------------------
// Helper to detect if a bKash response indicates an auth/token failure
// ---------------------------------------------------------------------------
function isTokenAuthError(statusCode?: string, statusMessage?: string, httpStatus?: number): boolean {
  if (httpStatus === 401 || httpStatus === 403) return true;

  const code = String(statusCode ?? "");
  // bKash Tokenized Checkout error codes:
  // 2004: Invalid token
  // 2005: Token expired
  // 2006: Token does not exist
  // 2008: Unauthorized
  // 2009: Invalid app key / token
  if (["2004", "2005", "2006", "2008", "2009"].includes(code)) return true;

  const msg = String(statusMessage ?? "").toLowerCase();
  if (msg.includes("token") && (msg.includes("expired") || msg.includes("invalid") || msg.includes("not found"))) {
    return true;
  }
  if (msg.includes("unauthorized") || msg.includes("unauthenticated")) {
    return true;
  }

  return false;
}

// ---------------------------------------------------------------------------
// Internal fetcher with automatic token refresh on auth failure (max 1 retry)
// ---------------------------------------------------------------------------
async function bkashRequest<T>(
  endpointPath: string,
  bodyPayload: Record<string, unknown>,
  isRetry = false,
): Promise<T> {
  const bkashConfig = getBkashConfig();

  if (!bkashConfig) {
    throw new BkashApiError("BKASH_NOT_CONFIGURED", "CONFIG_MISSING");
  }

  const { token } = await getBkashToken(isRetry);
  const cleanPath = endpointPath.startsWith("/") ? endpointPath : `/${endpointPath}`;
  const url = `${bkashConfig.baseUrl.replace(/\/+$/, "")}${cleanPath}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: token,
      "X-App-Key": bkashConfig.appKey,
    },
    body: JSON.stringify(bodyPayload),
    cache: "no-store",
  });

  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;

  const statusCode = String(data.statusCode ?? "");
  const statusMessage = String(data.statusMessage ?? "");

  // If token expired or invalid and we haven't retried yet:
  if (!isRetry && isTokenAuthError(statusCode, statusMessage, response.status)) {
    console.warn(`[bKash] Token error detected (${statusCode}: ${statusMessage}). Evicting token and retrying once...`);
    await clearCachedBkashToken();
    return bkashRequest<T>(endpointPath, bodyPayload, true);
  }

  // Handle errors
  if (!response.ok || (statusCode && statusCode !== "0000")) {
    console.error(`[bKash] Request error on ${cleanPath}:`, response.status, data);
    const errorMsg = statusMessage || (data.message as string) || "bKash request failed";
    throw new BkashApiError(errorMsg, statusCode, statusMessage, data);
  }

  return data as T;
}

// ---------------------------------------------------------------------------
// 1. Create Payment
// ---------------------------------------------------------------------------
export async function createBkashPayment({
  amount,
  invoiceNumber,
  callbackURL,
  payerReference,
}: {
  amount: number | string;
  invoiceNumber: string;
  callbackURL: string;
  payerReference?: string;
}): Promise<BkashPaymentIntent> {
  const formattedAmount = typeof amount === "number" ? amount.toFixed(2) : Number(amount).toFixed(2);

  const data = await bkashRequest<Record<string, unknown>>("/tokenized/checkout/create", {
    mode: "0011",
    payerReference: payerReference || invoiceNumber,
    callbackURL,
    amount: formattedAmount,
    currency: "BDT",
    intent: "sale",
    merchantInvoiceNumber: invoiceNumber,
  });

  if (!data.paymentID || !data.bkashURL) {
    throw new BkashApiError("bKash payment creation did not return paymentID or bkashURL", String(data.statusCode), String(data.statusMessage), data);
  }

  return {
    paymentID: String(data.paymentID),
    bkashURL: String(data.bkashURL),
    callbackURL: data.callbackURL ? String(data.callbackURL) : undefined,
    successCallbackURL: data.successCallbackURL ? String(data.successCallbackURL) : undefined,
    failureCallbackURL: data.failureCallbackURL ? String(data.failureCallbackURL) : undefined,
    cancelledCallbackURL: data.cancelledCallbackURL ? String(data.cancelledCallbackURL) : undefined,
    amount: String(data.amount ?? formattedAmount),
    currency: String(data.currency ?? "BDT"),
    intent: String(data.intent ?? "sale"),
    merchantInvoiceNumber: String(data.merchantInvoiceNumber ?? invoiceNumber),
    transactionStatus: String(data.transactionStatus ?? "Initiated"),
    statusCode: data.statusCode ? String(data.statusCode) : undefined,
    statusMessage: data.statusMessage ? String(data.statusMessage) : undefined,
  };
}

// ---------------------------------------------------------------------------
// 2. Execute Payment
// ---------------------------------------------------------------------------
export async function executeBkashPayment({
  paymentID,
}: {
  paymentID: string;
}): Promise<BkashExecutedPayment> {
  const data = await bkashRequest<Record<string, unknown>>("/tokenized/checkout/execute", {
    paymentID,
  });

  const transactionStatus = String(data.transactionStatus ?? "");

  if (data.statusCode && data.statusCode !== "0000") {
    throw new BkashApiError(
      String(data.statusMessage ?? "bKash execute failed"),
      String(data.statusCode),
      String(data.statusMessage),
      data,
    );
  }

  return {
    paymentID: String(data.paymentID ?? paymentID),
    trxID: String(data.trxID ?? ""),
    transactionStatus,
    amount: String(data.amount ?? ""),
    currency: String(data.currency ?? "BDT"),
    intent: String(data.intent ?? "sale"),
    merchantInvoiceNumber: data.merchantInvoiceNumber ? String(data.merchantInvoiceNumber) : undefined,
    customerMsisdn: data.customerMsisdn ? String(data.customerMsisdn) : undefined,
    payerReference: data.payerReference ? String(data.payerReference) : undefined,
    paymentExecuteTime: data.paymentExecuteTime ? String(data.paymentExecuteTime) : undefined,
    statusCode: data.statusCode ? String(data.statusCode) : undefined,
    statusMessage: data.statusMessage ? String(data.statusMessage) : undefined,
  };
}

// ---------------------------------------------------------------------------
// 3. Query Payment Status
// ---------------------------------------------------------------------------
export async function queryBkashPayment({
  paymentID,
}: {
  paymentID: string;
}): Promise<BkashQueriedPayment> {
  const data = await bkashRequest<Record<string, unknown>>("/tokenized/checkout/payment/status", {
    paymentID,
  });

  return {
    paymentID: String(data.paymentID ?? paymentID),
    trxID: data.trxID ? String(data.trxID) : undefined,
    transactionStatus: String(data.transactionStatus ?? ""),
    amount: String(data.amount ?? ""),
    currency: String(data.currency ?? "BDT"),
    intent: data.intent ? String(data.intent) : undefined,
    merchantInvoice: data.merchantInvoice ? String(data.merchantInvoice) : undefined,
    verificationStatus: data.verificationStatus ? String(data.verificationStatus) : undefined,
    payerReference: data.payerReference ? String(data.payerReference) : undefined,
    paymentCreateTime: data.paymentCreateTime ? String(data.paymentCreateTime) : undefined,
    statusCode: data.statusCode ? String(data.statusCode) : undefined,
    statusMessage: data.statusMessage ? String(data.statusMessage) : undefined,
  };
}

// ---------------------------------------------------------------------------
// 4. Refund Payment
// ---------------------------------------------------------------------------
export async function refundBkashPayment({
  paymentID,
  trxID,
  amount,
  reason = "Subscription cancellation refund",
  sku = "subscription",
}: {
  paymentID: string;
  trxID: string;
  amount: number | string;
  reason?: string;
  sku?: string;
}): Promise<BkashRefundedPayment> {
  const formattedAmount = typeof amount === "number" ? amount.toFixed(2) : Number(amount).toFixed(2);

  const data = await bkashRequest<Record<string, unknown>>("/tokenized/checkout/payment/refund", {
    paymentID,
    trxID,
    amount: formattedAmount,
    reason,
    sku,
  });

  return {
    refundTrxID: data.refundTrxID ? String(data.refundTrxID) : undefined,
    trxID: data.trxID ? String(data.trxID) : trxID,
    transactionStatus: String(data.transactionStatus ?? "Completed"),
    amount: String(data.amount ?? formattedAmount),
    currency: String(data.currency ?? "BDT"),
    statusCode: data.statusCode ? String(data.statusCode) : undefined,
    statusMessage: data.statusMessage ? String(data.statusMessage) : undefined,
  };
}

// ---------------------------------------------------------------------------
// Builds a unique merchant invoice number
// ---------------------------------------------------------------------------
export function generateInvoiceNumber(): string {
  return `SUB${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
}
