import sidebarStyles from "./sidebar.module.css";
import { signOut } from "next-auth/react";

export default function Sidebar() {
  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <div className={sidebarStyles.sidebar}>
      <div className={sidebarStyles.logo}>KodeSphere</div>
      <div className={sidebarStyles.navItems}>
        <button className={sidebarStyles.navButton}>Dashboard</button>
        <button className={sidebarStyles.navButton}>Repositories</button>
        <button className={sidebarStyles.navButton}>Deployments</button>
        <button className={sidebarStyles.navButton}>Settings</button>
      </div>
      <button className={sidebarStyles.logoutButton} onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}
