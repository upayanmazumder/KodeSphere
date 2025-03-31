"use client";

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
