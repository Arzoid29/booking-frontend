"use client";

import { GoogleLogin } from "@react-oauth/google";
import { setToken, getToken } from "@/lib/auth";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const from = useSearchParams().get("from") || "/";
  const API = process.env.NEXT_PUBLIC_API_URL!;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getToken()) router.replace("/");
  }, [router]);

  const handleSuccess = async (cred: any) => {
    try {
      setLoading(true);
      const idToken = cred?.credential;
      if (!idToken) {
        toast.error("We couldn't get a Google token. Please try again.");
        return;
      }

      const { data } = await axios.post(`${API}/auth/google`, { idToken });
      setToken(data.token);

      toast.success("Welcome back!");
      router.replace(from);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ??
        "We couldn't sign you in. Please try again.";
      toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleError = () => {
    toast.error("Google sign-in failed. Please try again.");
  };

  return (
    <main className="grid min-h-screen place-items-center p-4">
      <div className="card w-full max-w-sm">
        <h1 className="heading mb-2">Sign in</h1>
        <p className="subtle mb-6">
          Use your Google account to access your bookings.
        </p>

        <div className="flex justify-center">
          <div
            className={loading ? "pointer-events-none opacity-70" : ""}
            aria-busy={loading}
            aria-live="polite"
          >
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleError}
              useOneTap={false}
              theme="outline"
              size="large"
              text={loading ? "signin_with" : undefined}
            />
          </div>
        </div>

        <p className="subtle mt-4 text-center">
          We only use your email to identify your account. No posts, no
          surprises.
        </p>
      </div>
    </main>
  );
}
