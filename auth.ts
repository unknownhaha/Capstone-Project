import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { CredentialsSignin } from "next-auth";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/lib/model/user";
import { authConfig } from "@/auth.config";
import { isLegacyUser } from "@/lib/auth-otp";

class EmailNotVerifiedError extends CredentialsSignin {
  code = "email_not_verified";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) return null;

          const email = String(credentials.email).trim().toLowerCase();
          const password = String(credentials.password);

          await connectDB();

          const user = await User.findOne({
            "contact.email": email,
          }).select("+password isEmailVerified createdAt");

          if (!user?.password) return null;

          const isValid = await bcrypt.compare(password, user.password);
          if (!isValid) return null;

          const mustVerify = user.isEmailVerified === false;
          if (mustVerify && !isLegacyUser(user.createdAt)) {
            throw new EmailNotVerifiedError();
          }

          return {
            id: user._id.toString(),
            email: user.contact.email,
            name: `${user.firstName} ${user.lastName}`,
            image: user.profileImg ?? null,
          };
        } catch (error) {
          if (error instanceof CredentialsSignin) {
            throw error;
          }
          console.error("[auth] credentials authorize failed:", error);
          return null;
        }
      },
    }),
  ],
});
