// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands";
import "./facilityCommands";
import "./flowCommands";
import "./seedDataCommands";
import "./floorCommands";
import "./catalogCommands";

beforeEach(() => {
  cy.intercept({ resourceType: /xhr|fetch/ }, { log: false });
});

before(() => {
  cy.intercept({ resourceType: /xhr|fetch/ }, { log: false });
});

const createCustomErrorMessage = (
  error: Cypress.CypressError,
  steps: any[],
  runnableObj: Mocha.Runnable
) => {
  // Generate the list of steps from an array of strings
  let lastSteps = "Last logged steps:\n";
  steps.forEach((step: any, index: number) => {
    lastSteps += `${index + 1}. ${step}\n`;
  });

  // Build the message array
  const messageArr = [
    `Context: ${runnableObj.parent?.title}`, // describe('...')
    `Test: ${runnableObj.title}`, // it('...')
    "----------",
    `${error.message}`, // actual Cypress error message
    "\n" + lastSteps, // additional empty line to get some space
  ];

  // Return the new custom error message
  return messageArr.join("\n");
};

// When the test fails, run this function
Cypress.on("fail", (err, runnable) => {
  // Create a custom error message using the custom function
  const customErrorMessage = createCustomErrorMessage(
    err,
    Cypress.env("step") || ["no steps provided..."],
    runnable
  );

  // Modify the error message
  const customError: any = err;
  customError.message = customErrorMessage;

  // Throw the modified error
  throw customError;
});
