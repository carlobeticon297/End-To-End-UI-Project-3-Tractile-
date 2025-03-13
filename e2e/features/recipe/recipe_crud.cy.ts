/* eslint-disable @typescript-eslint/no-unused-vars */
import { productData } from "../../../support/samplePayload";
import global from "../../pageObjects/global.json";
import recipeObj from "../../pageObjects/recipe.json";
import sideMenu from "../../pageObjects/sideMenu.json";
Cypress.on("uncaught:exception", (err, runnable) => {
  return false;
});

describe(
  "Recipe CRUD functionality",
  { testIsolation: false, scrollBehavior: "center" },
  () => {
    before(() => {
      cy.clearAllCookies();
      cy.clearAllLocalStorage();
      cy.clearAllSessionStorage();
      cy.task("createTenant");
      cy.seedProduct(productData);
      cy.seedSupplier("");
      cy.loginAs("dynamicUser");
      cy.get(sideMenu.recipeMenu).click({ force: true });
      cy.url().should("contain", "/admin/recipes");
      cy.get("[data-testid='filter-tabs']")
        .should("contain", "Preparation")
        .and("contain", "Production")
        .and("contain", "Packaging");
      cy.wait(2000);
    });
    after(() => {
      cy.task("destroyTestTenant");
      cy.wait(800);
    });
    it("Admin is able to make Recipe", () => {
      cy.step("I click the Add button on the Recipe page");
      cy.get(recipeObj.createNewRecipeBtn).click();
      cy.url().should("contain", "/recipes/new");
      cy.wait(2000);
      cy.step("I click the Recipe Save button");
      cy.get(recipeObj.saveRecipesBtn).click().wait(1000);
      cy.step(
        "I should see the Name, Inputs, and Outputs field required warning"
      );
      cy.get(recipeObj.saveRecipesBtn).should(
        "have.attr",
        "aria-disabled",
        "true"
      );
      cy.get(recipeObj.recipeNameInput)
        .parent()
        .parent()
        .parent()
        .parent()
        .should("contain", "This field is required");
      cy.get(recipeObj.recipeInputsItemCard).should(
        "contain",
        "This field is required"
      );
      cy.get(recipeObj.recipeOutputsItemCard).should(
        "contain",
        "This field is required"
      );
      cy.step("I enter Recipe Name, Recipe type, and Description");
      cy.get(recipeObj.recipeNameInput).type("Testauto Recipe Pack");
      cy.get(recipeObj.recipeTypeSelect).select("Packaging");
      cy.get(recipeObj.recipeDescInput).type("This is for ETE purposes only");
      cy.step("I select an Inputs item");
      cy.get(recipeObj.recipeInputsItemCard).find("input").as("btn").click();
      cy.wait(3000);
      cy.contains("Choose Input");
      cy.get(`[data-testid="Product"]`).parent().click({ force: true });
      cy.wait(2000);
      cy.get("[data-testid^='table-row']")
        .last()
        .contains("ETE Testing Bar 3.0")
        .click({ force: true });
      cy.wait(2500);
      cy.get(`[data-testid='inputs.0.quantity_scalar-input']`)
        .clear()
        .type("2", { force: true });
      cy.step("I select an Outputs item");
      cy.get(recipeObj.recipeOutputsItemCard).find("input").as("btn").click();
      cy.wait(3000);
      cy.contains("Choose Output");
      cy.get(`[data-testid="Product"]`).parent().click({ force: true });
      cy.wait(2000);
      cy.get("[data-testid^='table-row']")
        .last()
        .contains("ETE Testing Bar 3.0")
        .click({ force: true })
        .wait(1500);
      cy.get(`[data-testid='outputs.0.quantity_scalar-input']`)
        .clear()
        .type("3");
      cy.wait(1200);
      cy.step("I can save the New Recipe");
      cy.get(recipeObj.saveRecipesBtn).click().wait(1000);
      cy.step("I should see the New Recipe is successfully saved");
      cy.get(global.banner, { timeout: 10000 }).contains(
        `Testauto Recipe Pack recipe saved successfully`,
        {
          timeout: 10000,
        }
      );
      cy.wait(2000);
      cy.get(`[data-testid="Packaging"]`).last().click({ force: true });
      cy.wait(5000);
      cy.get(recipeObj.recipeCards, { timeout: 10000 }).then(($recipeItems) => {
        expect($recipeItems).to.contain("Testauto Recipe Pack");
        expect($recipeItems).to.contain(`1 Inputs`);
        expect($recipeItems).to.contain(`1 Outputs`);
      });
    });
    it("Admin is able to Edit a  Item", () => {
      cy.reload();
      cy.wait(3000);
      cy.step("navigate to packaging filter tab");
      cy.get("[data-testid='filter-tabs']")
        .find(`[data-testid="Packaging"]`)
        .last()
        .click({ force: true });
      cy.wait(1200);
      cy.step("I select **Testauto Recipe Pack** Recipe Item");
      cy.get(recipeObj.recipeCards).contains("Testauto Recipe Pack").click();
      cy.wait(5000);
      cy.step("I enter Recipe Name, Recipe type, and Description");
      cy.get(recipeObj.recipeNameInput)
        .clear()
        .type("Testauto Recipe Pack - Edited");
      cy.get(recipeObj.recipeTypeSelect).select("Production");
      cy.get(recipeObj.recipeDescInput)
        .clear()
        .type("ETE edit recipe item description");
      cy.step("I add Inputs Instruction **ETE recipe instruction only**");
      cy.get(recipeObj.addInstruction).click();
      cy.get(recipeObj.instructionContainer)
        .last()
        .find("input")
        .type("ETE recipe instruction only", { force: true });
      cy.step("I save the recipe");
      cy.get(recipeObj.saveRecipesBtn).click().wait(1000);
      cy.step(
        "I should see the New Recipe is successfully saved an belongs to the correct type"
      );
      cy.get(global.banner, { timeout: 10000 }).contains(
        `Testauto Recipe Pack - Edited recipe saved successfully`,
        {
          timeout: 10000,
        }
      );
      cy.wait(2000);
      cy.get(`[data-testid="Production"]`).last().click({ force: true });
      cy.wait(5000);
      cy.get(recipeObj.recipeCards, { timeout: 10000 }).then(($recipeItems) => {
        expect($recipeItems).to.contain("Testauto Recipe Pack - Edited");
        expect($recipeItems).to.contain(`1 Inputs`);
        expect($recipeItems).to.contain(`1 Outputs`);
      });
    });
    it("Admin is able to delete a Recipe Item", () => {
      cy.reload();
      cy.wait(3000);
      cy.step("navigate to **Production** Recipe filter tab");
      cy.get("[data-testid='filter-tabs']")
        .find(`[data-testid="Production"]`)
        .last()
        .click({ force: true });
      cy.wait(1200);
      cy.step("I select **Testauto Recipe Pack** Recipe Item");
      cy.get(recipeObj.recipeCards).contains("Testauto Recipe Pack").click();
      cy.wait(2000);
      cy.step("I click the Delete Recipe button");
      cy.get(recipeObj.deleteRecipeBtn).click();
      cy.wait(2000);
      cy.step("I click the **Delete Item** button from the confimation modal");
      cy.wait(1500);
      cy.get(global.modalSurface).should("contain", "Confirm Delete");
      cy.get(global.modalSurface).contains("Delete Item").click();
      cy.step(
        "I should not see the **Testauto Recipe Pack** Recipe from the **Production** tab"
      );
      cy.get("[data-testid='filter-tabs']")
        .find(`[data-testid="Production"]`)
        .last()
        .click({ force: true });
      cy.wait(3000);
      cy.get("body").should("not.contain", "Testauto Recipe Pack");
    });
  }
);
