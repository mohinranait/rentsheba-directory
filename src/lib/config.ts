// import dotenv from "dotenv";
// import path from "path";

// dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
	app_url : process.env.APP_URL,
	bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
	jwt_access_secret: process.env.JWT_ACCESS_SECRET!,
	jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
	jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
	jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,

	radis_user: process.env.RADIS_USER,
	radis_password: process.env.RADIS_PASSWORD,
	radis_host: process.env.RADIS_HOST,
	radis_port: process.env.RADIS_PORT,


	smtp_user: process.env.SMTP_USER,
	smtp_pass: process.env.SMTP_PASS,
	email_sender: process.env.EMAIL_SENDER,


	cloudinary_name: process.env.CLOUDINARY_NAME,
	cloudinary_key: process.env.CLOUDINARY_KEY,
	cloudinary_SECRET: process.env.CLOUDINARY_SECRET,

};
