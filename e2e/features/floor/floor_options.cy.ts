/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
Cypress.on("uncaught:exception", (err, runnable) => {
  return false;
});
import {
  forOutputItem,
  inputsItemsIngredient,
  recipePayload,
  recipeWithInputsAsProduct,
} from "../../../support/samplePayload";
import floorObj from "../../pageObjects/floor.json";
import global from "../../pageObjects/global.json";
import sidemenu from "../../pageObjects/sideMenu.json";
let outputItemId: any;

describe(
  "Floor Options Modal",
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
      cy.wait(3000);
      cy.addFlowStageRule();
      cy.get(sidemenu.floor).click();
      cy.url().should("contain", "/floor");
    });
    after(() => {
      cy.task("destroyTestTenant");
      cy.wait(800);
    });
    it("Made From and Deconstruct: Multiple Inputs should display the correct quantity", () => {
      cy.wait(5000);
      forOutputItem.name = "Product Options Test";
      recipePayload.name = "Recipe first";
      recipePayload.outputs[0].quantity = "2kg";
      const inputItem1 = inputsItemsIngredient;
      (inputItem1.name = "Ingredient1"),
        (inputItem1.unitOfMeasurement = "kilogram");
      // Seed Ingredient Item for inputs 1 with 1 kg
      cy.seedProduct(inputItem1).then(($catalogItemInput1) => {
        recipePayload.inputs[0].name = inputItem1.name;
        recipePayload.inputs[0].correlationId = $catalogItemInput1.id;
        recipePayload.inputs[0].quantity = "1 kg";
        cy.wait(1000);
        const inputItem2 = inputsItemsIngredient;
        (inputItem2.name = "Ingredient2"),
          (inputItem2.unitOfMeasurement = "kilogram");
        // Seed Ingredient Item for inputs 2 with 4kg
        cy.seedProduct(inputItem2).then(($catalogItemInput2) => {
          cy.wait(1000);
          recipePayload.inputs[1].name = inputItem2.name;
          recipePayload.inputs[1].correlationId = $catalogItemInput2.id;
          recipePayload.inputs[1].quantity = "4 kg";
          // seed another Catalog Item and get the id for Recipe Outputs
          cy.seedProduct(forOutputItem).then(($catalogItemOutput) => {
            recipePayload.outputs[0].correlationId = $catalogItemOutput.id;
            outputItemId = $catalogItemOutput;
            // seed Recipe
            cy.seedRecipe(recipePayload);
          });
        });
      });
      cy.step("Steps to receive an Item");
      cy.receiveItems({
        supplier: "ETE Supplier",
        product: "Ingredient1",
        quantity: "1",
        printLabel: false,
      });
      cy.wait(3000);
      cy.receiveItems({
        supplier: "ETE Supplier",
        product: "Ingredient2",
        quantity: "4",
        printLabel: false,
      });
      cy.get(sidemenu.floor).click();
      cy.url().should("contain", "/floor");
      cy.step("User clicks on the **Make Product** button");
      cy.get(floorObj.makeProductBtn).click();
      cy.url().should("contain", "floor/make/recipe");
      cy.contains("Select Recipe");
      cy.wait(3000);
      cy.step("User selects a variant **Production**");
      cy.get("[data-testid='Production']").click();
      cy.wait(3000);
      cy.step(
        "Assert that the expected Recipe exist and contains the correct number of Inputs and Outputs"
      );
      cy.contains(recipePayload.name)
        .parent()
        .parent()
        .should("contain", "2 Inputs")
        .and("contain", "1 Outputs");
      cy.step("User clicks the Recipe");
      cy.contains(recipePayload.name).parent().parent().click();
      cy.wait(3000);
      cy.step("user clicks on each *choose source button**");
      cy.get(floorObj.sourceChoosingBtn).each(($btn) => {
        cy.wait(1500);
        cy.wrap($btn).as("btn").click();
      });

      cy.step("User clicks the **Create** button");
      cy.get(floorObj.saveMakeProductBtn).click();
      cy.wait(2000);
      cy.get(global.banner).should("be.visible");
      cy.wait(5000);
      cy.step(
        "User clicks the **Options Icon** and navigate to Deconstruct tab"
      );
      cy.get("[data-testid='row-items']")
        .contains(forOutputItem.name)
        .parentsUntil("[data-testid='row-items']")
        .find(floorObj.iconsOption)
        .click();
      cy.wait(3000);
      cy.get("[data-testid='Deconstruct']").click();
      cy.wait(3000);
      cy.contains("Ingredient1").parent().parent().should("contain", "1 kg");
      cy.contains("Ingredient2").parent().parent().should("contain", "4 kg");
      cy.step("User navigates to **Made From** tab");
      cy.get("[data-testid='Made From']").click();
      cy.wait(3000);
      cy.get("[aria-modal='true']")
        .find("[index='0']")
        .should("contain", "1")
        .and("contain", "kg");
      cy.get("[aria-modal='true']")
        .find("[index='1']")
        .should("contain", "4")
        .and("contain", "kg");
    });
    it("Floor Options - History for Produced and Consumed", () => {
      // Produced and Consumed History
      cy.wait(5000);
      recipeWithInputsAsProduct.name = "Recipe Second";
      recipeWithInputsAsProduct.inputs[0].correlationId = outputItemId.id;
      cy.step(
        "Seed new Recipe and use the Produced output item as Input for new Output Item"
      );
      forOutputItem.name = "Output Second Item";
      cy.seedProduct(forOutputItem).then(($secondOutput) => {
        recipeWithInputsAsProduct.inputs[0].name = "Product Options Test";
        recipeWithInputsAsProduct.inputs[0].quantity = "1 U";
        recipeWithInputsAsProduct.outputs[0].correlationId = $secondOutput.id;
        cy.seedRecipe(recipeWithInputsAsProduct);
      });
      cy.reload();
      cy.step("User clicks on the **Make Product** button");
      cy.get(floorObj.makeProductBtn).click();
      cy.url().should("contain", "floor/make/recipe");
      cy.contains("Select Recipe");
      cy.wait(3000);
      cy.step("User selects a variant **Production**");
      cy.get("[data-testid='Production']").click();
      cy.wait(3000);
      cy.step(
        "Assert that the expected Recipe exist and contains the correct number of Inputs and Outputs"
      );
      cy.contains(recipeWithInputsAsProduct.name)
        .parent()
        .parent()
        .should("contain", "1 Inputs")
        .and("contain", "1 Outputs");
      cy.step("User clicks the Recipe");
      cy.get("[data-testid='recipe-cards']")
        .contains(recipeWithInputsAsProduct.name)
        .parentsUntil("[data-testid='recipe-cards']")
        .parent()
        .parent()
        .click({ force: true });
      cy.wait(1500);
      cy.step("user clicks on *choose source button**");
      cy.get(floorObj.sourceChoosingBtn).click();
      cy.step("User clicks the **Create** button");
      cy.get(floorObj.saveMakeProductBtn).click();
      cy.wait(2000);
      cy.get(global.banner).should("be.visible");
      cy.wait(5000);
      cy.step("User clicks the **Options Icon** and navigate to History tab");
      cy.get("[data-testid='row-items']")
        .contains("Product Options Test")
        .parentsUntil("[data-testid='row-items']")
        .find(floorObj.iconsOption)
        .click();
      cy.wait(3000);
      cy.get("[data-testid='History']").click();
      cy.wait(3000);
      cy.get("[aria-modal='true']")
        .find("div")
        .contains("Produce")
        .parent()
        .should("contain", "2 U");
      cy.get("[aria-modal='true']")
        .find("div")
        .contains("Consumed")
        .parent()
        .and("contain", "1 U")
        .and("contain", "was consumed to create")
        .and("contain", forOutputItem.name);
      cy.step("User Closed the Options Modal");
      cy.get("[aria-modal='true']").contains("Close").as("btn").click();
      cy.wait(3000);
    });
    it("The user can move Items to another stage or location and must be logged in History", () => {
      cy.wait(5000);
      cy.reload();
      cy.step("User selects the item **Product Options Test**");
      cy.get("[data-testid='row-items']")
        .contains("Product Options Test")
        .parentsUntil("[data-testid='row-items']")
        .find("input")
        .as("btn")
        .click();
      cy.wait(1500);
      cy.get(floorObj.moveBtn).click();
      cy.url().should("contain", "/floor/move");
      cy.get("[data-testid='itemName-move']").contains("Move Items");
      cy.wait(2500);
      cy.get("[data-testid='table-row-0-item']")
        .should("contain", "Product Options Test")
        .find("input")
        .should("have.value", 1);
      cy.step("User selects **shipping** stage");
      cy.get(floorObj.selectStageId).select("Shipping");
      cy.wait(4000);
      cy.step("User Saves the Move Item");
      cy.get(floorObj.saveMove).click();
      cy.wait(2000);
      cy.get(global.banner).contains("Items moved to On Hand successfully!");
      cy.wait(3500);
      cy.step("User Navigates to **Shipping** stage to check the moved items");
      cy.get(floorObj.selectStage).select("Shipping");
      cy.wait(2000);
      cy.get("[data-testid='row-items']")
        .contains("Product Options Test")
        .parentsUntil("[data-testid='row-items']")
        .find(floorObj.iconsOption)
        .click();
      cy.wait(3000);
      cy.get("[data-testid='History']").click();
      cy.wait(3000);
      cy.get("[aria-modal='true']").find("div").contains("Produced");
      cy.get("[aria-modal='true']")
        .find("div")
        .contains("Consumed")
        .parent()
        .and("contain", "1 U")
        .and("contain", "was consumed to create")
        .and("contain", forOutputItem.name);
      cy.get("[aria-modal='true']")
        .find("div")
        .contains("Moved")
        .parent()
        .and("contain", "Moved from")
        .and("contain", "Receiving")
        .and("contain", "to")
        .and("contain", "Shipping");
      cy.wait(2500);
    });
    it("User should be able to edit the received item, adjust quantity, change code, add tag, put On hold and add reason for change and Verify the History", () => {
      const newQty = "12.52";
      const newCode = "ETE-CODE-EDIT-001";
      cy.wait(2500);
      cy.reload();
      cy.get("[data-testid='row-items']")
        .contains("Product Options Test")
        .parentsUntil("[data-testid='row-items']")
        .find(floorObj.iconsOption)
        .click();
      cy.step("User navigate to Edit tab on Floor Options modal -> Edit tab");
      cy.wait(2000);
      cy.get("[data-testid='Edit']").click();
      cy.wait(1000);
      // Edit Quantity
      cy.step(
        "User changed the Quantity to **12.52** and Saved it and user should see warning 'This field is required' when **Reason for Change is not specified**"
      );
      cy.get("[data-testid='quantity_scalar-input']").type(
        `{selectall}${newQty}`
      );
      cy.wait(1000);
      cy.get("[data-testid='save-']").click();
      cy.get("[aria-modal='true']").should("contain", "This field is required");
      cy.step("User writes a **Reason for Change**");
      cy.get("[data-testid='note-input']").type("ETE changed the Quantity");
      cy.wait(1000);
      cy.get("[data-testid='save-']").click();
      cy.wait(3500);
      cy.get("[data-testid='row-items']").contains(newQty);
      cy.step("User verifies the History logs include the Quantity Changed");
      cy.get("[data-testid='row-items']")
        .contains("Product Options Test")
        .parentsUntil("[data-testid='row-items']")
        .find(floorObj.iconsOption)
        .click();
      cy.wait(1000);
      cy.get("[data-testid='History']").click();
      cy.wait(1200);
      cy.get("[role='dialog']")
        .find("div")
        .contains("Modified")
        .last()
        .parent()
        .should(($logs) => {
          expect($logs).to.contain("Quantity changed from");
          expect($logs).to.contain("1 U");
          expect($logs).to.contain("to");
          expect($logs).to.contain(`${newQty} U`);
          expect($logs).to.contain("Note");
          expect($logs).to.contain("ETE changed the Quantity");
        });
      // Edit Code
      cy.step(
        "User updates the code to **ETE-CODE-EDIT-001** and sees it on item and history logs"
      );
      cy.get("[aria-modal='true']").find("div").contains("Close").click();
      cy.get("[data-testid='row-items']")
        .contains("Product Options Test")
        .parentsUntil("[data-testid='row-items']")
        .find(floorObj.iconsOption)
        .click();
      cy.wait(2000);
      cy.get("[data-testid='Edit']").click();
      cy.wait(1000);
      cy.get("[data-testid='code-input']").type(`{selectall}${newCode}`);
      cy.wait(1000);
      cy.get("[data-testid='note-input']").type("ETE changed the Code");
      cy.wait(1000);
      cy.get("[data-testid='save-']").click();
      cy.wait(3500);
      cy.get("[data-testid='row-items']").contains(newCode);
      cy.step("User verifies the History logs include the Quantity Changed");
      cy.get("[data-testid='row-items']")
        .contains("Product Options Test")
        .parentsUntil("[data-testid='row-items']")
        .find(floorObj.iconsOption)
        .click();
      cy.wait(1000);
      cy.get("[data-testid='History']").click();
      cy.wait(4000);
      cy.get("[role='dialog']")
        .contains("ETE changed the Code")
        .parent()
        .parent()
        .should(($logs) => {
          expect($logs).to.contain("Modified");
          expect($logs).to.contain("Code changed from");
          expect($logs).to.contain("to");
          expect($logs).to.contain(`ETE-CODE`);
          expect($logs).to.contain("Note");
          expect($logs).to.contain("ETE changed the Code");
        });
      // Put Items on Hold
      cy.step("User Puts Item On Hold and sees it on item and history logs");
      cy.get("[aria-modal='true']").find("div").contains("Close").click();
      cy.get("[data-testid='row-items']")
        .contains("Product Options Test")
        .parentsUntil("[data-testid='row-items']")
        .find(floorObj.iconsOption)
        .click();
      cy.wait(2000);
      cy.get("[data-testid='Edit']").click();
      cy.wait(2000);
      cy.get("[role='switch']").click();
      cy.wait(1000);
      cy.get("[data-testid='note-input']").type("ETE put the Item On Hold");
      cy.get("[data-testid='save-']").click();
      cy.wait(3500);
      cy.get("[data-testid='row-items']")
        .find("[style*='background-color: rgb(222, 72, 108)']")
        .should("contain", "On Hold");
      cy.get("[data-testid='row-items']")
        .contains("Product Options Test")
        .parentsUntil("[data-testid='row-items']")
        .find(floorObj.iconsOption)
        .click();
      cy.wait(1000);
      cy.get("[data-testid='History']").click();
      cy.wait(4000);
      cy.get("[role='dialog']")
        .find("div")
        .contains("ETE put the Item On Hold")
        .parent()
        .parent()
        .should(($logs) => {
          expect($logs).to.contain("Modified");
          expect($logs).to.contain("Active");
          expect($logs).to.contain("On Hold");
          expect($logs).to.contain("Note");
          expect($logs).to.contain("ETE put the Item On Hold");
        });
    });
  }
);
