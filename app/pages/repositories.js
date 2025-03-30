"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import API_URL from "../shared/api";

import "../styles/repositories.css"; // Import your CSS file

export default function Dashboard() {
  const { data: session } = useSession();
  const [repos, setRepos] = useState([]);
  const [displayedRepos, setDisplayedRepos] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.push("/login");
    } else {
      const githubUserId = session?.user?.id; // Extract GitHub User ID
      if (!githubUserId) {
        console.error("GitHub user ID is missing from session data.");
        return;
      }

      fetch(`${API_URL}/github/repos?githubUserId=${githubUserId}`) // Pass githubUserId as query param
        .then((res) => res.json())
        .then((data) => {
          console.log("Fetched Repositories:", data.repos);
          setRepos(data.repos || []);
          setDisplayedRepos(data.repos || []); // Initialize displayedRepos with fetched repos
        })
        .catch((err) => console.error("Error fetching repos:", err));
    }
  }, [session, router]);

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  const handleSetupDocker = async (repoName) => {
    try {
      const response = await fetch(
        `${API_URL}/analyze-repo?repoUrl=${repoName}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
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

  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredRepos = repos.filter((repo) =>
      repo.name.toLowerCase().includes(searchTerm)
    );
    setDisplayedRepos(filteredRepos);
  };

  return (
    <div className="repositories-container">
      <h1 className="h1">Your Repositories</h1>

      <div className="repo-search-bar">
        <div class="input-group search-box m-2">
          <span class="input-group-text" id="basic-addon1">
            Search
          </span>
          <input
            type="text"
            class="form-control"
            placeholder="Username"
            aria-label="Username"
            aria-describedby="basic-addon1"
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="repo-grid">
        {displayedRepos.map((repo) => (
          <div
            key={repo.id}
            className="max-w p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700"
          >
            <div className="repo-info-container">
              <h4 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                {repo.name}
              </h4>
              <p className="id-name">Repo ID: {repo.id}</p>
            </div>
            <button
              onClick={() => handleSetupDocker(repo.full_name)}
              className="btn btn-primary"
            >
              Setup Docker
            </button>
          </div>
        ))}
      </div>

      {/* {session?.user?.image && <img src={session?.user?.image} alt="Profile" />} */}
    </div>
  );
}
