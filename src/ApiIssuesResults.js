import React from "react";
import IssueDataGrid from "./IssueDataGrid";
import "./App.css";

const issueEndpoints =  [
  'https://epic-health-dashboard-artifacts.s3.amazonaws.com/issues-hafs-community-HAFS.json',
  'https://epic-health-dashboard-artifacts.s3.amazonaws.com/issues-NOAA-EMC-UPP.json',
  'https://epic-health-dashboard-artifacts.s3.amazonaws.com/issues-NOAA-EPIC-land-offline_workflow.json',
  'https://epic-health-dashboard-artifacts.s3.amazonaws.com/issues-ufs-community-land-DA_workflow.json',
  'https://epic-health-dashboard-artifacts.s3.amazonaws.com/issues-ufs-community-ufs-srweather-app.json',
  'https://epic-health-dashboard-artifacts.s3.amazonaws.com/issues-ufs-community-ufs-weather-model.json',
];

function ApiIssuesResults() {
  return (
    <div style={{ padding: 30 }}>
      <div>
        <h1>Issues</h1>
        <p>Includes: ufs-srweather-app, ufs-weather-model, UPP, land-DA_workflow, HAFS, and NOAA-EPIC/land-offline_workflow</p>
        <p><span style={{ color: 'red' }}>Red</span> indicates that there has been no initial reply to the author. Only issues labelled for EPIC support and issues created within the last two weeks are shown.</p>
        <IssueDataGrid endpoints={issueEndpoints} />
      </div>
    </div>
  );
}

export default ApiIssuesResults;

