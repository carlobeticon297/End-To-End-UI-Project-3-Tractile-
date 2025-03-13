Cypress.on("uncaught:exception", (err, runnable) => {
  return false;
});

import sidemenu from "../../pageObjects/sideMenu.json";
import { inputsItemsIngredient } from "../../../support/samplePayload";
import { decodeReference } from "@tracktile/flow";

describe(
  "Floor Options Modal",
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
      cy.addFlowStageRule();
      cy.get(sidemenu.floor).click();
      cy.url().should("contain", "/floor");
    });

    it("The User should be able to see and scan the QR code for Received Item from floor options inspector modal", () => {
      const inputItem1 = inputsItemsIngredient;
      cy.seedProduct(inputItem1);
      cy.receiveItems({
        supplier: "ETE Supplier",
        product: inputsItemsIngredient.name,
        quantity: "2.5",
        printLabel: false,
      });
      cy.get(sidemenu.floor).click();
      cy.wait(5000);
      cy.get("[data-testid='row-items']")
        .first()
        .find("[data-testid='icons-info']")
        .click(); // Click to open the QR code or the section containing it

      cy.wait(500); // Ensure the QR code is fully loaded

      cy.get("[alt='Barcode']")
        .first() // Get the image element containing the QR code
        .should("be.visible")
        .then(($img) => {
          const imgUrl: any = $img.attr("src"); // Get the source of the image
          const imgElement = $img.get(0) as HTMLImageElement; //

          // Check that the image has non-zero dimensions
          expect(imgElement.naturalWidth).to.be.greaterThan(0);
          expect(imgElement.naturalHeight).to.be.greaterThan(0);

          // Check if the image is in base64 format
          const base64Data = imgUrl.split(",")[1]; // Extract the base64 string
          console.log("Base64 String: ", base64Data); // Log the base64 string for debugging
          cy.decodeBase64SvgImage(base64Data).then((decodedQR: string) => {
            // Assert that the decoded QR code matches the expected pattern
            expect(decodedQR.trim()).to.match(/^tt:\/\/e:[a-zA-Z0-9+\-_/]+$/);
            const decodedUrl = decodeReference(decodedQR);
            expect(decodedUrl).to.have.property("id");
            expect(decodedUrl).to.have.property("type");
            expect(decodedUrl.id).to.be.a("string");
            expect(decodedUrl.type).to.equal("entity");
          }); // Call the function to decode the base64 image
        });
    });
  }
);
