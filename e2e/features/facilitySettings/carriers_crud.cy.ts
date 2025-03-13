import global from "../../pageObjects/global.json";
import carriers from "../../pageObjects/carriers.json";
import sideMenu from "../../pageObjects/sideMenu.json";
Cypress.on("uncaught:exception", (err, runnable) => {
  return false;
});
const carrierName = "ETE CARRIER";
const newCarrierName = "ETE CARRIER UPDATED";
describe(
  "Facility Carriers CRUD Functionality",
  { testIsolation: false, scrollBehavior: "center" },
  () => {
    before(() => {
      cy.clearAllCookies();
      cy.clearAllLocalStorage();
      cy.clearAllSessionStorage();
      cy.task("createTenant");
      cy.loginAs("dynamicUser");
      cy.step("navigate to facility -> Carriers page");
      cy.get(sideMenu.facilityMenu).click({ force: true });
      cy.url().should("contain", "/admin/facility");
      cy.get('[data-testid="card"]').should("be.visible");
      cy.wait(1200);
      cy.get(carriers.carriersTab).click();
      cy.url().should("contain", "admin/facility/carriers");
      cy.contains("Facility Settings");
      cy.wait(4000);
    });
    after(() => {
      cy.task("destroyTestTenant");
      cy.wait(800);
    });
    it("Admin is able to add Carrier", () => {
      cy.step("I click the **Add Carrier** Button");
      cy.get(carriers.addCarrierBtn).click();
      cy.url().should("contain", "admin/facility/carriers/new");
      cy.contains("New Carrier");
      cy.wait(4000);
      cy.step("I enter the Carrier Title or Name");
      cy.get(carriers.companyNameInput).type(carrierName).wait(1000);
      cy.step("I fill in the address form");
      cy.get(carriers.phoneNumberInput).type("5555555555").wait(1000);
      cy.get(carriers.addressInput).type("001 Bonsecours").wait(1000);
      cy.get(carriers.cityInput).type("Montréal").wait(1000);
      cy.get(carriers.provinceInput).type("Quebec").wait(1000);
      cy.get(carriers.countryInput).type("Canada").wait(1000);
      cy.get(carriers.postalCodeInput).type("H2Y 3C3").wait(1000);
      cy.wait(3000);
      cy.step("I click the **Save Carrier** Button");
      cy.get(carriers.saveCarrierBtn).click();
      cy.wait(1000);
      cy.step("Assert that the Carrier is saved correctly");
      cy.get(global.banner).contains(`Saved Carrier: ${carrierName}`);
      cy.get("[data-testid='table-row-0-carriers']").should(($newCarrier) => {
        expect($newCarrier).to.contain(carrierName);
        expect($newCarrier).to.contain("(555)5555555");
        expect($newCarrier).to.contain("a few seconds ago");
      });
    });
    it("Admin is able to edit a Carrier", () => {
      cy.wait(5000);
      cy.step("I click a carrier that I want to edit");
      cy.get("[data-testid='table-row-0-carriers']").click();
      cy.url().should("contain", "facility/carriers/edit");
      cy.wait(3000);
      cy.step("I change the Carrier Name");
      cy.get(carriers.companyNameInput).clear().type(newCarrierName).wait(1000);
      cy.step("I change the phone number");
      cy.get(carriers.phoneNumberInput).clear().type("4444444444");
      cy.step("I click the **Save Carrier** Button");
      cy.get(carriers.saveCarrierBtn).click();
      cy.wait(1000);
      cy.step("Assert that the Carrier is saved correctly");
      cy.get(global.banner).contains(`Saved Carrier: ${newCarrierName}`);
      cy.get("[data-testid='table-row-0-carriers']").should(($newCarrier) => {
        expect($newCarrier).to.contain(newCarrierName);
        expect($newCarrier).to.contain("(444)4444444");
        expect($newCarrier).to.contain("a few seconds ago");
      });
    });
    it("Admin is able to delete Carrier", () => {
      cy.wait(5000);
      cy.step("I click the Carrier I want to delete");
      cy.get("[data-testid='table-row-0-carriers']").click();
      cy.wait(3000);
      cy.url().should("contain", "facility/carriers/edit");
      cy.step("I click the **Delete** Button and cofirm");
      cy.get(carriers.deleteCarrierBtn).click();
      cy.wait(1000);
      cy.get("[data-testid='modal-surface']")
        .should("contain", "Confirm Delete")
        .contains("Delete Item")
        .click();
      cy.wait(2000);
      cy.get("[data-testid='surface']").should("not.contain", newCarrierName);
      cy.get("[data-testid='table-row-0-carriers']").should("not.exist");
    });
  }
);
