/* eslint-disable @typescript-eslint/no-unused-vars */
Cypress.on("uncaught:exception", (_err, _runnable) => {
  return false;
});
import { productData } from "../../../support/samplePayload";
import global from "../../pageObjects/global.json";
import orders from "../../pageObjects/orders.json";
import sidemenu from "../../pageObjects/sideMenu.json";
const today = new Date();

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
const orderId = "ETE-ORDER-001";
const editedOrderID = "ETE-001-EDITED";

describe(
  "Orders Crud Functionalities",
  { testIsolation: false, scrollBehavior: "center" },
  () => {
    before(() => {
      cy.clearAllCookies();
      cy.clearAllLocalStorage();
      cy.clearAllSessionStorage();
      cy.task("createTenant");
      cy.seedProduct(productData);
      cy.seedCarrier("");
      cy.seedCustomer("");
      cy.loginAs("dynamicUser");
      cy.wait(5000);
      cy.step("Navigate to Orders page");
      cy.get(sidemenu.orders).click();
      cy.url().should("contain", "/orders");
      cy.get("[data-testid='itemName-orders']").contains("Orders");
    });
    after(() => {
      cy.task("destroyTestTenant");
      cy.wait(800);
    });
    it("Admin is able to add an Order", () => {
      cy.wait(5000);
      cy.step("I click the **Add** Button");
      cy.get(orders.addOrdersBtn).click();
      cy.url().should("contain", "/orders/new");
      cy.wait(5000);
      cy.step("I enter the Order ID");
      cy.get(orders.orderIdInput).clear().type(orderId);
      cy.step("I select a Customer");
      cy.get(orders.chooseCustomer).click();
      cy.wait(3000);
      cy.contains("Choose Customer").should("exist");
      cy.get("[aria-modal='true']")
        .find("input")
        .first()
        .type("Testauto Customer");
      cy.wait(1500);
      cy.get("[data-testid='table-row-0-item']")
        .should("contain", "Testauto Customer")
        .click()
        .wait(1000);
      cy.step("I select Currency **CAD**");
      cy.get(orders.selectCurrency).select("CAD");

      cy.step("I select Date Created **Today**");
      cy.get(orders.dateCreated)
        .find("[data-testid='CalendarIcon']")
        .click()
        .wait(1000);
      cy.get("button").contains(day).click().wait(800);
      cy.get(orders.dateCreated)
        .find("[placeholder='MM/DD/YYYY']")
        .should("have.value", formattedDate);

      cy.step("I select Due Date **Tomorrow**");
      cy.get(orders.dueDate)
        .find("[data-testid='CalendarIcon']")
        .click()
        .wait(1000);
      // the due date is always 1 day ahead if not end of the month else due date is the current date
      cy.get("button").contains(newDay).click().wait(800);
      cy.get(orders.dueDate)
        .find("[placeholder='MM/DD/YYYY']")
        .last()
        .should("have.value", formattedNextDate);

      cy.step("I select Due Date **Requested Ship Date**");
      cy.get(orders.requestedShipDate)
        .find("[data-testid='CalendarIcon']")
        .click()
        .wait(1000);
      cy.get("button").contains(newDay).click().wait(800);
      cy.get(orders.requestedShipDate)
        .find("[placeholder='MM/DD/YYYY']")
        .should("have.value", formattedNextDate);

      cy.step("I select Due Date **Requested Delivery Date**");
      cy.get(orders.requestedDeliveryDate)
        .find("[data-testid='CalendarIcon']")
        .click()
        .wait(1000);
      cy.get("button").contains(newDay).click().wait(800);
      cy.get(orders.requestedDeliveryDate)
        .find("[placeholder='MM/DD/YYYY']")
        .should("have.value", formattedNextDate);

      cy.step("I add an Item");
      cy.get(orders.addItemsToOrderBtn).click();
      cy.wait(3000);
      cy.step("I navigate to Product Variant");
      cy.get("[aria-modal='true']")
        .find("[data-testid='Product']")
        .click({ force: true });
      cy.step("I search for the desired product");
      cy.get("[aria-modal='true']")
        .find("input")
        .first()
        .type("ETE Testing Bar 3.0{enter}");
      cy.wait(1500);
      cy.get("[data-testid='table-row-0-item']").click().wait(500);
      cy.get("[data-testid='btn-common-done']").click();
      cy.wait(3000);
      cy.get("[data-testid='table-row-0-item']")
        .find("input")
        .first()
        .should("have.value", "ETE Testing Bar 3.0");
      cy.step("I enter the quantity");
      cy.get('[data-testid="orderItems.0.quantity_scalar-input"]').type(
        "{selectall}1"
      );
      cy.step("I enter the price per unit");
      cy.get("[data-testid='orderItems.0.price-input']").type("{selectall}8");
      cy.step("Assert the total Estimated amount");
      cy.get("[data-testid='table-row-0-item']").should("contain", "CA$8.00");
      cy.wait(2000);
      cy.step("I save the Order");
      cy.get(orders.saveOrderBtn).click();
      cy.step("Assert the new Order is saved and details are correct");
      cy.get(global.banner).contains(`Saved Order: ${orderId}`);
      cy.get(orders.ordersBackBtn).click();
      cy.wait(3000);
      cy.get("[data-testid='table-row-0-orders']").should(($newPoDetails) => {
        expect($newPoDetails).to.contain(orderId); //
        expect($newPoDetails).to.contain("CA$8.00"); //
        if (!lastDayOfMonth) {
          expect($newPoDetails).to.contain("in a day");
        }
        expect($newPoDetails).to.contain("0%");
      });
    });
    it("Admin is able to edit an Order", () => {
      cy.step("I click an Order item to edit");
      cy.get("[data-testid='table-row-0-orders']").click();
      cy.wait(5000);
      cy.step("I enter the new Order ID");
      cy.get(orders.orderIdInput).clear().type(editedOrderID);
      cy.wait(1000);
      cy.step("I enter the new Price Per Unit");
      cy.get("[data-testid='orderItems.0.price-input']").type("{selectall}9");
      cy.wait(1000);
      cy.step("I save the Order");
      cy.get(orders.saveOrderBtn).click();
      cy.step("Assert the new Order is saved and details are correct");
      cy.get(global.banner).contains(`Saved Order: ${editedOrderID}`);
      cy.get(orders.ordersBackBtn).click();
      cy.wait(3000);
      cy.get("[data-testid='table-row-0-orders']").should(($newPoDetails) => {
        expect($newPoDetails).to.contain(editedOrderID); //
        expect($newPoDetails).to.contain("CA$9.00"); //
        if (!lastDayOfMonth) {
          expect($newPoDetails).to.contain("in a day");
        }
        expect($newPoDetails).to.contain("0%");
      });
    });
  }
);
