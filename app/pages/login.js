"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  return (
    <div>
      <div>
        <h1>Welcome to KodeSphere</h1>
        <p>Sign in with GitHub to continue.</p>
        <button onClick={() => signIn("github")}>Sign in with GitHub</button>
      </div>
    </div>
  );
}
