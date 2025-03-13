Cypress.on("uncaught:exception", (err, runnable) => {
  return false;
});

import loginObj from "../../pageObjects/login.json";

describe("Login functionality", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.contains("Forgot your password?").should("be.visible");
    cy.url().should("contain", "/Login");
  });
  it("User login to the app using incorrect Email", () => {
    cy.step("I type in the Email **incorrect.email@fake.com**");
    cy.get(loginObj.emailField).type("incorrect.email@fake.com");
    cy.step("I type in the correct Password");
    cy.get(loginObj.passwordField).type("letmein");
    cy.step("I click the Login button");
    cy.get(loginObj.loginButton).click();
    cy.step("I should see the error **Incorrect email address or password.**");
    cy.get(loginObj.loginErrMsg, { timeout: 20000 }).should(
      "contain",
      "Incorrect email address or password."
    );
  });
  it("User login to the app using incorrect Password", () => {
    cy.step("I type in the correct Email");
    cy.get(loginObj.emailField).type("user@tracktile.io");
    cy.step("I type in the incorrect Password **incorrectPassword**");
    cy.get(loginObj.passwordField).type("incorrectPassword");
    cy.step("I click the Login button");
    cy.get(loginObj.loginButton).click();
    cy.step("I should see the error **Incorrect email address or password.**");
    cy.get(loginObj.loginErrMsg, { timeout: 20000 }).should(
      "contain",
      "Incorrect email address or password."
    );
  });
  it("User login to the app using correct Email and Password", () => {
    cy.step("I type in the correct Email");
    cy.get(loginObj.emailField).type("user@tracktile.io");
    cy.step("I type in the correct Password");
    cy.get(loginObj.passwordField).type("letmein");
    cy.step("I click the Login button");
    cy.get(loginObj.loginButton).click();
    cy.step("I should be able to login to the app");
    cy.wait(5000);
    cy.get('[href="/floor"]').click();
    cy.url().should("contain", "/floor", { timeout: 15000 });
    cy.get("div").contains("Items On Hand").should("be.visible");
  });
});
