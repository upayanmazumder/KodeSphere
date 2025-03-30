"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import API_URL from "../shared/api";

import "../styles/dashboard.css"; // Import your CSS file

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
    <div className="dashboard-container">
      <div className="dashboard-header">
        <a href={process.env.NEXT_PUBLIC_GITHUB_APP_INSTALL_URL}>Link Github</a>
      </div>
      <h1>Your Repositories</h1>

      <div className="repo-search-bar">
        <label
          for="search"
          class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
        >
          Search
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg
              class="w-4 h-4 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
          <input
            id="search"
            class="block w-150 p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Search"
            required
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
              <h2 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                {repo.name}
              </h2>
              <p className="id-name">Repo ID: {repo.id}</p>
            </div>
            <button
              onClick={() => handleSetupDocker(repo.full_name)}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Setup Docker
            </button>
          </div>
        ))}
      </div>

      <p>Username: {session?.user?.login}</p>
      <p>GitHub Email: {session?.user?.email}</p>
      {session?.user?.image && <img src={session?.user?.image} alt="Profile" />}

      <a href={process.env.NEXT_PUBLIC_GITHUB_APP_INSTALL_URL}>Sign in</a>
      <button
        onClick={handleLogout}
        style={{ marginBottom: "20px", color: "white" }}
      >
        Logout
      </button>
    </div>
  );
}
