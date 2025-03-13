/* eslint-disable @typescript-eslint/no-namespace */

import sidemenu from "../e2e/pageObjects/sideMenu.json";

Cypress.Commands.add("getProdPlanRecipe", (planId) => {
  cy.task("getProdPlanById", planId);
});

declare global {
  namespace Cypress {
    interface Chainable {
      getProdPlanRecipe(planId: string): Chainable<any>;
    }
  }
}
