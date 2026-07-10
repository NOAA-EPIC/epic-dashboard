const hostname = window.location.hostname;

const devBucket =  'https://epic-health-dashboard-artifacts-dev.s3.us-east-1.amazonaws.com';
const prodBucket = 'https://epic-health-dashboard-artifacts.s3.us-east-1.amazonaws.com';

const isDev =
  hostname === 'localhost' ||
  hostname === '127.0.0.1' ||
  hostname.includes('-dev');

const config = {
  isDev,
  dataBucket: isDev
    ? devBucket
    : prodBucket,
};

console.log(config);
export default config;
