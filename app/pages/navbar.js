"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import API_URL from "../shared/api";
import Link from "next/link";

import "../styles/navbar.css";

export default function Navbar() {
  const { data: session } = useSession();
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
    }
  }, [session, router]);

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <div>
      <button
        class="btn btn-dark fixed-button"
        type="button"
        data-bs-toggle="offcanvas"
        data-bs-target="#offcanvasScrolling"
        aria-controls="offcanvasScrolling"
      >
        Menu
      </button>

      <div
        class="offcanvas offcanvas-start"
        data-bs-scroll="true"
        data-bs-backdrop="false"
        tabindex="-1"
        id="offcanvasScrolling"
        aria-labelledby="offcanvasScrollingLabel"
      >
        <div class="offcanvas-header">
          <h5 class="offcanvas-title" id="offcanvasScrollingLabel">
            KodeSphere
          </h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div className="navigation-buttons">
          <div class="list-group">
            <Link
              href="/dashboard"
              class="list-group-item list-group-item-action"
            >
              Dashboard
            </Link>
            <Link
              href="/repositories"
              class="list-group-item list-group-item-action"
            >
              Repositories
            </Link>
            <Link
              href="/deployments"
              class="list-group-item list-group-item-action"
            >
              Deployements
            </Link>
          </div>
        </div>
        {session?.user?.name ? (
          <>
            <div className="navigation-buttons">
              <div class="list-group">
                <Link
                  href="/dashboard"
                  class="list-group-item list-group-item-action"
                >
                  Username: {session?.user?.login}
                </Link>
                <a href="#" class="list-group-item list-group-item-action">
                  GitHub Email: {session?.user?.email}
                </a>
                <a
                  href="#"
                  class="list-group-item list-group-item-action"
                  onClick={handleLogout}
                >
                  Logout
                </a>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="navigation-buttons">
              <div class="list-group">
                <Link
                  href="/login"
                  class="list-group-item list-group-item-action"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
