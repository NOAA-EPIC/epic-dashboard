import React, { useEffect, useState } from "react";
import ArtifactDataGrid from "./ArtifactDataGrid";
import "./App.css";


const artifact_data_endpoint = [
  "https://noaa-epic-prod-jenkins-public-react.s3.amazonaws.com/ufs-srweather-app-dashboard.json",
];

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

    const titles = artifact_data_endpoint.map((endpoint) =>
      removeDashboard(extractProjectName(endpoint))
    );
    setTableTitles(titles);
  }, []);

  return (
    <div style={{ padding: 30 }}>
      {tableTitles.map((title, index) => (
        <div key={index}>
          <h1>{title} Build History</h1>
          <ArtifactDataGrid endpoints={[artifact_data_endpoint[index]]} />
        </div>
      ))}
    </div>
  );
}

export default CICDpiepline;