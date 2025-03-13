/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
Cypress.on("uncaught:exception", (err, runnable) => {
  return false;
});
import {
  codesPayload,
  inputsItemsIngredient,
} from "../../../support/samplePayload";
import floorObj from "../../pageObjects/floor.json";
import global from "../../pageObjects/global.json";
import purchaseOrder from "../../pageObjects/purchaseOrder.json";
import sideMenu from "../../pageObjects/sideMenu.json";
const date = new Date();
// Format the date in ddMMyyyy format
const formattedDate = `${date.getDate()}${("0" + (date.getMonth() + 1)).slice(-2)}${date.getFullYear() % 100}`;

const poID = `ETE-POID-1`;
describe(
  "Admin is able to use Facility General Settings",
  { testIsolation: false, scrollBehavior: "center" },
  () => {
    before(() => {
      cy.clearAllCookies();
      cy.clearAllLocalStorage();
      cy.clearAllSessionStorage();
      cy.task("createTenant");
      cy.loginAs("dynamicUser");
      cy.seedSupplier("");
      inputsItemsIngredient.unitOfMeasurement = "case";
      cy.seedProduct(inputsItemsIngredient);
      cy.seedCustomerProfile("");
      cy.step("navigate to flow page and add assign traits in each stage");
      cy.addFlowStageRule();
      cy.wait(5000);
    });
    after(() => {
      cy.task("destroyTestTenant");
      cy.wait(800);
    });
    it("**Receiving:** Admin has the ability to control which catalog variants are displayed on the Receiving screen.", () => {
      cy.step(
        "Admin navigates to General Settings and check only **'Ingredient', 'Chemical', 'Product'** variants for Receiving"
      );
      cy.setReceivingItemVariant(["Ingredient", "Chemical", "Product"]);
      cy.step(
        "Navigate to floor page and Receiving, assert that the available variants when selecting items are only **'Ingredient', 'Chemical', 'Product'**"
      );
      cy.get(sideMenu.floor).click();
      cy.get(floorObj.receiveItemsBtn).click();
      cy.wait(1500);
      cy.get(floorObj.selectSupplier).find("input").last().as("btn").click();
      cy.wait(3000);
      cy.get("[data-testid^='table-row']").contains("ETE Supplier").click();
      cy.get(floorObj.floorAddItemBtn).last().click();
      cy.wait(2000);
      // assert the available variants
      cy.get("[data-testid='filter-tabs']")
        .find("[tabindex='0']")
        .should(($variantTabs) => {
          expect($variantTabs).to.have.length(3);
          expect($variantTabs).to.contain("Ingredient");
          expect($variantTabs).to.contain("Chemical");
          expect($variantTabs).to.contain("Product");
        });
      cy.wait(3500);
      cy.get("[data-testid='Ingredient']").click();
      cy.wait(1200);
      cy.get("[data-testid^='table-row']")
        .contains(inputsItemsIngredient.name)
        .last()
        .click({ force: true });
      cy.get("[data-testid='btn-common-done']").click();
      cy.wait(1500);
      cy.get(floorObj.quantityInput)
        .last()
        .clear()
        .type("100", { force: true });
      cy.wait(500);
      cy.step("Click Save btn and verify that the item was received");
      cy.get(floorObj.uniqueCodeInput).last().clear().type(`ete-product-123`);
      cy.get(floorObj.saveReciveBtn).last().click();
      cy.get(global.banner, { timeout: 25000 }).contains(
        `${inputsItemsIngredient.name} received successfully!`,
        {
          timeout: 10000,
        }
      );
      cy.wait(2000);
      cy.get(sideMenu.floor).click();
      cy.wait(2000);
      cy.get("[data-testid='row-items']").contains(inputsItemsIngredient.name);
    });
    it("**Purchase Order:** Admin has the ability to enable or disable Purchase Order Document Custom Data Options", () => {
      cy.wait(2000);
      cy.step("User creates a Purchase Order");
      cy.get(sideMenu.purchaseOrder).click();
      cy.wait(3000);
      cy.get(purchaseOrder.addPoBtn).click();
      cy.url().should("contain", "/purchase-orders/new");
      cy.wait(5000);
      cy.step("I select a supplier");
      cy.get(purchaseOrder.selectSupplier).click();
      cy.wait(3000);
      cy.contains("Choose Supplier").should("exist");
      cy.get("[aria-modal='true']").find("input").first().type("ETE Supplier");
      cy.wait(1500);
      cy.get(purchaseOrder.poIdInput).clear().type(poID);
      cy.get("[data-testid='table-row-0-item']")
        .should("contain", "ETE Supplier")
        .click()
        .wait(1000);
      cy.step("I select Status **In Progress**");
      cy.get(purchaseOrder.selectStatus).select("In Progress");
      cy.step("I set the Due Date - last day of the month");
      cy.get("[data-testid='CalendarIcon']").last().click();
      cy.wait(1800);
      cy.get("button").last().click();
      cy.wait(1000);
      cy.step("Select Customer profile");
      cy.get(purchaseOrder.selectComProfID).select("ETE Company", {
        force: true,
      });
      cy.wait(2000);
      cy.step("I save the Purchase Order");
      cy.get(purchaseOrder.savePurchaseOrder).click();
      cy.wait(1000);
      cy.get(global.banner).contains(`Saved Purchase Order:`);
      cy.wait(2000);
      // End of PO creation
      cy.step("Admin enable the **Always prompt me with custom data options**");
      cy.setPOCustomDataOptions(true);
      cy.step("Navigate to Purchase order page again and click a PO");
      cy.get(sideMenu.purchaseOrder).click();
      cy.wait(3000);
      cy.get("[data-testid='table-row-0-purchase-orders']").click();
      cy.wait(4000);
      cy.get("[data-testid='Ordered']").last().click();
      cy.wait(2500);
      cy.contains("Get PO Document").as("btn").click();
      cy.wait(2000);
      cy.get("[role='dialog']").should(($dialogModal) => {
        expect($dialogModal).to.contain("Generate Purchase Order");
        expect($dialogModal).to.contain("Include Catalog Item ID");
        expect($dialogModal).to.contain("Include Cost");
        expect($dialogModal).to.contain("Include Description");
        expect($dialogModal).to.contain("Generate");
        expect($dialogModal).to.have.descendants("[type='checkbox']");
      });
      cy.get("[role='dialog']").find("div").contains("Back").click();
      cy.get("[role='dialog']").should("not.exist");
    });
    it("Admin is able to choose which code templates to use when creating new bundles. ", () => {
      const lastItem =
        codesPayload.definition[codesPayload.definition.length - 1];
      // Modify it
      lastItem.type = "named_match";
      lastItem.name = "bundle";
      lastItem.enum = ["bundle"];
      cy.wait(600);
      console.log(codesPayload, "codesPayload");
      cy.seedCodes(codesPayload);
      cy.reload();
      cy.step(
        "User Navigate to Facility Settings page and update the Bundling template codes"
      );
      cy.selectCodesForBundle(codesPayload.name);
      cy.step("Perform Recieve Item");
      cy.get(sideMenu.floor).click();
      cy.wait(5000);
      cy.get("[data-testid='row-items']").first().click();
      cy.wait(2000);
      cy.get(floorObj.bundleItemsBtn).click();
      cy.wait(1200);
      cy.contains("Bundle Items");
      cy.get(floorObj.bundleNameInput).should(
        "have.value",
        `${formattedDate}bundle`
      );
      cy.get("[data-testid='table-row-0-item']")
        .should("contain", inputsItemsIngredient.name)
        .and("contain", "case");
    });
  }
);
