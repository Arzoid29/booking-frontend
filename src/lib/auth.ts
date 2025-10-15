"use client";
import Cookies from "js-cookie";

const KEY = "auth";

export function setToken(token: string) {
  Cookies.set(KEY, token, { sameSite: "lax", secure: false, expires: 7 });
}
export function getToken() {
  return Cookies.get(KEY) ?? null;
}
export function clearToken() {
  Cookies.remove(KEY);
}
export function isAuthed(): boolean {
  return !!getToken();
}
