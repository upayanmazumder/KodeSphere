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
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 w-96 text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome to KodeSphere</h1>
        <p className="text-gray-600 mb-6">Sign in with GitHub to continue.</p>
        <button
          onClick={() => signIn("github")}
          className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition duration-300"
        >
          Sign in with GitHub
        </button>
      </div>
    </div>
  );
}
