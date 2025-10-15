"use client";


import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Navbar from "./components/NavBar";
import BookingFormCard from "./components/BookingFormCard";

type Booking = { id: string; title: string; startAt: string; endAt: string; };

export default function Dashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get<Booking[]>("/bookings/me");
      setBookings(data);
    } catch {
      toast.error("No pude cargar tus reservas");
    }
  };

  useEffect(() => { load(); }, []);

  const createBooking = async ({ title, startAtISO, endAtISO }: { title: string; startAtISO: string; endAtISO: string; }) => {
    setLoading(true);
    try {
      await api.post("/bookings", { title, startAt: startAtISO, endAt: endAtISO });
      await load();
      toast.success("Reserva creada");
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Error creando reserva");
    } finally {
      setLoading(false);
    }
  };

  const del = async (id: string) => {
    try {
      await api.delete(`/bookings/${id}`);
      await load();
      toast.success("Reserva cancelada");
    } catch {
      toast.error("No se pudo cancelar");
    }
  };

  return (
    <>
      <Navbar />
      <main className="container py-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <BookingFormCard onSubmit={createBooking} loading={loading} />
          </div>

          <section className="lg:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="heading">Mis reservas</h2>
              <button className="btn-ghost" onClick={load}>Refrescar</button>
            </div>

            {bookings.length === 0 ? (
              <p className="subtle">No tienes reservas.</p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {bookings.map((b) => (
                  <li key={b.id} className="card">
                    <div className="mb-2 font-medium">{b.title}</div>
                    <div className="subtle space-y-1">
                      <div>Inicio: {new Date(b.startAt).toLocaleString()}</div>
                      <div>Fin: {new Date(b.endAt).toLocaleString()}</div>
                    </div>
                    <button className="btn mt-3 w-full" onClick={() => del(b.id)}>
                      Cancelar
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
