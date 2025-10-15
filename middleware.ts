// middleware.ts (en la raíz del frontend)
import { NextResponse, type NextRequest } from "next/server";

// Rutas públicas mínimas (login y activos estáticos)
const PUBLIC_PATHS = ["/login"];

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  const token = req.cookies.get("auth")?.value;

  const isAsset =
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/fonts/");

  // 1) Permitir estáticos siempre
  if (isAsset) return NextResponse.next();

  // 2) Si NO hay token y no estás en /login => redirige a /login
  if (!token && pathname !== "/login") {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    // guarda a dónde iba el user
    url.searchParams.set("from", pathname + (searchParams.size ? `?${searchParams.toString()}` : ""));
    return NextResponse.redirect(url);
  }

  // 3) Si SÍ hay token y estás en /login => mándalo al home
  if (token && pathname === "/login") {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Aplica a todo menos activos estáticos (más robusto que una whitelist larga)
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
