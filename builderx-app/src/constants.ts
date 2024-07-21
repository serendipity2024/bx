export const BACKEND_API_URL =
  typeof window !== "undefined" && window["bxEnv"]
    ? window["bxEnv"].BUILDERX_API_URL
    : String(process.env.REACT_APP_BUILDERX_API_URL || "");

export const WEBSITE_URL =
  typeof window !== "undefined" && window["bxEnv"]
    ? window["bxEnv"].BUILDERX_WEBSITE_URL
    : String(process.env.REACT_APP_BUILDERX_WEBSITE_URL);

export const SUPPORT_URL =
  typeof window !== "undefined" && window["bxEnv"]
    ? window["bxEnv"].BUILDERX_SUPPORT_URL
    : String(process.env.REACT_APP_REACT_APP_SUPPORT_URL);

export const APP_PORT_START =
  typeof window !== "undefined" && window["bxEnv"]
    ? Number(window["bxEnv"].BUILDERX_APP_PORT_START)
    : Number(process.env.REACT_APP_BUILDERX_APP_PORT_START);

export const APP_PORT_END =
  typeof window !== "undefined" && window["bxEnv"]
    ? Number(window["bxEnv"].BUILDERX_APP_PORT_END)
    : Number(process.env.REACT_APP_BUILDERX_APP_PORT_END);
export const APP_URL =
  typeof window !== "undefined" && window["bxEnv"]
    ? window["bxEnv"].BUILDERX_APP_URL
    : String(process.env.REACT_APP_REACT_APP_URL);

export const APP_STATIC_URL =
  typeof window !== "undefined" && window["bxEnv"]
    ? window["bxEnv"].BUILDERX_APP_STATIC_URL
    : String(process.env.REACT_APP_BUILDERX_APP_STATIC_URL);

export const APP_ENVIRONMENT =
  typeof window !== "undefined" && window["bxEnv"]
    ? window["bxEnv"].BUILDERX_APP_ENVIRONMENT
    : String(process.env.REACT_APP_BUILDERX_APP_ENVIRONMENT);

export const BUILDERX_FONT_API_KEY =
  typeof window !== "undefined" && window["bxEnv"]
    ? window["bxEnv"].BUILDERX_FONT_API_KEY
    : String(process.env.REACT_APP_BUILDERX_FONT_API_KEY);

export const BUILDERX_DOWNLOAD_URL = String(
  process.env.REACT_APP_BUILDERX_DOWNLOAD_URL
);
export const GA_TRACKING_ID =
  typeof window !== "undefined" && window["bxEnv"]
    ? window["bxEnv"].BUILDERX_GA_TRACKING_ID
    : String(process.env.REACT_APP_BUILDERX_GA_TRACKING_ID);

export const SENTRY_URL =
  typeof window !== "undefined" && window["bxEnv"]
    ? window["bxEnv"].BUILDERX_APP_SENTRY_DSN
    : String(process.env.REACT_APP_BUILDERX_APP_SENTRY_DSN);

export const BUILDERX_ASSETS_URL =
  typeof window !== "undefined" && window["bxEnv"]
    ? window["bxEnv"].BUILDERX_ASSETS_URL
    : String(process.env.REACT_APP_BUILDERX_ASSETS_URL);

export const SOCKET_SERVER_URL =
  typeof window !== "undefined" && window["bxEnv"]
    ? window["bxEnv"].SOCKET_SERVER_URL
    : "";
