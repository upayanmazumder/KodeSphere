"use client"; 
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function LoginPage() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/dashboard"); 
    }
  }, [session, router]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Welcome to KodeSphere</h1>
      <p>Sign in with GitHub to continue or <Link href="/signup">create an account</Link></p>

      <button onClick={() => signIn("github")}>Sign in with GitHub</button>
    </div>
  );
}
