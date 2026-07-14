const hostname = window.location.hostname;

let isDev =
  hostname === 'localhost' ||
  hostname === '127.0.0.1' ||
  hostname.includes('-dev');

//*****************************************************************************
// You can uncomment the line below to test code locally using prod buckets
// rather than dev buckets. This can be useful to make sure the prod buckets
// don't have any permission or path issues. 

// IMPORTANT: Re-comment this line before deploying.

//isDev = false;
//*****************************************************************************

const env = isDev ? 'dev' : 'prod';

const discussionsBucket = `https://epic-health-dashboard-artifacts-${env}.s3.us-east-1.amazonaws.com`;
const jenkinsBucket = `https://noaa-epic-${env}-jenkins-artifacts.s3.amazonaws.com`;
const reactBucket = `https://noaa-epic-${env}-jenkins-public-react.s3.amazonaws.com`;

const config = {
    isDev,
    discussionsBucket: discussionsBucket,
    issuesBucket: discussionsBucket,
    jenkinsBucket: jenkinsBucket,
    reactBucket: reactBucket,
};

console.log(config);
export default config;
