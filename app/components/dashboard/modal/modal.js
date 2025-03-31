import styles from "./modal.module.css";
import { useState } from "react";
import { MdContentCopy } from "react-icons/md";
import { IoIosExit } from "react-icons/io";
import { GrNext } from "react-icons/gr";

export default function Modal({ modalData, closeModal }) {
  const [modalStep, setModalStep] = useState(0);

  const nextStep = () => setModalStep((prev) => prev + 1);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => alert("Copied to clipboard!"),
      (err) => alert("Failed to copy: " + err)
    );
  };

  if (!modalData) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        {modalData.error ? (
          <>
            <p className={styles.errorText}>
              There was an error analysing your repository!
            </p>
            <button onClick={closeModal} className={styles.closeButton}>
              <IoIosExit />
            </button>
          </>
        ) : (
          <>
            {modalStep === 0 && modalData.dockerfile && (
              <>
                <h3>Dockerfile:</h3>
                <button
                  onClick={() => copyToClipboard(modalData.dockerfile)}
                  className={styles.copyButton}
                >
                  <MdContentCopy />
                </button>
                <pre className={styles.codeBlock}>{modalData.dockerfile}</pre>
                <button onClick={nextStep} className={styles.nextButton}>
                  <GrNext />
                </button>
              </>
            )}

            {modalStep === 1 && modalData.dockerCompose && (
              <>
                <h3>Docker Compose:</h3>
                <button
                  onClick={() => copyToClipboard(modalData.dockerCompose)}
                  className={styles.copyButton}
                >
                  <MdContentCopy />
                </button>
                <pre className={styles.codeBlock}>
                  {modalData.dockerCompose}
                </pre>
                <button onClick={closeModal} className={styles.closeButton}>
                  <IoIosExit />
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
