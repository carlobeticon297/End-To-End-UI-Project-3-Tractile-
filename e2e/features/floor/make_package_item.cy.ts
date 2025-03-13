/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
Cypress.on("uncaught:exception", (err, runnable) => {
  return false;
});
import {
  inputsItemsIngredient,
  outputPackagedItem,
  recipePayload,
} from "../../../support/samplePayload";
import floorObj from "../../pageObjects/floor.json";
import global from "../../pageObjects/global.json";
import sidemenu from "../../pageObjects/sideMenu.json";

recipePayload.inputs.splice(1, 1); // remove the second input from array
inputsItemsIngredient.name = "New Mango Shake";
describe(
  "To ensure that the **Packaged product is being produced as a product type** bug does not occur again.",
  { testIsolation: false, scrollBehavior: "center" },
  () => {
    before(() => {
      cy.clearAllCookies();
      cy.clearAllLocalStorage();
      cy.clearAllSessionStorage();
      cy.task("createTenant");
      // seed Catalog Item and get the id for Recipe Inputs
      cy.step("Login to the app");
      cy.seedSupplier("");
      cy.seedProduct(inputsItemsIngredient).then(
        ($catalogItemInput: { id: string }) => {
          recipePayload.inputs[0].correlationId = $catalogItemInput.id;
          // seed another Catalog Item and get the id for Recipe Outputs
          outputPackagedItem.unitOfMeasurement = "case";
          cy.seedProduct(outputPackagedItem).then(
            ($catalogItemOutput: { id: string }) => {
              recipePayload.outputs[0].correlationId = $catalogItemOutput.id;
              // seed Recipe
              cy.seedRecipe(recipePayload);
            }
          );
        }
      );
      cy.loginAs("dynamicUser");
      cy.step("navigate to flow page and add assign traits in each stage");
      cy.addFlowStageRule();
      cy.get(sidemenu.floor).click();
      cy.url().should("contain", "/floor");
    });
    after(() => {
      cy.task("destroyTestTenant");
      cy.wait(800);
    });
    it("Packaged product is being produced as a packaged type", () => {
      cy.wait(5000);
      cy.step(
        "Admin navigates to Catalog page and verify that the item is packaged item"
      );
      cy.get(sidemenu.catalogMenu).click();
      cy.url().should("contain", "admin/catalog");
      cy.wait(2500);
      cy.get("[data-testid='Packaged']").click();
      cy.wait(2000);
      cy.get("[data-testid='table-row-0-catalog-items']").should(
        "contain",
        outputPackagedItem.name
      );
      cy.step("Perform recieve item steps");
      cy.receiveItems({
        supplier: "ETE Supplier",
        product: inputsItemsIngredient.name,
        quantity: "10",
        printLabel: false,
      });
      cy.wait(8000);
      cy.step("Start the make product step");
      cy.get(sidemenu.floor).click();
      cy.url().should("contain", "/floor");
      cy.step("User clicks on the **Make Product** button");
      cy.get(floorObj.makeProductBtn).click();
      cy.url().should("contain", "floor/make/recipe");
      cy.contains("Select Recipe");
      cy.wait(3000);
      cy.reload();
      cy.step("User selects a variant **Production**");
      cy.get("[data-testid='Production']").click();
      cy.wait(3000);
      cy.step("User clicks the Recipe");
      cy.contains(recipePayload.name).parent().parent().click();
      cy.wait(3000);
      cy.get(floorObj.inputsSurface).contains(inputsItemsIngredient.name);
      cy.step("Select Source Item");
      cy.get(floorObj.sourceChoosingBtn).click();
      cy.wait(5500);
      cy.step("User clicks the **Create** btn");
      cy.get(floorObj.saveMakeProductBtn).click();
      cy.wait(1000);
      cy.step("User should see the success banner and navigated to floor page");
      cy.get(global.banner).contains(
        `${recipePayload.name} has been made successfully!`
      );
      cy.wait(3000);
      cy.contains("Items On Hand");
      cy.step(
        "User should see the output item in the inventory table and assert the the correct type **packaged** on info modal"
      );
      cy.get("[data-testid='row-items']")
        .first()
        .find("[tabindex='-1']")
        .last()
        .find("path")
        .click();
      cy.wait(5000);
      cy.get("[aria-modal='true']")
        .find('[dir="auto"]')
        .contains("Type")
        .parent()
        .should("contain", "Packaged");
    });
  }
);
