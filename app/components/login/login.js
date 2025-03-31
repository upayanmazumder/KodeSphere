"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { BiLogoGithub } from "react-icons/bi";

export default function Login() {
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
        <p>Sign in to continue.</p>
        <button onClick={() => signIn("github")}>
          <BiLogoGithub />
        </button>
      </div>
    </div>
  );
}
