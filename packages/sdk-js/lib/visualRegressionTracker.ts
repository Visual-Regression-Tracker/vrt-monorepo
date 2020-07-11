import { Config, Build, TestRun, TestRunResult, TestRunStatus } from "./types";
import axios, { AxiosRequestConfig } from "axios";

export class VisualRegressionTracker {
  config: Config;
  buildId: string | undefined;
  projectId: string | undefined;
  axiosConfig: AxiosRequestConfig;

  constructor(config: Config) {
    this.config = config;
    this.axiosConfig = {
      headers: {
        apiKey: this.config.apiKey,
      },
    };
  }

  private async startBuild() {
    if (!this.buildId) {
      console.log("Starting new build");
      const data = {
        branchName: this.config.branchName,
        project: this.config.project,
      };
      const build = await axios
        .post<Build>(`${this.config.apiUrl}/builds`, data, this.axiosConfig)
        .then(function (response) {
          // handle success
          return response.data;
        })
        .catch(function (error) {
          // handle error
          return Promise.reject(error);
        });
      this.buildId = build.id;
      this.projectId = build.projectId;
    }
  }

  private async submitTestResult(test: TestRun): Promise<TestRunResult> {
    const data = {
      buildId: this.buildId,
      projectId: this.projectId,
      branchName: this.config.branchName,
      ...test,
    };
    return axios
      .post(`${this.config.apiUrl}/test-runs`, data, this.axiosConfig)
      .then(function (response) {
        // handle success
        return response.data;
      })
      .catch(function (error) {
        // handle error
        return Promise.reject(error);
      });
  }

  async track(test: TestRun) {
    await this.startBuild();

    const result = await this.submitTestResult(test);

    if (result.status === TestRunStatus.new) {
      throw new Error(`No baseline: ${result.url}`);
    }
    if (result.status === TestRunStatus.unresolved) {
      throw new Error(`Difference found: ${result.url}`);
    }
  }
}
