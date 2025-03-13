/* eslint-disable @typescript-eslint/no-namespace */

import floorObj from "../e2e/pageObjects/floor.json";
import global from "../e2e/pageObjects/global.json";
import sidemenu from "../e2e/pageObjects/sideMenu.json";
function generateUniqueCode(length: number) {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  while (result.length < length) {
    const randomChar = charset[Math.floor(Math.random() * charset.length)];
    if (!result.includes(randomChar)) {
      result += randomChar;
    }
  }

  return result;
}
const code = generateUniqueCode(5);

Cypress.Commands.add("receiveItems", (data) => {
  cy.get(sidemenu.floor).click();
  cy.get(floorObj.receiveItemsBtn).click();
  cy.wait(1500);
  cy.get(floorObj.selectSupplier).find("input").last().as("btn").click();
  cy.wait(3000);
  cy.get("[data-testid^='table-row']").contains(data.supplier).click();
  cy.step("I select a Products Item, add Quantity and Unique ID");
  cy.get(floorObj.floorAddItemBtn).last().click();
  cy.wait(2000);
  if (typeof data.variant !== "undefined") {
    cy.get(`[data-testid=${data.variant}]`).click({ force: true });
  } else {
    cy.get(`[data-testid="Ingredient"]`).click({ force: true });
  }
  cy.wait(3500);
  cy.get("[data-testid^='table-row']")
    .contains(data.product)
    .last()
    .click({ force: true });
  cy.get("[data-testid='btn-common-done']").click();
  cy.wait(1500);
  cy.get(floorObj.quantityInput)
    .last()
    .clear()
    .type(data.quantity, { force: true });
  cy.wait(500);
  cy.get(floorObj.uniqueCodeInput).last().clear().type(`ete-pruduct-${code}`);
  // if (!data.printLabel) {
  //   cy.get("[role='switch']").last().click();
  // }
  cy.get(floorObj.saveReciveBtn).last().click();
  cy.get(global.banner, { timeout: 25000 }).contains(
    `${data.product} received successfully!`,
    {
      timeout: 10000,
    }
  );
  cy.wait(2000);
});

Cypress.Commands.add("receiveMultipleItems", (data: any) => {
  // Step 1: Click the side floor menu and the "Receive Items" button
  cy.get(sidemenu.floor).click();
  cy.get(floorObj.receiveItemsBtn).click();
  cy.wait(1500);

  // Step 2: Select the supplier
  cy.get(floorObj.selectSupplier).find("input").last().as("btn").click();
  cy.wait(3000);
  cy.get("[data-testid^='table-row']").contains(data.supplier).click();

  // Step 3: Log that we're starting to add products
  cy.step("I select Products Item, add Quantity, and Unique ID");

  // Step 4: Click the "Add Item" button once before the iteration over products
  cy.get(floorObj.floorAddItemBtn).last().click();
  cy.wait(2000);

  // Step 5: Loop through each product in the data.products array
  data.items.forEach(
    (productData: { variant: any; item: string | number | RegExp }) => {
      // Step 5a: Select the variant of the product (if provided)
      if (productData.variant) {
        cy.get(`[data-testid=${productData.variant}]`).click({ force: true });
      } else {
        cy.get("[data-testid='Ingredient']").click({ force: true });
      }

      cy.wait(3500);

      // Step 5b: Select the product from the modal
      cy.get("[data-testid^='table-row']")
        .contains(productData.item)
        .last()
        .click({ force: true });
    }
  );

  // Step 6: Click the "Done" button after selecting all products
  cy.get("[data-testid='btn-common-done']").click();
  cy.wait(1500);

  // Step 7: Fill in the quantity and unique ID for each product
  data.items.forEach(
    (productData: { quantity: string; uniqueId: string }, index: any) => {
      // Step 7a: Fill in quantity
      cy.get(`[data-testid="productRows.${index}.quantity_scalar-input"]`)
        .clear()
        .type(productData.quantity, { force: true });
      cy.wait(500);

      cy.get(`[data-testid="productRows.${index}.code-input"]`)
        .clear()
        .type(productData.uniqueId);
    }
  );

  // Step 8: Click the "Save" button to save all received items
  cy.get(floorObj.saveReciveBtn).last().click();

  // Step 9: Assert that the product was received successfully
  data.items.forEach((productData: { item: any }) => {
    cy.get(global.banner, { timeout: 25000 }).contains(
      `received successfully!`,
      { timeout: 20000 }
    );
  });

  cy.wait(2000);
});

declare global {
  namespace Cypress {
    interface Chainable {
      receiveItems(data: {
        supplier: string;
        variant?: string;
        product: string;
        quantity: string;
        printLabel?: boolean;
      }): Chainable<any>;
      receiveMultipleItems(data: {
        supplier: string;
        items: {
          item: string;
          variant: string;
          quantity: string;
          uniqueId: string;
        }[];
      }): Chainable<any>;
    }
  }
}
