"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import API_URL from "../shared/api";
import styles from "../styles/dashboard.module.css";

export default function Dashboard() {
  const { data: session } = useSession();
  const [repos, setRepos] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.push("/login");
    } else {
      const githubUserId = session?.user?.id;
      if (!githubUserId) {
        console.error("GitHub user ID is missing from session data.");
        return;
      }

      fetch(`${API_URL}/github/repos?githubUserId=${githubUserId}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Fetched Repositories:", data.repos);
          setRepos(data.repos || []);
        })
        .catch((err) => console.error("Error fetching repos:", err));
    }
  }, [session, router]);

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  const handleSetupDocker = async (repoName) => {
    try {
      const response = await fetch(`${API_URL}/analyze-repo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ repoUrl: `https://github.com/${repoName}` }),
      });
      const data = await response.json();
      if (data.dockerfile || data.dockerCompose) {
        let message = "Suggested Docker configurations:\n\n";
        if (data.dockerfile) {
          message += `Dockerfile:\n${data.dockerfile}\n\n`;
        }
        if (data.dockerCompose) {
          message += `Docker Compose:\n${data.dockerCompose}`;
        }
        alert(message);
      } else {
        alert("No Docker file suggestions available for this repository.");
      }
    } catch (err) {
      console.error("Error analyzing repository:", err);
      alert("Failed to analyze the repository.");
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.sidebar}>
        <div className={styles.logo}>KodeSphere</div>
        <div className={styles.navItems}>
          <button className={styles.navButton}>Dashboard</button>
          <button className={styles.navButton}>Repositories</button>
          <button className={styles.navButton}>Deployments</button>
          <button className={styles.navButton}>Settings</button>
        </div>
        <button className={styles.logoutButton} onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className={styles.mainContent}>
        <h1 className={styles.welcomeText}>
          Welcome back, {session?.user?.name}!
        </h1>
        <input
          type="text"
          placeholder="Search repositories and projects..."
          className={styles.searchBar}
        />

        <h2 className={styles.projectsHeading}>Projects</h2>

        <div className={styles.repoGrid}>
          {repos.map((repo) => (
            <div key={repo.id} className={styles.repoCard}>
              <h2>{repo.name}</h2>
              <p>Repo Name: {repo.full_name}</p>
              <p>Repo ID: {repo.id}</p>
              <button
                onClick={() => handleSetupDocker(repo.full_name)}
                className={styles.setupDockerButton}
              >
                Setup Docker
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
