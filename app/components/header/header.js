/* eslint-disable @next/next/no-img-element */
import headerStyles from "./header.module.css";

export default function Header() {
  return (
    <header className={headerStyles.header}>
      <img
        src="/kodesphere.webp"
        alt="Logo"
        className={headerStyles.logo}
        height={80}
        width={80}
      />
      <h1 className={headerStyles.title}>kodesphere</h1>
    </header>
  );
}
