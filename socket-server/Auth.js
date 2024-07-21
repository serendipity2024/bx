const apiSdk = require("@builderx-core/api-sdk").apiSdk;
const get = require("lodash.get");
const http = require("http");

module.exports = class Auth {
  constructor(token) {
    apiSdk.init({
      localFontsUrl: "",
      baseUrl: process.env.API_URL,
      accessToken: token,
    });
    this.apiSdk = apiSdk;
  }

  async checkAuth() {
    if (await this.isLoggedIn()) {
      let hasTeam = false;
      try {
        hasTeam = await this.hasTeam();
      } catch (err) {
        console.log("No team data", err);
      }
      if (!hasTeam) {
        // window.location.replace(urljoin(window["bxEnv"].WEBSITE_URL, "team"));
        return;
      } else {
        return true;
      }
    }
  }

  async isLoggedIn() {
    try {
      const response = await this.apiSdk.auth();
      if (!response) {
        throw new Error("Not Authenticated");
      }
      const id = response.data.id.toString();

      if (id) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log("error");
      return false;
    }
    return false;
  }

  getProjectDetails(projectId, connectionId = "") {
    return new Promise((resolve, reject) => {
      this.apiSdk.project
        .get(projectId, connectionId)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          console.log(
            error,
            error.message,
            "Error in fetching getProjectDetails ***###"
          );
          reject(error);
        });
    });
  }

  async fetchProjectFiles(projectId) {
    return new Promise((resolve, reject) => {
      this.apiSdk.files
        .get(undefined, projectId)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          console.log(error, "Error in fetching project files");
          resolve([]);
        });
    });
  }

  async fetchUserDetails(userId) {
    try {
      const response = await this.apiSdk.auth();

      // console.log(
      //   response.data,
      //   this.apiSdk.config.accessToken,
      //   "response here"
      // );
      if (!response) {
        throw new Error("Not Authenticated");
      }
      const data = response.data;

      if (data) {
        return response.data;
      } else {
        return undefined;
      }
    } catch (error) {
      console.log("error");
      return undefined;
    }
  }

  hasTeam() {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await this.apiSdk.auth();
        if (!response) {
          throw new Error("Not Authenticated");
        }
        let hasTeam = get(response, "data.user.teams.length", 0);
        resolve(hasTeam);
      } catch (error) {
        console.log("error: ", error);
        reject(error);
      }
    });
  }

  updateProject(projectId, key, value) {
    return new Promise((resolve, reject) => {
      this.apiSdk.project
        .update(projectId, key, value)
        .then(async (response) => {
          resolve(true);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
};
