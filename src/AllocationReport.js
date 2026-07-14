import React, { useState, useEffect } from 'react';
import config from "./config";

const HTMLLoader = ({ url }) => {
  const [htmlContent, setHtmlContent] = useState(null);

  useEffect(() => {
    const loadHTML = async () => {
      try {
        const response = await fetch(url);
        const data = await response.text();
        setHtmlContent(data);
      } catch (error) {
        console.error('Error loading HTML:', error);
      }
    };

    loadHTML();
  }, [url]);
  
  return (
    <div>
      {htmlContent && (
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      )}
    </div>
  );
};

const AllocationReport = () => {
  const [reportLinks, setReportLinks] = useState([]);

  useEffect(() => {
    const loadReportLinks = async () => {
      try {
        const response = await fetch(`${config.reactBucket}/monthly-logs/log_list.json`);
        const data = await response.json();
        setReportLinks(data);
      } catch (error) {
        console.error('Error loading report links:', error);
      }
    };

    loadReportLinks();
  }, []);

  return (
    <div>
      <HTMLLoader url={`${config.jenkinsBucket}/jobs/infrastructure/epic-account-info/report.html`} />
      <div>
        <h2>Previous Monthly Reports</h2>
        <ul>
          {reportLinks.map((link, index) => {
            const fileName = link.substring(link.lastIndexOf('/') + 1);
            return (
              <li key={index}>
                <a href={link} target="_blank" rel="noopener noreferrer">{fileName}</a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default AllocationReport;
