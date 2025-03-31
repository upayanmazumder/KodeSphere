"use client";
import { SessionProvider, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import "../styles/globals.css";
import Header from "../components/header/header";
import Sidebar from "../components/sidebar/sidebar";
import Footer from "../components/footer/footer";

function Layout({ children }) {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <>
      {router.pathname !== "/" && <Header />}
      {session && <Sidebar />}
      {children}
      {session && <Footer />}
    </>
  );
}

export default function App({ Component, pageProps }) {
  return (
    <SessionProvider session={pageProps.session}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SessionProvider>
  );
}
