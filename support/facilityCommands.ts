/* eslint-disable @typescript-eslint/no-namespace */

import facilityObj from "../e2e/pageObjects/facility.json";
import global from "../e2e/pageObjects/global.json";
import sideMenu from "../e2e/pageObjects/sideMenu.json";

Cypress.Commands.add("supplierAddCatalog", (catalogSupData) => {
  const catalogData = {
    department: {
      id: '[data-testid$=".supplierCode-input"]',
      value: catalogSupData.supCodeValue,
    },
  };

  cy.get(facilityObj.supAddCatalog).click();
  // click Choose Product input
  cy.get(facilityObj.addCatalogSection)
    .last()
    .find("input")
    .first()
    .as("btn")
    .click();
  cy.wait(2500);
  // select variant or tab
  cy.get(`[data-testid=${catalogSupData.category}]`)
    .parent()
    .click({ force: true });
  cy.wait(2000);
  // select an Item from selected category
  cy.get('[data-testid^="table-row"]').contains(catalogSupData.item).click();
  cy.wait(1500);
  cy.fillForm(catalogData);
});

Cypress.Commands.add("supplierAddContact", (contactData) => {
  cy.get(facilityObj.supplierAddContactBtn).click();
  cy.wait(4000);
  cy.fillForm(contactData);
});

Cypress.Commands.add("autoFillCode", (data) => {
  cy.get(sideMenu.facilityMenu).click();
  cy.wait(4000);
  cy.contains("Auto fill code").scrollIntoView();
  if (data) {
    cy.get("[data-testid='checkbox-shouldAutoFillCodeMakeProduct']").click();
    cy.wait(1000);
    cy.get("[data-testid='checkbox-shouldAutoFillCodeMakeProduct']")
      .find("input")
      .should("have.attr", "aria-checked", "true");
  } else {
    cy.get("[data-testid='checkbox-shouldAutoFillCodeMakeProduct']").click();
    cy.wait(1000);
    cy.get("[data-testid='checkbox-shouldAutoFillCodeMakeProduct']")
      .find("input")
      .should("have.attr", "aria-checked", "false");
  }
  cy.get('[data-testid="save-"]').click();
  cy.wait(3000);
  cy.get(global.banner, { timeout: 20000 }).contains(
    "Facility Settings Updated."
  );
});
Cypress.Commands.add("selectCodesForBundle", (codes) => {
  cy.get(sideMenu.facilityMenu).click();
  cy.url().should("contain", "/admin/facility");
  cy.wait(1500);
  cy.contains("Bundle Naming Format");
  cy.get(facilityObj.selectBundleCodes).select(codes);
  cy.wait(1200);
  cy.get('[data-testid="save-"]').click();
  cy.wait(3000);
  cy.get(global.banner, { timeout: 20000 }).contains(
    "Facility Settings Updated."
  );
});

Cypress.Commands.add("setReceivingItemVariant", (variants: string[]) => {
  // Define the allowed variant keys as a union type
  const variantCheckboxes: {
    [key in
      | "Ingredient"
      | "Chemical"
      | "Product"
      | "Packaging"
      | "Packaged"]: string;
  } = {
    Ingredient: "checkbox-canReceiveIngredients",
    Chemical: "checkbox-canReceiveChemicals",
    Product: "checkbox-canReceiveProducts",
    Packaging: "checkbox-canReceivePackaging",
    Packaged: "checkbox-canReceivePackaged",
  };

  // Navigate to the settings page and wait for the elements to be ready
  cy.get(sideMenu.facilityMenu).click();
  cy.url().should("contain", "/admin/facility");
  cy.wait(2500);

  // Loop through each variant checkbox
  Object.keys(variantCheckboxes).forEach((variant) => {
    const checkboxId =
      variantCheckboxes[
        variant as
          | "Ingredient"
          | "Chemical"
          | "Product"
          | "Packaging"
          | "Packaged"
      ];
    const checkboxSelector = `[data-testid="${checkboxId}"] input`; // Target the <input> inside the <div>

    // Get the current state of the checkbox using aria-checked attribute
    cy.get(checkboxSelector)
      .should("exist") // Ensure the <input> exists
      .then(($checkbox) => {
        const isChecked = $checkbox.attr("aria-checked") === "true";

        // If the variant is in the list, ensure it's checked, otherwise uncheck it
        if (variants.includes(variant)) {
          if (!isChecked) {
            // If the checkbox isn't checked, click it
            cy.wrap($checkbox).click();
            cy.wait(1200);
          }
        } else {
          if (isChecked) {
            // If the checkbox is checked and the variant isn't in the list, uncheck it
            cy.wrap($checkbox).click();
          }
        }
      });
  });
  cy.wait(1200);
  cy.get('[data-testid="save-"]').click();
  cy.wait(3000);
  cy.get(global.banner, { timeout: 20000 }).contains(
    "Facility Settings Updated."
  );
});

Cypress.Commands.add("setPOCustomDataOptions", (data) => {
  cy.get(sideMenu.facilityMenu).click();
  cy.wait(4000);
  cy.contains("Purchase Orders").scrollIntoView();

  const checkboxSelector =
    '[data-testid="checkbox-shouldShowPurchaseOrderOptionalModal"] input';

  // Check the current state of the checkbox using aria-checked attribute
  cy.get(checkboxSelector).then(($checkbox) => {
    const isChecked = $checkbox.attr("aria-checked") === "true";

    // If data is true, ensure the checkbox is checked
    if (data) {
      if (!isChecked) {
        // If the checkbox is not checked, click it to check it
        cy.wrap($checkbox).click();
      }
    } else {
      // If data is false, ensure the checkbox is unchecked
      if (isChecked) {
        // If the checkbox is checked, click it to uncheck it
        cy.wrap($checkbox).click();
      }
    }
  });
  cy.wait(1200);
  cy.get('[data-testid="save-"]').click();
  cy.wait(3000);
  cy.get(global.banner, { timeout: 20000 }).contains(
    "Facility Settings Updated."
  );
});

declare global {
  namespace Cypress {
    interface Chainable {
      supplierAddCatalog(catalogSupData: {
        category: string;
        item: string;
        supCodeValue: any;
      }): Chainable<any>;
      supplierAddContact(contactData: any): Chainable<any>;
      autoFillCode(data: boolean): Chainable<any>;
      supplierAddContact(contactData: any): Chainable;
      supplierAddContact(contactData: any): Chainable<any>;
      autoFillCode(data: boolean): Chainable<any>;
      selectCodesForBundle(codes: any): Chainable<any>;
      setReceivingItemVariant(variants: string[]): Chainable<any>;
      setPOCustomDataOptions(data: boolean): Chainable<any>;
    }
  }
}
