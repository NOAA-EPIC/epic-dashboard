import React from "react";
import { Typography, Box } from "@mui/material";
import AllocationReport from "./AllocationReport";
import SeleniumTestResults from "./SeleniumTestResults";
import ApiTestResults from "./ApiTestResults";
import GithubTraffic from "./GithubTraffic";
import CICDpiepline from "./CICDDashboard";

function TestDashboard() {
  const [currentTab, setCurrentTab] = React.useState("allocation");

  const getTabStyle = (tab) => {
    let tabStyle = {
      color: "black",
      backgroundColor: "darkgray",
    };
    if (tab === currentTab) {
      tabStyle = {
        ...tabStyle,
        color: "white",
        backgroundColor: "gray",
      };
    }
    return tabStyle;
  };

  return (
    <div>
      <Box
        sx={{
          backgroundColor: "#145c9e",
          width: "100%",
          height: "35px",
        }}
      >
        <Box
          height="100%"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Typography fontSize="18px" color="white">
            {" "}
            Earth Prediction Innovation Center - Health Dashboard
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{
          backgroundColor: "lightgray",
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
            color={getTabStyle("selenium").color}
            backgroundColor={getTabStyle("selenium").backgroundColor}
            onClick={() => setCurrentTab("selenium")}
          >
            <Typography>Selenium Test Results</Typography>
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
            color={getTabStyle("cicdPipeline").color}
            backgroundColor={getTabStyle("cicdPipeline").backgroundColor}
            onClick={() => setCurrentTab("cicdPipeline")}
          >
            <Typography>Jenkins Artifacts</Typography>
          </Box>
        </Box>
      </Box>
      {currentTab === "allocation" ? (
        <AllocationReport />
      ) : currentTab === "selenium" ? (
        <SeleniumTestResults />
      ) : currentTab === "apiDoc" ? (
        <ApiTestResults />
      ) : currentTab === "githubTraffic" ? (
        <GithubTraffic />
      ): (
        <CICDpiepline />
      ) }
    </div>
  );
}

export default TestDashboard;
