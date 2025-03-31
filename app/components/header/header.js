/* eslint-disable @next/next/no-img-element */
import headerStyles from "./header.module.css";
import Link from "next/link";

export default function Header() {
  return (
    <header className={headerStyles.header}>
      <Link href="/" className={headerStyles.link}>
        <img
          src="/kodesphere.webp"
          alt="Logo"
          className={headerStyles.logo}
          height={80}
          width={80}
        />
        <h1 className={headerStyles.title}>kodesphere</h1>
      </Link>
    </header>
  );
}
