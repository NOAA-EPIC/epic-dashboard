import React from "react";
import { Box, Typography } from "@mui/material";
import AllocationReport from "./AllocationReport";
// import SeleniumTestResults from "./SeleniumTestResults";
import ApiDiscussionResults from "./ApiDiscussionsResults";
import ApiIssuesResults from "./ApiIssuesResults";
import GithubTraffic from "./GithubTraffic";
import CICDpiepline from "./CICDDashboard";

function TestDashboard() {
  const [currentTab, setCurrentTab] = React.useState("allocation");

  const tabs = [
    {
      id: "allocation",
      label: "EPIC Allocation",
      component: <AllocationReport />,
    },
    {
      id: "cicdPipeline",
      label: "CI/CD Artifacts",
      component: <CICDpiepline />,
    },
    {
      id: "apiDoc",
      label: "GitHub Discussions",
      component: <ApiDiscussionResults />,
    },
    {
      id: "apiIssues",
      label: "GitHub Issues",
      component: <ApiIssuesResults />,
    },
    {
      id: "githubTraffic",
      label: "GitHub Traffic",
      component: <GithubTraffic />,
    },

    /*
    {
      id: "selenium",
      label: "Selenium Test Results",
      component: <SeleniumTestResults />,
    },
    */
  ];

  const currentComponent =
    tabs.find((tab) => tab.id === currentTab)?.component ?? <CICDpiepline />;

  return (
    <div>
      <Box
        sx={{
          backgroundColor: "#333333",
          width: "100%",
          height: "45px",
        }}
      >
        <Box
          height="100%"
          display="flex"
          gap={5}
          justifyContent="flex-start"
          alignItems="center"
        >
          {tabs.map((tab) => (
            <Box
              key={tab.id}
              sx={{
                cursor: "pointer",
                width: "15%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "#FFFFFF",
                backgroundColor:
                  currentTab === tab.id ? "#0099D8" : "#333333",
              }}
              onClick={() => setCurrentTab(tab.id)}
            >
              <Typography>{tab.label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {currentComponent}
    </div>
  );
}

export default TestDashboard;
