"use client";

import { getSession } from "next-auth/react";
import GithubLogin from "../components/githublogin/githublogin";

export default function LoginPage() {
  return (
    <main>
      <div className="heading">
        <h1>GitHub App Login</h1>
        <h2>Sign in with your GitHub account to continue.</h2>
      </div>
      <GithubLogin />
    </main>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}
