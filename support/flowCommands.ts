/* eslint-disable @typescript-eslint/no-namespace */

import flowObj from "../e2e/pageObjects/flow.json";
import globalObj from "../e2e/pageObjects/global.json";
import sidemenu from "../e2e/pageObjects/sideMenu.json";

Cypress.Commands.add("addFlowStageRule", () => {
  cy.get(sidemenu.flow).click();
  cy.wait(2000);
  cy.get(flowObj.autoLayoutIcon).click();
  cy.wait(2000);
  cy.get(flowObj.zoomFitIcon).click();
  cy.wait(1500);
  cy.get(flowObj.rf_wrapper)
    .find("[data-testid^='rf__node-']")
    .contains("Receiving")
    .click();
  cy.wait(1000);
  cy.get(flowObj.checkboxReceive).click().wait(500);
  cy.get(flowObj.checkboxProduce).click().wait(500);
  cy.get(flowObj.rf_wrapper)
    .find("[data-testid^='rf__node-']")
    .contains("Processing")
    .scrollIntoView()
    .click();
  cy.wait(1000);
  cy.get(flowObj.checkboxReceive).click().wait(500);
  cy.get(flowObj.checkboxProduce).click().wait(1000);
  cy.get(flowObj.rf_wrapper)
    .find("[data-testid^='rf__node-']")
    .contains("Shipping")
    .scrollIntoView()
    .click();
  cy.wait(1000);
  cy.get(flowObj.checkboxShip).click().wait(1000);
  cy.get(flowObj.publishChangesBtn).click();
  cy.get(globalObj.banner).contains("Flow published", { timeout: 15000 });
});

declare global {
  namespace Cypress {
    interface Chainable {
      addFlowStageRule(): Chainable<any>;
    }
  }
}
