"use client";

import loginStyles from "../login/login.module.css";
import { BiLogoGithub } from "react-icons/bi";

export default function GithubLogin() {
  const handleRedirect = () => {
    const installUrl = process.env.NEXT_PUBLIC_GITHUB_APP_INSTALL_URL;
    if (installUrl) {
      window.location.href = `${installUrl}/installations/select_target`;
    } else {
      console.error(
        "NEXT_PUBLIC_GITHUB_APP_INSTALL_URL is not defined in .env"
      );
    }
  };

  return (
    <div className={loginStyles.login}>
      <button onClick={handleRedirect} className={loginStyles.github}>
        Give access to Github
        <BiLogoGithub style={{ marginLeft: "var(--padding-small)" }} />
      </button>
    </div>
  );
}
