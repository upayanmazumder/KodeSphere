/* eslint-disable @next/next/no-img-element */
"use client";

import { useSession } from "next-auth/react";
import Loading from "../Loading/Loading";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API_URL from "../../shared/api";
import styles from "./dashboard.module.css";
import Modal from "./modal/modal";
import { SiPerplexity } from "react-icons/si";

export default function Dashboard() {
  const { data: session } = useSession();
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzingRepo, setAnalyzingRepo] = useState(null);
  const [modalData, setModalData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    if (!session) {
      router.push("/login");
      return;
    }

    const githubUserId = session?.user?.id;
    if (!githubUserId) {
      console.error("GitHub user ID missing.");
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/github/repos?githubUserId=${githubUserId}`)
      .then((res) => res.json())
      .then((data) => setRepos(data.repos || []))
      .catch((err) => console.error("Error fetching repos:", err))
      .finally(() => setLoading(false));
  }, [session, router]);

  const handleAnalyzeRepo = async (repoName) => {
    setAnalyzingRepo(repoName);
    const repoUrl = `https://github.com/${repoName}`;

    try {
      const response = await fetch(`${API_URL}/analyze-repo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to analyze.");

      setModalData({
        repoName,
        dockerfile: data.dockerfile || "",
        dockerCompose: data.dockerCompose || "",
      });
    } catch (err) {
      setModalData({
        repoName,
        error: `Failed to analyze: ${err.message}`,
      });
    } finally {
      setAnalyzingRepo(null);
    }
  };

  const closeModal = () => setModalData(null);

  const handleInstallClick = () => {
    const installUrl = process.env.NEXT_PUBLIC_GITHUB_APP_INSTALL_URL;
    if (installUrl) {
      window.open(`${installUrl}/installations/select_target`, "_blank");
    } else {
      console.error("NEXT_PUBLIC_GITHUB_APP_INSTALL_URL is not defined.");
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.mainContent}>
        {loading ? (
          <Loading />
        ) : (
          <>
            <h1 className={styles.welcomeText}>
              Welcome back, {session?.user?.name}!
            </h1>
            <input
              type="text"
              placeholder="Search repositories..."
              className={styles.searchBar}
            />

            <div className={styles.repoList}>
              {repos.length > 0 ? (
                repos.map((repo) => (
                  <div key={repo.id} className={styles.repoTile}>
                    <div className={styles.repoInfo}>
                      <strong>{repo.name}</strong>
                      <span className={styles.repoFullName}>
                        {repo.full_name}
                      </span>
                    </div>
                    <button
                      onClick={() => handleAnalyzeRepo(repo.full_name)}
                      className={styles.analyzeButton}
                      disabled={analyzingRepo === repo.full_name}
                    >
                      {analyzingRepo === repo.full_name ? (
                        <>
                          <SiPerplexity
                            className={styles.icon}
                            style={{ marginRight: "var(--margin-tiny)" }}
                          />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <SiPerplexity
                            className={styles.icon}
                            style={{ marginRight: "var(--margin-tiny)" }}
                          />
                          Analyze Repo
                        </>
                      )}
                    </button>
                  </div>
                ))
              ) : (
                <p className={styles.noRepos}>No repositories found.</p>
              )}
            </div>
          </>
        )}
      </div>

      <div className={styles.profileContainer}>
        <img
          src={session?.user?.image}
          alt="Profile"
          className={styles.profileImage}
        />
        <p className={styles.username}>@{session?.user?.name}</p>
        <div className={styles.bottom}>
          <p className={styles.installText}>
            Repositories not showing up? Ensure you have the app installed
          </p>
          <button
            style={{ display: "none" }}
            className={styles.installButton}
            onClick={handleInstallClick}
          >
            Install GitHub App
          </button>
          <a
            href="https://github.com/apps/kodesphere-app"
            style={{ fontSize: "0.6em", marginTop: 15 }}
            target="_blank"
            rel="noopener noreferrer"
          >
            Install
          </a>
        </div>
      </div>

      {modalData && <Modal modalData={modalData} closeModal={closeModal} />}
    </div>
  );
}
