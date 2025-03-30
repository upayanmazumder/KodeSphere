"use client";

import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";

import "../styles/globals.css";
import "../styles/app.css";
import "bootstrap/dist/css/bootstrap.min.css";

import Navbar from "./navbar";

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Dynamically import Bootstrap JS (client-side only)
    import("bootstrap/dist/js/bootstrap.bundle.min");
  }, []);

  return (
    <SessionProvider session={pageProps.session}>
      <Navbar />
      <Component {...pageProps} />
    </SessionProvider>
  );
}
