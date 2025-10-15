"use client";

import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import Navbar from "../components/NavBar";

export default function CalendarPage() {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);

  const checkStatus = async () => {
    try {
      setChecking(true);
      const { data } = await api.get<{ connected: boolean }>("/calendar/status");
      setConnected(data.connected);
    } catch {
      toast.error("No pude verificar el estado de Calendar");
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => { checkStatus(); }, []);

  const connect = async () => {
    try {
      const { data } = await api.get<{ url: string }>("/calendar/connect");
      window.open(data.url, "_blank", "noopener,noreferrer");
      toast("Autoriza en la pestaña nueva y vuelve aquí.");
    } catch {
      toast.error("No se pudo iniciar la conexión con Calendar");
    }
  };

  const disconnect = async () => {
    try {
      await api.post("/calendar/disconnect");
      toast.success("Calendar desconectado");
      checkStatus();
    } catch {
      toast.error("No se pudo desconectar");
    }
  };

  return (
    <>
      <Navbar />
      <main className="container py-6">
        <div className="card">
          <div className="mb-2 flex items-center justify-between">
            <h1 className="heading">Google Calendar</h1>
            <button className="btn-ghost text-sm" onClick={checkStatus} disabled={checking}>
              {checking ? "Comprobando..." : "Refrescar estado"}
            </button>
          </div>

          {connected === null ? (
            <p className="subtle">Cargando estado…</p>
          ) : connected ? (
            <div className="space-y-3">
              <p className="subtle">
                ✅ <b>Conectado.</b> Ya validamos choques con tu agenda al crear reservas.
              </p>
              <div className="flex gap-3">
                <button className="btn" onClick={connect}>
                  Reautorizar / Cambiar cuenta
                </button>
                <button className="btn-ghost" onClick={disconnect}>
                  Desconectar
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="subtle">
                Para bloquear reservas que choquen con tu agenda, conecta tu Google Calendar (solo lectura).
              </p>
              <button className="btn" onClick={connect}>Conectar mi Google Calendar</button>
              <p className="subtle">¿Ya autorizaste en la otra pestaña? <button className="btn-ghost" onClick={checkStatus}>Comprobar conexión</button></p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
