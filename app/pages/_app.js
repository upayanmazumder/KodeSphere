"use client";
import { SessionProvider } from "next-auth/react";
import "../styles/globals.css"; // Ensure styles are imported

export default function App({ Component, pageProps }) {
  return (
    <SessionProvider session={pageProps.session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}
