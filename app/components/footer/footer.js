import footerStyles from "./footer.module.css";
import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      <div className={footerStyles.top}>
        <div className={footerStyles.links}>
          <ul className={footerStyles.linkList}>
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
        </div>
        <div className={footerStyles.branding}>
          <h2>KodeSphere</h2>
        </div>
      </div>
      <div className={footerStyles.bottom}>
        <p>©2025, KodeSphere Inc.</p>
      </div>
    </footer>
  );
}
