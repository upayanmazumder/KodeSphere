import styles from "./Loader.module.css";

const Loader = () => {
  return (
    <div className={styles.loaderContainer}>
      <div className={styles.circle}></div>
      <div className={styles.orbit}>
        <span className={styles.braceLeft}>{`{`}</span>
        <span className={styles.braceRight}>{`}`}</span>
      </div>
    </div>
  );
};

export default Loader;
