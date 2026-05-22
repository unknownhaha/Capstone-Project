"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email    = formData.get("email")    as string;
  const password = formData.get("password") as string;
  const callbackUrl = (formData.get("callbackUrl") as string) || "/allproject";

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,   
    });
  } catch (err) {
    if (err instanceof AuthError) {
      switch (err.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password." };
        default:
          return { error: "Something went wrong. Try again." };
      }
    }
    throw err;
  }

  redirect(callbackUrl.startsWith("/") ? callbackUrl : "/allproject");
}