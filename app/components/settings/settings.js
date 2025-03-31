/* eslint-disable @next/next/no-img-element */
"use client";

import { useSession } from "next-auth/react";
import { IoPersonCircle } from "react-icons/io5";
import { IoMailOutline } from "react-icons/io5";
import settingsStyles from "./settings.module.css";

export default function Settings() {
  const { data: session } = useSession();

  if (!session) {
    return <p>Loading...</p>;
  }

  const { user } = session;

  return (
    <div className={settingsStyles.settings}>
      <h1 className={settingsStyles.title}>User Details</h1>
      <div className={settingsStyles.details}>
        {user.avatar && (
          <img
            src={user.avatar}
            alt="User Avatar"
            className={settingsStyles.avatar}
          />
        )}
        <p className={settingsStyles.userDetails}>
          <IoPersonCircle /> {user.name}
          <br />
          <IoMailOutline /> {user.email}
        </p>
      </div>
    </div>
  );
}
