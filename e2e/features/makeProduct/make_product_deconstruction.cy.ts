/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
Cypress.on("uncaught:exception", (err, runnable) => {
  return false;
});

import {
  productData,
  productWithAttributes,
} from "../../../support/samplePayload";
import catalogObj from "../../pageObjects/catalog.json";
import floor from "../../pageObjects/floor.json";
import global from "../../pageObjects/global.json";
import recipeObj from "../../pageObjects/recipe.json";
import sideMenu from "../../pageObjects/sideMenu.json";
const ingredientName = "Ingredient Item 1";
const customAttributes1 = "MSC Certified";
const customAttributes2 = "Test Text";
const customAttributes3 = "Test Number";
const firstProductName = "Product 1";
const secondProductName = "Product 2";
const recipeName = "ETE Recipe";
const inputQty = "4";

describe(
  "Testing for deconstruction recipes focusing on catalog items with attributes and input validation based on recipe requirements",
  { testIsolation: false },
  () => {
    before(() => {
      cy.clearAllCookies();
      cy.clearAllLocalStorage();
      cy.clearAllSessionStorage();
      cy.task("createTenant");
      cy.seedSupplier("");
      cy.seedProduct(productData);
      cy.loginAs("dynamicUser");
      cy.wait(1500);
      cy.addFlowStageRule();
    });
    after(() => {
      cy.task("destroyTestTenant");
      cy.wait(800);
    });
    it(
      "User should be able to create Catalog Items Product and Ingredient with multiple **Custom Attributes**",
      { scrollBehavior: false },
      () => {
        cy.step("I navigate to Catalog page");
        cy.get(sideMenu.catalogMenu).click();
        cy.url().should("contain", "/admin/catalog");
        cy.contains("Catalog").should("be.visible");
        cy.get(catalogObj.catalogItems).should("be.visible");
        cy.step("I clicked the Add button on the Catalog page");
        // add ingredient item
        cy.get(catalogObj.addCatalogBtn).click();
        cy.url().should("contain", "catalog/new?type=product");
        cy.contains("New Product");
        cy.contains("Product");
        cy.wait(8000);
        cy.step(
          "I enter the item name and select the Ingredient variant and use pounds for UOM"
        );
        cy.get(catalogObj.nameInput).type(ingredientName);
        cy.wait(1000);
        cy.get(catalogObj.selectVariant).select("Ingredient");
        cy.wait(1000);
        cy.get(catalogObj.unitOfMeasurement).select("pound");
        cy.wait(1500);
        cy.step("I add 3 Custom Attributes");
        cy.get("[data-testid='card-container']")
          .contains("Custom Attributes")
          .scrollIntoView();
        cy.addCustomAttributeCmd({
          index: 0,
          name: customAttributes1,
          type: "Yes / No",
          required: true,
        });
        cy.addCustomAttributeCmd({
          index: 1,
          name: customAttributes2,
          type: "Text",
          required: false,
        });
        cy.addCustomAttributeCmd({
          index: 2,
          name: customAttributes3,
          type: "Number",
          required: true,
        });
        cy.step("I save the catalog Item");
        cy.wait(1000);
        cy.get(catalogObj.saveItemBtn).click();
        cy.wait(1000);
        cy.get(global.banner, { timeout: 10000 }) // expect the banner to appear
          .contains(`Saved Product: ${ingredientName}`, {
            timeout: 10000,
          })
          .wait(500);
        cy.step(
          "I click the back button and assert if the Item is successfully saved"
        );
        cy.get(global.backBtn).click();
        cy.wait(3000);
        // navigate to the correct variant
        cy.get(global.filterTabs).contains(`Ingredient`).click({ force: true });
        cy.wait(3000);
        cy.get("[data-testid='table-row-0-catalog-items']").should(($item) => {
          expect($item).to.contain(ingredientName);
          expect($item).to.contain("pound");
          expect($item).to.contain("MSC Certified");
          expect($item).to.contain("Test Text");
          expect($item).to.contain("Test Text");
        });
        // Add Product Item with multiple variant
        cy.step("I clicked the Add button on the Catalog page");
        cy.get(catalogObj.addCatalogBtn).click();
        cy.contains("New Product");
        cy.contains("Product");
        cy.wait(8000);
        cy.step(
          "I enter the item name and select the Ingredient variant and use pounds for UOM"
        );
        cy.get(catalogObj.nameInput).type(firstProductName);
        cy.wait(1000);
        cy.get(catalogObj.selectVariant).select("Product");
        cy.wait(1000);
        cy.get(catalogObj.unitOfMeasurement).select("pound");
        cy.wait(1500);
        cy.step("I add 3 Custom Attributes");
        cy.get("[data-testid='card-container']")
          .contains("Custom Attributes")
          .scrollIntoView();
        cy.addCustomAttributeCmd({
          index: 0,
          name: customAttributes1,
          type: "Yes / No",
          required: true,
        });
        cy.addCustomAttributeCmd({
          index: 1,
          name: customAttributes2,
          type: "Text",
          required: false,
        });
        cy.addCustomAttributeCmd({
          index: 2,
          name: customAttributes3,
          type: "Number",
          required: false,
        });
        cy.step("I save the catalog Item");
        cy.wait(1000);
        cy.get(catalogObj.saveItemBtn).click();
        cy.wait(1000);
        cy.get(global.banner, { timeout: 10000 }) // expect the banner to appear
          .contains(`Saved Product: ${firstProductName}`, {
            timeout: 10000,
          })
          .wait(500);
        cy.step(
          "I click the back button and assert if the Item is successfully saved"
        );
        cy.get(global.backBtn).click();
        cy.wait(3000);
        // navigate to the correct variant
        cy.get(global.filterTabs).contains(`Products`).click({ force: true });
        cy.wait(3000);
        cy.get("[data-testid='table-row-0-catalog-items']").should(($item) => {
          expect($item).to.contain(firstProductName);
          expect($item).to.contain("pound");
          expect($item).to.contain("MSC Certified");
          expect($item).to.contain("Test Text");
          expect($item).to.contain("Test Text");
        });
      }
    );
    it("User Should be able to create Deconstruction Recipe. Test Inputs and Outputs Items with custom attributes", () => {
      cy.wait(3000);
      productWithAttributes.name = secondProductName;
      productWithAttributes.attributes[2].required = false;
      cy.seedProduct(productWithAttributes);
      cy.step("I got to recipe page");
      cy.get(sideMenu.recipeMenu).click();
      cy.wait(5000);
      cy.get(recipeObj.createNewRecipeBtn).click();
      cy.url().should("contain", "/recipes/new");
      cy.wait(2000);
      cy.step("I enter Recipe Name");
      cy.get(recipeObj.recipeNameInput).type(recipeName);
      cy.wait(1000);
      cy.get(recipeObj.recipeTypeSelect).select("Deconstruction");
      cy.step("I select an Inputs item");
      cy.get(recipeObj.recipeInputsItemCard).find("input").as("btn").click();
      cy.wait(3000);
      cy.get("[data-testid^='table-row']")
        .last()
        .contains(ingredientName)
        .click({ force: true });
      cy.wait(2500);
      cy.step("I select an 2 Outputs items and enter each target percent");
      cy.wait(1000);
      cy.get(recipeObj.recipeOutputsItemCard).find("input").as("btn").click();
      cy.wait(3000);
      cy.contains("Choose Output");
      cy.get(`[data-testid="Product"]`).parent().click({ force: true });
      cy.wait(2000);
      cy.get("[data-testid='table-row-0-item']")
        .contains(firstProductName)
        .click({ force: true })
        .wait(1500);
      cy.get(
        "[data-testid='outputs.0.deconstruction.targetPercent-input']"
      ).type("15");
      cy.wait(1000);
      cy.get("[data-testid='common-add-item-outputs']").click();
      cy.wait(1500);
      cy.get(recipeObj.recipeOutputsItemCard)
        .last()
        .find("input")
        .as("btn")
        .click();
      cy.wait(3000);
      cy.contains("Choose Output");
      cy.get(`[data-testid="Product"]`).parent().click({ force: true });
      cy.wait(2000);
      cy.get("[data-testid='table-row-1-item']")
        .contains(secondProductName)
        .click({ force: true })
        .wait(1500);
      cy.get(
        "[data-testid='outputs.1.deconstruction.targetPercent-input']"
      ).type("20");
      cy.wait(1500);
      cy.get(recipeObj.saveRecipesBtn).click();
      cy.get(global.banner, { timeout: 10000 }).contains(
        `${recipeName} recipe saved successfully`,
        {
          timeout: 10000,
        }
      );
      cy.wait(2000);
      cy.get(`[data-testid="Deconstruction"]`).last().click({ force: true });
      cy.wait(5000);
      cy.get(recipeObj.recipeCards, { timeout: 10000 }).then(($recipeItems) => {
        expect($recipeItems).to.contain(recipeName);
        expect($recipeItems).to.contain(`1 Inputs`);
        expect($recipeItems).to.contain(`2 Outputs`);
      });
      cy.wait(1000);
    });
    it("User receive the Ingredient Item with custom attributes and produce the outputs item. This Test focuses on Make Product through Recipe Deconstruction and custom attributes display ", () => {
      cy.wait(2000);
      cy.reload();
      // Receive
      cy.step(
        "User Recieve the ingredient item and verify the Custom attributes display"
      );
      cy.get(sideMenu.floor).click();
      cy.wait(5000);
      cy.get(floor.receiveItemsBtn).click();
      cy.wait(2000);
      cy.get(floor.selectSupplier).find("input").as("btn").click();
      cy.wait(3500);
      cy.get("[aria-modal='true']").find("input").first().type("ETE Supplier");
      cy.wait(2000);
      cy.get("[data-testid^='table-row']").contains("ETE Supplier").click();
      cy.get(floor.floorAddItemBtn).last().click();
      cy.wait(2000);
      cy.get(`[data-testid="Ingredient"]`).click({ force: true });
      cy.get("[data-testid='table-row-0-item']")
        .contains(ingredientName)
        .last()
        .click({ force: true });
      cy.get("[data-testid='btn-common-done']").click();
      cy.get(floor.selectCatalog)
        .find("input")
        .should("have.attr", "value", ingredientName);
      cy.wait(500);
      cy.get(floor.quantityInput).last().type("{selectall}10");
      cy.wait(500);
      cy.get(floor.uniqueCodeInput).last().clear().type("ete-product-ID");
      // cy.step("I disable the print label by clicking the Print Label toggle");
      // cy.get("[role='switch']").last().click();
      cy.step(
        "I click the Receive button, I should see error warning **This field is required** for the required Attributes **except Test Text Attribute**"
      );
      cy.get(floor.saveReciveBtn).click();
      cy.wait(1000);
      cy.get("[data-testid='select-productRows.0.attributes.0.value']")
        .parent()
        .parent()
        .parent()
        .should("contain", "MSC Certified")
        .and("contain", "This field is required");
      cy.step("I select **Yes* for MSC Certified");
      cy.get("[data-testid='select-productRows.0.attributes.0.value']").select(
        "Yes"
      );
      cy.wait(1000);
      cy.step(
        "I should not be able to click the Save button and I should still see the **This field is required** for the **Test Number** attributes"
      );
      cy.get(floor.saveReciveBtn).should("have.attr", "aria-disabled", "true");
      cy.wait(1200);
      cy.contains("This field is required");
      cy.wait(1000);
      cy.step(
        "I type number for the Test Number Attribute then I should be able to click the Save button"
      );
      cy.get("[data-testid='productRows.0.attributes.2.value-input']").type(
        "10"
      );
      cy.wait(1000);
      cy.get(floor.saveReciveBtn).click();
      cy.wait(1000);
      cy.get(global.banner, { timeout: 25000 }).contains(
        `${ingredientName} received successfully!`,
        {
          timeout: 10000,
        }
      );
      cy.get(sideMenu.floor).click();
      cy.wait(5000);
      cy.step(
        "Assert the Received Item contains is saved and Custom Attribute Chips are displayed with the correct value"
      );
      cy.get(floor.receiveItemsRow, { timeout: 10000 })
        .first()
        .should(($itemIsSave) => {
          expect($itemIsSave).to.contain(ingredientName);
          expect($itemIsSave).to.contain("ete-product-ID");
          expect($itemIsSave).to.contain("Lbs");
          expect($itemIsSave).to.contain(customAttributes1);
          expect($itemIsSave).to.not.contain(customAttributes2);
          expect($itemIsSave).to.contain(customAttributes3);
        });
      cy.get(floor.receiveItemsRow, { timeout: 10000 })
        .first()
        .contains("MSC Certified")
        .parent()
        .should("contain", "Yes");
      cy.get(floor.receiveItemsRow, { timeout: 10000 })
        .first()
        .contains("Test Number")
        .parent()
        .should("contain", "10");
      cy.wait(3000);
      // Make Product
      cy.step(
        "I click the Make Product btn and navigate to Deconstruction tab"
      );
      cy.get(floor.makeProductBtn).click();
      cy.wait(2000);
      cy.get("[data-testid='Deconstruction']").last().click();
      cy.wait(1200);
      cy.url().should("contain", "deconstruction");
      cy.get(floor.recipeCards)
        .last()
        .contains(recipeName)
        .click({ force: true });
      cy.wait(2000);
      cy.step("Assert the Inputs data");
      cy.get("[data-testid='inputs-surface']")
        .should("contain", ingredientName)
        .find("[data-testid='inputs-quantity']")
        .should("contain", `0 lbs`);
      cy.step("I click the choose source btn");
      cy.get(floor.sourceChoosingBtn)
        .should("contain", "10 lbs")
        .should("contain", "from ete-product-ID")
        .click();
      cy.wait(1200);
      cy.step(
        "Assert the source entity qty and the custom attributes are present"
      );
      cy.get("[data-testid='source-entity-quanty']").should(
        "contain",
        "10 lbs"
      );
      cy.get("[data-testid='exp-or-attributes-chip']").should(($attr) => {
        expect($attr).to.contain(customAttributes1);
        expect($attr).to.contain(customAttributes3);
      });
      cy.step("Assert the defaul use qty and change the value to **2**");
      cy.wait(1200);
      cy.get("[data-testid='formula.inputs.0.sources.0.quantity_scalar-input']")
        .should("have.value", "10")
        .type("{selectall}2");
      cy.wait(1200);
      cy.step("I click the Next Step");
      cy.contains("Next Step").as("btn").click();
      cy.wait(10000);
      cy.get(floor.saveMakeProductBtn).should(
        "have.attr",
        "aria-disabled",
        "true"
      );
      cy.get("[data-testid='quantity_Ingredient Item 1_scalar-input']").should(
        "have.value",
        "2"
      );
      cy.step(
        "I see all the Outputs Item, I select the Product 2 by clicking the **Assign +** btn"
      );
      cy.get(floor.assigningItem).should(($assigningItem) => {
        expect($assigningItem).to.have.length(3);
        expect($assigningItem).to.contain(firstProductName);
        expect($assigningItem).to.contain(secondProductName);
        expect($assigningItem).to.contain("Waste");
      });
      cy.get(floor.assigningItem)
        .contains(secondProductName)
        .parent()
        .parent()
        .parent()
        .find(floor.floorAssign)
        .contains("Assign")
        .as("btn")
        .click();
      cy.wait(1000);
      cy.step("Assert the total qty of the selected item");
      cy.get(floor.assigningItem)
        .contains(secondProductName)
        .parent()
        .parent()
        .parent()
        .find("[data-testid='qty-unit']")
        .should("contain", "2");
      // cy.step("Assert the available assign quantity value is became 0");
      // cy.get("[data-testid='quantity_Ingredient Item 1_scalar-input']").should(
      //   "have.value",
      //   "0"
      // );
      cy.step("I click the Create button");
      cy.get(floor.saveMakeProductBtn).click();
      cy.wait(1000);
      cy.get(global.banner).contains(
        `${recipeName} has been made successfully!`
      );
      cy.wait(7000);
      cy.step(
        "I see the item is on the Floor list and I see the correct Quantity, Unit and Custom Attributes"
      );
      cy.get(floor.receiveItemsRow, { timeout: 10000 })
        .first()
        .should(($itemIsSave) => {
          expect($itemIsSave).to.contain(secondProductName);
          expect($itemIsSave).to.contain("2");
          expect($itemIsSave).to.contain("Lbs");
          expect($itemIsSave).to.contain(customAttributes1);
          expect($itemIsSave).to.not.contain(customAttributes2);
          expect($itemIsSave).to.contain(customAttributes3);
        });
    });
    it("User should be able to modify the Deconstruction Recipe Input requirement", () => {
      // Edit Recipe
      cy.wait(3000);
      cy.reload();
      cy.step("I go to Recipe page and navigate to Deconstruction tab");
      cy.get(sideMenu.recipeMenu).click();
      cy.wait(2000);
      cy.get("[data-testid='Deconstruction']").last().click();
      cy.wait(2000);
      cy.step("I select the Recipe and click the Requirement switch toggle");
      cy.get(floor.recipeCards)
        .last()
        .contains(recipeName)
        .click({ force: true });
      cy.wait(2000);
      cy.get("[role='switch']").last().click();
      cy.wait(12000);
      cy.step(
        "I check the **Include** checkbox for **Require MSC Certified** attribute and it should display on  the List of selected requirements"
      );
      cy.get(floor.inputsAttrRequirements).contains("Require MSC Certified");
      cy.get(
        "[data-testid='checkbox-inputs.0.requirements.attributes.0.value']"
      )
        .as("btn")
        .click();
      cy.wait(800);
      cy.get("[data-testid='list-selected-inputs-requirements']").should(
        "contain",
        "Must be MSC Certified"
      );
      cy.step(
        "I check the **Test Number** attribute and set up **is not 8** as condition and I should see this requirement on  the List of selected requirements"
      );
      cy.get(floor.inputsAttrRequirements)
        .contains("Test Number")
        .parentsUntil(floor.inputsAttrRequirements)
        .find("[data-testid^='checkbox-inputs']")
        .as("btn")
        .click();
      cy.get(
        "[data-testid='select-inputs.0.requirements.attributes.2.comparator']"
      ).select("is not");
      cy.wait(800);
      cy.get(
        "[data-testid='inputs.0.requirements.attributes.2.value-input']"
      ).type("8");
      cy.wait(800);
      cy.get("[data-testid='list-selected-inputs-requirements']")
        .should("contain", "Must be MSC Certified")
        .and("contain", "Test Number cannot be 8");
      cy.wait(1000);
      cy.step("I save the recipe");
      cy.get(recipeObj.saveRecipesBtn).click();
      cy.wait(5000);
      // Navigate to Make Product Deconstruction Verify the the inputs
      cy.step(
        "I click the Make Product btn and navigate to Deconstruction tab"
      );
      cy.get(sideMenu.floor).click();
      cy.step(
        "Navigate to Make Product Deconstruction Verify the the Inputs is displayed and there is available source item from inventory that met the requirements"
      );
      cy.get(floor.makeProductBtn).click();
      cy.wait(2000);
      cy.get("[data-testid='Deconstruction']").last().click();
      cy.wait(1200);
      cy.url().should("contain", "deconstruction");
      cy.get(floor.recipeCards)
        .last()
        .contains(recipeName)
        .click({ force: true });
      cy.wait(3000);
      cy.get(floor.inputsSurface).should(($inputsSurface) => {
        expect($inputsSurface).to.contain(ingredientName);
        expect($inputsSurface).to.contain("Must be MSC Certified");
        expect($inputsSurface).to.contain("Test Number cannot be 8");
      });
      cy.get(floor.sourceChoosingBtn).click();
      cy.wait(2000);
      cy.step(
        "User manually edited the ingredient Item from Floor, changed the **Test Number** value to 8"
      );
      cy.get(sideMenu.floor).click();
      cy.get("[data-testid='row-items']")
        .contains(ingredientName)
        .parentsUntil("[data-testid='row-items']")
        .find(floor.iconsOption)
        .click();
      cy.wait(3000);
      cy.wait(2000);
      cy.get("[data-testid='Edit']").click();
      cy.wait(2000);
      cy.get("[data-testid='custom_attribute_Test Number-input']").type(
        "{selectall}8"
      );
      cy.wait(1200);
      cy.get("[data-testid='note-input']").type(
        "ETE changed the Attribute value"
      );
      cy.wait(1000);
      cy.get("[data-testid='save-']").click();
      cy.wait(8000);
      cy.step(
        "Navigate to Make Product Deconstruction Verify that there isn't available source from the inventory"
      );
      cy.get(floor.makeProductBtn).click();
      cy.wait(2000);
      cy.get("[data-testid='Deconstruction']").last().click();
      cy.wait(1200);
      cy.url().should("contain", "deconstruction");
      cy.get(floor.recipeCards)
        .last()
        .contains(recipeName)
        .click({ force: true });
      cy.wait(3000);
      cy.get(floor.inputsSurface).should(($inputsSurface) => {
        expect($inputsSurface).to.contain(ingredientName);
        expect($inputsSurface).to.contain("Must be MSC Certified");
        expect($inputsSurface).to.contain("Test Number cannot be 8");
      });
      cy.get(floor.inputsSurface).should("contain", "Cannot find in inventory");
      cy.wait(2000);
    });
  }
);
