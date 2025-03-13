Cypress.on("uncaught:exception", (err, runnable) => {
  return false;
});
import facilityObj from "../../pageObjects/facility.json";
import global from "../../pageObjects/global.json";
import sideMenu from "../../pageObjects/sideMenu.json";
import {
  ingredientChemical,
  productData,
} from "../../../support/samplePayload";

describe(
  "Facility Supplier CRUD functionality",
  { testIsolation: false, scrollBehavior: "center" },
  () => {
    before(() => {
      cy.clearAllCookies();
      cy.clearAllLocalStorage();
      cy.clearAllSessionStorage();
      cy.task("createTenant");
      cy.seedProduct(ingredientChemical);
      cy.seedSupplier("");
      cy.loginAs("dynamicUser");
      cy.step("navigate to facility -> supplier page");
      cy.wait(5000);
      cy.get(sideMenu.facilityMenu).click({ force: true });
      cy.url().should("contain", "/admin/facility");
      cy.get('[data-testid="card"]').should("be.visible");
      cy.contains("Suppliers").click();
      cy.url().should("contain", "/suppliers");
      cy.get('[placeholder="Search"]').should("be.visible");
    });
    after(() => {
      cy.task("destroyTestTenant");
      cy.wait(800);
    });
    it("Admin is able to add a supplier", () => {
      cy.step("I click the **Add Supplier** button");
      cy.contains("NAME");
      cy.wait(3000);
      cy.get(facilityObj.addSupplierBtn).click();
      cy.url().should("contain", "/suppliers/new");
      cy.step("I fill in the New Supplier form");
      cy.wait(5000);
      cy.get(facilityObj.companyName).type("Testauto Supplier", {
        force: true,
      });
      cy.get(facilityObj.supCode).type("ete-code-123", { force: true });
      cy.get(facilityObj.address).type("123 Main Street", { force: true });
      cy.get(facilityObj.city).type("Anytown");
      cy.get(facilityObj.province).type("UT", { force: true });
      cy.get(facilityObj.country).type("US", { force: true });
      cy.get(facilityObj.zipcode).type("12345", { force: true });
      cy.step("I add a contact");
      cy.get(facilityObj.supplierAddContactBtn).click();
      cy.wait(3000);
      cy.get(facilityObj.contactTitleInput).type("ETE Title", { force: true });
      cy.get(facilityObj.contactDepartmentInput).type("ETE department", {
        force: true,
      });
      cy.get(facilityObj.contactFirstNameInput).type("ETE", { force: true });
      cy.get(facilityObj.contactLastNameInput).type("Contact", { force: true });
      cy.get(facilityObj.contactEmailInput).type("ete@fakeEmail.com", {
        force: true,
      });
      cy.get(facilityObj.contactPhoneInput).type("5555555555", { force: true });
      cy.step("I add a catalog");
      cy.get(facilityObj.supAddCatalog).click();
      cy.wait(3000);
      cy.get(facilityObj.addCatalogSection)
        .last()
        .find("input")
        .first()
        .as("btn")
        .click();
      cy.wait(2500);
      cy.get(`[data-testid="Chemical"]`).parent().click({ force: true });
      cy.wait(3000);
      cy.get('[data-testid="table-row-0-item"]')
        .contains(ingredientChemical.name)
        .click();
      cy.wait(1500);
      cy.step("I click the Save supplier button");
      cy.get(facilityObj.saveSupplierBtn).click();
      cy.step("Then I should see the Supplier is successfully saved");
      cy.get(global.banner).contains(`Saved Supplier: Testauto Supplier`);
      // cy.get(global.backBtn).click();
      cy.wait(3000);
      cy.step("expect the new supplier contains the correct info");
      cy.get('[data-testid="table-row-0-suppliers"]').then(($details) => {
        expect($details).to.contain("Testauto Supplier");
        expect($details).to.contain("ete-code-123");
        expect($details).to.contain("ete@fakeEmail.com");
        expect($details).to.contain("(555)5555555");
        expect($details).to.contain("ETE Contact");
        expect($details).to.contain("a few seconds ago");
      });
    });
    it("Admin is able to edit a supplier and add another contact", () => {
      cy.wait(6000);
      cy.contains("Suppliers").click();
      cy.url().should("contain", "/suppliers");
      cy.get('[placeholder="Search"]').should("be.visible");
      cy.step("I select the **Testauto Supplier** supplier");
      cy.get('[data-testid="table-row-0-suppliers"]')
        .contains("Testauto Supplier", { timeout: 8000 })
        .click();
      cy.step("I Edited the **Supplier name and code**");
      cy.get(facilityObj.companyName)
        .clear()
        .type("Testauto Supplier - Edited");
      cy.get(facilityObj.supCode).clear().type("ete-edited-code-123");
      cy.step("I add another supplier contact");
      cy.get(facilityObj.supplierAddContactBtn).click();
      cy.wait(1000);
      cy.get(facilityObj.contactDepartmentInput)
        .last()
        .clear()
        .type("ETE department");
      cy.get(facilityObj.contactFirstNameInput)
        .last()
        .clear()
        .type("ETE 2", { force: true });
      cy.get(facilityObj.contactLastNameInput)
        .last()
        .clear()
        .type("Contact", { force: true });
      cy.get(facilityObj.contactEmailInput)
        .last()
        .clear()
        .type("ete2@fakeEmail.com", { force: true });
      cy.get(facilityObj.contactPhoneInput)
        .last()
        .clear()
        .type("(234) 567-8901");
      cy.get(facilityObj.saveSupplierBtn).click();
      cy.step("Then I should see the Supplier is successfully saved");
      cy.get(global.banner).contains(`Testauto Supplier - Edited`);
      cy.wait(5000);
      cy.get('[data-testid="table-row-0-suppliers"]').then(($details) => {
        expect($details).to.contain("a few seconds ago");
        expect($details).to.contain("ete-edited-code...");
      });
      cy.step(
        "I click the edited supplier and verify if data and new contact are saved correctly"
      );
      cy.get('[data-testid="table-row-0-suppliers"]')
        .contains("Testauto Supplier - Edited", { timeout: 8000 })
        .click();
      cy.get(facilityObj.contactDepartmentInput)
        .last()
        .should("have.value", "ETE department");
      cy.get(facilityObj.contactFirstNameInput)
        .last()
        .should("have.value", "ETE 2");
      cy.get(facilityObj.contactLastNameInput)
        .last()
        .should("have.value", "Contact");
      cy.get(facilityObj.contactEmailInput)
        .last()
        .should("have.value", "ete2@fakeEmail.com");
      cy.get(facilityObj.contactPhoneInput)
        .last()
        .should("have.value", "(234) 567-8901");
      cy.get("[data-testid='back-supplier']").click();
    });
    it("Admin is able to delete a Supplier", () => {
      cy.wait(3000);
      cy.step("I navigate to **Suppliers** tab");
      cy.get(sideMenu.facilityMenu).click({ force: true });
      cy.url().should("contain", "/admin/facility");
      cy.get('[data-testid="card"]').should("be.visible");
      cy.contains("Suppliers").click();
      cy.wait(2000);
      cy.url().should("contain", "/suppliers");
      cy.step("I select the **Testauto Supplier** supplier");
      cy.get('[data-testid="table-row-0-suppliers"]')
        .contains("Testauto Supplier", { timeout: 8000 })
        .click();
      cy.wait(5000);
      cy.step("I click the Delete Supplier button and confirm tho modal");
      cy.get(facilityObj.deleteSupplierBtn).click({ force: true });
      cy.wait(1500);
      cy.get(global.modalSurface).should("contain", "Confirm Delete");
      cy.contains("Delete Item").click();
      cy.step(
        "I should not see the **Testauto Supplier** from the supplier list"
      );
      cy.wait(5000);
      cy.get('[data-testid^="table-row-"]').should(
        "not.contain",
        "Testauto Supplier"
      );
    });
  }
);
