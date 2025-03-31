"use client";
import { SessionProvider } from "next-auth/react";
import "../styles/globals.css";
import Header from "../components/header/header";
import Footer from "../components/footer/footer";

export default function App({ Component, pageProps }) {
  return (
    <SessionProvider session={pageProps.session}>
      <Header />
      <Component {...pageProps} />
      <Footer />
    </SessionProvider>
  );
}
