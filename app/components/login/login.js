"use client";

import loginStyles from "./login.module.css";
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
    <div className={loginStyles.login}>
      <button onClick={() => signIn("github")} className={loginStyles.github}>
        Sign in using Github
        <BiLogoGithub style={{ marginLeft: "var(--padding-small)" }} />
      </button>
    </div>
  );
}
