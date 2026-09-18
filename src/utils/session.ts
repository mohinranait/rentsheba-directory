import { cookies } from "next/headers";
import config from "@/lib/config";
import { jwtUtils } from "@/utils/jwt";

export type SessionUser = {
  userId: string;
  name?: string;
  email?: string;
  role?: string;
};

// Reads the currently signed-in user from the accessToken cookie. Used by the
// admin APIs to know who created / last reviewed a listing.
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) return null;

    const verified = jwtUtils.verifyToken(token, config.jwt_access_secret);

    if (!verified.success) return null;

    const payload = verified.data as SessionUser;

    return payload?.userId ? payload : null;
  } catch {
    return null;
  }
}