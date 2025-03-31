import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { gsap } from "gsap";
import styles from "./hero.module.css";

export default function Home() {
  const router = useRouter();
  const buttonRef = useRef(null);
  const smallTriangle = useRef(null);
  const leftShapes = useRef(null);
  const rightShapes = useRef(null);
  const bigTriangle = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      leftShapes.current,
      { x: -100, opacity: 0 },
      { x: 0, opacity: 1, duration: 1.5, ease: "power3.out" }
    );

    gsap.fromTo(
      rightShapes.current,
      { x: 100, opacity: 0 },
      { x: 0, opacity: 1, duration: 1.5, ease: "power3.out", delay: 0.5 }
    );

    gsap.fromTo(
      buttonRef.current,
      { scale: 0.8, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 1,
        ease: "elastic.out(1, 0.5)",
        delay: 1,
      }
    );

    gsap.to(smallTriangle.current, {
      rotation: 360,
      duration: 5,
      repeat: -1,
      ease: "linear",
    });
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Kodesphere</h1>
      <h2 className={styles.subtitle}>
        Deploy <span className={styles.highlight}>Smarter, Not Harder</span>
      </h2>

      <div className={styles.buttonWrapper}>
        <button
          ref={buttonRef}
          onClick={() => router.push("/login")}
          className={styles.button}
        >
          Get Started
        </button>
      </div>

      <div ref={leftShapes} className={styles.leftShapes}>
        <div className={styles.circleGreen}></div>
        <div className={styles.circleBlue}></div>
      </div>

      <div ref={rightShapes} className={styles.rightShapes}>
        <div ref={bigTriangle} className={styles.bigTriangle}>
          <div ref={smallTriangle} className={styles.smallTriangle}></div>
        </div>
      </div>
    </div>
  );
}
