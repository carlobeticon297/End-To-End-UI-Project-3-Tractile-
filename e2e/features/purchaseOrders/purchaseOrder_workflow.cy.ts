/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
Cypress.on("uncaught:exception", (err, runnable) => {
  return false;
});
import {
  ingredientChemical,
  ingredientPackaging,
  inputsItemsIngredient,
} from "../../../support/samplePayload";
import floorObj from "../../pageObjects/floor.json";
import global from "../../pageObjects/global.json";
import purchaseOrder from "../../pageObjects/purchaseOrder.json";
import receive from "../../pageObjects/receive.json";
import sidemenu from "../../pageObjects/sideMenu.json";
const today = new Date();
const subjectDynamic = [...Array(10)]
  .map(() => ((Math.random() * 10) | 0).toString())
  .join("");
const month = today.getMonth() + 1; // Months are zero-based
const day = today.getDate();
const year = today.getFullYear();
function isLastDayOfMonth() {
  // Create a date object for the first day of the next month
  const nextMonth: any = new Date(year, month, 1);
  // Get the last day of the current month by subtracting one day from the first day of next month
  const lastDayOfCurrentMonth = new Date(nextMonth - 1);
  // Check if today is the last day of the month
  return today.getDate() === lastDayOfCurrentMonth.getDate();
}
const lastDayOfMonth = isLastDayOfMonth();
// Increment the day only if it's not the end of the month
const newDay = lastDayOfMonth ? day : day + 1;
const formattedMonth = month.toString().padStart(2, "0");
const formattedDay = day.toString().padStart(2, "0");
const formattedNextDay = newDay.toString().padStart(2, "0");
const formattedDate = `${formattedMonth}/${formattedDay}/${year}`;
const formattedNextDate = `${formattedMonth}/${formattedNextDay}/${year}`;
const poID = `ETE-${subjectDynamic}`;
const editedPoID = "ETE-001-EDITED";
console.log("lastDayOfMonth", lastDayOfMonth);
describe(
  "Purchase Orders Crud Functionalities",
  { testIsolation: false, scrollBehavior: "center" },
  () => {
    before(() => {
      cy.clearAllCookies();
      cy.clearAllLocalStorage();
      cy.clearAllSessionStorage();
      cy.task("createTenant");
      inputsItemsIngredient.name = "ETE Item 1";
      inputsItemsIngredient.price = 4;
      inputsItemsIngredient.unitOfMeasurement = "kilogram";
      inputsItemsIngredient.weightPerUnit = "";
      cy.seedProduct(inputsItemsIngredient);
      cy.seedProduct(ingredientChemical);
      cy.seedProduct(ingredientPackaging);
      cy.seedSupplier("");
      cy.seedCustomerProfile("");
      cy.loginAs("dynamicUser");
      cy.wait(5000);
      cy.addFlowStageRule();
      cy.step("Navigate to Purchase order page");
      cy.get(sidemenu.purchaseOrder).click();
      cy.url().should("contain", "/purchase-orders");
      cy.get("[data-testid='itemName-purchase-orders']").contains(
        "Purchase Orders"
      );
    });
    after(() => {
      cy.task("destroyTestTenant");
      cy.wait(800);
    });
    it("Admin is able to Add Purchase Order with Ordered items and the items should display on Details Summary Card", () => {
      cy.wait(5000);
      cy.step("I click the **Add** Button");
      cy.get(purchaseOrder.addPoBtn).click();
      cy.url().should("contain", "/purchase-orders/new");
      cy.wait(5000);
      cy.step("I enter Purchase Order ID");
      cy.get(purchaseOrder.poIdInput).clear().type(poID);
      cy.step("I select a supplier");
      cy.get(purchaseOrder.selectSupplier).click();
      cy.wait(3000);
      cy.contains("Choose Supplier").should("exist");
      cy.get("[aria-modal='true']").find("input").first().type("ETE Supplier");
      cy.wait(1500);
      cy.get("[data-testid='table-row-0-item']")
        .should("contain", "ETE Supplier")
        .click()
        .wait(1000);
      cy.step("I select Status **In Progress**");
      cy.get(purchaseOrder.selectStatus).select("In Progress");

      cy.step("I select Date Created **Today**");
      cy.get("[data-testid='CalendarIcon']").first().click().wait(1000);
      cy.get("button").contains(day).click().wait(800);
      cy.get("[placeholder='MM/DD/YYYY']")
        .first()
        .should("have.value", formattedDate);
      cy.wait(1000);
      cy.step("I select Due Date **Tomorrow**");
      cy.get("[data-testid='CalendarIcon']").last().click();
      cy.wait(1800);
      // the due date is always 1 day ahead if not end of the month else due date is the current date
      cy.get("button").contains(newDay).click();
      cy.wait(1000);
      cy.get("[placeholder='MM/DD/YYYY']")
        .last()
        .should("have.value", formattedNextDate);

      cy.step("Select Customer profile");
      cy.get(purchaseOrder.selectComProfID).select("ETE Company", {
        force: true,
      });
      cy.wait(2000);
      cy.step("Select Ordered Filter tab");
      cy.get("[data-testid='Ordered']").click();
      // add first item
      cy.step("I add ingredient, chemical and packaging Item");
      cy.get(purchaseOrder.purchaseOrderAddItemBtn).click();
      // add all items
      cy.wait(3000);
      cy.get("[aria-modal='true']").find("input").first().type("ETE");
      cy.wait(2500);
      cy.get("[data-testid^='table-row']")
        .contains(inputsItemsIngredient.name)
        .click();
      cy.wait(1200);
      cy.get("[data-testid='Packaging']").last().click();
      cy.wait(1200);
      cy.get("[data-testid^='table-row']")
        .contains(ingredientPackaging.name)
        .click();
      cy.wait(1200);
      cy.get("[data-testid='Chemical']").last().click();
      cy.wait(1200);
      cy.get("[data-testid^='table-row']")
        .contains(ingredientChemical.name)
        .click();
      cy.wait(1000);
      cy.step(
        "Prices should default to the catalog’s default or supplier-specific pricing"
      );
      cy.get("[data-testid='btn-common-done']").click();
      cy.wait(3000);
      // for first item
      cy.get("[data-testid='table-row-0-item']")
        .find("input")
        .first()
        .should("have.value", inputsItemsIngredient.name);
      cy.step("I enter the quantity");
      cy.get("[data-testid='items.0.quantity_scalar-input']").type(
        "{selectall}2.5"
      );
      cy.get("[data-testid='items.0.price-input']").should(
        "have.value",
        inputsItemsIngredient.price // price is the item default price
      );
      cy.get('[data-testid="table-row-0-item"]').contains("CA$10.00"); // estimated price
      // for second item
      cy.get("[data-testid='table-row-1-item']")
        .find("input")
        .first()
        .should("have.value", ingredientPackaging.name);
      cy.step("I enter the quantity");
      cy.get("[data-testid='items.1.quantity_scalar-input']").type(
        "{selectall}3"
      );
      cy.step("I enter the price per unit");
      cy.get("[data-testid='items.1.price-input']").should(
        "have.value",
        ingredientPackaging.price // price is the item default price
      );
      cy.get('[data-testid="table-row-1-item"]').contains("CA$8.97"); // estimated price
      // for third item
      cy.get("[data-testid='table-row-2-item']")
        .find("input")
        .first()
        .should("have.value", ingredientChemical.name);
      cy.step("I enter the quantity");
      cy.get("[data-testid='items.2.quantity_scalar-input']").type(
        "{selectall}3"
      );
      cy.step("I enter the price per unit");
      cy.get("[data-testid='items.2.price-input']").should(
        "have.value",
        ingredientChemical.price // price is the item default price
      );
      cy.get('[data-testid="table-row-2-item"]').contains("CA$7.50"); // estimated price
      cy.wait(2000);
      cy.step("Assert the total price");
      cy.get(purchaseOrder.purchaseOrderTotalCost).should(
        "contain",
        "CA$26.47"
      );

      cy.step(
        "I change the price of the third item and it's estimated price should change. I see the new total price as well"
      );
      cy.get("[data-testid='items.2.price-input']").type("{selectall}3.40");
      cy.wait(1000);
      cy.get('[data-testid="table-row-2-item"]').contains("CA$10.20"); // third item estimated price
      cy.get(purchaseOrder.purchaseOrderTotalCost).should(
        "contain",
        "CA$29.17"
      );
      cy.wait(2000);
      cy.step("I save the Purchase Order");
      cy.get(purchaseOrder.savePurchaseOrder).click();
      cy.wait(1000);
      cy.get(global.banner).contains(`Saved Purchase Order: ${poID}`);
      cy.wait(2000);
      cy.step("Assert the Summary Card Details should have no progress yet");
      // assert the total progress 0%
      cy.get(purchaseOrder.summaryTotalProgress)
        .should("contain", "0.0%")
        .find(
          '[style*="background-image: linear-gradient(88.3634deg, rgb(0, 92, 151), rgb(168, 200, 228))"]'
        )
        .should("not.exist");
      // assert 1st items is displayed correctly ano no progress
      cy.get(purchaseOrder.summaryOrderedItems)
        .first()
        .should("contain", inputsItemsIngredient.name)
        .should("contain", "0/2.5 kg")
        .find(
          '[style*="background-image: linear-gradient(88.3634deg, rgb(0, 92, 151), rgb(168, 200, 228))"]'
        )
        .should("not.exist");
      // assert 2nd items is displayed correctly ano no progress
      cy.get(purchaseOrder.summaryOrderedItems)
        .contains(ingredientPackaging.name)
        .parentsUntil(purchaseOrder.summaryOrderedItems)
        .should("contain", "0/3 U")
        .find(
          '[style*="background-image: linear-gradient(88.3634deg, rgb(0, 92, 151), rgb(168, 200, 228))"]'
        )
        .should("not.exist");
      // assert second third are displayed correctly ano no progress
      cy.get(purchaseOrder.summaryOrderedItems)
        .last()
        .should("contain", ingredientChemical.name)
        .should("contain", "0/3 U")
        .find(
          '[style*="background-image: linear-gradient(88.3634deg, rgb(0, 92, 151), rgb(168, 200, 228))"]'
        )
        .should("not.exist");
      cy.wait(2000);
      cy.step(
        "User clicks the Back button and verifies the details are correct"
      );
      cy.get(purchaseOrder.poBackBtn).click();
      cy.wait(2500);
      cy.get("[data-testid='table-row-0-purchase-orders']").should(
        ($newPoDetails) => {
          expect($newPoDetails).to.contain(poID); //
          expect($newPoDetails).to.contain("CA$29.17"); //
          expect($newPoDetails).to.contain("0.0%");
          if (!lastDayOfMonth) {
            // expect($newPoDetails).to.contain("n a day");
          } else {
            expect($newPoDetails).to.contain("Today");
          }
          expect($newPoDetails).to.contain("0.0%");
          expect($newPoDetails).to.contain("a few seconds ago");
        }
      );
      cy.wait(3000);
    });

    it("User is able to Email PO Document", () => {
      const emailAddressTo = "shanetracktile@gmail.com";
      cy.step("Navigate to PO Page and open the PO");
      cy.wait(3000);
      cy.get(sidemenu.purchaseOrder).click();
      cy.wait(2000);
      cy.get("[data-testid='table-row-0-purchase-orders']").click();
      cy.contains("Summary");
      cy.step("Navigate to Ordered tab and send PO Document Email");
      cy.get("[data-testid='Ordered']").click();
      cy.wait(2500);
      cy.contains("Email PO Document").as("btn").click();
      cy.wait(1000);
      cy.get("[aria-modal='true']")
        .should("contain", "Send Purchase Order Document")
        .find(purchaseOrder.emailAddressInput)
        .type(emailAddressTo);
      cy.get(purchaseOrder.emailSubjectInput)
        .should("have.value", "Document Attachment")
        .type(`{selectall}${subjectDynamic}`);
      cy.get(purchaseOrder.emailMessageInput).should(
        "contain",
        "Attached is the document generated."
      );
      cy.wait(1500);
      cy.get("[role='dialog']")
        .find("[tabindex='0']")
        .contains("Send")
        .last()
        .as("btn")
        .click();
      cy.wait(10000);
      cy.get("[aria-modal='true']").should("not.exist");
      cy.wait(5000);
      cy.step("Assert the Email is received and contain the PO Attachment");
      cy.verifyTheEmailIsSent(subjectDynamic).then((emailReceived) => {
        expect(emailReceived.filename).to.be.equal(`Purchase_Order_${poID}`);
      });
      cy.wait(3000);
    });
    it("User should be able to receive items against PO partially - Assert the Summary Details are correct and PO status remains active", () => {
      cy.wait(1200);
      cy.reload();
      cy.step("User navigates to **Receive Items** page");
      cy.get(sidemenu.floor).click();
      cy.wait(4000);
      cy.get(floorObj.receiveItemsBtn).click();
      cy.wait(4000);
      cy.step("User clicks the **Purchase Order**");
      cy.get("[data-testid='purchase-order-card']")
        // .should("contain", "Overall Received Progress (0.0 %)")
        .and("contain", "$29.17 total cost")
        .contains(poID)
        .parentsUntil("[data-testid='purchase-order-card']")
        .click();
      cy.wait(6000);
      cy.step(
        "Assert that the Items from the Purchase order are listed under Products Column"
      );
      cy.get(receive.receiveProductCard).should("have.length", 3);
      cy.wait(1000);
      cy.get(receive.receiveProductCard).last().scrollIntoView();
      // assert the first item
      cy.get(receive.receiveProductCard)
        .first()
        .find(receive.poItemProgress)
        .should("contain", "0%")
        .and("contain", "0 kg / 2.5 kg");
      cy.get(receive.receiveProductCard)
        .first()
        .find(receive.selectItemInput)
        .should("have.value", inputsItemsIngredient.name);
      cy.get(receive.receiveProductCard)
        .first()
        .find("[data-testid='productRows.0.quantity_scalar-input']")
        .should("have.value", "2.5");
      // type unique id
      cy.get(receive.receiveProductCard)
        .first()
        .find("[data-testid='productRows.0.code-input']")
        .type("ete-unique-id");
      cy.step("Assert the second item progress and reduce the quantity");
      cy.get(receive.receiveProductCard)
        .eq(1)
        .find(receive.poItemProgress)
        .should("contain", "0%")
        .and("contain", "0 U / 3 U");
      cy.get(receive.receiveProductCard)
        .eq(1)
        .find(receive.selectItemInput)
        .should("have.value", ingredientPackaging.name);
      cy.get(receive.receiveProductCard)
        .eq(1)
        .find("[data-testid='productRows.1.quantity_scalar-input']")
        .should("have.value", "3")
        .type("{selectall}2");
      // type unique id
      cy.get(receive.receiveProductCard)
        .eq(1)
        .find("[data-testid='productRows.1.code-input']")
        .type("ete-unique-id");

      cy.step("Assert the third item progress and reduce the quantity");
      cy.get(receive.receiveProductCard)
        .last()
        .find(receive.poItemProgress)
        .should("contain", "0%")
        .and("contain", "0 U / 3 U");
      cy.get(receive.receiveProductCard)
        .last()
        .find(receive.selectItemInput)
        .should("have.value", ingredientChemical.name);
      cy.get(receive.receiveProductCard)
        .find("[data-testid='productRows.2.quantity_scalar-input']")
        .should("have.value", "3")
        .type("{selectall}2");
      // type unique id
      cy.get(receive.receiveProductCard)
        .find("[data-testid='productRows.2.code-input']")
        .type("ete-unique-id");
      cy.step("User select a Supplier");
      cy.get(floorObj.selectSupplier).find("input").last().as("btn").click();
      cy.wait(3000);
      cy.get("[data-testid^='table-row']").contains("ETE Supplier").click();
      cy.wait(3000);
      cy.step("User click the **Receive** button");
      // cy.get("[role='switch']").last().click();
      // cy.wait(1000);
      cy.get(floorObj.saveReciveBtn).last().click();
      cy.wait(1200);
      cy.get(global.banner, { timeout: 25000 }).should("be.visible");
      cy.wait(4000);
      cy.step(
        "Assert the items are received and displayed on floor showing the correct quantity"
      );
      cy.get(sidemenu.floor).click();
      cy.wait(3000);
      cy.get("[data-testid='row-items']")
        .contains(inputsItemsIngredient.name)
        .parentsUntil("[data-testid='row-items']")
        .should("contain", "2.5")
        .and("contain", "Kg");
      cy.get("[data-testid='row-items']")
        .contains(ingredientPackaging.name)
        .parentsUntil("[data-testid='row-items']")
        .should("contain", "2")
        .and("contain", "U");
      cy.get("[data-testid='row-items']")
        .contains(ingredientChemical.name)
        .parentsUntil("[data-testid='row-items']")
        .should("contain", "2")
        .and("contain", "U");
      cy.step(
        "User navigates to Purchase Order and Assert that the PO is still active and verify the progress total and bar"
      );
      cy.reload();
      cy.get(sidemenu.purchaseOrder).click();
      cy.wait(3000);
      // assert that PO is not displayed in Active column
      // cy.get("[data-testid='table-row-0-purchase-orders']").should("not.exist");
      // // navigate to completed tab
      // cy.get("[data-testid='Completed']").click();
      // cy.wait(2000);
      // click the PO right away since the default tab is Active
      cy.get("[data-testid='table-row-0-purchase-orders']")
        .should(($poCompletedDetails) => {
          expect($poCompletedDetails).to.contain(poID);
          expect($poCompletedDetails).to.contain("CA$29.17");
          expect($poCompletedDetails).to.contain("77.8%");
        })
        .find("[data-testid='po-overall-progress']")
        .should("contain", "77.8%")
        .find(
          "[style*='background-image: linear-gradient(85.1148deg, rgb(0, 92, 151), rgb(168, 200, 228));']" // blue progress bar
        )
        .should("be.visible")
        .parentsUntil("[data-testid='po-overall-progress']")
        .find("[style*='width: 116.7px']"); // get the width of the progress bar
      cy.get("[data-testid='table-row-0-purchase-orders']").click();
      cy.wait(4000);
      cy.step(
        "Assert the Overall Summary progress is not 100% and verify each 100 progress"
      );
      // overall progress
      cy.get(purchaseOrder.summaryTotalProgress)
        .should("contain", "77.8%")
        .find(
          "[style*='background-image: linear-gradient(87.4739deg, rgb(0, 92, 151), rgb(168, 200, 228));']" // blue progress bar
        )
        .should("be.visible");
      // First Item progress
      cy.get(purchaseOrder.summaryOrderedItems)
        .first()
        .should("contain", inputsItemsIngredient.name)
        .should("contain", "2.5/2.5 kg")
        .find(
          "[style*='background-image: linear-gradient(88.3634deg, rgb(0, 92, 151), rgb(168, 200, 228))']"
        )
        .should("be.visible");
      // Second Item progress
      cy.get(purchaseOrder.summaryOrderedItems)
        .eq(1)
        .should("contain", ingredientPackaging.name)
        .should("contain", "2/3 U")
        .find(
          "[style*='background-image: linear-gradient(87.5425deg, rgb(0, 92, 151), rgb(168, 200, 228));']"
        )
        .should("be.visible");
      // Third Item progress
      cy.get(purchaseOrder.summaryOrderedItems)
        .last()
        .should("contain", ingredientChemical.name)
        .should("contain", "2/3 U")
        .find(
          "[style*='background-image: linear-gradient(87.5425deg, rgb(0, 92, 151), rgb(168, 200, 228));']"
        )
        .should("be.visible");
      cy.wait(2000);
    });

    it("User receive the remaining Items from PO, the PO progress should be shown 100% and automatically moved to **Completed**", () => {
      cy.wait(3500);
      cy.reload();
      // seed new product
      cy.get(sidemenu.floor).click();
      cy.wait(3000);
      cy.get(floorObj.receiveItemsBtn).click();
      cy.wait(4000);
      cy.step("User clicks the **Purchase Order**");
      cy.get("[data-testid='purchase-order-card']")
        .should("contain", "Overall Received Progress (77.8 %)")
        .and("contain", "$29.17 total cost")
        .contains(poID);
      cy.get("[data-testid='purchase-order-card']").last().as("btn").click();
      cy.wait(3000);
      cy.step(
        "Assert that only the remaining Items from the Purchase order are listed under Products Column showing the crrect Quantity and progress"
      );
      cy.get(receive.receiveProductCard).last().scrollIntoView();
      cy.get(receive.receiveProductCard).should("have.length", 2);
      cy.step(
        "Assert the first item progress and the remaining quatity is default qty value"
      );
      cy.get(receive.receiveProductCard)
        .first()
        .find(receive.poItemProgress)
        .should("contain", "67%")
        .should("contain", "2 U / 3 U")
        .find(
          "[style*='background-color: rgb(227, 228, 229); height: 10px; display: flex; flex-direction: row;']"
        );

      cy.get(receive.receiveProductCard)
        .first()
        .find(receive.selectItemInput)
        .should("have.value", ingredientPackaging.name);
      cy.get(receive.receiveProductCard)
        .first()
        .find("[data-testid='productRows.0.quantity_scalar-input']")
        .should("have.value", "1"); // remaining quantity is default value
      cy.get(receive.receiveProductCard)
        .first()
        .find("[data-testid='productRows.0.code-input']")
        .type("ete-unique-id");

      cy.step(
        "Assert the second item progress and the remaining quatity is default qty value"
      );
      cy.get(receive.receiveProductCard)
        .last()
        .find(receive.poItemProgress)
        .should("contain", "67%")
        .should("contain", "2 U / 3 U")
        .find(
          "[style*='background-color: rgb(227, 228, 229); height: 10px; display: flex; flex-direction: row;']"
        );
      cy.get(receive.receiveProductCard)
        .last()
        .find(receive.selectItemInput)
        .should("have.value", ingredientChemical.name);
      cy.get(receive.receiveProductCard)
        .find("[data-testid='productRows.1.quantity_scalar-input']")
        .should("have.value", "1"); // remaining quantity is default value
      // type unique id
      cy.get(receive.receiveProductCard)
        .find("[data-testid='productRows.1.code-input']")
        .type("ete-unique-id");
      cy.step("User select a Supplier");
      cy.get(floorObj.selectSupplier).find("input").last().as("btn").click();
      cy.wait(3000);
      cy.get("[data-testid^='table-row']").contains("ETE Supplier").click();
      cy.wait(3000);
      cy.step("User click the **Receive** button");
      // cy.wait(1000);
      // cy.get("[role='switch']").last().click();
      cy.wait(1000);
      cy.get(floorObj.saveReciveBtn).last().click();
      cy.wait(1200);
      cy.get(global.banner, { timeout: 25000 }).should("be.visible");
      cy.wait(4000);
      cy.step(
        "Assert the items are received and displayed on floor showing the correct quantity"
      );
      cy.get(sidemenu.floor).click();
      cy.wait(3000);
      cy.get("[data-testid='row-items']")
        .contains(ingredientPackaging.name)
        .parentsUntil("[data-testid='row-items']")
        .should("contain", "1")
        .and("contain", "U");
      cy.get("[data-testid='row-items']")
        .contains(ingredientChemical.name)
        .parentsUntil("[data-testid='row-items']")
        .should("contain", "1")
        .and("contain", "U");
      cy.reload();
      cy.step(
        "User navigates to Purchase Order and Assert that the PO is still active and verify the progress total and bar"
      );
      cy.get(sidemenu.purchaseOrder).click();
      cy.wait(3000);
      // assert that PO is not displayed in Active column
      cy.get("[data-testid='table-row-0-purchase-orders']").should("not.exist");
      // navigate to completed tab
      cy.get("[data-testid='Completed']").click();
      cy.wait(2000);
      cy.get("[data-testid='table-row-0-purchase-orders']")
        .should(($poCompletedDetails) => {
          expect($poCompletedDetails).to.contain(poID);
          expect($poCompletedDetails).to.contain("CA$29.17");
          expect($poCompletedDetails).to.contain("100.0%");
        })
        .find(
          "[style*='background-image: linear-gradient(86.1859deg, rgb(0, 92, 151), rgb(168, 200, 228));']" // blue progress bar
        )
        .should("be.visible");
      cy.get("[data-testid='table-row-0-purchase-orders']").click();
      cy.wait(4000);
      cy.step(
        "Assert the Overall Summary progress is not 100% and verify each 100 progress"
      );
      // overall progress
      cy.get(purchaseOrder.summaryTotalProgress)
        .should("contain", "100.0%")
        .find(
          "[style*='background-image: linear-gradient(88.0363deg, rgb(0, 92, 151), rgb(168, 200, 228));']" // blue progress bar
        )
        .should("be.visible");
      // First Item progress
      cy.get(purchaseOrder.summaryOrderedItems)
        .first()
        .should("contain", inputsItemsIngredient.name)
        .should("contain", "2.5/2.5 kg")
        .find(
          "[style*='background-image: linear-gradient(88.3634deg, rgb(0, 92, 151), rgb(168, 200, 228));']"
        )
        .should("be.visible");
      // Second Item progress
      cy.get(purchaseOrder.summaryOrderedItems)
        .eq(1)
        .should("contain", ingredientPackaging.name)
        .should("contain", "3/3 U")
        .find(
          "[style*='background-image: linear-gradient(88.3634deg, rgb(0, 92, 151), rgb(168, 200, 228));']"
        )
        .should("be.visible");
      // Third Item progress
      cy.get(purchaseOrder.summaryOrderedItems)
        .last()
        .should("contain", ingredientChemical.name)
        .should("contain", "3/3 U")
        .find(
          "[style*='background-image: linear-gradient(88.3634deg, rgb(0, 92, 151), rgb(168, 200, 228));']"
        )
        .should("be.visible");
      cy.wait(2000);
    });
    it("Admin is able to delete a Purchase Order", () => {
      cy.wait(3000);
      cy.get(sidemenu.purchaseOrder).click();
      cy.wait(1200);
      cy.get("[data-testid='Completed']").click();
      cy.step("I click the Purchase Order");
      cy.wait(3000);
      cy.get("[data-testid='table-row-0-purchase-orders']").click();
      cy.wait(5000);
      cy.step("I click the Delete button");
      cy.get(purchaseOrder.deletePOBtn).last().click();
      cy.wait(2000);
      cy.step("I click the **Delete Item** button");
      cy.get("[data-testid='modal-surface']").should(
        "contain",
        "Confirm Delete"
      );
      cy.get("[data-testid='surface']").contains("Delete Item").click();
      cy.wait(4000);
      cy.step("Assert that the PO is deleted");
      cy.get("[data-testid='Completed']").click();
      cy.get("[data-testid='table-row-0-purchase-orders']").should("not.exist");
    });
  }
);
