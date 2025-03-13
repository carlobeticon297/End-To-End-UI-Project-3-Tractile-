/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable no-console */
import sidemenu from "../e2e/pageObjects/sideMenu.json";
console.log(sidemenu);

const basicProductData = {
  variant: "ingredient",
  name: "ETE Testing Bar 3.0",
  description: "ete purposes only",
  traits: ["inceptable", "moveable", "consumable", "producible"],
  price: 0,
  shipPercentage: 0,
  cost: 0,
  unitOfMeasurement: "unit",
  categoryType: "Manual",
  suppliers: [],
  attributes: [],
  consumptionStrategy: "FIFO",
  casingOptions: [],
  receiveInitialStatus: "active",
  weightPerUnit: "10 g",
  decimalPrecision: "0.000001",
  shelfLife: 20,
  shelfLifeAlertDays: 15,
  minimumStockAmount: 18,
  customerCatalogItems: [],
  customerProductPrices: [],
  customerProductShipPercentages: [],
  supplierProductPrices: [],
  customers: [],
  categorizations: [],
};

const basicSupplierData = {
  supplierName: "ETE Supplier",
  currency: "cad",
  contacts: [],
  supplies: [],
  supplierProductPrices: [],
  defaultPurchaseOrder: [],
  supplierCode: "ETE-code1234",
  address: null,
  city: null,
  province: null,
  country: null,
  postalCode: null,
  contactName: null,
  email: null,
  phoneNumber: null,
  cellNumber: null,
  faxNumber: null,
};

const custProfileBasicData = {
  companyName: "ETE Company",
  companyAddress: "107 St NE",
  companyCity: "Calgary",
  companyProvince: "Alberta",
  companyCountry: "Canada",
  companyPostalCode: "00011",
  companyEmail: "ete.company@email.co",
  companyPhone: "(555)5555555",
};

const carrierBasicData = {
  companyName: "ETE Carrier 01",
  contactName: "ETE Contact",
  phoneNumber: "555.555.5555",
  address: "4493 Yundt Pines",
  city: "Framingham",
  province: "OH",
  country: "CANADA",
  postalCode: "48395",
};

const customerBasicData = {
  companyName: "Testauto Customer",
  locations: [
    {
      id: "4ae19ceb-b167-4b77-81c3-f377cf47eb2e",
      index: 0,
      address: "443 Arlington Ave Toronto Ontario Canada, M6C 3A4",
      city: "Toronto",
      province: "Ontario",
      country: "Canada",
      postalCode: "M6C 3A4",
      daysInTransit: 3,
      isBillToSelected: true,
      isShipToSelected: false,
      customerId: "",
      countryCode: "ca",
    },
  ],
  attributes: {},
  contacts: [],
  defaultOrder: [],
  currency: "CAD",
  usedBy: {
    shipments: 0,
    orders: 0,
  },
  catalogItems: [],
  code: "cx-0001",
  taxRateId: null,
  shippingDocumentOptions: {},
};

Cypress.Commands.add("seedProduct", (productData) => {
  cy.task("createProduct", productData ? productData : basicProductData);
});

Cypress.Commands.add("seedSupplier", (supplierData) => {
  cy.task("createSupplier", supplierData ? supplierData : basicSupplierData);
});

Cypress.Commands.add("seedCustomer", (customerData) => {
  cy.task("createCustomer", customerData ? customerData : customerBasicData);
});

Cypress.Commands.add("seedCustomerProfile", (custProfileData) => {
  cy.task(
    "createCustProfile",
    custProfileData ? custProfileData : custProfileBasicData
  );
});

Cypress.Commands.add("seedOrder", (orderData) => {
  cy.task("createOrder", orderData);
});

Cypress.Commands.add("seedCarrier", (carrierData) => {
  cy.task("createCarrier", carrierData ? carrierData : carrierBasicData);
});

Cypress.Commands.add("seedRecipe", (recipeData) => {
  cy.task("createRecipe", recipeData);
});

Cypress.Commands.add("seedCodes", (codesDataPayload) => {
  cy.task("createCodes", codesDataPayload);
});
Cypress.Commands.add("seedEmployee", (codesDataPayload) => {
  cy.task("createEmployee", codesDataPayload);
});

declare global {
  namespace Cypress {
    interface Chainable {
      seedProduct(productData: any): Chainable<any>;
      seedSupplier(supplierData: any): Chainable<any>;
      seedCustomer(customerData: any): Chainable<any>;
      seedCustomerProfile(custProfileData: any): Chainable<any>;
      seedOrder(orderData: any): Chainable<any>;
      seedCarrier(carrierData: any): Chainable<any>;
      seedRecipe(recipeData: any): Chainable<any>;
      seedCodes(codesData: any): Chainable<any>;
      seedEmployee(employeeData: any): Chainable<any>;
    }
  }
}
