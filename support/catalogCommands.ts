/* eslint-disable @typescript-eslint/no-namespace */
/// <reference types="cypress" />

import catalogObj from "../e2e/pageObjects/catalog.json";

Cypress.Commands.add("addCustomAttributeCmd", (data) => {
  cy.get(catalogObj.addCustAttrBtn).click();
  cy.get(`[data-testid="attributes.${data.index}.name-input"]`).type(data.name);
  cy.wait(1000);
  cy.get(`[data-testid="select-attributes.${data.index}.type"]`).select(
    data.type
  );
  cy.wait(500);
  if (data.required) {
    cy.get(
      `[data-testid="checkbox-attributes.${data.index}.required"]`
    ).click();
  } else {
    cy.wait(500);
  }
});

declare global {
  namespace Cypress {
    interface Chainable {
      addCustomAttributeCmd(data: {
        index: number;
        name: string;
        type: string;
        required: boolean;
      }): Chainable<void>;
    }
  }
}
