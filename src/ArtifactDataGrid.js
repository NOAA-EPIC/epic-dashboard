import React, { useEffect, useState } from "react";
import { DataGrid, GridCellParams } from "@mui/x-data-grid";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles({
  red: {
    background: "#FD8369"
  },
  green: {
    background: "#81C784"
  }
});

// Custom Cell Renderer component
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
        <button onClick={openArtifactLink} style={{ marginLeft: "10px" }}>
          Open
        </button>
      )}
    </div>
  );
};

// Define columns
const columns = [
  { field: "Title", headerName: "Title", width: 100 },
  { field: "State", headerName: "State", width: 100 },
  { field: "Result", headerName: "Result", width: 100 },
  { field: "Duration", headerName: "Duration", width: 75 },
  {
    field: "Timestamp",
    headerName: "Timestamp",
    width: 175,
    valueFormatter: (params) => {
      const timestamp = params.value;
      const withoutMicroseconds = timestamp.split(".")[0]; // Remove microseconds
      return withoutMicroseconds;
    },
  },
  {
    field: "Artifacts",
    headerName: "Artifacts",
    width: 1000,
    renderCell: (params) => <ArtifactsCellRenderer value={params.value} />
  }
];

const ArtifactDataGrid = ({ endpoints }) => {
  const classes = useStyles(); // Use the makeStyles hook to get the custom styles
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

  const getRowClass = (result) => {
    if (result === "FAILURE") {
      return classes.red;
    } else if (result === "SUCCESS") {
      return classes.green;
    } else {
      return "";
    }
  };

  return (
    <div style={{ height: 500, width: "100%" }}>
      <DataGrid
        rowHeight={40}
        getRowId={(row) => row.id}
        rows={data}
        columns={columns}
        getRowClassName={(params) => getRowClass(params.row.Result)}
        pageSize={10}
        rowsPerPageOptions={[10, 20, 30]}
      />
    </div>
  );
};

export default ArtifactDataGrid;
