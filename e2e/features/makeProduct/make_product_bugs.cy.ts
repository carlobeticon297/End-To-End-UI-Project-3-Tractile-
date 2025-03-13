/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
Cypress.on("uncaught:exception", (err, runnable) => {
  return false;
});
import {
  forOutputItem,
  inputsItemsIngredient,
  recipePayload,
} from "../../../support/samplePayload";
import floorObj from "../../pageObjects/floor.json";
import global from "../../pageObjects/global.json";
import sidemenu from "../../pageObjects/sideMenu.json";
const today = new Date();
const month = today.getMonth() + 1; // Months are zero-based
const day = today.getDate();
const year = today.getFullYear();
const formattedMonth = month.toString().padStart(2, "0");
const formattedDay = day.toString().padStart(2, "0");
const formattedCodeDate = `${formattedDay}${formattedMonth}${year}`;

describe(
  "Make Product functionalities",
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
      cy.addFlowStageRule();
      cy.get(sidemenu.floor).click();
      cy.url().should("contain", "/floor");
    });
    after(() => {
      cy.task("destroyTestTenant");
      cy.wait(800);
    });
    it("User should successfully make a product without any errors when the Recipe includes duplicate input items. ", () => {
      cy.seedProduct("").then(($catalogItemInput) => {
        recipePayload.inputs[0].correlationId = $catalogItemInput.id;
        recipePayload.inputs[1].correlationId = $catalogItemInput.id;
        // seed another Catalog Item and get the id for Recipe Outputs
        cy.seedProduct(forOutputItem).then(($catalogItemOutput) => {
          recipePayload.outputs[0].correlationId = $catalogItemOutput.id;
          // seed Recipe
          cy.seedRecipe(recipePayload);
        });
      });
      cy.step("Steps to receive an Item");
      cy.receiveItems({
        supplier: "ETE Supplier",
        product: "ETE Testing Bar 3.0",
        quantity: "4",
        printLabel: false,
      });
      cy.get(sidemenu.floor).click();
      cy.wait(5000);
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
      cy.contains("Ally Mango")
        .parent()
        .parent()
        .should("contain", "2 Inputs")
        .and("contain", "1 Outputs");
      cy.step("User clicks the Recipe");
      cy.contains("Ally Mango").parent().parent().click();
      cy.wait(3000);
      cy.get(floorObj.inputsSurface).contains("ETE Testing Bar 3.0");
      cy.step(
        "Assert that the **Create** button is disabled when source isn't selected"
      );
      cy.get(floorObj.saveMakeProductBtn).should(
        "have.attr",
        "aria-disabled",
        "true"
      );
      cy.step("user clicks on each *+ source code button**");
      cy.get(floorObj.sourceChoosingBtn).each(($btn) => {
        cy.wait(1500);
        cy.wrap($btn).as("btn").click();
      });
      cy.wait(2000);
      cy.step("After selecting source, the **Create** btn should be enabled");
      cy.get(floorObj.saveMakeProductBtn)
        .parent()
        .should(
          "not.have",
          "background-image",
          "linear-gradient(70.3462deg, rgb(0, 92, 151), rgb(0, 141, 192))"
        );
      cy.step("Assert that each input(use field) contains the correct value");
      cy.get(floorObj.inputsSurface)
        .find("input")
        .should("have.length", 2)
        .each(($useField) => {
          cy.wrap($useField).should("have.value", 1);
        });
      cy.step("User clicks the **Create** button");
      cy.get(floorObj.saveMakeProductBtn).click();
      cy.wait(2000);
      cy.get(global.banner).should("be.visible");
      cy.get("[data-testid='row-items']")
        .contains(formattedCodeDate)
        .should("exist");
      cy.wait(3000);
    });
    it("User should successfully make a product without any errors when the Recipe includes items with value in decimals.", () => {
      cy.wait(5000);
      (recipePayload.inputs[0].name = "Recipe Decimals"),
        (recipePayload.inputs[0].quantity = "0.6");
      recipePayload.inputs.splice(1, 1); // remove the second input from array
      recipePayload.name = "Recipe Decimals";
      forOutputItem.name = "Output Item Decimal";
      // seed Catalog Item and get the id for Recipe Inputs
      cy.seedProduct(inputsItemsIngredient).then(($catalogItemInput) => {
        recipePayload.inputs[0].correlationId = $catalogItemInput.id;
        // seed another Catalog Item and get the id for Recipe Outputs
        cy.seedProduct(forOutputItem).then(($catalogItemOutput) => {
          recipePayload.outputs[0].correlationId = $catalogItemOutput.id;
          // seed Recipe
          cy.seedRecipe(recipePayload);
        });
      });
      cy.reload();
      cy.step(
        "Execute Receive Items 2x and the quantity set is 0.4 and 0.2 for the other"
      );
      cy.wait(2000);
      cy.receiveItems({
        supplier: "ETE Supplier",
        product: inputsItemsIngredient.name,
        quantity: "0.4",
        printLabel: false,
      });
      cy.wait(2000);
      cy.receiveItems({
        supplier: "ETE Supplier",
        product: inputsItemsIngredient.name,
        quantity: "0.2",
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
        .should("contain", "1 Inputs")
        .and("contain", "1 Outputs");
      cy.step("User clicks the Recipe");
      cy.contains(recipePayload.name).parent().parent().click();
      cy.wait(3000);
      cy.get(floorObj.inputsSurface).contains(inputsItemsIngredient.name);
      cy.step("Select Source Items **2 same items with value in decimals**");
      cy.get("[data-testid='common-source-source']").click();
      cy.wait(1500);
      cy.get("[aria-modal='true']")
        .find("[data-testid='table-row-0-item']")
        .click();
      cy.wait(1500);
      cy.get("[data-testid='common-source-source']").click();
      cy.wait(1500);
      cy.get("[aria-modal='true']")
        .find("[data-testid='table-row-0-item']")
        .click();
      cy.wait(2500);
      cy.step(
        "Assert that there are no issues or errors since the total source items value are enough for the required value"
      );
      cy.get(floorObj.inputsSurface)
        .should("not.contain", "Total must")
        .and("not.contain", "Must be at most");
    });
    it("Not included OUTPUT item should not be produced", () => {
      cy.wait(5000);
      (recipePayload.inputs[0].name = "Recipe 2 Outputs"),
        (recipePayload.inputs[0].quantity = "2");
      recipePayload.inputs.splice(1, 1); // remove the second input from array
      recipePayload.name = "Recipe 2 Outputs";
      forOutputItem.name = "Output item included";
      inputsItemsIngredient.name = "E2E Input Item";
      cy.seedProduct(inputsItemsIngredient).then(($catalogItemInput) => {
        recipePayload.inputs[0].correlationId = $catalogItemInput.id;
        // seed another Catalog Item and get the id for Recipe Outputs
        cy.seedProduct(forOutputItem).then(($catalogItemOutput) => {
          recipePayload.outputs[0].correlationId = $catalogItemOutput.id;
          // seed another Item for second output (not required)
          cy.seedProduct(forOutputItem).then(($catalogItemOutput2) => {
            // Create a copy of the first outputs item and add it to the array
            const newItem = { ...recipePayload.outputs[0] };
            recipePayload.outputs.push(newItem);
            recipePayload.outputs[1].name = "Output Item not included";
            recipePayload.outputs[1].required = false;
            recipePayload.outputs[1].correlationId = $catalogItemOutput2.id;
            // seed Recipe
            cy.seedRecipe(recipePayload);
          });
          cy.reload();
          cy.step("Execute Receive Items for **E2E Input Item**");
          cy.wait(2000);
          cy.receiveItems({
            supplier: "ETE Supplier",
            product: "E2E Input Item",
            quantity: "10",
            printLabel: false,
          });
          cy.wait(2000);
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
            .should("contain", "1 Inputs")
            .and("contain", "2 Outputs");
          cy.step("User clicks the Recipe");
          cy.contains(recipePayload.name).parent().parent().click();
          cy.wait(3000);
          cy.get(floorObj.inputsSurface).contains(inputsItemsIngredient.name);
          cy.step(
            "Select Source Items **2 same items with value in decimals**"
          );
          cy.get(floorObj.sourceChoosingBtn).as("btn").click();
          cy.wait(2500);
          cy.step(
            "assert that there is one Outputs item that is mark as not included"
          );
          cy.get("[role='switch']")
            .prev()
            .should("not.have", "background-image", "rgb(189, 189, 189)");
          cy.wait(1500);
          cy.step("User clicks the **Create** btn");
          cy.get(floorObj.saveMakeProductBtn).click();
          cy.wait(1000);
          cy.step(
            "User should see the success banner and navigated to floor page"
          );
          cy.get(global.banner).contains(
            `${recipePayload.name} has been made successfully!`
          );
          cy.wait(5000);
          cy.contains("Items On Hand");
          cy.step(
            "On Items On hand list - User should see the Iutputs item that is marked as required and should not see the Outputs item marked as not included"
          );
          cy.get("[data-testid='row-items']").contains("Output item included");
          cy.get("[data-testid='row-items']").should(
            "not.contain",
            "Output Item not included"
          );
        });
      });
    });

    // add new tests for : Regression on deconstruct(MK): infinite items are included again
  }
);
