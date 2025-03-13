import global from "../../pageObjects/global.json";
import codes from "../../pageObjects/codes.json";
import sideMenu from "../../pageObjects/sideMenu.json";
Cypress.on("uncaught:exception", (err, runnable) => {
  return false;
});
const templateName = "ETE CODES TEMPLATE";
const now = new Date();
const day = now.getDate();
const monthIndex = now.getMonth();
const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const month = monthNames[monthIndex];
const dayString = day.toString().padStart(2, "0");
const [digit1, digit2] = dayString.split("");
const monthString = month.toString();
const [mon1, mon2, mon3] = monthString.split("");
// Get the full year (e.g., 2024)
const year = now.getFullYear();
const yearString = year.toString();
const [y1, y2, y3, y4] = yearString.split("");

describe(
  "Facility Codes Settings Crud Functionality",
  { testIsolation: false, scrollBehavior: "center" },
  () => {
    before(() => {
      cy.clearAllCookies();
      cy.clearAllLocalStorage();
      cy.clearAllSessionStorage();
      cy.task("createTenant");
      cy.loginAs("dynamicUser");
      cy.step("Admin navigates to Facility Settings and Codes page");
      cy.wait(5000);
      cy.get(sideMenu.facilityMenu).click({ force: true });
      cy.url().should("contain", "/admin/facility");
      cy.get('[data-testid="card"]').should("be.visible");
      cy.wait(1200);
      cy.get(codes.codesTab).click();
      cy.url().should("contain", "facility/codes");
      cy.wait(5000);
    });
    after(() => {
      cy.task("destroyTestTenant");
      cy.wait(800);
    });
    it("Admin is able to add Codes Template", () => {
      cy.step("I click the **New Code** button");
      cy.get(codes.newCodeBtn).click();
      cy.url().should("contain", "/facility/codes/new");
      cy.contains("New Code Template");
      cy.contains("Preview");
      cy.contains("Components");
      cy.wait(2000);
      cy.step("I enter a **Template Name**");
      cy.get(codes.templateNameInput).type(templateName);
      cy.wait(1000);
      cy.step("I click the **Add Component** button");
      cy.contains("Add Component").as("btn").click();
      cy.wait(2000);
      cy.step("I select the **Day of Month (01)**");
      cy.get("[data-testid='select-definition.0.type']").select(
        "Day of Month (01)"
      );
      cy.step("Assert that the renderer Surface renders the correct day");
      cy.wait(2500);
      console.log("Digits", digit1, digit2);
      cy.get(codes.rendererSurface)
        .should("contain", digit1)
        .and("contain", digit2);
      cy.step("I click the **Add Component** button to add second component");
      cy.contains("Add Component").as("btn").click();
      cy.wait(1500);
      cy.step("I select the **Month (Jan)**");
      cy.get("[data-testid='select-definition.1.type']").select("Month (Jan)");
      cy.wait(1500);
      cy.step("Assert that the renderer Surface renders the correct month");
      cy.get(codes.rendererSurface)
        .should("contain", mon1)
        .and("contain", mon2)
        .and("contain", mon3);
      cy.wait(2000);
      cy.step("I click the **Add Component** button to add third component");
      cy.contains("Add Component").as("btn").click();
      cy.wait(1500);
      cy.step("I select the **Year (2022)**");
      cy.get("[data-testid='select-definition.2.type']").select("Year (2022)");
      cy.wait(1500);
      cy.step("Assert that the renderer Surface contains the correct year");
      cy.get(codes.rendererSurface)
        .should("contain", y1)
        .and("contain", y2)
        .and("contain", y3)
        .and("contain", y4);
      cy.step(
        "Assert that the renderer Surface contains the **day, month, and year**"
      );
      cy.get(codes.rendererSurface)
        .should("contain", digit1)
        .and("contain", digit2)
        .and("contain", mon1)
        .and("contain", mon2)
        .and("contain", mon3)
        .and("contain", y1)
        .and("contain", y2)
        .and("contain", y3)
        .and("contain", y4);
      cy.wait(2000);
      cy.step("I save the Code Template");
      cy.get(codes.saveCodeBtn).click();
      cy.wait(1000);
      cy.step(
        "Assert that the new code is added in the table list and contains the correct details"
      );
      cy.get(global.banner).contains(`Saved Profile: ${templateName}`);
      cy.get("[data-testid='table-row-0-codes']").should(($newCodes) => {
        expect($newCodes).to.contain(templateName);
        expect($newCodes).to.contain(digit1);
        expect($newCodes).to.contain(digit2);
        expect($newCodes).to.contain(mon1);
        expect($newCodes).to.contain(mon2);
        expect($newCodes).to.contain(mon3);
        expect($newCodes).to.contain(y1);
        expect($newCodes).to.contain(y2);
        expect($newCodes).to.contain(y3);
        expect($newCodes).to.contain(y4);
      });
    });
    it("Admin is able to edit a Codes Template", () => {
      cy.wait(5000);
      cy.step("I click the Codes I want to edit");
      cy.get("[data-testid='table-row-0-codes']").click();
      cy.wait(3000);
      cy.url().should("contain", "/admin/facility/codes/edit?id");
      cy.step("I remove the last code component");
      cy.get("[data-testid='remove-code-2']").click();
      cy.wait(1000);
      cy.get(codes.rendererSurface).should("not.contain", "Year"); //to make sure that year is removed
      cy.step("I add another Year component format **Year Short (22)**");
      cy.contains("Add Component").as("btn").click();
      cy.wait(1000);
      cy.get("[data-testid='select-definition.2.type']").select(
        "Year Short (22)"
      );
      cy.wait(1500);
      cy.step("Assert the new Code Component is added");
      cy.get(codes.rendererSurface)
        .contains("Year Short")
        .parent()
        .parent()
        .should("contain", y3)
        .and("contain", y4);
      cy.wait(1500);
      cy.step("I click the Save button");
      cy.get(codes.saveCodeBtn).click();
      cy.wait(1000);
      cy.step(
        "Assert that the new code is added in the table list and contains the correct details"
      );
      cy.get(global.banner).contains(`Saved Profile: ${templateName}`);
      cy.get("[data-testid='table-row-0-codes']").should(($newCodes) => {
        expect($newCodes).to.contain(templateName);
        expect($newCodes).to.contain(digit1);
        expect($newCodes).to.contain(digit2);
        expect($newCodes).to.contain(mon1);
        expect($newCodes).to.contain(mon2);
        expect($newCodes).to.contain(mon3);
        expect($newCodes).to.contain(y3);
        expect($newCodes).to.contain(y4);
      });
    });
    it("Admin is able to delete a Code Template", () => {
      cy.wait(5000);
      cy.step("I click the Codes I want to delete");
      cy.get("[data-testid='table-row-0-codes']").click();
      cy.wait(3000);
      cy.url().should("contain", "/admin/facility/codes/edit?id");
      cy.step("I click the **Delete** Button and cofirm");
      cy.get(codes.deleteCodeBtn).click();
      cy.get("[data-testid='modal-surface']").should(
        "contain",
        "Confirm Delete"
      );
      cy.get("[data-testid='surface']").contains("Delete Item").click();
      cy.wait(5000);
      cy.reload();
      cy.get("[data-testid='surface']").should("not.contain", templateName);
      cy.get("[data-testid='table-row-0-codes']").should("not.exist");
    });
  }
);
