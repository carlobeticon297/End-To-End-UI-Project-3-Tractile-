Cypress.on("uncaught:exception", (err, runnable) => {
  return false;
});
import global from "../../pageObjects/global.json";
import sidemenu from "../../pageObjects/sideMenu.json";
import shipment from "../../pageObjects/shipment.json";
const today = new Date();

const month = today.getMonth() + 1; // Months are zero-based
const day = today.getDate();
const year = today.getFullYear();
const nextDay = new Date(year, month, day + 1);
const isEndOfMonth = nextDay.getMonth() !== month;
// Increment the day only if it's not the end of the month
const newDay = isEndOfMonth ? day : day + 1;
const formattedMonth = month.toString().padStart(2, "0");
const formattedNextDay = newDay.toString().padStart(2, "0");
const formattedNextDate = `${formattedMonth}/${formattedNextDay}/${year}`;
const shipId = "ETE-SHIPMENT-001";
const newShipId = "ETE-SHIPMENT-EDITED";
const orderData = {
  shortId: "ETE-ORDER-001",
  customerId: "",
  dueDate: formattedNextDate,
  currency: "cad",
  orderItems: [
    {
      quantity: 1,
      price: 12.99,
      productId: "",
    },
  ],
};

describe(
  "Shipments Crud Functionalities",
  { testIsolation: false, scrollBehavior: "center" },
  () => {
    before(() => {
      cy.clearAllCookies();
      cy.clearAllLocalStorage();
      cy.clearAllSessionStorage();
      cy.task("createTenant");
      cy.seedProduct("");
      cy.seedCarrier("");
      cy.seedCustomer("");
      cy.seedCustomerProfile("");
      cy.seedOrder(orderData);
      cy.loginAs("dynamicUser");
      cy.wait(5000);
      cy.step("Navigate to Shipment page");
      cy.get(sidemenu.shipments).click();
      cy.url().should("contain", "/shipments");
      cy.get("[data-testid='itemName-shipments']").contains("Shipments");
    });
    after(() => {
      cy.task("destroyTestTenant");
      cy.wait(800);
    });
    it("Admin is able to create Shipment", () => {
      cy.wait(5000);
      cy.step("I click the **Add** button");
      cy.get(shipment.addShipmentBtn).click();
      cy.url().should("contain", "/shipments/new");
      cy.wait(5000);
      cy.step("I enter the Shipment ID");
      cy.get(shipment.shortId).clear().type(shipId);
      cy.step("I choose a Customer");
      cy.get("[data-testid='chooseCustomer']").click();
      cy.wait(2000);
      cy.contains("Choose Customer").should("exist");
      cy.get("[aria-modal='true']")
        .find("input")
        .first()
        .type("Testauto Customer");
      cy.wait(2000);
      cy.get("[data-testid='table-row-0-item']").click();
      cy.wait(1000);
      cy.step("I set the status **Pending**");
      cy.get(shipment.selectStatus).select("Pending", { force: true });
      cy.step("I set the Customer Due Date **Tomorrow**");
      cy.get("[data-testid='CalendarIcon']").click().wait(1000);
      cy.get("button").contains(newDay).click().wait(800);
      cy.get("[placeholder='MM/DD/YYYY']")
        .last()
        .should("have.value", formattedNextDate);
      cy.step("I select a Company Profile");
      cy.get(shipment.selectCompanyProfile).select("ETE Company");
      cy.wait(1500);
      cy.step("I select an Order **Order Details**");
      cy.get(shipment.orderSelectInput).click();
      cy.wait(2000);
      cy.get("[data-testid='Active']").click({ force: true });
      cy.get("[aria-modal='true']").find("input").first().type("ETE-ORDER-001");
      cy.wait(2000);
      cy.get("[data-testid='table-row-0-item']").click();
      cy.wait(1500);
      cy.get("[data-testid='card']").first().should("contain", "CA$12.99"); // assert the Order Details Price exists and correct
      cy.step("I select a Transport Provider");
      cy.get(shipment.shipmentSeclectProvider).click().wait(1500);
      cy.get("[data-testid='table-row-0-item']")
        .contains("ETE Carrier 01")
        .click();
      cy.wait(1500);
      cy.step("I add a note");
      cy.get(shipment.notesInput).type("For ETE purpose only").wait(800);
      cy.step("I save the shipment");
      cy.get(shipment.saveShipmentBtn).click();
      cy.get(global.banner)
        .should("contain", `Saved Shipment: ${shipId}`)
        .wait(1000);
      cy.get(shipment.backButton).click();
      cy.get("[data-testid='table-row-0-shipments']").should(
        ($newShipmentItem) => {
          expect($newShipmentItem).to.contain(shipId);
          expect($newShipmentItem).to.contain("Pending");
          if (!isEndOfMonth) {
            expect($newShipmentItem).to.contain("Tomorrow");
          }
        }
      );
    });
    it("Admin is able to edit a Shipment", () => {
      cy.wait(3000);
      cy.step("I click the shipment I want to edit");
      cy.get("[data-testid='table-row-0-shipments']").click();
      cy.url().should("contain", "/shipments/edit");
      cy.wait(3000);
      cy.step("I enter a new ship Id");
      cy.get("[data-testid='shortId-input']")
        .should("have.value", shipId)
        .clear()
        .type(newShipId);
      cy.step("I change the status to **On Hold**");
      cy.get(shipment.selectStatus).select("On Hold", { force: true });
      cy.wait(2000);
      cy.step("I save the shipment");
      cy.get(shipment.saveShipmentBtn).click();
      cy.wait(3000);
      cy.get(shipment.backButton).click();
      cy.get("[data-testid='table-row-0-shipments']").should(
        ($newShipmentItem) => {
          expect($newShipmentItem).to.contain("On Hold");
        }
      );
    });
    it("Admin able to delete a shipment", () => {
      cy.wait(3000);
      cy.step("I click the shipment I want to delete");
      cy.get("[data-testid='table-row-0-shipments']").click();
      cy.url().should("contain", "/shipments/edit");
      cy.wait(3000);
      cy.step("I click the Shipment delete button and confirm the modal");
      cy.get(shipment.deleteShipmentBtn).click();
      cy.get("[data-testid='modal-surface']").should(
        "contain",
        "Confirm Delete"
      );
      cy.get("[data-testid='surface']").contains("Delete Item").click();
      cy.wait(4000);
      cy.step("Assert that the Shipment is deleted");
      cy.get("[data-testid='surface']").should("not.contain", shipId);
      cy.get("[data-testid='surface']").should("not.contain", newShipId);
    });
  }
);
