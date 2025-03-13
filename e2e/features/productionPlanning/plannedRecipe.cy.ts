/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
Cypress.on("uncaught:exception", (err, runnable) => {
  return false;
});
import moment from "moment";
import {
  forOutputItem,
  inputsItemsIngredient,
  recipePayload,
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
recipePayload.inputs.splice(1, 1);
recipePayload.outputs[0].quantity = "0.56 l";
forOutputItem.unitOfMeasurement = "liter";
inputsItemsIngredient.name = "Mango Input";
inputsItemsIngredient.unitOfMeasurement = "liter";

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
      cy.seedProduct(inputsItemsIngredient).then(
        ($catalogItemInput: { id: string }) => {
          recipePayload.inputs[0].correlationId = $catalogItemInput.id;
          // seed another Catalog Item and get the id for Recipe Outputs
          cy.seedProduct(forOutputItem).then(
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
      cy.wait(1400);
      cy.autoFillCode(true);
      cy.wait(1200);
      cy.get(sidemenu.floor).click();
      cy.url().should("contain", "/floor");
      cy.step("Perform Recieve Item");
      cy.receiveItems({
        supplier: "ETE Supplier",
        product: inputsItemsIngredient.name,
        quantity: "1000",
      });
      cy.get(sidemenu.floor).click();
    });
    after(() => {
      cy.task("destroyTestTenant");
      cy.wait(800);
    });
    it("Planned Recipe Progress", () => {
      cy.wait(5000);
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
      cy.step("User navigates to **Production** filter tabs");
      cy.get("[data-testid='Production']").last().click();
      cy.wait(3000);
      cy.step("User selects the Recipe");
      cy.contains(recipePayload.name).parent().parent().click();
      cy.wait(3000);
      cy.step("User change the Inputs to **12**");
      cy.get(planned.repeatInput).should("have.value", "1").clear().type("600");
      cy.wait(1500);
      cy.step("User selects source item");
      cy.contains("Choose Source").parent().parent().click();
      cy.wait(3000);
      cy.get("[data-testid='table-row-0-item']")
        .should("contain", inputsItemsIngredient.name)
        .click({ force: true });
      cy.wait(2000);
      cy.step("User clicks the **Save** button");
      cy.get("[data-testid='save-']").click();
      cy.wait(1000);
      cy.get(global.banner).contains("Created Plan");
      cy.wait(4000);
      cy.step("Assert the Saved Planned Item contains correct data");
      // Asana: https://app.asana.com/0/1206494938659659/1208319514902695
      cy.get(planned.planListItem).should(($plannedItem) => {
        expect($plannedItem).to.contain(formattedCodeDate);
        expect($plannedItem).to.contain(recipePayload.name);
        expect($plannedItem).to.contain(forOutputItem.name);
        expect($plannedItem).to.contain("0 / 336 l");
        expect($plannedItem).to.not.contain("336.0000");
      });
      // Asana: https://app.asana.com/0/1206494938659659/1208319514902695
      cy.step(
        "Assert that the Saved Production Planning Output Item value do not have Decimal format"
      );
      cy.get(planned.planListItem)
        .invoke("text")
        .then((text) => {
          console.log("textsss", text);
          // Regular expression to check for numbers with decimals
          const decimalPattern = /\d+\.\d+/;
          // Extract the numbers from the text
          const numbers = text.match(/\d+/g) || []; // This will give you an array of numbers as strings
          // Assert that the text does not match the pattern
          numbers.forEach((number) => {
            expect(decimalPattern.test(number)).to.be.false;
          });
          console.log("ttttt", numbers);
        });
      cy.get(planned.planListItem).contains("600");
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
        "User navigates to **Production** filter tab and should see the Recipe under the Planned list"
      );
      cy.get("[data-testid='Production']").last().click();
      cy.wait(2000);
      cy.get("[data-testid='collapsible-title']")
        .contains("Planned")
        .parent()
        .parent()
        .parent()
        .find("[data-testid='recipe-cards']")
        .contains(recipePayload.name)
        .click();
      cy.wait(3000);
      cy.step("User updates the **Repeat Recipe** from 600 to 300");
      cy.get("[data-testid='scale-input']")
        .should("have.value", "600")
        .clear()
        .type("300");
      cy.wait(1200);
      cy.step("User click the **Create** button");
      cy.get(floor.saveMakeProductBtn).click();
      cy.wait(1000);
      cy.get(global.banner).contains(
        `${recipePayload.name} has been made successfully!`
      );
      cy.wait(5000);
      cy.contains("Items On Hand");
      cy.get("[data-testid='row-items']")
        .should("contain", forOutputItem.name)
        .and("contain", "700");
      cy.step(
        "User navigates to Make Product screen again to verify the progress of the planned recipe"
      );
      cy.get(floor.makeProductBtn).click();
      cy.wait(1200);
      cy.get("[data-testid='Production']").last().click();
      cy.wait(2000);
      cy.contains(recipePayload.name)
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
    it("The recipe should still appear in the Planned section if its scheduled date is within 2 days past or 7 days before startDate.", () => {
      cy.wait(5000);
      const formatWithTimeAhead = (daysToAdd: moment.DurationInputArg1) => {
        return (
          moment().add(daysToAdd, "days").startOf("day").format("YYYY-MM-DD") +
          "T15:17:08.317Z"
        );
      };
      const formatWithTime = (daysToSubtract: moment.DurationInputArg1) => {
        return (
          moment()
            .subtract(daysToSubtract, "days")
            .startOf("day")
            .format("YYYY-MM-DD") + "T15:17:08.317Z"
        );
      };
      cy.step("Click the planned recipe to get the planID from URL");
      cy.reload();
      cy.wait(5000);
      cy.get("[data-testid='Production']").last().click();
      cy.wait(2500);
      cy.contains(recipePayload.name).parent().parent().click();
      cy.wait(2000);
      cy.url().then((url) => {
        const urlObj = new URL(url);
        // Get the 'planId' query parameter
        const planId = urlObj.searchParams.get("planId");
        cy.step("get Production Plan recipe by plan ID via API");
        cy.task("getProdPlanById", planId).then(($prodPlanRecipe: any) => {
          const past4DaysWithTime = formatWithTime(4);
          delete $prodPlanRecipe.correlated;
          $prodPlanRecipe.startDate = past4DaysWithTime;
          $prodPlanRecipe.endDate = past4DaysWithTime;
          const plannedData = $prodPlanRecipe;
          cy.step(
            "Update Planned recipe via api, update the startDate **past 4 days** and assert that the recipe is no longer displays under Planned section"
          );
          cy.log(
            "Update Planned recipe via api, update the startDate **past 4 days** and assert that the recipe is no longer displays under Planned section"
          );
          cy.task("updatePlannedRecipe", plannedData);
          cy.wait(1000);
          cy.get(sidemenu.floor).click();
          cy.reload();
          cy.wait(2000);
          cy.get(floor.makeProductBtn).click();
          cy.wait(2000);
          cy.get("[data-testid='Production']").last().click();
          cy.wait(3500);
          cy.get(planned.collapsibleTitle).and("not.contain", "Planned");
        });
        cy.task("getProdPlanById", planId).then(($prodPlanRecipe: any) => {
          cy.step(
            "Update Planned recipe via api, update the startDate **next 7 days** and assert that the recipe is displays under Planned section"
          );
          cy.log(
            "Update Planned recipe via api, update the startDate **next 7 days** and assert that the recipe is displays under Planned section"
          );
          const nextDay7WithTime = formatWithTimeAhead(7);
          $prodPlanRecipe.startDate = nextDay7WithTime;
          $prodPlanRecipe.endDate = nextDay7WithTime;
          const plannedData7DaysFuture = $prodPlanRecipe;
          cy.task("updatePlannedRecipe", plannedData7DaysFuture);
          cy.reload();
          cy.wait(2000);
          cy.get("[data-testid='Production']").last().click();
          cy.wait(3500);
          cy.get(planned.collapsibleTitle).and("contain", "Planned");
        });
        cy.task("getProdPlanById", planId).then(($prodPlanRecipe: any) => {
          cy.step(
            "Update Planned recipe via api, update the startDate **next 9 days** and assert that the recipe is no longer displays under Planned section"
          );
          cy.log(
            "Update Planned recipe via api, update the startDate **next 9 days** and assert that the recipe is no longer displays under Planned section"
          );
          const nextDay9WithTime = formatWithTimeAhead(9);
          $prodPlanRecipe.startDate = nextDay9WithTime;
          $prodPlanRecipe.endDate = nextDay9WithTime;
          const plannedData9DaysFuture = $prodPlanRecipe;
          cy.task("updatePlannedRecipe", plannedData9DaysFuture);
          cy.reload();
          cy.wait(2000);
          cy.get("[data-testid='Production']").last().click();
          cy.wait(3500);
          cy.get(planned.collapsibleTitle).and("not.contain", "Planned");
        });
        cy.task("getProdPlanById", planId).then(($prodPlanRecipe: any) => {
          cy.step(
            "Update Planned recipe via api, update the startDate **past 1 days** and assert that the recipe is displays under Planned section"
          );
          cy.log(
            "Update Planned recipe via api, update the startDate **past 1 days** and assert that the recipe is displays under Planned section"
          );
          const past1DaysWithTime = formatWithTime(1);
          $prodPlanRecipe.startDate = past1DaysWithTime;
          $prodPlanRecipe.endDate = past1DaysWithTime;
          const plannedData1DaysFuture = $prodPlanRecipe;
          cy.task("updatePlannedRecipe", plannedData1DaysFuture);
          cy.reload();
          cy.wait(2000);
          cy.get("[data-testid='Production']").last().click();
          cy.wait(3500);
          cy.get(planned.collapsibleTitle).and("contain", "Planned");
        });
      });
    });
  }
);
