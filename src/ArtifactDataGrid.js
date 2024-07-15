import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles({
  lightGrey: {
    background: "#f0f0f0", // Light grey color for all rows
  },
  keyContainer: {
    marginTop: "20px", // Updated to create space between table and key
    marginBottom: "10px",
  },
  keyItem: {
    marginRight: "20px",
    display: "flex",
    alignItems: "center",
  },
  keyColorBox: {
    width: "20px",
    height: "20px",
    marginRight: "5px",
    borderRadius: "50%",
  },
});

const WE2ETestsCellRenderer = ({ value }) => {
  const getColor = (result) => {
    switch (result) {
      case "SUCCESS":
        return "#81C784"; // green
      case "FAILURE":
        return "#FD8369"; // red
      case "ABORTED":
        return "#FFA500"; // orange
      case "NOT_BUILT":
        return "#A9A9A9"; // grey
      default:
        return "#FFFFFF"; // white
    }
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
      {value.map((test, index) => {
        const match = test.match(/SRW_PLATFORM\s*=\s*'([^']*)'\s*SRW_COMPILER\s*=\s*'([^']*)'\s*(\w+)/);
        if (!match) return null;

        const [, platform, compiler, result] = match;
        const color = getColor(result);

        return (
          <div
            key={index}
            style={{
              backgroundColor: color,
              padding: "5px 10px",
              borderRadius: "5px",
              color: "#000",
            }}
          >
            {`${platform}-${compiler}`}
          </div>
        );
      })}
    </div>
  );
};

const ArtifactsCellRenderer = ({ value }) => {
  const [selectedArtifact, setSelectedArtifact] = useState("");

  const handleArtifactChange = (event) => {
    setSelectedArtifact(event.target.value);
  };

  const openArtifactLink = () => {
    if (selectedArtifact) {
      window.open(selectedArtifact, "_blank");
    }
  };

  const isArtifactSelected = selectedArtifact !== "";

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <div style={{ width: isArtifactSelected ? "100%" : "200px" }}>
        <select
          value={selectedArtifact}
          onChange={handleArtifactChange}
          style={{ width: "100%" }}
        >
          <option value="">Select an artifact</option>
          {value.map((artifact, index) => (
            <option key={index} value={artifact}>
              {artifact}
            </option>
          ))}
        </select>
      </div>
      {isArtifactSelected && (
        <button
          onClick={openArtifactLink}
          style={{
            marginLeft: "10px",
            backgroundColor: "#ffffff",
            color: "#000000",
          }}
        >
          Open
        </button>
      )}
    </div>
  );
};

const columns = [
  { field: "Title", headerName: "Title", width: 100 },
  { field: "State", headerName: "State", width: 100 },
  { field: "Duration", headerName: "Duration", width: 75 },
  {
    field: "Timestamp",
    headerName: "Timestamp",
    width: 175,
    valueFormatter: (params) => {
      const timestamp = params.value;
      const withoutMicroseconds = timestamp.split(".")[0];
      return withoutMicroseconds;
    },
  },
  {
    field: "WE2ETests",
    headerName: "Build Results",
    width: 680,
    renderCell: (params) => <WE2ETestsCellRenderer value={params.value} />,
  },
  {
    field: "Artifacts",
    headerName: "Artifacts",
    width: 1000,
    renderCell: (params) => <ArtifactsCellRenderer value={params.value} />,
  },
];

const ArtifactDataGrid = ({ endpoints }) => {
  const classes = useStyles();
  const [data, setData] = useState([]);

  useEffect(() => {
    // Fetch data from API
    const fetchData = async () => {
      try {
        const responses = await Promise.all(
          endpoints.map(async (f) => {
            const response = await fetch(f);
            return await response.json();
          })
        );

        let jsonData = Array.prototype.concat.apply([], responses);
        jsonData = jsonData.map((j, index) => ({ ...j, id: index }));

        setData(jsonData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [endpoints]);

  return (
    <div style={{ height: 500, width: "100%" }}>
      <DataGrid
        rowHeight={40}
        getRowId={(row) => row.id}
        rows={data}
        columns={columns}
        getRowClassName={() => classes.lightGrey} // Apply light grey color to all rows
        pageSize={10}
        rowsPerPageOptions={[10, 20, 30]}
      />
      <div className={classes.keyContainer}>
        <div className={classes.keyItem}>
          <div className={classes.keyColorBox} style={{ background: "#81C784" }} />
          <span>Success</span>
        </div>
        <div className={classes.keyItem}>
          <div className={classes.keyColorBox} style={{ background: "#FD8369" }} />
          <span>Failure</span>
        </div>
        <div className={classes.keyItem}>
          <div className={classes.keyColorBox} style={{ background: "#FFA500" }} />
          <span>Aborted</span>
        </div>
        <div className={classes.keyItem}>
          <div className={classes.keyColorBox} style={{ background: "#A9A9A9" }} />
          <span>Not Built</span>
        </div>
      </div>
    </div>
  );
};

export default ArtifactDataGrid;
