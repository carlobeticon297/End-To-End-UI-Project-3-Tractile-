Cypress.on("uncaught:exception", (err, runnable) => {
  return false;
});

import catalogObj from "../../pageObjects/catalog.json";
import global from "../../pageObjects/global.json";
import sideMenu from "../../pageObjects/sideMenu.json";
import { productData } from "../../../support/samplePayload";

describe(
  "Catalog Crud Functionality",
  { testIsolation: false, scrollBehavior: "center" },
  () => {
    before(() => {
      cy.clearAllCookies();
      cy.clearAllLocalStorage();
      cy.clearAllSessionStorage();
      cy.task("createTenant");
      cy.seedProduct(productData);
      cy.loginAs("dynamicUser");
      cy.wait(1500);
      cy.step("I navigate to Catalog page");
      cy.get(sideMenu.catalogMenu).click();
      cy.url().should("contain", "/admin/catalog");
      cy.contains("Catalog").should("be.visible");
      cy.get(catalogObj.catalogItems).should("be.visible");
    });
    after(() => {
      cy.task("destroyTestTenant");
      cy.wait(800);
    });
    it("Admin is able to make Catalog item without using the default fields ", () => {
      cy.step("I clicked the Add button on the Catalog page");
      cy.get(catalogObj.addCatalogBtn).click();
      cy.url().should("contain", "catalog/new?type=product");
      cy.contains("New Product");
      cy.contains("Product");
      cy.wait(10000);
      cy.step(
        "Admin clicked the Save Item button on the New Product page while other fields are empty"
      );
      cy.wait(1800);
      cy.get("[data-testid^='save-']").click();
      cy.step("assert that the required fields are present");
      cy.get(catalogObj.nameInput)
        .parent()
        .parent()
        .parent()
        .parent()
        .should("contain", "is required.");
      // this will make sure that other fields are not required
      cy.get("[data-testid='card']").should("not.contain", "is required.");
      cy.step("I entered a Name and Description");
      cy.wait(5000);
      cy.get(catalogObj.nameInput).type("Testauto Product", { force: true });
      cy.get(catalogObj.descriptionInput).type("For ETE purposes only", {
        force: true,
      });
      cy.step("I selected the Variant **Ingredient**");
      cy.get(catalogObj.selectVariant).select("Ingredient");
      cy.step("I fill in the Inventory Settings form");
      cy.get(catalogObj.consumptionStrategy).select("First Expiry First Out");
      cy.wait(1000);
      cy.get(catalogObj.receiveInitialStatus).select("On Hold");
      cy.get(catalogObj.unitOfMeasurement).select("kilogram");
      cy.wait(1000);
      cy.get(catalogObj.convertToUnit).select("gram");
      cy.wait(800);
      cy.get(catalogObj.shelfLife)
        .clear({ force: true })
        .type("15", { force: true });
      cy.wait(800);
      cy.get(catalogObj.shelfLifeAlertDays)
        .clear({ force: true })
        .type("20", { force: true });
      cy.get(catalogObj.minimumStockAmount).clear().type("5", { force: true });
      cy.wait(3000);
      cy.step("I add Sub Categories");
      cy.get(catalogObj.addSubCategory).click();
      cy.wait(2500);
      cy.get(catalogObj.subCatNameInput)
        .type("Testauto Sub Category", { force: true })
        .wait(800);
      cy.get(catalogObj.priceCatNameInput)
        .clear()
        .type("20", { force: true })
        .wait(800);
      cy.get(catalogObj.descCatNameInput)
        .type("For E2E purposes only", { force: true })
        .wait(800);
      cy.step("I fill in the Details form");
      cy.wait(3000);
      cy.get(catalogObj.upcCatInput)
        .scrollIntoView()
        .type("012345678905", { force: true });
      cy.wait(2500);
      cy.get(catalogObj.catItemId).type("testauto-catalog-id", { force: true });
      cy.get(catalogObj.dimentionLength)
        .clear({ force: true })
        .type("15", { force: true });
      cy.wait(1000);
      cy.get(catalogObj.dimentionWidth)
        .clear()
        .type("10", { force: true })
        .wait(800);
      cy.get(catalogObj.dimentionDepth)
        .clear()
        .type("5", { force: true })
        .wait(800);
      cy.step("I add Casing **Units in Packages**");
      cy.wait(3000);
      cy.get(catalogObj.addCasingOptionBtn).click().wait(1500);
      cy.get("[data-testid='casingOptions.0.name-input']")
        .type("012345678905", { force: true })
        .wait(800);
      cy.get(catalogObj.casingOptAmountInput)
        .clear()
        .type("2", { force: true })
        .wait(800);
      cy.step("I add Custom Attributes");
      cy.get(catalogObj.addCustAttrBtn).click().wait(1500);
      cy.get("[data-testid='attributes.0.name-input']").type(
        "Testauto Custom Attributes",
        { force: true }
      );
      cy.get(catalogObj.selectAttrType).select("Yes / No");
      cy.wait(1500);
      cy.get(catalogObj.uomQuantity)
        .should("contain", "2")
        .and("contain", "kg");
      cy.step("I add Purchase Price");
      cy.get(catalogObj.purchasePrice).clear().type("20", { force: true });
      cy.step("I add Shelf Life Shipping Calculator");
      cy.get(catalogObj.shipPercentInput)
        .clear({ force: true })
        .type("20", { force: true });
      cy.step("I click the Save Item button");
      cy.get(catalogObj.saveItemBtn).contains("Save Item").click();
      cy.step("I should see the New Product is successfully saved");
      cy.get(global.banner, { timeout: 10000 }) // expect the banner to appear
        .contains(`Saved Product: Testauto Product`, {
          timeout: 10000,
        })
        .wait(500);
      cy.get(global.backBtn).click();
      cy.wait(3000);
      // navigate to the correct variant
      cy.get(global.filterTabs).contains(`Ingredient`).click({ force: true });
      cy.wait(2000);
      cy.step(
        "expect the new product contains the correct info and belongs to the correct variant"
      );
      cy.get('[data-testid="table-row-0-catalog-items"]').then(($details) => {
        expect($details).to.contain("Testauto Product");
        expect($details).to.contain("testauto-catalo...");
        expect($details).to.contain("kilogram");
        expect($details).to.contain("Testauto Custom Attributes");
        expect($details).to.contain("few seconds ago");
      });
      cy.wait(2000);
    });
    it("Admin is able to Edit a Catalog Item", () => {
      cy.wait(5000);
      cy.reload();
      cy.step("Navigate to **Ingredients** variant tab");
      cy.get(global.filterTabs).contains("Ingredients").click({ force: true });
      cy.step("I select **ETE Testing Bar 3.0** Item");
      cy.wait(1500);
      cy.get(`[data-testid^="table-row-"]`)
        .contains("Testauto Product")
        .click();
      cy.step(
        "I edit the following fields: **Product Name, Variant, Unit of Measurement, Weight Per Unit**"
      );
      cy.wait(5000);
      cy.get(catalogObj.nameInput)
        .clear()
        .type("Testauto Product - Edited", { force: true });
      cy.get(catalogObj.selectVariant).select("Product");
      cy.get(catalogObj.unitOfMeasurement).select("unit");
      cy.get(catalogObj.weightPerUnit)
        .clear({ force: true })
        .type("10", { force: true });
      cy.step("I click the Save Item button");
      cy.get(catalogObj.saveItemBtn).contains("Save Item").click();
      cy.step("I should see the New Product is successfully saved");
      cy.get(global.banner, { timeout: 10000 })
        .contains(`Saved Product: Testauto Product - Edited`, {
          timeout: 10000,
        })
        .wait(500);
      cy.get(global.backBtn).click();
      cy.step(
        "expect the new product contains the correct info and belongs to the correct variant"
      );
      cy.get('[data-testid="table-row-0-catalog-items"]').then(($details) => {
        expect($details).to.contain("Testauto Product - Edited");
        expect($details).to.contain("testauto-catalo..");
        expect($details).to.contain("unit");
        expect($details).to.contain("Testauto Custom Attributes");
        expect($details).to.contain("few seconds");
      });
    });
    it("Admin is able to delete a Catalog Item", () => {
      cy.wait(5000);
      cy.reload();
      cy.step("Navigate to **Products** variant tab");
      cy.get(global.filterTabs).contains("Products").click({ force: true });
      cy.wait(1500);
      cy.get(`[data-testid="table-row-0-catalog-items"]`)
        .contains("Testauto Product")
        .click();
      cy.step("I click the **Delete Item** button");
      cy.wait(5000);
      cy.get(catalogObj.deleteItemBtn).contains("Delete Item").click();
      cy.step("I click the **Delete Item** button from the confimation modal");
      cy.wait(1500);
      cy.get(global.modalSurface).should("contain", "Confirm Delete");
      cy.get(global.modalSurface).contains("Delete Item").click();
      cy.step(
        "Then I should not see the *Testauto Product** from the **Product** list"
      );
      cy.wait(2000);
      cy.get(global.filterTabs).contains("Product").click({ force: true });
      cy.wait(3000);
      cy.get('[data-testid^="table-row-"]').should(
        "not.contain",
        "Testauto Product"
      );
    });
  }
);
