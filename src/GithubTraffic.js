import React, { useEffect, useState } from "react";
import TrafficDataGrid from "./TrafficDataGrid";
import "./App.css";

function GithubTraffic() {
  const [repoList, setRepoList] = useState([]);

  useEffect(() => {
    const fetchRepoList = async () => {
      try {
        const response = await fetch(
          "https://noaa-epic-prod-jenkins-artifacts.s3.amazonaws.com/jobs/infrastructure/dashboard-contributors/latest.txt"
        );
        const data = await response.text();
        const urls = data.split("\n").filter(url => url.trim() !== "");
        const urlList = urls.map(url => {
          const repoName = url.substring(url.lastIndexOf("/") + 1, url.lastIndexOf(".json"));
          return [repoName, `https://github.com/ufs-community/${repoName}`, url];
        });
        setRepoList(urlList);
      } catch (error) {
        console.error("Error fetching repo list:", error);
      }
    };

    fetchRepoList();
  }, []);

  return (
    <div style={{ padding: 30 }}>
      {repoList.map((repo, index) => (
        <div key={index}>
          <h1>{repo[0]}</h1>
          <p>
            <a href={`https://github.com/ufs-community/${repo[0]}`}>{repo[0]} GitHub repository</a>
          </p>
          <TrafficDataGrid endpoints={repo.slice(2)} />
        </div>
      ))}
    </div>
  );
}

export default GithubTraffic;

