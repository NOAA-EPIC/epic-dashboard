import React from "react";
import ItemDataGrid from "./ItemDataGrid";
import "./App.css";
import config from "./config";

const discussionFiles = [
  "discussions-hafs-community-HAFS.json",
  "discussions-NOAA-EMC-UPP.json",
  "discussions-NOAA-EPIC-land-offline_workflow.json",
  "discussions-NOAA-EPIC-EAGLE.json",
  "discussions-ufs-community-land-DA_workflow.json",
  "discussions-ufs-community-ufs-srweather-app.json",
  "discussions-ufs-community-ufs-weather-model.json",
  "discussions-ufs-community-ufs-da-workflow.json",
];

const discussionEndpoints = discussionFiles.map(
  file => `${config.discussionsBucket}/${file}`
);

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
