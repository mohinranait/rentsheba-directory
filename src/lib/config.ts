const clean = (val?: string) => (val ? val.trim() : undefined);

export default {
  app_url: clean(process.env.APP_URL),
  bcrypt_salt_rounds: clean(process.env.BCRYPT_SALT_ROUNDS),
  jwt_access_secret: clean(process.env.JWT_ACCESS_SECRET)!,
  jwt_refresh_secret: clean(process.env.JWT_REFRESH_SECRET),
  jwt_access_expires_in: clean(process.env.JWT_ACCESS_EXPIRES_IN),
  jwt_refresh_expires_in: clean(process.env.JWT_REFRESH_EXPIRES_IN),

  radis_user: clean(process.env.RADIS_USER),
  radis_password: clean(process.env.RADIS_PASSWORD),
  radis_host: clean(process.env.RADIS_HOST),
  radis_port: clean(process.env.RADIS_PORT),

  smtp_user: clean(process.env.SMTP_USER),
  smtp_pass: clean(process.env.SMTP_PASS),
  email_sender: clean(process.env.EMAIL_SENDER),

  cloudinary_name: clean(process.env.CLOUDINARY_NAME),
  cloudinary_key: clean(process.env.CLOUDINARY_KEY),
  cloudinary_SECRET: clean(process.env.CLOUDINARY_SECRET),

  bkash_base_url: clean(process.env.BKASH_BASE_URL),
  bkash_app_key: clean(process.env.BKASH_APP_KEY),
  bkash_app_secret: clean(process.env.BKASH_APP_SECRET),
  bkash_username: clean(process.env.BKASH_USERNAME),
  bkash_password: clean(process.env.BKASH_PASSWORD),
  bkash_callback_url: clean(process.env.BKASH_CALLBACK_URL),
  // "test" simulates a payment without hitting the bKash API,
  // "sandbox" uses the bKash sandbox, "live" uses production.
  bkash_mode: clean(process.env.BKASH_MODE),
};
