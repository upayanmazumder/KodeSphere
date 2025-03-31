"use client";

import { useSession } from "next-auth/react";
import Loading from "../Loading/Loading";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API_URL from "../../shared/api";
import styles from "./dashboard.module.css";

export default function Dashboard() {
  const { data: session } = useSession();
  const [repos, setRepos] = useState([]);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (!session) {
      router.push("/login");
    } else {
      const githubUserId = session?.user?.id;
      if (!githubUserId) {
        console.error("GitHub user ID missing.");
        return;
      }
      fetch(`${API_URL}/github/repos?githubUserId=${githubUserId}`)
        .then((res) => res.json())
        .then((data) => setRepos(data.repos || []))
        .catch((err) => console.error("Error fetching repos:", err))
        .finally(() => setLoading(false));
    }
  }, [session, router]);

  const handleAnalyzeRepo = async (repoName) => {
    const repoUrl = `https://github.com/${repoName}`;
    try {
      const response = await fetch(`${API_URL}/analyze-repo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to analyze.");
      alert(
        `Suggested Docker configurations:\n\n${
          data.dockerfile ? `Dockerfile:\n${data.dockerfile}\n\n` : ""
        }${data.dockerCompose ? `Docker Compose:\n${data.dockerCompose}` : ""}`
      );
    } catch (err) {
      alert(`Failed to analyze: ${err.message}`);
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.mainContent}>
        {loading && <Loading />}
        <h1 className={styles.welcomeText}>
          Welcome back, {session?.user?.name}!
        </h1>
        <input
          type="text"
          placeholder="Search repositories..."
          className={styles.searchBar}
        />

        <h2 className={styles.projectsHeading}>Projects</h2>
        <div className={styles.repoList}>
          {repos.map((repo) => (
            <div key={repo.id} className={styles.repoTile}>
              <div className={styles.repoInfo}>
                <strong>{repo.name}</strong>
                <span className={styles.repoFullName}>{repo.full_name}</span>
              </div>
              <button
                onClick={() => handleAnalyzeRepo(repo.full_name)}
                className={styles.analyzeButton}
              >
                Analyze Repo
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.profileContainer}>
        <img
          src={session?.user?.image}
          alt="Profile"
          className={styles.profileImage}
        />
        <p className={styles.username}>@{session?.user?.name}</p>
        <button className={styles.installButton}>Install GitHub</button>
      </div>
    </div>
  );
}
