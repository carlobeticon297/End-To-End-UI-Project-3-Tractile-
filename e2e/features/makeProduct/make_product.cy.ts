/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
Cypress.on("uncaught:exception", (err, runnable) => {
  return false;
});
import { format } from "date-fns";
import {
  codesPayloadForProduction,
  forOutputItem,
  ingredientChemical,
  ingredientWithAttributes,
  inputsItemsIngredient,
  productData,
  recipePayload,
  recipePayloadWithAttributes,
} from "../../../support/samplePayload";
import floorObj from "../../pageObjects/floor.json";
import global from "../../pageObjects/global.json";
import sidemenu from "../../pageObjects/sideMenu.json";
const formattedDate = format(new Date(), "dMMyy");
let item1: string;
let item2: string;
let item3: string;
let item4: string;
let item5: string;
const recipe2 = "Recipe No Scale";
const recipe3 = "Recipe Multiple Outputs";
describe(
  "Make Product features test scenarios",
  { testIsolation: false, scrollBehavior: "center" },
  () => {
    before(() => {
      cy.clearAllCookies();
      cy.clearAllLocalStorage();
      cy.clearAllSessionStorage();
      cy.task("createTenant");
      // seed Catalog Item and get the id for Recipe Inputs
      cy.step("Login to the app");
      cy.loginAs("dynamicUser");
      cy.step("navigate to flow page and add assign traits in each stage");
      cy.seedSupplier("");
      cy.seedProduct(inputsItemsIngredient).then(($catalogItem) => {
        item1 = $catalogItem.id;
      });
      cy.seedProduct(forOutputItem).then(($catalogItemInput) => {
        item2 = $catalogItemInput.id;
      });
      cy.seedCodes(codesPayloadForProduction);
      // cy.seedEmployee(employeePayload);
      cy.addFlowStageRule();
      cy.step("Perform Receiving for input item");
      cy.receiveItems({
        supplier: "ETE Supplier",
        product: inputsItemsIngredient.name,
        quantity: "100",
        printLabel: false,
      });
    });
    after(() => {
      cy.task("destroyTestTenant");
      cy.wait(800);
    });
    it("The Admin can select a custom code template that will be used in producing an item.", () => {
      recipePayload.inputs.splice(1, 1); // remove the second input from array
      recipePayload.inputs[0].quantity = "15";
      recipePayload.inputs[0].correlationId = item1;
      recipePayload.outputs[0].correlationId = item2;
      recipePayload.inputs[0].variance = {
        enabled: true,
        under: 10,
        over: 25,
      };
      cy.seedRecipe(recipePayload);
      cy.get(sidemenu.floor).click();
      cy.url().should("contain", "/floor");
      cy.wait(5000);
      cy.step("navigate to catalog page and open the catalog item");
      cy.get(sidemenu.catalogMenu).click();
      cy.url().should("contain", "/catalog");
      cy.get(`[data-testid*=catalog-items]`)
        .contains(forOutputItem.name)
        .click();
      cy.wait(1500);
      cy.get(`[data-testid*=itemName]`).click();
      cy.contains("Code Template").scrollIntoView();
      cy.step("select a code template and save the changes");
      cy.get(`[data-testid=select-lotCodeTemplateId]`).select(
        "Production Codes Template"
      );
      cy.wait(1000);
      cy.get("[data-testid='save-']").click();
      cy.wait(1000);
      cy.get(global.banner).contains(`Saved Product: ${forOutputItem.name}`);
      cy.step("Navigate to the make product page");
      cy.get(sidemenu.floor).click();
      cy.url().should("contain", "/floor");
      cy.get(floorObj.makeProductBtn).click();
      cy.url().should("contain", "floor/make/recipe");
      cy.contains("Select Recipe");
      cy.wait(3000);
      cy.step("User selects a variant **Production**");
      cy.get("[data-testid='Production']").click();
      cy.wait(3000);
      cy.contains(recipePayload.name).parent().parent().click();
      cy.wait(3000);
      cy.step(
        "Assert that the Make Product screen has an Output Item with the Code Template selected"
      );
      cy.get('[data-testid="surface"]')
        .contains(forOutputItem.name)
        .parentsUntil('[data-testid="surface"]')
        .invoke("text") // Get the text content of the element
        .then((text) => {
          // Remove the unwanted text 'Inputs Name' from the text
          const filteredText = text.replace(forOutputItem.name, "").trim();
          // Assert that the remaining text contains 'code template'
          expect(filteredText).to.contain(`${formattedDate}production`);
        });
      cy.step(
        "User clicks the source item button and assert that the available item is auto selected"
      );
      cy.get(floorObj.sourceChoosingBtn).as("btn").click().wait(1000);
      cy.step("User clicks the **Create** button");
      cy.get(floorObj.saveMakeProductBtn).click();
      cy.wait(2000);
      cy.get(global.banner).should("be.visible");
      cy.step("Assert that the output item has the correct code template");
      cy.get("[data-testid='row-items']")
        .contains(forOutputItem.name)
        .parentsUntil("[data-testid='row-items']")
        .should("contain", `${formattedDate}production`);
    });
    it("The user should be able to produce the item if the input quantity is inside the allowed variance range", () => {
      cy.get(sidemenu.floor).click();
      cy.get("[data-testid='row-items']").should(
        "contain",
        inputsItemsIngredient.name
      );
      cy.wait(2000);
      cy.step("User clicks on the **Make Product** button");
      cy.get(floorObj.makeProductBtn).click();
      cy.url().should("contain", "floor/make/recipe");
      cy.contains("Select Recipe");
      cy.wait(3000);
      cy.step("User selects a variant **Production** and select the recipe");
      cy.get("[data-testid='Production']").click();
      cy.wait(3000);
      cy.contains(recipePayload.name).parent().parent().click();
      cy.wait(3000);
      cy.step(
        "User clicks the source item button and assert that the available item is auto selected"
      );
      cy.get(floorObj.sourceChoosingBtn).as("btn").click();
      cy.step(
        "Assert that the recipe contains the correct Input Item with correct variance"
      );
      cy.get(floorObj.inputsSurface).should(($inputSurfaceContent) => {
        expect($inputSurfaceContent).to.contain("15 U");
        expect($inputSurfaceContent).to.contain("Variance 5 U - 40 U");
        expect($inputSurfaceContent).to.contain("85 U");
      });
      cy.get(
        "[data-testid='formula.inputs.0.sources.0.quantity_scalar-input']"
      ).should("have.value", "15");
      cy.step(
        "The user should not be able to produce the item if the input quantity is outside the allowed variance range"
      );
      // less than minimum
      cy.get(
        "[data-testid='formula.inputs.0.sources.0.quantity_scalar-input']"
      ).type("{selectall}4.5");
      cy.wait(1200);
      // error message
      cy.get("[data-testid='inputs-source-area']").contains(
        "Cannot find more in inventory, short by 0.5 U"
      );
      // assert the create button is disabled
      cy.get(floorObj.saveMakeProductBtn).should(
        "have.attr",
        "aria-disabled",
        "true"
      );
      cy.wait(1000);
      cy.get(
        "[data-testid='formula.inputs.0.sources.0.quantity_scalar-input']"
      ).type("{selectall}41");
      cy.wait(1200);
      // error message that the quantity isn't allowed
      cy.get("[data-testid='inputs-source-area']").contains(
        "Total must be less than or equal to 40 U"
      );
      // assert the create button is disabled
      cy.get(floorObj.saveMakeProductBtn).should(
        "have.attr",
        "aria-disabled",
        "true"
      );
      // user use allowed quantity
      cy.step(
        "User should be able to click the Create button if the input quantity is within the variance range"
      );
      cy.get(
        "[data-testid='formula.inputs.0.sources.0.quantity_scalar-input']"
      ).type("{selectall}20");
      cy.wait(2000);
      // assert that the error message doesn't exist
      cy.get("[data-testid='inputs-source-area']").should(
        "not.contain",
        "Total must be less than"
      );
      cy.step("User clicks the **Create** button");
      cy.get(floorObj.saveMakeProductBtn).click();
      cy.wait(5000);
      cy.step("Assert that the output item is displayed in the floor page");
      cy.get("[data-testid='row-items']")
        .eq(0)
        .should("contain", forOutputItem.name);
      cy.get("[data-testid='row-items']")
        .eq(1)
        .should("contain", forOutputItem.name);
    });
    it(" Input quantity is within the allowed variance but multiple sources being used", () => {
      cy.get(sidemenu.floor).click();
      cy.get("[data-testid='row-items']").should("be.visible");
      cy.wait(2000);
      cy.step("Select a different Stage (Processing)");
      cy.get(floorObj.selectStage).select("Processing");
      cy.wait(5000);
      cy.step("Perform Receiving for input item");
      cy.receiveItems({
        supplier: "ETE Supplier",
        product: inputsItemsIngredient.name,
        quantity: "100",
        printLabel: false,
      });
      cy.get(sidemenu.floor).click();
      cy.url().should("contain", "/floor");
      cy.wait(2000);
      cy.step("User clicks on the **Make Product** button");
      cy.get(floorObj.makeProductBtn).click();
      cy.url().should("contain", "floor/make/recipe");
      cy.contains("Select Recipe");
      cy.wait(3000);
      cy.step("User selects a variant **Production** and select the recipe");
      cy.get("[data-testid='Production']").click();
      cy.wait(3000);
      cy.contains(recipePayload.name).parent().parent().click();
      cy.wait(3000);
      cy.step(
        "assert that the correct default stage is selected and select the 'Anywhere' stage"
      );
      cy.get("[data-testid='text-input-outlined']")
        .eq(1)
        .should("have.value", "Processing")
        .wait(600);
      cy.step(
        "User clicks the source item button and assert that the available item is auto selected"
      );
      cy.get(floorObj.sourceChoosingBtn).as("btn").click();
      cy.wait(1200);
      cy.get(floorObj.inputsSurface).should(($inputSurfaceContent) => {
        expect($inputSurfaceContent).to.contain("15 U");
        expect($inputSurfaceContent).to.contain("Variance 5 U - 40 U");
        expect($inputSurfaceContent).to.contain("100 U");
      });
      cy.get(
        "[data-testid='formula.inputs.0.sources.0.quantity_scalar-input']"
      ).should("have.value", "15");
      cy.step("User selects a different source item 'Anywhere'").wait(1000);
      cy.get("[data-testid='text-input-outlined']").eq(1).click().wait(1000);
      cy.get("[aria-modal='true']")
        .find("[dir='auto']")
        .contains("Anywhere")
        .click();
      cy.wait(1000);
      cy.get("[data-testid='common-source-source']").as("btn").click();
      cy.wait(1000);
      cy.get("[aria-modal='true']")
        .find("[data-testid='table-row-0-item']")
        .should("contain", "Receiving")
        .click();
      cy.step("Assert that an error message is displayed");
      cy.contains("Must be at most 25");
      cy.contains("Total must be less than or equal to 40 U");
      cy.step(
        "User adjusts the quantity of the selected source item and assert that the error messages are removed"
      );
      cy.get('[data-testid="formula.inputs.0.sources.1.quantity_scalar-input"]')
        .type("{selectall}25")
        .wait(800);
      cy.get(floorObj.inputsSurface)
        .should("not.contain", "Must be at most 25")
        .and("not.contain", "Total must be less than or equal to 40 U");
      cy.step(
        "Assert that there are multiple sources displayed in the inputs area"
      );
      cy.get(floorObj.inputsSurface)
        .should("contain", "Processing")
        .and("contain", "Receiving");
      cy.step("User clicks the **Create** button");
      cy.get(floorObj.saveMakeProductBtn).click();
      cy.wait(5000);
      cy.step("Assert that the output item is displayed in the floor page");
      cy.get("[data-testid='row-items']")
        .eq(0)
        .should("contain", forOutputItem.name);
      cy.step("That the Inputs Item from Processing source reduced by 15 U");
      cy.get("[data-testid='row-items']")
        .contains(inputsItemsIngredient.name)
        .parentsUntil("[data-testid='row-items']")
        .should("contain", "85");
      cy.step(
        "Assert That the Inputs Item from Receiving source reduced by 25 U"
      );
      cy.get(floorObj.selectStage).select("Receiving");
      cy.wait(5000);
      cy.get("[data-testid='row-items']")
        .contains(inputsItemsIngredient.name)
        .parentsUntil("[data-testid='row-items']")
        .should("contain", "40");
    });
    it("If recipe input and/or output is set as fixed, input quantity with or without variance should remain the same no matter if recipe repeat is scaled or lowered", () => {
      // seed new recipe

      /// Skip this becase I think there's a bug auto populating the threshold value in Make Product page
      recipePayload.name = recipe2;
      recipePayload.inputs.splice(1, 1); // remove the second input from array
      recipePayload.inputs[0].quantity = "2";
      recipePayload.inputs[0].correlationId = item1;
      recipePayload.outputs[0].correlationId = item2;
      recipePayload.inputs[0].variance = {
        enabled: true,
        under: 2,
        over: 5,
      };
      recipePayload.inputs[0].wasteRemainder = {
        enabled: true,
        threshold: 1,
      };
      recipePayload.inputs[0].ignoreScale = true;
      recipePayload.outputs[0].quantity = "2.5";
      recipePayload.outputs[0].ignoreScale = true;
      cy.seedRecipe(recipePayload);
      cy.get(sidemenu.floor).click();
      cy.get("[data-testid='row-items']").should("be.visible");
      cy.wait(2000);
      cy.step("Navigate to the make product page and select the new Recipe");
      cy.get(floorObj.makeProductBtn).click();
      cy.url().should("contain", "floor/make/recipe");
      cy.contains("Select Recipe");
      cy.wait(3000);
      cy.get("[data-testid='Production']").click();
      cy.wait(3000);
      cy.contains(recipe2).parent().parent().click();
      cy.wait(3000);
      cy.get(floorObj.sourceChoosingBtn).as("btn").click();
      cy.wait(1200);
      cy.step(
        "Assert first the Inputs Quantity Required is 2 U and the Output Quantity is 2.5 U"
      );
      cy.get(floorObj.inputsSurface).should("contain", "2 U");
      cy.get("[data-testid='surface']")
        .contains(forOutputItem.name)
        .parentsUntil("[data-testid='surface']")
        .should("contain", "2.5");
      cy.step(
        "User change the Repeat Recipe to 3 and Assert the Inputs Quantity Required is still 2 U and the Output Quantity is still 2.5 U"
      );
      cy.get("[data-testid='scale-input']").type("{selectall}3");
      cy.get(floorObj.inputsSurface).should("contain", "2 U");
      cy.get("[data-testid='surface']")
        .contains(forOutputItem.name)
        .parentsUntil("[data-testid='surface']")
        .should("contain", "2.5");
      cy.step(
        "User change the Repeat Recipe to 0.5 and Assert the Inputs Quantity Required is still 2 U and the Output Quantity is still 2.5 U"
      );
      cy.get("[data-testid='scale-input']").type("{selectall}0.5");
      cy.get(floorObj.inputsSurface).should("contain", "2 U");
      cy.get("[data-testid='surface']")
        .contains(forOutputItem.name)
        .parentsUntil("[data-testid='surface']")
        .should("contain", "2.5");
      cy.step("User clicks the **Create** button");
      cy.get(floorObj.saveMakeProductBtn).click();
      cy.wait(5000);
      cy.step("Assert that the output item is displayed in the floor page");
      cy.get("[data-testid='row-items']")
        .eq(0)
        .should("contain", forOutputItem.name)
        .and("contain", "2.5");
    });
    it("If recipe input has special requirements for custom attributes, this should be properly filtered during production", () => {
      cy.step("seed new catalog item that has custom attributes");
      // seed new catalog item that has custom attributes
      cy.seedProduct(ingredientWithAttributes).then(($catalogItem) => {
        item3 = $catalogItem.id;
        cy.step("seed new recipe");
        // seed new recipe
        recipePayloadWithAttributes.inputs[0].correlationId = $catalogItem.id;
        recipePayloadWithAttributes.outputs[0].correlationId = item2;
        cy.seedRecipe(recipePayloadWithAttributes);
      });
      cy.reload();
      cy.step("Perform Receiving for input item with Custom attr *Name*");
      cy.get(sidemenu.floor).click();
      cy.get("[data-testid='row-items']").should("be.visible");
      cy.wait(2000);
      cy.get(floorObj.receiveItemsBtn).click();
      cy.wait(1500);
      cy.get(floorObj.selectSupplier).find("input").last().as("btn").click();
      cy.wait(3000);
      cy.get("[data-testid^='table-row']").contains("ETE Supplier").click();
      cy.step("I select a Products Item, add Quantity and Unique ID");
      cy.get(floorObj.floorAddItemBtn).last().click();
      cy.wait(2000);
      cy.get(`[data-testid="Ingredient"]`).click({ force: true });
      cy.get("[data-testid^='table-row']")
        .contains(ingredientWithAttributes.name)
        .last()
        .click({ force: true });
      cy.get("[data-testid='btn-common-done']").click();
      cy.wait(1500);
      cy.get(floorObj.quantityInput).last().clear().type("100");
      cy.wait(500);
      cy.get(floorObj.uniqueCodeInput)
        .last()
        .clear()
        .type(`ete-product-name-attr`);
      cy.wait(2000);
      cy.step("I add a custom attribute *Name* to the item");
      cy.get("[data-testid='productRows.0.attributes.0.value-input']").type(
        "Name"
      );
      cy.step("I add same item but the custom attribute filled is *Boolean*");
      cy.get(floorObj.floorAddItemBtn).last().click();
      cy.wait(2000);
      cy.get(`[data-testid="Ingredient"]`).click({ force: true });
      cy.get("[data-testid^='table-row']")
        .contains(ingredientWithAttributes.name)
        .last()
        .click({ force: true });
      cy.get("[data-testid='btn-common-done']").click();
      cy.wait(1500);
      cy.get(floorObj.quantityInput).last().clear().type("100");
      cy.wait(500);
      cy.get(floorObj.uniqueCodeInput)
        .last()
        .clear()
        .type(`ete-product-boolean-attr`);
      cy.wait(2000);
      cy.step("I add a custom attribute *Boolean* to the item");
      cy.get("[data-testid='select-productRows.1.attributes.1.value']").select(
        "Yes"
      );
      cy.wait(700);
      cy.get(floorObj.saveReciveBtn).last().click();
      cy.get(global.banner, { timeout: 25000 }).contains(
        `${ingredientWithAttributes.name} received successfully!`,
        {
          timeout: 10000,
        }
      );
      cy.wait(2000);
      cy.step("Navigate to the make product page and select the new Recipe");
      cy.get(sidemenu.floor).click();
      cy.get(floorObj.makeProductBtn).click();
      cy.url().should("contain", "floor/make/recipe");
      cy.contains("Select Recipe");
      cy.wait(3000);
      cy.get("[data-testid='Production']").click();
      cy.wait(3000);
      cy.contains(recipePayloadWithAttributes.name).parent().parent().click();
      cy.wait(3000);
      cy.step(
        "User clicks the source item button and assert that the Modal should display only the item with the custom attribute *Name*"
      );
      cy.get("[data-testid='common-source-source']").as("btn").click();
      cy.wait(1200);
      cy.get("[aria-modal='true']")
        .find("[data-testid^='table-row']")
        .should("have.length", 1)
        .should("contain", "Item with Attributes")
        .and("contain", "ete-product-name-attr") // unique code
        .and("not.contain", "ete-product-boolean-attr");
      cy.step("User selects the item with the custom attribute *Name*");
      cy.get("[aria-modal='true']")
        .find("[data-testid^='table-row']")
        .contains("Item with Attributes")
        .click();
      cy.wait(1000);
      cy.step("Assert that the selected item is displayed in the inputs area");
      cy.get(floorObj.inputsSurface)
        .should("contain", ingredientWithAttributes.name)
        .and("contain", "ete-product-name-attr");
      cy.step("User clicks the **Create** button");
      cy.get(floorObj.saveMakeProductBtn).click();
      cy.wait(5000);
      cy.step("Assert that the output item is displayed in the floor page");
      cy.get("[data-testid='row-items']")
        .eq(0)
        .should("contain", forOutputItem.name)
        .and("contain", "1");
      cy.step(
        "User clicks the item Options Modal and verify that the Made From section contains the correct custom input item with the custom attribute *Name*"
      );
      cy.get("[data-testid='row-items']")
        .eq(0)
        .find(floorObj.iconsOption)
        .click();
      cy.wait(3000);
      cy.get("[data-testid='Made From']").click();
      cy.wait(3000);
      cy.get("[index='0']")
        .should("contain", ingredientWithAttributes.name)
        .and("contain", "ete-product-name-attr");
      cy.step("User Closed the Options Modal");
      cy.get("[aria-modal='true']").contains("Close").as("btn").click();
    });
    it.skip("User can select employee on make product which will be saved in history for produced item", () => {
      // Steps to navigate to Recipe and Edit recipe and Add optional Input
      // Make product
    });
    it("By including rework on make product, users can select a source from inventory to integrate it with a new batch.", () => {
      cy.step("Navigate to the make product page and select the new Recipe");
      cy.get(sidemenu.floor).click();
      cy.get(floorObj.makeProductBtn).click();
      cy.url().should("contain", "floor/make/recipe");
      cy.contains("Select Recipe");
      cy.wait(3000);
      cy.get("[data-testid='Production']").click();
      cy.wait(3000);
      cy.contains(recipePayload.name).parent().parent().click();
      cy.wait(3000);
      cy.step(
        "User clicks the source item button and assert that the available item is auto selected"
      );
      cy.get(floorObj.sourceChoosingBtn).as("btn").click();
      cy.wait(1200);
      cy.step("User checks the Rework checkbox");
      cy.get("[data-testid='checkbox-formula.hasRework']")
        .find("input")
        .click()
        .wait(600);
      cy.step(
        "Assert that the modal only displays the previous produced same items"
      );
      cy.get("[index='1']").contains("Rework");
      cy.get("[index='1']")
        .find("[data-testid='text-input-outlined']")
        .as("btn")
        .click({ force: true });
      cy.wait(1000);
      cy.get("[aria-modal='true']").contains("Use Item as Rework");
      cy.wait(1200);
      cy.get("[data-testid^='table-row']").should(
        "contain",
        forOutputItem.name
      );
      cy.step(
        "User clicks 1 item and assert that it is selected and displays correctly on rework surface"
      );
      cy.get("[data-testid='table-row-0-item']").click();
      cy.wait(2000);
      cy.get("[index='1']")
        .find("[data-testid='text-input-outlined']")
        .should(
          "have.value",
          `${forOutputItem.name} - ${formattedDate}production - 1 U`
        );
      cy.get("[data-testid='reworkItems.0.quantity_scalar-input']").should(
        "have.value",
        "1"
      );
      cy.step("User clicks the **Create** button");
      cy.get(floorObj.saveMakeProductBtn).click();
      cy.wait(5000);
      cy.step("Assert that the output item is displayed in the floor page");
      cy.get("[data-testid='row-items']")
        .eq(0)
        .should("contain", forOutputItem.name)
        .and("contain", "2.5");
      cy.step(
        "User clicks the item Options Modal and verify that the Made From section contains the correct Inputs item and the item from rework"
      );
      cy.get("[data-testid='row-items']")
        .eq(0)
        .find(floorObj.iconsOption)
        .click();
      cy.wait(3000);
      cy.get("[data-testid='Made From']").click();
      cy.wait(3000);
      cy.get("[aria-modal='true']")
        .find("[index='0']")
        .should("contain", inputsItemsIngredient.name);
      cy.get("[aria-modal='true']")
        .find("[index='1']")
        .last()
        .should("contain", forOutputItem.name)
        .and("contain", `${formattedDate}production`)
        .and("contain", "1");
      cy.get("[aria-modal='true']").find("[index='2']").should("not.exist");
      cy.step("User Closed the Options Modal");
      cy.get("[aria-modal='true']").contains("Close").as("btn").click();
    });
    it("When using recipe with optional outputs user can include/not include recipe output on make product ", () => {
      // edit recipe to include optional output
      // make product
    });
    it("User can swap a recipe input by choosing an alternate catalog item with a similar name and use it instead of the original catalog item.", () => {
      cy.step("Seed new catalog items with similar names");
      inputsItemsIngredient.name = "ETE Swap Ingredient 1";
      inputsItemsIngredient.unitOfMeasurement = "kilogram";
      ingredientChemical.name = "ETE Swap Chemical 2";
      ingredientChemical.unitOfMeasurement = "pound";
      recipePayload.name = "ETE Swap Recipe";
      recipePayload.inputs[0].quantity = "2 lbs";
      cy.seedProduct(inputsItemsIngredient).then(($catalogItem) => {
        item4 = $catalogItem.id;
        recipePayload.inputs[0].correlationId = $catalogItem.id;
        recipePayload.outputs[0].correlationId = item2;
        cy.seedRecipe(recipePayload);
        cy.seedProduct(ingredientChemical).then(($catalogItem2) => {
          item5 = $catalogItem2.id;
        });
      });
      cy.step("Perform Receiving for input items");
      cy.reload();
      cy.receiveMultipleItems({
        supplier: "ETE Supplier",
        items: [
          {
            item: inputsItemsIngredient.name,
            variant: "Ingredient",
            quantity: "20",
            uniqueId: "ete-swap-001",
          },
          {
            item: ingredientChemical.name,
            variant: "Chemical",
            quantity: "12",
            uniqueId: "ete-swap-002",
          },
        ],
      });
      cy.step("Navigate to the make product page and select the new Recipe");
      cy.get(sidemenu.floor).click();
      cy.get(floorObj.makeProductBtn).click();
      cy.url().should("contain", "floor/make/recipe");
      cy.contains("Select Recipe");
      cy.wait(3000);
      cy.get("[data-testid='Production']").click();
      cy.wait(3000);
      cy.contains(recipePayload.name).parent().parent().click();
      cy.wait(3000);
      cy.step(
        "User clicks the source item button and assert that the available item is auto selected"
      );
      cy.get(floorObj.sourceChoosingBtn).as("btn").click();
      cy.wait(1200);
      cy.step(
        "Assert the inputs area contains the correct item, quantity and uom"
      );
      cy.get(floorObj.inputsSurface)
        .should("contain", "20 kg")
        .and("contain", inputsItemsIngredient.name)
        .find("[dir='auto']")
        .contains("Kg"); // assert that the unit of measurement is displayed as kg
      cy.get(floorObj.inputsSurface)
        .find(
          "[data-testid='formula.inputs.0.sources.0.quantity_scalar-input']"
        )
        .should("have.value", "2");
      cy.step("User clicks the **Swap** button");
      cy.get(floorObj.inputsSurface)
        .find("[tabindex='0']")
        .contains("Swap")
        .click();
      cy.step(
        "Assert that the **Alternate Item** Modal only contains the similar (named and uom) items"
      );
      cy.contains("Choose Alternate Item");
      cy.wait(2000);
      cy.get("[aria-modal='true']")
        .find("[data-testid^='table-row']")
        .each(($el) => {
          // Assert that each element contains the specific text
          cy.wrap($el).should("contain", "Swap");
        });
      cy.step("User selects the alternate item");
      cy.get("[aria-modal='true']")
        .find("[data-testid^='table-row']")
        .contains(ingredientChemical.name)
        .click();
      cy.wait(1000);
      cy.get(floorObj.sourceChoosingBtn).as("btn").click().wait(600);
      cy.step(
        "Assert that the selected item is displayed in the inputs area and the uom is updated and the quantity is calculated based on the uom"
      );
      cy.get(floorObj.inputsSurface)
        .should("contain", "4.409245 lbs")
        .and("contain", ingredientChemical.name)
        .find("[dir='auto']")
        .contains("Lbs"); // assert that the unit of measurement is displayed as g
      cy.get(floorObj.inputsSurface)
        .find(
          "[data-testid='formula.inputs.0.sources.0.quantity_scalar-input']"
        )
        .should("have.value", "4.409245");
      cy.step("User clicks the **Create** button");
      cy.get(floorObj.saveMakeProductBtn).click();
      cy.wait(5000);
      cy.step("Assert that the output item is displayed in the floor page");
      cy.get("[data-testid='row-items']")
        .eq(0)
        .should("contain", forOutputItem.name)
        .and("contain", "2.5");
      cy.step(
        "User clicks the item Options Modal and verify that the Made From section contains the correct input item"
      );
      cy.get("[data-testid='row-items']")
        .eq(0)
        .find(floorObj.iconsOption)
        .click();
      cy.wait(3000);
      cy.get("[data-testid='Made From']").click();
      cy.wait(3000);
      cy.get("[index='0']")
        .should("contain", ingredientChemical.name)
        .and("contain", "4.409245")
        .and("contain", "lbs");
      cy.step("User Closed the Options Modal");
      cy.get("[aria-modal='true']").contains("Close").as("btn").click();
    });

    it("If waste is enabled for recipe output, user should be able to enter waste amount", () => {
      cy.step("User Navigate to Recipe page and enable waste for output item");
      cy.get(sidemenu.floor).click();
      cy.get(sidemenu.recipeMenu).click();
      cy.wait(2000);
      cy.get("[data-testid='Production']").click();
      cy.wait(2000);
      cy.contains(recipePayload.name).click();
      cy.wait(2000);
      cy.get("[data-testid='surface']")
        .contains("A portion can be wasted when produced.")
        .parent()
        .parent()
        .find("input")
        .click();
      cy.wait(1000);
      cy.step("User save the changes");
      cy.get("[data-testid='save-recipes']").click();
      cy.wait(1000);
      cy.get(global.banner).contains(
        `${recipePayload.name} recipe saved successfully`
      );
      cy.step("Navigate to the make product page and select the new Recipe");
      cy.get(sidemenu.floor).click();
      cy.get(floorObj.makeProductBtn).click();
      cy.url().should("contain", "floor/make/recipe");
      cy.contains("Select Recipe");
      cy.wait(3000);
      cy.get("[data-testid='Production']").click();
      cy.wait(3000);
      cy.contains(recipePayload.name).parent().parent().click();
      cy.wait(3000);
      cy.step(
        "User clicks the source item button and assert that the available item is auto selected"
      );
      cy.get(floorObj.sourceChoosingBtn).as("btn").click();
      cy.wait(1200);
      cy.step(
        "User should see the Output Item with the Waste field and enter a value"
      );
      cy.get(
        "[data-testid='formula.outputs.0.wastePortion.quantity_scalar-input']"
      ).type("1");
      cy.step("User clicks the **Create** button");
      cy.get(floorObj.saveMakeProductBtn).click();
      cy.wait(5000);
      cy.step(
        "Assert that the output item is displayed in the floor page and the waste amount is deducted from the output item"
      );
      cy.get("[data-testid='row-items']")
        .eq(0)
        .should("contain", forOutputItem.name)
        .and("contain", "1.5");
    });
    it("If automatic waste remainder is set on the recipe input, this should be wasted automatically during production", () => {
      cy.step(
        "User navigate to Recipe and enable tge Automatic waste remainder for Inputs item"
      );
      cy.get(sidemenu.floor).click();
      cy.get(sidemenu.recipeMenu).click();
      cy.wait(2000);
      cy.get("[data-testid='Production']").click();
      cy.wait(2000);
      cy.contains(recipePayload.name).click();
      cy.wait(2000);
      // cy.get("[data-testid='surface']")
      //   .contains(
      //     "Automatically waste remaining input quantities if less than set threshold."
      //   )
      //   .parent()
      //   .parent()
      //   .find("input")
      //   .click();
      cy.get("[data-testid='inputs.0.wasteRemainder.threshold-input']").type(
        "{selectall}20"
      );
      cy.wait(1000);
      cy.step("User save the changes");
      cy.get("[data-testid='save-recipes']").click();
      cy.wait(1000);
      cy.get(global.banner).contains(
        `${recipePayload.name} recipe saved successfully`
      );
      cy.step("Navigate to the make product page and select the new Recipe");
      cy.get(sidemenu.floor).click();
      cy.get(floorObj.makeProductBtn).click();
      cy.url().should("contain", "floor/make/recipe");
      cy.contains("Select Recipe");
      cy.wait(3000);
      cy.get("[data-testid='Production']").click();
      cy.wait(3000);
      cy.contains(recipePayload.name).parent().parent().click();
      cy.wait(3000);
      cy.step(
        "User clicks the source item button and assert that the available item is auto selected"
      );
      cy.get(floorObj.sourceChoosingBtn).as("btn").click();
      cy.wait(1200);
      cy.step(
        "User should see the Output Item with the Waste field for Inputs item and Assert that the Waste input displays the remaining amount"
      );
      cy.get(
        "[data-testid='formula.inputs.0.sources.0.waste_scalar-input']"
      ).should("have.value", "16");
      cy.step("User clicks the **Create** button");
      cy.get(floorObj.saveMakeProductBtn).click();
      cy.wait(5000);
      cy.step(
        "Assert that the output item is displayed in the floor page and the inputs item used is no longer listed on Floor"
      );
      cy.get("[data-testid='row-items']")
        .eq(0)
        .should("contain", forOutputItem.name)
        .and("contain", "2.5");
      cy.get("[data-testid='row-items']").should(
        "not.contain",
        inputsItemsIngredient.name
      );
    });
    it("When using recipe with optional outputs user can include/not include recipe output on make product", () => {
      cy.step("Seed new recipe");
      cy.seedProduct(productData).then(($catalog) => {
        recipePayload.name = recipe3;
        recipePayload.inputs.splice(1, 1); // remove the second input from array
        recipePayload.inputs[0].quantity = "2";
        recipePayload.inputs[0].correlationId = item1;
        recipePayload.outputs[0].correlationId = item2;
        recipePayload.inputs[0].variance = {
          enabled: false,
          under: 0,
          over: 0,
        };
        recipePayload.inputs[0].wasteRemainder = {
          enabled: false,
          threshold: 0,
        };
        recipePayload.inputs[0].ignoreScale = false;
        recipePayload.outputs[0].quantity = "3.5";
        recipePayload.outputs[0].ignoreScale = false;
        cy.seedRecipe(recipePayload);
      });
      cy.reload();
      cy.step("Navigate to recipe page and add another output item");
      cy.get(sidemenu.floor).click();
      cy.get(sidemenu.recipeMenu).click();
      cy.wait(2000);
      cy.get("[data-testid='Production']").click();
      cy.wait(2000);
      cy.contains(recipe3).click();
      cy.wait(2000);
      cy.get("[data-testid='common-add-item-outputs']").click();
      cy.wait(1500);
      cy.get("[data-testid='outputs-item-card']")
        .last()
        .find("[value='Add Another Output']")
        .click();
      cy.wait(100);
      cy.get("[aria-modal='true']")
        .find("[data-testid^='table-row']")
        .contains(productData.name)
        .click();
      cy.get("[data-testid='outputs-item-card']")
        .should("have.length", 2)
        .last()
        .find("[data-testid='outputs.1.quantity_scalar-input']")
        .type("{selectall}1.3");
      cy.step("User sets the second output to not required");
      cy.get("[data-testid='outputs-item-card']")
        .last()
        .parent()
        .parent()
        .find("[dir='auto']")
        .contains("Output quantity is required.")
        .parent()
        .parent()
        .find("[role='switch']")
        .click()
        .wait(800);
      cy.wait(1000);
      cy.step("User save the changes");
      cy.get("[data-testid='save-recipes']").click();
      cy.wait(1000);
      cy.get(global.banner).contains(`${recipe3} recipe saved successfully`);
      cy.step(
        "User navigates to Make Product and produce only the required Output"
      );
      cy.get(sidemenu.floor).click();
      cy.get(floorObj.makeProductBtn).click();
      cy.url().should("contain", "floor/make/recipe");
      cy.contains("Select Recipe");
      cy.wait(3000);
      cy.get("[data-testid='Production']").click();
      cy.wait(3000);
      cy.contains(recipe3).parent().parent().click();
      cy.wait(3000);
      cy.step(
        "User clicks the source item button and assert that the available item is auto selected"
      );
      cy.get(floorObj.sourceChoosingBtn).as("btn").click();
      cy.wait(1200);
      cy.step(
        "User should see 2 Outputs Items, the 2nd item is optional and the toggle switch is off as default"
      );
      cy.get("[index='5']").contains(forOutputItem.name);
      cy.get("[index='6']").contains(productData.name);
      cy.step("User clicks the **Create** button");
      cy.get(floorObj.saveMakeProductBtn).click();
      cy.wait(5000);
      cy.step("Assert that only the 1st Outputs Item was produced");
      cy.get("[data-testid='row-items']")
        .eq(0)
        .should("contain", forOutputItem.name)
        .and("contain", "3.5");
      cy.get("[data-testid='row-items']").should(
        "not.contain",
        productData.name
      );
      cy.step(
        "Navigate to Make Product again, select the same recipe and include the optional outputs"
      );
      cy.get(floorObj.makeProductBtn).click();
      cy.url().should("contain", "floor/make/recipe");
      cy.contains("Select Recipe");
      cy.wait(3000);
      cy.get("[data-testid='Production']").click();
      cy.wait(3000);
      cy.contains(recipe3).parent().parent().click();
      cy.wait(3000);
      cy.get(floorObj.sourceChoosingBtn).as("btn").click().wait(1000);
      cy.get("[index='6']")
        .contains(productData.name)
        .parent()
        .parent()
        .find("[role='switch']")
        .click();
      cy.wait(800);
      cy.step("User clicks the **Create** button");
      cy.get(floorObj.saveMakeProductBtn).click();
      cy.wait(5000);
      cy.step("Assert that only the 1st Outputs Item was produced");
      cy.get("[data-testid='row-items']")
        .eq(0)
        .should("contain", forOutputItem.name)
        .and("contain", "3.5");
      cy.get("[data-testid='row-items']")
        .eq(1)
        .should("contain", productData.name)
        .and("contain", "1.3");
    });
  }
);
