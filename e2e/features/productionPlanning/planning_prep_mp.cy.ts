Cypress.on("uncaught:exception", (err, runnable) => {
  return false;
});
import planned from "../../pageObjects/planned.json";
import global from "../../pageObjects/global.json";
import sidemenu from "../../pageObjects/sideMenu.json";
import floor from "../../pageObjects/floor.json";
import moment from "moment";
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
import {
  forOutputItem,
  productionRecipePayload,
  recipePlanningPayload,
  ingredientChemical,
  inputsItemsIngredient,
} from "../../../support/samplePayload";
let itemInput1: string;
let itemOutput1: string;
let itemInput2: string;

describe(
  "Production Planning Functionalities",
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
      inputsItemsIngredient.unitOfMeasurement = "cup";
      cy.seedProduct(inputsItemsIngredient).then(($catalogItemInput) => {
        itemInput1 = $catalogItemInput.id;
      });
      ingredientChemical.unitOfMeasurement = "liter";
      cy.seedProduct(ingredientChemical).then(($chemicalItem) => {
        itemInput2 = $chemicalItem.id;
      });
      forOutputItem.unitOfMeasurement = "liter";
      cy.seedProduct(forOutputItem).then(($outputItem) => {
        itemOutput1 = $outputItem.id;
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
        quantity: "2000",
        printLabel: false,
      });
      cy.receiveItems({
        supplier: "ETE Supplier",
        variant: "Chemical",
        product: ingredientChemical.name,
        quantity: "2500",
        printLabel: false,
      });
      cy.get(sidemenu.floor).click();
    });
    after(() => {
      cy.task("destroyTestTenant");
      cy.wait(800);
    });
    it("Planning Workflow - Preparation Recipe", () => {
      cy.step("seed preparation recipe");
      recipePlanningPayload.inputs[0].correlationId = itemInput1;
      recipePlanningPayload.inputs[0].name = inputsItemsIngredient.name;
      recipePlanningPayload.inputs[1].correlationId = itemInput2;
      recipePlanningPayload.inputs[1].name = inputsItemsIngredient.name;
      recipePlanningPayload.outputs[0].correlationId = itemOutput1;
      recipePlanningPayload.outputs[0].name = forOutputItem.name;
      cy.seedRecipe(recipePlanningPayload);
      cy.wait(2500);
      cy.step("User navigates to Planning page");
      cy.get(sidemenu.planning).click();
      cy.url().should("contain", "/planning");
      cy.contains("Production Planning").should("exist");
      cy.step("User clicks on the **Schedule a Recipe");
      cy.wait(2000);
      cy.get(planned.createNewPlanBtn).click();
      cy.url().should("contain", "/planning/addrecipe/Index");
      cy.contains("Select a Recipe");
      cy.wait(3000);
      cy.step("User selects the Recipe");
      cy.contains(recipePlanningPayload.name).parent().parent().click();
      cy.wait(3000);
      cy.step("User change the Inputs to **12**");
      cy.get(planned.repeatInput).should("have.value", "1").clear().type("600");
      cy.wait(1500);
      cy.step("User selects source item");
      cy.contains("Choose Source").first().parent().parent().click();
      cy.wait(1200);
      cy.get("[data-testid='table-row-0-item']")
        .should("contain", inputsItemsIngredient.name)
        .click({ force: true });
      cy.wait(2000);
      cy.contains("Choose Source").parent().parent().click();
      cy.wait(1200);
      cy.get("[data-testid='table-row-0-item']")
        .should("contain", ingredientChemical.name)
        .click({ force: true });
      cy.wait(3000);
      cy.step("User clicks the **Save** button");
      cy.get("[data-testid='save-']").click();
      cy.wait(1000);
      cy.get(global.banner).contains("Created Plan");
      cy.wait(4000);
      cy.step("Assert the Saved Planned Item contains correct data");
      // Asana: https://app.asana.com/0/1206494938659659/1208319514902695
      cy.get(planned.planListItem).should(($plannedItem) => {
        expect($plannedItem).to.contain(formattedCodeDate);
        expect($plannedItem).to.contain(recipePlanningPayload.name);
        expect($plannedItem).to.contain(forOutputItem.name);
        expect($plannedItem).to.contain("0 / 336 l");
        expect($plannedItem).to.not.contain("336.0000");
      });
      // Asana: https://app.asana.com/0/1206494938659659/1208319514902695
      cy.step(
        "Assert that the Planned Recipe Output Item value do not have Decimal format"
      );
      cy.get(planned.planListItem)
        .invoke("text")
        .then((text) => {
          const decimalPattern = /\d+\.\d+/;
          const numbers = text.match(/\d+/g) || []; // This will give an array of numbers as strings
          // Assert that the text does not match the pattern
          numbers.forEach((number) => {
            expect(decimalPattern.test(number)).to.be.false;
          });
        });
      cy.get(planned.planListItem).contains("600");
    });
    it("Production Workflow - Preparation Recipe", () => {
      cy.wait(5000);
      cy.step(
        "User navigates to floor page and start to Make a product for the planned recipe"
      );
      cy.get(sidemenu.floor).click();
      cy.contains("Items On Hand");
      cy.wait(2500);
      cy.get(floor.makeProductBtn).click();
      cy.contains("Select Recipe");
      cy.wait(2000);
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
        .contains(recipePlanningPayload.name)
        .click();
      cy.step(
        "Assert that all recipe data are corret including the default repeat and calculation of inputs"
      );
      cy.get("[data-testid='scale-input']").should("have.value", "600");
      // check each Inputs value and calculation
      cy.get("[data-testid='inputs-quantity']")
        .first()
        .should("contain", "336 cu")
        .and("contain", "0.56 cu")
        .and("contain", "600");
      cy.get("[data-testid='inputs-source-area']")
        .first()
        .should("contain", "2000 cu")
        .find(
          "[data-testid='formula.inputs.0.sources.0.quantity_scalar-input']"
        )
        .should("have.value", "336");

      cy.get("[data-testid='inputs-quantity']")
        .eq(1)
        .should("contain", "150 l")
        .and("contain", "0.25 l")
        .and("contain", "600");
      cy.get("[data-testid='inputs-source-area']")
        .eq(1)
        .should("contain", "2500 l")
        .find(
          "[data-testid='formula.inputs.1.sources.0.quantity_scalar-input']"
        )
        .should("have.value", "150");
      //
      cy.wait(2200);
      cy.step("User edit the Target Repeat from 600 to 300");
      cy.get("[data-testid='scale-input']").type(`{selectall}300`);
      cy.wait(2000);
      cy.get("[data-testid='inputs-quantity']")
        .first()
        .should("contain", "168 cu")
        .and("contain", "0.56 cu")
        .and("contain", "300");
      cy.get("[data-testid='inputs-source-area']")
        .first()
        .should("contain", "2000 cu");
      // .find(
      //   "[data-testid='formula.inputs.0.sources.0.quantity_scalar-input']"
      // )
      // .should("have.value", "168");

      cy.get("[data-testid='inputs-quantity']")
        .eq(1)
        .should("contain", "75 l")
        .and("contain", "0.25 l")
        .and("contain", "300");
      cy.get("[data-testid='inputs-source-area']")
        .eq(1)
        .should("contain", "2500 l");

      cy.step(
        "User cant click the Create btn because the inputs value should be adjusted correctly"
      );
      cy.contains("Total must be less than or equal to");
      cy.get(floor.saveMakeProductBtn).should(
        "have.attr",
        "aria-disabled",
        "true"
      );
      cy.get(
        "[data-testid='formula.inputs.0.sources.0.quantity_scalar-input']"
      ).type("{selectall}168");
      cy.get(
        "[data-testid='formula.inputs.1.sources.0.quantity_scalar-input']"
      ).type("{selectall}75");
      cy.wait(1000);
      cy.step("User click the **Create** button");
      cy.get(floor.saveMakeProductBtn).click();
      cy.wait(1000);
      cy.get(global.banner).contains(
        `${recipePlanningPayload.name} has been made successfully!`
      );
      cy.wait(5000);
      cy.contains("Items On Hand");
      cy.get("[data-testid='row-items']")
        .should("contain", forOutputItem.name)
        .and("contain", "168");
      cy.step(
        "User navigates to Make Product screen again to verify the progress of the planned recipe"
      );
      cy.get(floor.makeProductBtn).click();
      cy.wait(2000);
      cy.contains(recipePlanningPayload.name)
        .parent()
        .parent()
        .find("[data-testid='overall-progress']")
        .should("contain", "50%")
        .find("div")
        .next()
        .next()
        .should("have.attr", "style")
        .and(
          "include",
          "background-image",
          "linear-gradient(84.6608deg, rgb(0, 92, 151), rgb(168, 200, 228));"
        )
        .and(
          "include",
          "background-image",
          "linear-gradient(rgb(227, 228, 229), rgb(227, 228, 229));"
        );
      cy.wait(2000);
    });
  }
);
