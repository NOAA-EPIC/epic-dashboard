import React from "react";
import { ResultsBox, ResultsBoxWrapper } from "./ResultsBox";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

function SeleniumTestResults() {
  const [testResults, setTestResults] = React.useState({});

  const getRowColor = (testResult) => {
    if (!testResult.toLowerCase().includes("failed")) {
      return "lightgreen";
    } else {
      return "lightpink";
    }
  };

  const fetchHeaders = {
    "cache-control": "no-store",
  };

  React.useEffect(() => {
    fetch(
      "https://epic-health-dashboard-artifacts.s3.amazonaws.com/selenium-data.json",
      { headers: fetchHeaders }
    )
      .then((res) => res.json())
      .then((data) => setTestResults(data));
  }, []); //eslint-disable-line

  let resultsBody;

  if (Object.keys(testResults).length > 0) {
    resultsBody = testResults.body;

    if (resultsBody) {
      return (
        <ResultsBoxWrapper>
          <ResultsBox>
            <Box
              width="100%"
              display="flex"
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box display="flex" flexDirection="column">
                <Typography fontWeight="bold" fontSize="18px">
                  Selenium Test Results
                </Typography>
                <Typography fontSize="18px">
                  Latest Run: {testResults.time_ran}
                </Typography>
              </Box>
            </Box>
            {Object.entries(resultsBody).map(([section, sectionData]) => (
              <Accordion
                key={section}
                defaultExpanded
                sx={{ width: "100%", backgroundColor: "lightGray" }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>{section}</Typography>
                </AccordionSummary>
                <AccordionDetails
                  sx={{ padding: "0px", backgroundColor: "white" }}
                >
                  <Box display="flex" flexDirection="column" gap="10px">
                    {Array.isArray(sectionData) ? (
                      sectionData.map((item, index) => (
                        <Box
                          key={index}
                          display="flex"
                          alignItems="center"
                          minHeight="50px"
                          border="1px solid black"
                          style={{
                            backgroundColor: getRowColor(item),
                          }}
                        >
                          <Typography sx={{ padding: "10px" }}>
                            {item}
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      <Box
                        display="flex"
                        alignItems="center"
                        minHeight="50px"
                        border="1px solid black"
                        style={{
                          backgroundColor: getRowColor(sectionData),
                        }}
                      >
                        <Typography sx={{ padding: "10px" }}>
                          {sectionData}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </ResultsBox>
        </ResultsBoxWrapper>
      );
    }
  }

  return null; // Return null if testResults is empty or not yet populated
}

export default SeleniumTestResults;

