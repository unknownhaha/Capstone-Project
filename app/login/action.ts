"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

function signInFailed(result: unknown) {
  if (typeof result !== "string" || !result) return true;
  return result.includes("error=");
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const callbackUrl = String(formData.get("callbackUrl") ?? "/allproject");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      redirectTo: callbackUrl,
    });

    if (signInFailed(result)) {
      return { error: "Invalid email or password." };
    }
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

  redirect(callbackUrl);
}
