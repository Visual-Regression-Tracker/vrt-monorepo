import { Config, Build, TestRun, TestRunResult, TestRunStatus } from "./types";
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";

export class VisualRegressionTracker {
  private config: Config;
  private buildId: string | undefined;
  private projectId: string | undefined;
  private axiosConfig: AxiosRequestConfig;

  constructor(config: Config) {
    this.config = config;
    this.axiosConfig = {
      headers: {
        apiKey: this.config.apiKey,
      },
    };
  }

  private isStarted() {
    return !!this.buildId && !!this.projectId;
  }

  async start() {
    const data = {
      branchName: this.config.branchName,
      project: this.config.project,
    };

    const build: Build = await axios
      .post(`${this.config.apiUrl}/builds`, data, this.axiosConfig)
      .then(this.handleResponse)
      .catch(this.handleException);

    this.buildId = build.id;
    this.projectId = build.projectId;
  }

  async stop() {
    if (!this.isStarted()) {
      throw new Error("Visual Regression Tracker has not been started");
    }

    await axios
      .patch(
        `${this.config.apiUrl}/builds/${this.buildId}`,
        {},
        this.axiosConfig
      )
      .then(this.handleResponse)
      .catch(this.handleException);
  }

  private async submitTestResult(test: TestRun): Promise<TestRunResult> {
    if (!this.isStarted()) {
      throw new Error("Visual Regression Tracker has not been started");
    }

    const data = {
      buildId: this.buildId,
      projectId: this.projectId,
      branchName: this.config.branchName,
      ...test,
    };

    return axios
      .post(`${this.config.apiUrl}/test-runs`, data, this.axiosConfig)
      .then(this.handleResponse)
      .catch(this.handleException);
  }

  private async handleResponse(response: AxiosResponse) {
    return response.data;
  }

  private async handleException(error: AxiosError) {
    const status = error.response?.status;
    if (status === 401) {
      return Promise.reject("Unauthorized");
    }
    if (status === 403) {
      return Promise.reject("Api key not authenticated");
    }
    if (status === 404) {
      return Promise.reject("Project not found");
    }

    return Promise.reject(error.message);
  }

  async track(test: TestRun) {
    const result = await this.submitTestResult(test);

    let errorMessage: string | undefined;
    switch (result.status) {
      case TestRunStatus.new: {
        errorMessage = `No baseline: ${result.url}`;
        break;
      }
      case TestRunStatus.unresolved: {
        errorMessage = `Difference found: ${result.url}`;
      }
    }

    if (errorMessage) {
      if (this.config.enableSoftAssert) {
        console.log(errorMessage);
      } else {
        throw new Error(errorMessage);
      }
    }
  }
}
