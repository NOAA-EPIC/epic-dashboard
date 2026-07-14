import React from "react";
import IssueDataGrid from "./IssueDataGrid";
import "./App.css";
import config from "./config";

const issueFiles = [
  "hafs-community-HAFS.json",
  "NOAA-EMC-UPP.json",
  "NOAA-EPIC-land-offline_workflow.json",
  "NOAA-EPIC-EAGLE.json",
  "ufs-community-land-DA_workflow.json",
  "ufs-community-ufs-srweather-app.json",
  "ufs-community-ufs-weather-model.json",
  "ufs-community-ufs-da-workflow.json",
];

const issueEndpoints = issueFiles.map(
  file => `${config.issuesBucket}/issues-${file}`
);

function ApiIssuesResults() {
  return (
    <div style={{ padding: 30 }}>
      <div>
        <h1>Issues</h1>
        <p>Includes: ufs-srweather-app, ufs-weather-model, ufs-da-workflow, UPP, land-DA_workflow, HAFS, NOAA-EPIC/EAGLE, and NOAA-EPIC/land-offline_workflow</p>
        <p><span style={{ color: 'red' }}>Red</span> indicates that there has been no initial reply to the author. Only issues labelled for EPIC support and issues created within the last two weeks are shown.</p>
        <IssueDataGrid endpoints={issueEndpoints} />
      </div>
    </div>
  );
}

export default ApiIssuesResults;
