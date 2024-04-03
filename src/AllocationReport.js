import React, { useState, useEffect } from 'react';


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
  const htmlUrl = 'https://noaa-epic-prod-jenkins-artifacts.s3.amazonaws.com/jobs/infrastructure/epic-account-info/report.html';

  return (
    <div>
      <HTMLLoader url={htmlUrl} />
    </div>
  );
};

export default AllocationReport;
