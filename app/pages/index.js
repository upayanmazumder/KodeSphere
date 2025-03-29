"use client"; 
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const router = useRouter();

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Welcome to KodeSphere</h1>
      <p>
        Please <Link href="/login">log in</Link> or <Link href="/signup">sign up</Link> to continue.
      </p>
    </div>
  );
}
