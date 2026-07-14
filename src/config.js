const hostname = window.location.hostname;

const isDev =
  hostname === 'localhost' ||
  hostname === '127.0.0.1' ||
  hostname.includes('-dev');

const env = isDev ? 'dev' : 'prod';
//const env = 'prod';

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
