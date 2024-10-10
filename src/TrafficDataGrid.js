import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";

const columns = [
  { field: "name", headerName: "Name", width: 200 },
  { field: "commits", headerName: "Commits", width: 100 },
  { field: "email", headerName: "Email", width: 500 }
];

const TrafficDataGrid = ({ endpoints }) => {
  const [data, setData] = useState([]);
  const [since, setSince] = useState("");
  const [until, setUntil] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responses = await Promise.all(
          endpoints.map(async (f) => {
            const response = await fetch(f);
            const data = await response.json();
            return data;
          })
        );

        let jsonData = Array.prototype.concat.apply([], responses);
        jsonData = jsonData.map((j, index) => ({
          ...j,
          traffic: j.activity.map((activity, id) => ({
            ...activity,
            email: activity.email.includes("noreply") ? "" : activity.email,
            id: id + 1
          })),
          id: index + 1
        }));

        setData(jsonData);
        if (jsonData.length > 0) {
          setSince(jsonData[0].since);
          setUntil(jsonData[0].until);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [endpoints]);
  if (data.length > 0 ){
        return (
        <div>
        <div>
            <p>Data from: {since} to {until}</p>
        </div>
        <div style={{ height: 300, width: "100%" }}>
            <DataGrid
            rowHeight={40}
            getRowId={(row) => row.id}
            rows={data.length > 0 ? data[0].traffic : []}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 20]}
            />
        </div>
        </div>
    );
  } else{
        return (
            <div>
                <p>Error fetching data.</p>
            </div>
        )
    }
};

export default TrafficDataGrid;
