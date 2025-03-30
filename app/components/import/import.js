import React, { useState } from "react";
import styles from "./import.module.css";
import { K8S_API_URL } from "@/shared/api";

const Import = () => {
  const [formData, setFormData] = useState({
    image: "",
    domains: [{ url: "", ports: "" }],
    env_variables: [{ key: "", value: "" }],
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    const payload = {
      image: formData.image,
      domains: formData.domains.map((domain) => ({
        url: domain.url,
        ports: domain.ports.split(",").map((port) => parseInt(port.trim())),
      })),
      env_variables: formData.env_variables.reduce((acc, curr) => {
        if (curr.key && curr.value) acc[curr.key] = curr.value;
        return acc;
      }, {}),
    };

    try {
      const response = await fetch(`${K8S_API_URL}/deploy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccessMessage(result.message);
      } else {
        const errorDetail = result.detail || "Unknown error occurred";
        const failedDomain =
          errorDetail.match(/Error deploying app for (.*?):/)?.[1] || "";
        setErrorMessage(
          `${errorDetail} ${failedDomain ? `(Domain: ${failedDomain})` : ""}`
        );
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("Failed to connect to deployment server");
    }
  };

  const addDomain = () => {
    setFormData((prev) => ({
      ...prev,
      domains: [...prev.domains, { url: "", ports: "" }],
    }));
  };

  const addEnvVar = () => {
    setFormData((prev) => ({
      ...prev,
      env_variables: [...prev.env_variables, { key: "", value: "" }],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className={styles.container}>
      {/* Success/Error Messages */}
      {successMessage && (
        <div className={`${styles.alert} ${styles["alert-success"]}`}>
          ✅ {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className={`${styles.alert} ${styles["alert-danger"]}`}>
          ❌ {errorMessage}
        </div>
      )}

      {/* Image Input */}
      <div className="mb-3">
        <label className={styles["form-label"]}>Docker Image</label>
        <input
          type="text"
          className="form-control"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          required
        />
      </div>

      {/* Domains Section */}
      <div className={`card ${styles.card}`}>
        <div className="card-body">
          <h5 className={styles["card-title"]}>Domain Mappings</h5>
          {formData.domains.map((domain, index) => (
            <div key={index} className="row mb-2">
              <div className="col-md-6">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Subdomain URL (e.g., mysite.vitians.in)"
                  value={domain.url}
                  onChange={(e) => {
                    const newDomains = [...formData.domains];
                    newDomains[index].url = e.target.value;
                    setFormData({ ...formData, domains: newDomains });
                  }}
                  required
                />
              </div>
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ports (comma-separated)"
                  value={domain.ports}
                  onChange={(e) => {
                    const newDomains = [...formData.domains];
                    newDomains[index].ports = e.target.value;
                    setFormData({ ...formData, domains: newDomains });
                  }}
                  required
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            className={`btn btn-secondary ${styles["btn-secondary"]}`}
            onClick={addDomain}
          >
            Add Domain
          </button>
        </div>
      </div>

      {/* Environment Variables */}
      <div className={`card ${styles.card}`}>
        <div className="card-body">
          <h5 className={styles["card-title"]}>Environment Variables</h5>
          {formData.env_variables.map((env, index) => (
            <div key={index} className="row mb-2">
              <div className="col-md-5">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Variable Name"
                  value={env.key}
                  onChange={(e) => {
                    const newEnv = [...formData.env_variables];
                    newEnv[index].key = e.target.value;
                    setFormData({ ...formData, env_variables: newEnv });
                  }}
                />
              </div>
              <div className="col-md-5">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Variable Value"
                  value={env.value}
                  onChange={(e) => {
                    const newEnv = [...formData.env_variables];
                    newEnv[index].value = e.target.value;
                    setFormData({ ...formData, env_variables: newEnv });
                  }}
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            className={`btn btn-secondary ${styles["btn-secondary"]}`}
            onClick={addEnvVar}
          >
            Add Environment Variable
          </button>
        </div>
      </div>

      <button
        type="submit"
        className={`btn btn-primary ${styles["btn-primary"]}`}
      >
        Deploy
      </button>
    </form>
  );
};

export default Import;
