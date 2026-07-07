const hostname = window.location.hostname;

const isDev =
  hostname === "localhost" ||
  hostname === "127.0.0.1" ||
  hostname.includes("-dev");

const config = {
  isDev,
  dataBucket: isDev
    ? "https://epic-health-dashboard-artifacts-dev.s3.us-east-1.amazonaws.com"
    : "https://epic-health-dashboard-artifacts.s3.us-east-1.amazonaws.com",
};

export default config;
