/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
Cypress.on("uncaught:exception", (_err, _runnable) => {
  return false;
});
import {
  forOutputItem,
  ingredientChemical,
  inputsItemsIngredient,
  recipePayload,
} from "../../../support/samplePayload";
import floorObj from "../../pageObjects/floor.json";
import global from "../../pageObjects/global.json";
import sidemenu from "../../pageObjects/sideMenu.json";
// const today = new Date();
// const month = today.getMonth() + 1; // Months are zero-based
// const day = today.getDate();
// const year = today.getFullYear();
// const formattedMonth = month.toString().padStart(2, "0");
// const formattedDay = day.toString().padStart(2, "0");
// const formattedCodeDate = `${formattedDay}${formattedMonth}${year}`;
let inputsItem1: string;
let inputsItem2: string;
let outOutputItem: string;

describe(
  "Item Action Workflow",
  { testIsolation: false, scrollBehavior: "center" },
  () => {
    before(() => {
      cy.clearAllCookies();
      cy.clearAllLocalStorage();
      cy.clearAllSessionStorage();
      cy.task("createTenant");
      // seed Catalog Item and get the id for Recipe Inputs
      cy.seedProduct(inputsItemsIngredient).then(
        ($inputItem: { id: string }) => {
          inputsItem1 = $inputItem.id;
        }
      );
      cy.seedProduct(ingredientChemical).then(($inputItem: { id: string }) => {
        inputsItem2 = $inputItem.id;
      });
      cy.seedProduct(forOutputItem).then(($outputItem: { id: string }) => {
        outOutputItem = $outputItem.id;
      });
      cy.step("Login to the app");
      cy.loginAs("dynamicUser");
      cy.step("navigate to flow page and add assign traits in each stage");
      cy.seedSupplier("");
      cy.addFlowStageRule();
      cy.get(sidemenu.floor).click();
      cy.url().should("contain", "/floor");
      cy.receiveMultipleItems({
        supplier: "ETE Supplier",
        items: [
          {
            item: inputsItemsIngredient.name,
            variant: "Ingredient",
            quantity: "20",
            uniqueId: "ete-001",
          },
          {
            item: ingredientChemical.name,
            variant: "Chemical",
            quantity: "15",
            uniqueId: "ete-001",
          },
        ],
      });
    });
    after(() => {
      cy.task("destroyTestTenant");
      cy.wait(800);
    });
    it("Move the produced item to another stage", () => {
      cy.wait(4000);
      cy.get(sidemenu.floor).click();
      cy.url().should("contain", "/floor");
      cy.get("[data-testid='row-items']").should("have.length", 2);
      cy.step("seed recipe and used the received items");
      recipePayload.inputs[0].correlationId = inputsItem1;
      recipePayload.inputs[1].correlationId = inputsItem2;
      recipePayload.inputs[0].quantity = "2.5 U";
      recipePayload.inputs[1].quantity = "4 U";
      recipePayload.inputs[0].name = inputsItemsIngredient.name;
      recipePayload.inputs[1].name = ingredientChemical.name;
      recipePayload.outputs[0].correlationId = outOutputItem;
      recipePayload.outputs[0].name = forOutputItem.name;
      recipePayload.outputs[0].quantity = "15 U";
      cy.seedRecipe(recipePayload);
      cy.wait(3000);
      // make product
      cy.step("User clicks on the **Make Product** button");
      cy.get(floorObj.makeProductBtn).click();
      cy.url().should("contain", "floor/make/recipe");
      cy.contains("Select Recipe");
      cy.wait(3000);
      cy.step("User selects a variant **Production**");
      cy.get("[data-testid='Production']").click();
      cy.wait(3000);
      cy.step("User clicks the Recipe");
      cy.contains(recipePayload.name).parent().parent().click();
      cy.wait(3000);
      cy.get(floorObj.sourceChoosingBtn).each(($btn) => {
        cy.wait(1500);
        cy.wrap($btn).as("btn").click();
      });
      cy.wait(1200);
      cy.get(floorObj.saveMakeProductBtn).click();
      cy.wait(2000);
      cy.get(global.banner).should("be.visible");
      cy.step("Click the produced Item");
      cy.get("[data-testid='row-items']").each(($btn) => {
        cy.wait(1500);
        cy.wrap($btn).as("btn").click();
      });
      cy.step(
        "Move All items to Processing stage including the newly Produced Item"
      );
      cy.wait(2000);
      cy.get(floorObj.moveBtn).click();
      cy.wait(1500);
      cy.get(floorObj.selectStageId).select("Processing");
      cy.wait(3000);
      cy.get("[data-testid^='table-row-']")
        // .contains(forOutputItem.name)
        .parentsUntil("[data-testid^='table-row-']")
        .find("[value='15']");
      cy.get(floorObj.saveMove).click();
      cy.wait(1000);
      cy.get(global.banner).contains("Items moved to On Hand successfully!");
      cy.step(
        "Assert that the produced item is no longer exist in Receiving stage"
      );
      cy.wait(3000);
      cy.get("[data-testid='row-items']").should("not.exist");
      cy.step(
        "Navigate to Processing stage and user should see the Produced item exist"
      );
      cy.get(floorObj.selectStage).select("Processing");
      cy.wait(4000);
      cy.get("[data-testid='row-items']").should("contain", forOutputItem.name);
    });
    it("Move the produced item to a container", () => {
      cy.reload();
      cy.wait(4000);
      cy.get(sidemenu.floor).click();
      cy.step("Select the produced item and click the Move btn");
      cy.get("[data-testid='row-items']").contains(forOutputItem.name).click();
      cy.wait(1200);
      cy.get(floorObj.moveBtn).click();
      cy.wait(2500);
      cy.get(floorObj.selectStageId).select("Processing");
      cy.wait(2000);
      cy.get(floorObj.putItemsInSelection).select("Line 1");
      cy.wait(5000);
      cy.get(floorObj.saveMove).click();
      cy.wait(1000);
      cy.get(global.banner).contains("Items moved to Line 1 successfully!");
      cy.wait(2000);
      cy.step("assert the item is moved to Container -> Line 1");
      cy.get("[index='6']").should("contain", "Line 1");
      cy.get("[index='9']").should("contain", forOutputItem.name);
    });
    it("Mark the produced item as wasted.", () => {
      cy.wait(4000);
      cy.step("select the Produced item then click Waste");
      cy.get("[data-testid='row-items']").contains(forOutputItem.name).click();
      cy.wait(1200);
      cy.get(floorObj.wasteBtn).click();
      cy.contains("Log Waste");
      cy.wait(2000);
      cy.get("[data-testid='table-row-0-item']")
        .find("[value='15']")
        .last()
        .type("{selectall}7.5");
      cy.get(floorObj.saveWastBtn).last().click();
      cy.wait(1000);
      cy.get(global.banner).contains(
        `${forOutputItem.name} put to waste successfully!`
      );
      cy.get("[data-testid='row-items']")
        .contains(forOutputItem.name)
        .parentsUntil("[data-testid='row-items']")
        .should("contain", "7.5");
    });
    it("Bundle the produced item.", () => {
      cy.reload();
      cy.wait(4000);
      cy.step("Select the produced item and another item");
      cy.get("[data-testid='row-items']").contains(forOutputItem.name).click();
      cy.get("[data-testid='row-items']")
        .contains(ingredientChemical.name)
        .click();
      cy.wait(1200);
      cy.step("Bundle the items");
      cy.get(floorObj.bundleItemsBtn).click();
      cy.wait(1500);
      cy.contains("Bundle Items");
      cy.get("[data-testid='bundleName-input']")
        .last()
        .type("{selectall}ETE Bundle Item");
      cy.get("[data-testid^='table-row-']")
        .should("contain", ingredientChemical.name)
        .and("contain", forOutputItem.name);
      cy.wait(2000);
      cy.get("[data-testid='save-']").last().click();
      cy.wait(2000);
      cy.get(global.banner).contains(`Created Bundle`);
      cy.wait(3000);
      cy.step("Assert the Bundles exist and contain the Bundled items");
      cy.get("[tabindex='0']").should("contain", "ETE Bundle Item");
      cy.get('[index="13"]').should("contain", forOutputItem.name);
      cy.get('[index="14"]').should("contain", ingredientChemical.name);
    });
  }
);
