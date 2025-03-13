/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
Cypress.on("uncaught:exception", (err, runnable) => {
  return false;
});
import {
  codesPayloadForProduction,
  forOutputItem,
  inputsItemsIngredient,
  recipePayload,
} from "../../../support/samplePayload";
import floorObj from "../../pageObjects/floor.json";
import global from "../../pageObjects/global.json";
import sidemenu from "../../pageObjects/sideMenu.json";
let item1: string;
let item2: string;
describe(
  "Production flow using  the Continues Fixed Recipe Type",
  { testIsolation: false, scrollBehavior: "center" },
  () => {
    before(() => {
      cy.clearAllCookies();
      cy.clearAllLocalStorage();
      cy.clearAllSessionStorage();
      cy.task("createTenant");
      // seed Catalog Item and get the id for Recipe Inputs
      cy.step("Login to the app");
      cy.loginAs("dynamicUser");
      cy.step("navigate to flow page and add assign traits in each stage");
      cy.seedSupplier("");
      cy.seedProduct(inputsItemsIngredient).then(($catalogItem) => {
        item1 = $catalogItem.id;
      });
      cy.seedProduct(forOutputItem).then(($catalogItemInput) => {
        item2 = $catalogItemInput.id;
      });
      cy.seedCodes(codesPayloadForProduction);
      // cy.seedEmployee(employeePayload);
      cy.addFlowStageRule();
      cy.step("Perform Receiving for input item");
      cy.receiveItems({
        supplier: "ETE Supplier",
        product: inputsItemsIngredient.name,
        quantity: "100",
        printLabel: false,
      });
    });
    after(() => {
      cy.task("destroyTestTenant");
      cy.wait(800);
    });
    it("Verify that a recipe can be set to the “Continuous Fixed” process type and that the change is reflected correctly", () => {
      recipePayload.name = "Continues Fixes";
      recipePayload.inputs.splice(1, 1); // remove the second input from array
      recipePayload.inputs[0].quantity = "15";
      recipePayload.inputs[0].correlationId = item1;
      recipePayload.outputs[0].correlationId = item2;
      cy.seedRecipe(recipePayload);
      cy.step(
        "Verify that a recipe can be set to the “Continuous Fixed” process type and that the change is reflected correctly"
      );
      cy.get(sidemenu.floor).click();
      cy.url().should("contain", "/floor");
      cy.wait(5000);
      cy.get(sidemenu.recipeMenu).click();
      cy.wait(2000);
      cy.get("[data-testid='Production']").click();
      cy.wait(2000);
      cy.contains(recipePayload.name).click();
      cy.wait(2000);
      cy.step("Set the Process Type to “Continuous Fixed”.");
      cy.get("[data-testid='select-processType']").select("Continuous Fixed");
      cy.wait(1000);
      cy.step("User save the changes");
      cy.get("[data-testid='save-recipes']").click();
      cy.wait(1000);
      cy.get(global.banner).contains(
        `${recipePayload.name} recipe saved successfully`
      );
      cy.step(
        "Verify that the “Continuous Fixed” label is displayed on the recipe card."
      );
      cy.get("[data-testid='Production']").click();
      cy.get("[data-testid='recipe-cards']").should((recipeCard) => {
        expect(recipeCard).to.contain(recipePayload.name);
        expect(recipeCard).to.contain("Continuous Fixed");
      });
      cy.step(
        "Ensure that a recipe with the “Continuous Fixed” type executes properly with target repeat."
      );
      cy.get(sidemenu.floor).click();
      cy.get(floorObj.makeProductBtn).click();
      cy.url().should("contain", "floor/make/recipe");
      cy.contains("Select Recipe");
      cy.wait(3000);
      cy.get("[data-testid='Production']").click();
      cy.wait(3000);
      cy.step("Select the recipe that has the “Continuous Fixed” label.");
      cy.get("[data-testid='recipe-cards']")
        .contains(recipePayload.name)
        .click();
      cy.wait(3000);
      cy.step(
        "User clicks the source item button and assert that the available item is auto selected"
      );
      cy.get(floorObj.sourceChoosingBtn).as("btn").click();
      cy.wait(1200);
      cy.step("Set the Target Repeat value to 5 repeats");
      cy.get("[data-testid='targetScale-input']").type("{selectall}5");
      cy.step("Click Create to execute the first repeat.");
      // first create
      cy.get(floorObj.saveMakeProductBtn).click();
      cy.wait(2000);
      cy.get(global.banner).should(
        "contain",
        `${recipePayload.name} has been made successfully!`
      );
      cy.wait(3200);
      cy.step("Verify that the page refreshes and displays “2/5 repeats”.");
      cy.get("[data-testid='targetScale-input']")
        .should("have.value", "5")
        .parentsUntil("[tabindex='0']")
        .parent()
        .parent()
        .should("contain", "2");
      cy.step(
        "Click Create four more times to complete all remaining repeats."
      );
      // second create
      cy.get(floorObj.saveMakeProductBtn).click();
      cy.wait(2000);
      cy.get(global.banner).should(
        "contain",
        `${recipePayload.name} has been made successfully!`
      );
      cy.wait(3200);
      cy.step("Verify that the page refreshes and displays “3/5 repeats”.");
      cy.get("[data-testid='targetScale-input']")
        .should("have.value", "5")
        .parentsUntil("[tabindex='0']")
        .parent()
        .parent()
        .should("contain", "3");
      // third create
      cy.get(floorObj.saveMakeProductBtn).click();
      cy.wait(2000);
      cy.get(global.banner).should(
        "contain",
        `${recipePayload.name} has been made successfully!`
      );
      cy.wait(3200);
      cy.step("Verify that the page refreshes and displays “4/5 repeats”.");
      cy.get("[data-testid='targetScale-input']")
        .should("have.value", "5")
        .parentsUntil("[tabindex='0']")
        .parent()
        .parent()
        .should("contain", "4");
      // fourth create
      cy.get(floorObj.saveMakeProductBtn).click();
      cy.wait(2000);
      cy.get(global.banner).should(
        "contain",
        `${recipePayload.name} has been made successfully!`
      );
      cy.wait(3200);
      cy.step("Verify that the page refreshes and displays “5/5 repeats”.");
      cy.get("[data-testid='targetScale-input']")
        .should("have.value", "5")
        .parentsUntil("[tabindex='0']")
        .parent()
        .parent()
        .should("contain", "5");
      // final create
      cy.step(
        "On the 5th repeat, confirm that the “Create” button is replaced with a “Finish” button. Then click!"
      );
      cy.get(floorObj.saveMakeProductBtn).contains("Finish").click();
      cy.get(global.banner).should(
        "contain",
        `${recipePayload.name} has been made successfully!`
      );
      cy.step("Verify that the Make Product page closes");
      cy.url().should("contain", "/floor?");
      cy.get("[data-testid='row-items']").should((itemsOnFloor) => {
        expect(itemsOnFloor).to.have.length(6); // Including the Item used as Inputs
        expect(itemsOnFloor).to.contain(forOutputItem.name);
      });
    });
  }
);
