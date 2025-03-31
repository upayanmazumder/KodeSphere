"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import API_URL from "../../shared/api";
import styles from "./dashboard.module.css";

export default function Dashboard() {
  const { data: session } = useSession();
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [files, setFiles] = useState(null);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [error, setError] = useState("");
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

  // 🔍 Search for files in a repo
  const handleSearchFiles = async (repoFullName) => {
    setLoadingFiles(true);
    setError("");
    setSelectedRepo(repoFullName);
    setFiles(null);

    try {
      const response = await fetch(
        `${API_URL}/github/search-files?owner=${
          repoFullName.split("/")[0]
        }&repo=${repoFullName.split("/")[1]}`
      );
      const data = await response.json();

      if (response.ok) {
        setFiles(data);
      } else {
        setError(data.error || "Error fetching files");
      }
    } catch (err) {
      setError("Network error or server not responding");
    } finally {
      setLoadingFiles(false);
    }
  };

  // 🐳 Analyze Repository
  const handleAnalyzeRepo = async (repoName) => {
    const repoUrl = `https://github.com/${repoName}`;
    try {
      const response = await fetch(`${API_URL}/analyze-repo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ repoUrl }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to analyze the repository.");
      }
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
      alert(`Failed to analyze the repository: ${err.message}`);
    }
  };

  // 🐳 Setup Docker
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
                onClick={() => handleSearchFiles(repo.full_name)}
                className={styles.searchFilesButton}
              >
                Search Files
              </button>
              <button
                onClick={() => handleAnalyzeRepo(repo.full_name)}
                className={styles.analyzeRepoButton}
              >
                Analyze Repo
              </button>
              <button
                onClick={() => handleSetupDocker(repo.full_name)}
                className={styles.setupDockerButton}
              >
                Setup Docker
              </button>
            </div>
          ))}
        </div>

        {/* 🔍 Display Searched Files */}
        {selectedRepo && (
          <div className={styles.fileResults}>
            <h2>Files in {selectedRepo}:</h2>
            {loadingFiles ? (
              <p>Loading files...</p>
            ) : error ? (
              <p className={styles.errorText}>{error}</p>
            ) : files ? (
              Object.keys(files).length > 0 ? (
                Object.keys(files).map((fileName) => (
                  <div key={fileName} className={styles.fileCard}>
                    <h3>{fileName}</h3>
                    <pre className={styles.fileContent}>{files[fileName]}</pre>
                  </div>
                ))
              ) : (
                <p>No matching files found in this repository.</p>
              )
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
