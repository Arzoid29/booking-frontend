# Booking Web App (Next.js + Tailwind CSS)

[![Framework](https://img.shields.io/badge/framework-Next.js-black.svg)](https://nextjs.org/)
[![Language](https://img.shields.io/badge/language-TypeScript-blue.svg)](https://www.typescriptlang.org/)
[![UI Library](https://img.shields.io/badge/UI-Tailwind%20CSS-38B2AC.svg)](https://tailwindcss.com/)
[![Deployment](https://img.shields.io/badge/deployment-Docker-blue.svg)](https://www.docker.com/)

This is the frontend application for the booking system, built with **Next.js 15 (Turbopack)**, **React 19**, and styled with **Tailwind CSS**. It allows users to authenticate with Google, manage their bookings, and connect their Google Calendar.

## 📋 Table of Contents

1.  [Key Features](#-key-features)
2.  [Requirements](#-requirements)
3.  [Quick Start Guide](#-quick-start-guide)
4.  [Environment Setup](#-environment-setup)
5.  [Authentication Flow](#-authentication-flow)
6.  [Routing and Protection](#-routing-and-protection)
7.  [Key Components](#-key-components)
8.  [Deployment with Docker](#-deployment-with-docker)

---

## ✨ Key Features

* **Google Sign-In**: Integrates with _React OAuth Google_ to obtain an `idToken` and authenticate against the backend API.
* **Cookie-Based Session Management**: The user's session is managed via a JWT stored in an `auth` cookie.
* **Route Protection**: A **Middleware** (`middleware.ts`) protects routes that require authentication.
* **Bookings Dashboard**: An intuitive interface to **create, list, and delete** bookings. Actions communicate with the API and update the UI in real-time.
* **Google Calendar Integration**: A dedicated page for users to **connect and disconnect** their Google Calendar and view the connection status.
* **Responsive & User-Friendly UI**: Designed with **Tailwind CSS**, the interface is modern, clean, and adaptive to any device.
* **Notifications**: Uses `react-hot-toast` to provide instant user feedback for actions.

---

## 🔧 Requirements

* Node.js 18+
* PNPM (or NPM / Yarn)
* The [backend API](https://github.com/Arzoid29/api) must be running (defaults to `http://localhost:4000`).

---

## 🚀 Quick Start Guide

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/Arzoid29/booking-frontend.git](https://github.com/Arzoid29/booking-frontend.git)
    cd booking-frontend
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Set up environment variables:**
    Copy the example file and fill in the required values.
    ```bash
    cp .env.local.example .env.local
    ```

4.  **Start the development server:**
    The application will run using Turbopack for maximum performance.
    ```bash
    pnpm dev
    ```

    Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Environment Setup

Your `.env.local` file must contain the following variables:

```env
# Your Google Cloud application's Client ID.
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your_google_client_id"

# The base URL where the backend API is running.
NEXT_PUBLIC_API_URL="http://localhost:4000"
🔐 Authentication Flow
On the /login page, the GoogleLogin component from @react-oauth/google obtains an idToken from the user.

The frontend sends this idToken to the POST /auth/google endpoint on the API.

The API verifies the token and, if valid, returns a system-specific JWT.

The frontend receives this JWT and stores it in a cookie named auth for 7 days.

An axios interceptor automatically attaches the Authorization: Bearer <JWT> header to all future API requests.

🗺️ Routing and Protection
Route protection is centralized in the middleware.ts file at the project root.

Middleware Behavior:

If the auth cookie does not exist and the user tries to access a protected route (any route other than /login), they are redirected to /login. The original path is saved in the from query parameter to redirect them back after logging in.

If the auth cookie exists and the user tries to access /login, they are automatically redirected to the homepage (/).

Main Routes:

/login: The public Google Sign-In page.

/: The main protected dashboard where bookings are listed, created, and deleted.

/calendar: A protected page for connecting and disconnecting Google Calendar.

🧩 Key Components
BookingFormCard: A well-structured, reusable component containing all the logic for the booking creation form. It features:

Inline validation for the title and date range.

Automatic calculation of the end time based on the start time and selected duration.

"Today" and "Tomorrow" shortcuts.

Displays the user's detected timezone for clarity.

ConfirmDialog: A generic confirmation modal that overlays the background and manages focus, used for destructive actions like deleting a booking.

NavBar: A navigation bar that displays the main links and a "Log out" button if the user is authenticated.

Providers: A high-level component that wraps the application to provide the GoogleOAuthProvider context and the Toaster notification system.

🐳 Deployment with Docker
The project is ready for containerized deployment, leveraging Next.js's output: "standalone" feature.

Build the Docker image: Make sure you have your environment variables in a .env file or pass them as build arguments.

Bash

docker compose build
Run the container:

Bash

docker compose up -d
The frontend will be available at http://localhost:3000.

Dockerfile: Uses a multi-stage build to create a lean and optimized production image.

docker-compose.yml: Orchestrates the build and execution of the container, mapping port 3000 and passing the necessary environment variables at build time.
