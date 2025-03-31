import footerStyles from "./footer.module.css";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className={footerStyles.footer}>
      <div className={footerStyles.top}>
        <ul className={footerStyles.links}>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <a href="/contact">Contact us</a>
          </li>
          <li>
            <a href="/about">About</a>
          </li>
        </ul>
        <div className={footerStyles.branding}>
          <a
            href="https://github.com/upayanmazumder/kodesphere"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>kodesphere</span>
          </a>
        </div>
      </div>
      <div className={footerStyles.bottom}>
        <p>©2025, kodesphere Inc.</p>
      </div>
    </footer>
  );
}
