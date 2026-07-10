import React from "react";
import IssueDataGrid from "./IssueDataGrid";
import "./App.css";
import config from "./config";

const issueEndpoints = [
  `${config.dataBucket}/issues-hafs-community-HAFS.json`,
  `${config.dataBucket}/issues-NOAA-EMC-UPP.json`,
  `${config.dataBucket}/issues-NOAA-EPIC-land-offline_workflow.json`,
  `${config.dataBucket}/issues-NOAA-EPIC-EAGLE.json`,  
  `${config.dataBucket}/issues-ufs-community-land-DA_workflow.json`,
  `${config.dataBucket}/issues-ufs-community-ufs-srweather-app.json`,
  `${config.dataBucket}/issues-ufs-community-ufs-weather-model.json`,
  `${config.dataBucket}/issues-ufs-community-ufs-da-workflow.json`,  
];

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
