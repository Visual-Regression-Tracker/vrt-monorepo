/* global cy */
import React from "react";
import { mount } from "cypress-react-unit-test";
import ProjectPage from "./ProjectPage";
import {
  ProjectProvider,
  AuthProvider,
  BuildProvider,
  TestRunProvider,
} from "../contexts";
import { MemoryRouter, Route } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import { buildsService, testRunService, staticService } from "../services";
import { BuildStatus } from "../types/buildStatus";
import { TestStatus } from "../types/testStatus";

describe("Project List page", () => {
  it("image", () => {
    cy.stub(buildsService, "getList").resolves([
      {
        id: "some id",
        projectName: "Project name",
        branchName: "Branch name",
        status: BuildStatus.failed,
        createdAt: "2020-09-14T06:57:25.845Z",
        createdBy: "2020-09-14T06:57:25.845Z",
        testRuns: [],
        unresolvedCount: 0,
        passedCount: 2,
        failedCount: 1,
        isRunning: false,
      },
      {
        id: "some id2",
        projectName: "Project name",
        branchName: "Branch name",
        status: BuildStatus.passed,
        createdAt: "2020-09-14T06:57:25.845Z",
        createdBy: "2020-09-14T06:57:25.845Z",
        testRuns: [],
        unresolvedCount: 0,
        passedCount: 2,
        failedCount: 0,
        isRunning: false,
      },
      {
        id: "some id3",
        projectName: "Project name",
        branchName: "Branch name",
        status: BuildStatus.unresolved,
        createdAt: "2020-09-14T06:57:25.845Z",
        createdBy: "2020-09-14T06:57:25.845Z",
        testRuns: [],
        unresolvedCount: 2,
        passedCount: 0,
        failedCount: 0,
        isRunning: false,
      },
    ]);
    cy.stub(testRunService, "getList").resolves([
      {
        id: "some test run id",
        createdAt: "2020-09-14T06:57:25.845Z",
        createdBy: "2020-09-14T06:57:25.845Z",

        buildId: "some build id",
        imageName: "imageName.png",
        diffName: "diffName.png",
        baselineName: "baselineName.png",
        diffPercent: 1.24,
        diffTollerancePercent: 3.21,
        status: TestStatus.unresolved,
        testVariationId: "some test variation id",
        name: "test run name",
        os: "OS",
        browser: "browser",
        viewport: "viewport",
        device: "device",
        ignoreAreas: "[]",
        comment: "some comment",
        branchName: "branch name",
        baselineBranchName: "baselineBranchName",
        merge: false,
      },
      {
        id: "some test run id2",
        createdAt: "2020-09-14T06:57:25.845Z",
        createdBy: "2020-09-14T06:57:25.845Z",

        buildId: "some build id",
        imageName: "imageName",
        diffName: "diffName",
        diffPercent: 1.24,
        diffTollerancePercent: 3.21,
        status: TestStatus.approved,
        testVariationId: "some test variation id",
        name: "test run name2",
        baselineName: "baselineName",
        os: "OS",
        browser: "browser",
        viewport: "viewport",
        device: "device",
        ignoreAreas: "[]",
        comment: "some comment",
        branchName: "branch name",
        baselineBranchName: "baselineBranchName",
        merge: false,
      },
      {
        id: "some test run id3",
        createdAt: "2020-09-14T06:57:25.845Z",
        createdBy: "2020-09-14T06:57:25.845Z",

        buildId: "some build id",
        imageName: "imageName",
        diffName: "diffName",
        diffPercent: 1.24,
        diffTollerancePercent: 3.21,
        status: TestStatus.new,
        testVariationId: "some test variation id",
        name: "test run name3",
        baselineName: "baselineName",
        os: "",
        browser: "",
        viewport: "",
        device: "",
        ignoreAreas: "[]",
        comment: "some comment",
        branchName: "branch name",
        baselineBranchName: "baselineBranchName",
        merge: false,
      },
      {
        id: "some test run id4",
        createdAt: "2020-09-14T06:57:25.845Z",
        createdBy: "2020-09-14T06:57:25.845Z",

        buildId: "some build id",
        imageName: "imageName",
        diffName: "diffName",
        diffPercent: 1.24,
        diffTollerancePercent: 3.21,
        status: TestStatus.ok,
        testVariationId: "some test variation id",
        name: "test run name4",
        baselineName: "baselineName",
        os: "",
        browser: "",
        viewport: "",
        device: "",
        ignoreAreas: "[]",
        comment: "some comment",
        branchName: "branch name",
        baselineBranchName: "baselineBranchName",
        merge: false,
      },
    ]);

    mount(
      <MemoryRouter initialEntries={["/someId"]}>
        <Route path={"/:projectId"}>
          <SnackbarProvider>
            <AuthProvider>
              <ProjectProvider>
                <BuildProvider>
                  <TestRunProvider>
                    <ProjectPage />
                  </TestRunProvider>
                </BuildProvider>
              </ProjectProvider>
            </AuthProvider>
          </SnackbarProvider>
        </Route>
      </MemoryRouter>,
      {
        stylesheets: ["/__root/src/index.css"],
      }
    );

    cy.vrtTrack("Project page");

    cy.contains("test run name").click();

    cy.get(".MuiDialog-root").vrtTrack("TestDetailsModal");
  });
});
