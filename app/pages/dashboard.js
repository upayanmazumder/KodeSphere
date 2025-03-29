"use client"; 

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import API_URL from "../shared/api";

export default function Dashboard() {
  const { data: session } = useSession();
  const [repos, setRepos] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.push("/login");
    } else {
      fetch(`${API_URL}/github/repos`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Fetched Repositories:", data.repos);
          setRepos(data.repos || []);
        })
        .catch((err) => console.error("Error fetching repos:", err));
    }
  }, [session, router]);

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Your Repositories</h1>
        <button onClick={handleLogout} style={{ marginBottom: '20px', color: 'white' }}>Logout</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
        {repos.map((repo) => (
          <div key={repo.id} className="repo-tile">
            <h2>{repo.name}</h2>
            <p>Full Name: {repo.full_name}</p>

            <p>Repo ID: {repo.id}</p>
            <button 
              onClick={() => window.open(process.env.NEXT_PUBLIC_GITHUB_APP_INSTALL_URL, '_blank')} 
              style={{ marginTop: '10px', color: 'white' }}
            >
              Link GitHub App
            </button>
          </div>
        ))}
      </div>
      <p>Username: {session?.user.login}</p>
      <p>GitHub Email: {session?.user.email}</p>
      <image src={session?.user.image}></image>
      <a href={process.env.NEXT_PUBLIC_GITHUB_APP_INSTALL_URL}>Sign in</a>
    </div>
  );
}