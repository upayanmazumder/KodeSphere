import React, { useState, useEffect } from "react";
import styles from "./import.module.css";
import { K8S_API_URL } from "@/shared/api";

const Import = () => {
  const [formData, setFormData] = useState({
    image: "",
    domains: [{ subdomain: "", url: "", ports: "" }],
    env_variables: [],
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  const [fetchingUsername, setFetchingUsername] = useState(true);

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await fetch("/api/auth/session");
        if (!response.ok) throw new Error("Failed to fetch session");
        const session = await response.json();
        if (session?.user?.login) {
          setGithubUsername(session.user.login);
        } else {
          throw new Error("GitHub username not found.");
        }
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setFetchingUsername(false);
      }
    };
    fetchUsername();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field, index, key, value) => {
    setFormData((prev) => {
      const updatedArray = [...prev[field]];
      updatedArray[index] = {
        ...updatedArray[index],
        [key]: key === "subdomain" ? value : value.trim(),
        ...(key === "subdomain" && githubUsername
          ? { url: `${value}-${githubUsername}.vitians.in` }
          : {}),
      };
      return { ...prev, [field]: updatedArray };
    });
  };

  const addField = (field, defaultValue) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], defaultValue],
    }));
  };

  const isValidPortFormat = (ports) => /^\d+(,\d+)*$/.test(ports);

  const isFormValid = () => {
    return (
      formData.image.trim() !== "" &&
      formData.domains.every(
        (d) => d.subdomain.trim() !== "" && isValidPortFormat(d.ports)
      ) &&
      (formData.env_variables.length === 0 ||
        formData.env_variables.every(
          (env) => env.key.trim() !== "" && env.value.trim() !== ""
        ))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      setErrorMessage("Please fill in all required fields correctly.");
      return;
    }

    setSuccessMessage("");
    setErrorMessage("");
    setLoading(true);

    const payload = {
      image: formData.image,
      domains: formData.domains.map(({ url, ports }) => ({
        url,
        ports: ports.split(",").map((port) => parseInt(port.trim(), 10)),
      })),
      env: Object.fromEntries(
        formData.env_variables
          .filter(({ key, value }) => key.trim() !== "" && value.trim() !== "")
          .map(({ key, value }) => [key, value])
      ),
    };

    try {
      const response = await fetch(`${K8S_API_URL}/deploy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (response.ok) {
        setSuccessMessage(result.message);
      } else {
        setErrorMessage(result.detail || "Unknown error occurred.");
      }
    } catch (error) {
      setErrorMessage("Failed to connect to the deployment server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div id="image">
        <label>Docker Image</label>
        <input
          type="text"
          placeholder="e.g., myapp:latest"
          value={formData.image}
          onChange={(e) => handleInputChange("image", e.target.value)}
          required
        />
      </div>

      <div id="domains">
        <h5>Domain Mappings</h5>
        {formData.domains.map((domain, index) => (
          <div key={index} className={styles.domain}>
            <div className={styles.domainField}>
              <input
                type="text"
                placeholder="Subdomain"
                value={domain.subdomain}
                onChange={(e) =>
                  handleArrayChange(
                    "domains",
                    index,
                    "subdomain",
                    e.target.value
                  )
                }
                required
              />
              <input
                type="text"
                placeholder="Ports (comma-separated)"
                value={domain.ports}
                onChange={(e) =>
                  handleArrayChange("domains", index, "ports", e.target.value)
                }
                required
              />
            </div>
            {domain.url && (
              <p className={styles.generatedDomain}>
                The traffic to this port will be routed through {"  "}
                <a href={`https://${domain.url}`} target="_blank">
                  https://{domain.url}
                </a>
              </p>
            )}
          </div>
        ))}
        <button
          type="button"
          className={styles.addButton}
          onClick={() =>
            addField("domains", { subdomain: "", url: "", ports: "" })
          }
        >
          ➕ Add Domain
        </button>
      </div>

      <div id="environment">
        <h5>Environment Variables</h5>
        {formData.env_variables.map((env, index) => (
          <div key={index} className={styles.envField}>
            <input
              type="text"
              placeholder="Variable Name"
              value={env.key}
              onChange={(e) =>
                handleArrayChange("env_variables", index, "key", e.target.value)
              }
            />
            <input
              type="text"
              placeholder="Variable Value"
              value={env.value}
              onChange={(e) =>
                handleArrayChange(
                  "env_variables",
                  index,
                  "value",
                  e.target.value
                )
              }
            />
          </div>
        ))}
        <button
          type="button"
          className={styles.addButton}
          onClick={() => addField("env_variables", { key: "", value: "" })}
        >
          ➕ Add Variable
        </button>
      </div>

      <button
        type="submit"
        disabled={loading || !isFormValid() || fetchingUsername}
        className={styles.submitButton}
      >
        {loading ? "Deploying..." : "Deploy"}
      </button>
      {successMessage && (
        <div className={styles.success}>✅ {successMessage}</div>
      )}
      {errorMessage && <div className={styles.error}>❌ {errorMessage}</div>}
    </form>
  );
};

export default Import;
