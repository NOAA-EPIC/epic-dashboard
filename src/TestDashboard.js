import React from "react";
import { Typography, Box } from "@mui/material";
import AllocationReport from "./AllocationReport";
import SeleniumTestResults from "./SeleniumTestResults";
import ApiDiscussionResults from "./ApiDiscussionsResults";
import ApiIssuesResults from "./ApiIssuesResults";
import GithubTraffic from "./GithubTraffic";
import CICDpiepline from "./CICDDashboard";

function TestDashboard() {
  const [currentTab, setCurrentTab] = React.useState("allocation");

  const getTabStyle = (tab) => {
    let tabStyle = {
      color: "#FFFFFF",
      backgroundColor: "#333333",
      align: "center",
    };
    if (tab === currentTab) {
      tabStyle = {
        ...tabStyle,
        color: "#FFFFFF",
        backgroundColor: "#0099D8",

      };
    }
    return tabStyle;
  };

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
          <Box
            sx={{ cursor: "pointer" }}
            height="100%"
            width="15%"
            display="flex"
            justifyContent="center"
            alignItems="center"
            color={getTabStyle("allocation").color}
            backgroundColor={getTabStyle("allocation").backgroundColor}
            border={getTabStyle("allocation").border}
            onClick={() => setCurrentTab("allocation")}
          >
            <Typography>EPIC Allocation</Typography>
          </Box>
          <Box
            sx={{ cursor: "pointer" }}
            height="100%"
            width="15%"
            display="flex"
            justifyContent="center"
            alignItems="center"
            color={getTabStyle("cicdPipeline").color}
            backgroundColor={getTabStyle("cicdPipeline").backgroundColor}
            onClick={() => setCurrentTab("cicdPipeline")}
          >
            <Typography>CI/CD Artifacts</Typography>
          </Box>
          <Box
            sx={{ cursor: "pointer" }}
            height="100%"
            width="15%"
            display="flex"
            justifyContent="center"
            alignItems="center"
            color={getTabStyle("apiDoc").color}
            backgroundColor={getTabStyle("apiDoc").backgroundColor}
            onClick={() => setCurrentTab("apiDoc")}
          >
            <Typography>GitHub Discussions</Typography>
          </Box>
          <Box
            sx={{ cursor: "pointer" }}
            height="100%"
            width="15%"
            display="flex"
            justifyContent="center"
            alignItems="center"
            color={getTabStyle("apiIssues").color}
            backgroundColor={getTabStyle("apiIssues").backgroundColor}
            onClick={() => setCurrentTab("apiIssues")}
          >
            <Typography>GitHub Issues</Typography>
          </Box>
          <Box
            sx={{ cursor: "pointer" }}
            height="100%"
            width="15%"
            display="flex"
            justifyContent="center"
            alignItems="center"
            color={getTabStyle("githubTraffic").color}
            backgroundColor={getTabStyle("githubTraffic").backgroundColor}
            onClick={() => setCurrentTab("githubTraffic")}
          >
            <Typography>GitHub Traffic</Typography>
          </Box>
          <Box
            sx={{ cursor: "pointer" }}
            height="100%"
            width="15%"
            display="flex"
            justifyContent="center"
            alignItems="center"
            color={getTabStyle("selenium").color}
            backgroundColor={getTabStyle("selenium").backgroundColor}
            onClick={() => setCurrentTab("selenium")}
          >
            <Typography>Selenium Test Results</Typography>
          </Box>
        </Box>
      </Box>
      {currentTab === "allocation" ? (
        <AllocationReport />
      ) : currentTab === "selenium" ? (
        <SeleniumTestResults />
      ) : currentTab === "apiDoc" ? (
        <ApiDiscussionResults />
      ) : currentTab === "apiIssues" ? (
        <ApiIssuesResults />        
      ) : currentTab === "githubTraffic" ? (
        <GithubTraffic />
      ): (
        <CICDpiepline />
      ) }
    </div>
  );
}

export default TestDashboard;
