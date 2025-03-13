/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
Cypress.on("uncaught:exception", (err, runnable) => {
  return false;
});
import {
  forOutputItem,
  inputsItemsIngredient,
  productData,
  recipeDeconsPayload,
} from "../../../support/samplePayload";
import floor from "../../pageObjects/floor.json";
import global from "../../pageObjects/global.json";
import planned from "../../pageObjects/planned.json";
import sidemenu from "../../pageObjects/sideMenu.json";
const today = new Date();
// Arrays for day and month names
const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const monthNames = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
];
// Get day of the week, month, and day of the month
const dayOfWeek = dayNames[today.getDay()];
const monthName = monthNames[today.getMonth()];
const dayOfMonth = today.getDate();
// Format the date string
const formattedCodeDate = `${dayOfWeek}, ${monthName} ${dayOfMonth}`;
let itemInput1: string;
let itemOutput1: string;
let itemOutput2: string;

describe(
  "Planning and Production Workflow",
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
      inputsItemsIngredient.unitOfMeasurement = "kilogram";
      cy.seedProduct(inputsItemsIngredient).then(($catalogItemInput) => {
        itemInput1 = $catalogItemInput.id;
      });
      forOutputItem.unitOfMeasurement = "pound";
      cy.seedProduct(forOutputItem).then(($outputItem) => {
        itemOutput1 = $outputItem.id;
      });
      productData.unitOfMeasurement = "pound";
      cy.seedProduct(productData).then(($output2) => {
        itemOutput2 = $output2.id;
      });
      cy.loginAs("dynamicUser");
      cy.step("navigate to flow page and add assign traits in each stage");
      cy.addFlowStageRule();
      cy.get(sidemenu.floor).click();
      cy.url().should("contain", "/floor");
      cy.step("Perform Recieve Item");
      cy.receiveItems({
        supplier: "ETE Supplier",
        product: inputsItemsIngredient.name,
        quantity: "100",
        printLabel: false,
      });
      cy.get(sidemenu.floor).click();
    });
    after(() => {
      cy.task("destroyTestTenant");
      cy.wait(800);
    });
    it("Planning Workflow - Deconstruction Recipe", () => {
      cy.step("seed production recipe");
      recipeDeconsPayload.inputs[0].correlationId = itemInput1;
      recipeDeconsPayload.inputs[0].name = inputsItemsIngredient.name;
      recipeDeconsPayload.outputs[0].correlationId = itemOutput1;
      recipeDeconsPayload.outputs[0].name = forOutputItem.name;
      recipeDeconsPayload.inputs[0].quantity = "45 kg";
      recipeDeconsPayload.outputs[1].correlationId = itemOutput2;
      recipeDeconsPayload.outputs[1].name = productData.name;
      recipeDeconsPayload.name = "ETE Deconstruction Recipe";
      cy.seedRecipe(recipeDeconsPayload);
      cy.wait(2500);
      cy.step("User navigates to Planning page");
      cy.get(sidemenu.planning).click();
      cy.url().should("contain", "/planning");
      cy.contains("Production Planning").should("exist");
      cy.step("User clicks on the **Schedule a Recipe");
      cy.wait(2000);
      cy.get(planned.createNewPlanBtn).click();
      cy.url().should("contain", "/planning/addrecipe/Index");
      cy.wait(2000);
      cy.step("User navigates to **Deconstruction** filter tabs");
      cy.get('[data-testid="Deconstruction"]').click();
      cy.wait(3000);
      cy.step("User selects the Recipe");
      cy.contains(recipeDeconsPayload.name)
        .parent()
        .parent()
        .click({ force: true });
      cy.wait(3000);
      // cy.get(planned.repeatInput).should("have.value", "1").clear().type("20");
      cy.step("Assert that the outputs are present");
      cy.contains("Select target outputs for plan progress tracking.")
        .parent()
        .should("contain", forOutputItem.name)
        .and("contain", productData.name);
      cy.step("User selects source item");
      cy.contains("Choose Source").parent().parent().click();
      cy.wait(1200);
      cy.get("[data-testid='table-row-0-item']")
        .should("contain", inputsItemsIngredient.name)
        .click({ force: true });
      cy.wait(3000);
      cy.step("User clicks the **Save** button");
      cy.get("[data-testid='save-']").click();
      cy.wait(1000);
      cy.get(global.banner).contains("Created Plan");
      cy.wait(4000);
      cy.step("Assert the Saved Planned Item contains correct data");
      cy.get(planned.planListItem).should(($plannedItem) => {
        expect($plannedItem).to.contain(formattedCodeDate);
        expect($plannedItem).to.contain(recipeDeconsPayload.name);
        expect($plannedItem).to.contain("Open Plan");
      });
      cy.wait(2000);
    });
    it("Production Workflow - Deconstruction Recipe", () => {
      recipeDeconsPayload.name = "ETE Deconstruction Recipe";
      cy.wait(2000);
      cy.reload();
      cy.step(
        "User navigates to floor page and start to Make a product for the planned recipe"
      );
      cy.get(sidemenu.floor).click();
      cy.contains("Items On Hand");
      cy.wait(2500);
      cy.get(floor.makeProductBtn).click();
      cy.contains("Select Recipe");
      cy.wait(2000);
      cy.step("User navigates to **Deconstruction** filter tabs");
      cy.get('[data-testid="Deconstruction"]').click();
      cy.step(
        "User should see the Recipe under Preparation tab and under the Planned list"
      );
      cy.wait(2000);
      cy.get("[data-testid='collapsible-title']")
        .contains("Planned")
        .parent()
        .parent()
        .parent()
        .find("[data-testid='recipe-cards']")
        .contains(recipeDeconsPayload.name)
        .click();
      cy.step("Assert that all recipe data are corret");
      cy.wait(2000);
      // check that Inputs value and calculation
      cy.get("[data-testid='inputs-surface']").should((inputsSurface) => {
        expect(inputsSurface).to.contain(inputsItemsIngredient.name);
        expect(inputsSurface).to.contain("100 kg");
        expect(inputsSurface).to.contain("Planned");
      });

      cy.get('[index="4"] > [style="flex-direction: column;"]').should(
        (inputsInstruction) => {
          expect(inputsInstruction).to.contain("Step 1");
          expect(inputsInstruction).to.contain("Instruction");
          expect(inputsInstruction).to.contain("ETE Test Instrunction");
        }
      );
      cy.get(
        '[data-testid="formula.inputs.0.sources.0.quantity_scalar-input"]'
      ).should("have.value", "100");
      cy.step("User clicks the Next Step button");
      cy.get('[data-testid="save-make"]').contains("Next Step").click();
      cy.wait(2000);
      cy.step(
        "Assert the **Next Step** screen contains the correct Outputs and data"
      );
      // cy.get("[data-testid='quantity_Item for Decimal_scalar-input']").should(
      //   "have.value",
      //   "45"
      // );
      cy.get(floor.assigningItem).should(($assigningItem) => {
        expect($assigningItem).to.have.length(3);
        expect($assigningItem).to.contain(forOutputItem.name);
        expect($assigningItem).to.contain(productData.name);
        expect($assigningItem).to.contain("Waste");
      });
      cy.step(
        "User changed the qty from 100 to 22.5 and assign to each Outputs Item"
      );
      cy.get("[data-testid='quantity_Item for Decimal_scalar-input']").type(
        "{selectall}22.5"
      );
      cy.get(floor.assigningItem)
        .contains(forOutputItem.name)
        .parent()
        .parent()
        .parent()
        .find(floor.floorAssign)
        .as("btn")
        .click();
      cy.wait(1000);
      cy.step(
        "Assert that the set qty is assigned to each outputs and the convertion from kg to lbs is correct"
      );
      cy.get(floor.assigningItem).first().contains("49.604009");
      // the Quanty input field value should be the remaining value
      cy.get("[data-testid='quantity_Item for Decimal_scalar-input']").should(
        "have.value",
        "77.5"
      );

      cy.get(floor.assigningItem)
        .contains(productData.name)
        .parent()
        .parent()
        .parent()
        .find(floor.floorAssign)
        .as("btn")
        .click();
      cy.wait(1000);
      cy.get(floor.assigningItem).eq(1).contains("170.858253");
      // both assign items are disabled
      cy.get(floor.floorAssign)
        .first()
        .contains("Assign")
        .parent()
        .parent()
        .should("have.attr", "aria-disabled", "true");
      cy.get(floor.floorAssign)
        .eq(1)
        .contains("Assign")
        .parent()
        .parent()
        .should("have.attr", "aria-disabled", "true");

      // the Quanty input field value should be 0
      // cy.get("[data-testid='quantity_Item for Decimal_scalar-input']").should(
      //   "have.value",
      //   "0"
      // );
      cy.get(floor.saveMakeProductBtn).click();
      cy.wait(1000);
      cy.get(global.banner).contains(
        `${recipeDeconsPayload.name} has been made successfully!`
      );
      cy.wait(5000);
      cy.contains("Items On Hand");
      cy.get("[data-testid='row-items']")
        .should("contain", forOutputItem.name)
        .and("contain", "49.604009");
      cy.get("[data-testid='row-items']")
        .should("contain", productData.name)
        .and("contain", "170.858253");
      cy.step(
        "User navigates to Make Product screen again to verify the progress of the planned recipe"
      );
      cy.get(floor.makeProductBtn).click();
      cy.wait(2000);
      cy.wait(2000);
      cy.step("User navigates to **Deconstruction** filter tabs");
      cy.get('[data-testid="Deconstruction"]').last().click();
      cy.wait(2000);
      cy.contains(recipeDeconsPayload.name)
        .parent()
        .parent()
        .find("[data-testid='overall-progress']")
        .should("not.exist");
      cy.wait(2000);
    });
  }
);
