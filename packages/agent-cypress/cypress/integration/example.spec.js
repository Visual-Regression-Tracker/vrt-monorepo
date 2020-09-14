/* global cy */

context("Visual Regression Tracker", () => {
  beforeEach(() => {
    cy.visit("/commands/viewport");
  });

  it("example", () => {
    cy.get("#navbar").should("be.visible");

    cy.vrtTrack("Whole page");

    cy.get("#navbar").vrtTrack("Separate element");

    cy.vrtTrack("With additional options", {
      os: "MacOS",
      device: "Cloud agent",
      diffTollerancePercent: 0,
    });
  });
});
