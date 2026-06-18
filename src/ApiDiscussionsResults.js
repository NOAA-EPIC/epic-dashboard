import React from "react";
import ItemDataGrid from "./ItemDataGrid";
import "./App.css";

const discussionEndpoints = [
  'https://epic-health-dashboard-artifacts.s3.amazonaws.com/discussions-hafs-community-HAFS.json',
  'https://epic-health-dashboard-artifacts.s3.amazonaws.com/discussions-NOAA-EMC-UPP.json',
  'https://epic-health-dashboard-artifacts.s3.amazonaws.com/discussions-NOAA-EPIC-land-offline_workflow.json',
  'https://epic-health-dashboard-artifacts.s3.amazonaws.com/discussions-NOAA-EPIC-EAGLE.json',  
  'https://epic-health-dashboard-artifacts.s3.amazonaws.com/discussions-ufs-community-land-DA_workflow.json',
  'https://epic-health-dashboard-artifacts.s3.amazonaws.com/discussions-ufs-community-ufs-srweather-app.json',
  'https://epic-health-dashboard-artifacts.s3.amazonaws.com/discussions-ufs-community-ufs-weather-model.json',
  'https://epic-health-dashboard-artifacts.s3.amazonaws.com/discussions-ufs-community-ufs-da-workflow.json',  
];

function ApiDiscussionResults() {
  return (
    <div style={{ padding: 30 }}>
      <div>
        <h1>Discussions</h1>
        <p>Includes: ufs-srweather-app, ufs-weather-model, ufs-da-workflow, UPP, land-DA_workflow, HAFS, NOAA-EPIC/EAGLE, and NOAA-EPIC/land-offline_workflow</p>
        <p><span style={{ color: 'green' }}>Green</span> indicates that the US team has replied most recently. <span style={{ color: 'red' }}>Red</span> indicates that there has been no initial reply to the author or that the author was the last to reply.</p>
        <p><a href="https://github.com/orgs/ufs-community/discussions">UFS Community Discussions</a></p>
        <ItemDataGrid endpoints={discussionEndpoints} />
      </div>
    </div>
  );
}

export default ApiDiscussionResults;
