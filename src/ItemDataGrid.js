import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles({
  red: {
    background: "#FD8369"
  },
  green: {
    background: "#82E0AA"
  }
});

const ItemDataGrid = ({ endpoints }) => {
  const classes = useStyles();
  const [data, setData] = useState([]);

  useEffect(() => {
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

  const columns = [
    { field: "repository", headerName: "Repository", width: 150 },
    { field: "index", headerName: "GitHub Id", width: 120, renderCell: (params) => (
      <a href={params.row.github_url}>{params.value}</a>
    ) },
    { field: "title", headerName: "Title", width: 300 },
    { field: "iso_date_time", headerName: "Date Created", width: 170 },
    { field: "initial_answer", headerName: "Initial Answer?", width: 100},
    { field: "author", headerName: "Author", width: 130 },
    { field: "last_comment_date_time", headerName: "Last Comment", width: 170 },
    { field: "last_commenter", headerName: "Last Comment Author", width: 170 },
    { field: "labels", headerName: "Labels", width: 200}, 
  ];

  const getRowClassName = (params) => {
    if (params.row.initial_answer === "No" || params.row.author === params.row.last_commenter) {
      return classes.red;
    } else if (params.row.last_commenter === "gspetro-NOAA") {
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
        getRowClassName={getRowClassName}
        pageSize={10}
        rowsPerPageOptions={[10, 20, 30]}
      />
    </div>
  );
};

export default ItemDataGrid;
