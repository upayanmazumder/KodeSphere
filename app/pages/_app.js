"use client";
import { SessionProvider } from "next-auth/react";
import "../styles/globals.css";
import Footer from "../components/footer/footer";

export default function App({ Component, pageProps }) {
  return (
    <SessionProvider session={pageProps.session}>
      <Component {...pageProps} />
      <Footer />
    </SessionProvider>
  );
}
