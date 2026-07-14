import React, { useEffect, useState } from "react";
import ArtifactDataGrid from "./ArtifactDataGrid";
import "./App.css";
import config from "./config";

const artifactDataFiles = [
  "ufs-srweather-app-dashboard.json",
  "ufs-weather-model-dashboard.json",
  "land-DA_workflow-dashboard.json",
];

// Prepend the bucket to the path
const artifactDataEndpoints = artifactDataFiles.map(
  file => `${config.reactBucket}/${file}`
);

function removeDashboard(title) {
  return title.replace(/-dashboard.*$/i, "").trim();
}

function CICDpiepline() {
  const [tableTitles, setTableTitles] = useState([]);

  useEffect(() => {
    const extractProjectName = (url) => {
      const lastSlashIndex = url.lastIndexOf("/");
      const fileName = url.substring(lastSlashIndex + 1);
      const dotIndex = fileName.lastIndexOf(".");
      const projectName = fileName.substring(0, dotIndex);
      return projectName;
    };

    const titles = artifactDataEndpoints.map((endpoint) =>
      removeDashboard(extractProjectName(endpoint))
    );
    setTableTitles(titles);
  }, []);

  return (
    <div style={{ padding: 30 }}>
      {artifactDataEndpoints.map((endpoint, index) => (
        <div key={index} style={{ marginBottom: 130 }}>
          <h1>{tableTitles[index]} CI/CD Artifacts</h1>
          <ArtifactDataGrid endpoints={[endpoint]} />
        </div>
      ))}
    </div>
  );
}

export default CICDpiepline;
