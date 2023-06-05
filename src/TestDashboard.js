import React from "react";
import { Typography, Box } from "@mui/material";
import IntegrationTestResults from "./IntegrationTestResults";
import SeleniumTestResults from "./SeleniumTestResults";
import ApiTestResults from "./ApiTestResults";
import GithubTraffic from "./GithubTraffic";

function TestDashboard() {
  const [currentTab, setCurrentTab] = React.useState("integration");

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
            color={getTabStyle("integration").color}
            backgroundColor={getTabStyle("integration").backgroundColor}
            border={getTabStyle("integration").border}
            onClick={() => setCurrentTab("integration")}
          >
            <Typography>Integration Test Results</Typography>
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
        </Box>
      </Box>
      {currentTab === "integration" ? (
        <IntegrationTestResults />
      ) : currentTab === "selenium" ? (
        <SeleniumTestResults />
      ) : currentTab === "apiDoc" ? (
        <ApiTestResults />
      ) : (
        <GithubTraffic />
      )}
    </div>
  );
}

export default TestDashboard;
