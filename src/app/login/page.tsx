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

    return (
        <main className="grid min-h-screen place-items-center p-4">
            <div className="card w-full max-w-sm">
                <h1 className="heading mb-2">Iniciar sesión</h1>
                <p className="subtle mb-6">Accede con Google para gestionar tus reservas.</p>
                <div className="flex justify-center">
                    <GoogleLogin
                        onSuccess={async (cred) => {
                            try {
                                setLoading(true);
                                const idToken = cred.credential;
                                if (!idToken) {
                                    toast.error("No recibimos el token de Google.");
                                    return;
                                }
                                const { data } = await axios.post(`${API}/auth/google`, { idToken });
                                setToken(data.token);
                                toast.success("¡Bienvenido!");
                                router.replace(from);
                            } catch (e: any) {
                                const msg = e?.response?.data?.message ?? "No se pudo iniciar sesión";
                                toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
                            } finally {
                                setLoading(false);
                            }
                        }}
                        onError={() => toast.error("Google login falló")}
                        useOneTap={false}
                        theme="outline"
                        size="large"
                        text={loading ? "signin_with" : undefined}
                    />
                </div>
            </div>
        </main>
    );
}
