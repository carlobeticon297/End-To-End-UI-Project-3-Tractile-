/* eslint-disable @typescript-eslint/no-namespace */
/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }
import catalogObj from "../e2e/pageObjects/catalog.json";
import loginObj from "../e2e/pageObjects/login.json";
import { recurse } from "cypress-recurse";
import jsQR from "jsqr";
console.log(catalogObj);

Cypress.Commands.add("fillForm", (formData) => {
  Object.entries(formData).forEach(([fieldName, fieldData]) => {
    const { id, value } = fieldData;
    cy.get(id)
      .last()
      .wait(1000)
      .clear({ force: true })
      .type(value, { force: true });
    cy.wait(1000);
  });
});

Cypress.Commands.add("verifyDataAreCorrect", (formData) => {
  cy.wait(2500);
  Object.entries(formData).forEach(([fieldName, fieldData]) => {
    const { id, value } = fieldData;
    cy.get(id).last().should("have.value", value);
  });
});

Cypress.Commands.add("loginAs", (userType) => {
  switch (true) {
    case userType.includes("dynamicUser"):
      cy.visit("/");
      cy.contains("Forgot your password?").should("be.visible");
      cy.task("getDynamicUserData").then((tenantData: any) => {
        cy.log(`tenantId is ${tenantData.tenantId}`);
        cy.get(loginObj.emailField).type(tenantData.email);
        cy.get(loginObj.passwordField).type(tenantData.password);
      });
      cy.get(loginObj.loginButton).click();
      cy.wait(3000);
      cy.get('[href="/floor"]').click();
      cy.url().should("contain", "/floor", { timeout: 15000 });
      break;
    case userType.includes("userTracktile"):
      cy.visit("/");
      cy.contains("Forgot your password?").should("be.visible");
      cy.get(loginObj.emailField).type("user@tracktile.io");
      cy.get(loginObj.passwordField).type("letmein");
      cy.get(loginObj.loginButton).click();
      cy.wait(4000);
      break;
    // case tag.startsWith("@seedProduct"):
    //   // create product
    //   cy.task("createProduct", basicProductData);
    //   cy.wait(1500);
    //   break;
    default:
      break;
  }
});

Cypress.Commands.add("step", (description) => {
  const MAX_ITEMS_IN_STACK = 8;
  const arr = Cypress.env("step") || [];
  arr.push(description);
  if (arr.length > MAX_ITEMS_IN_STACK) {
    arr.shift();
  }
  Cypress.env("step", arr);
});

Cypress.Commands.overwrite(
  "type",
  (
    originalFn: (arg0: string, arg1: string, arg2: any) => any,
    subject: any,
    text: any,
    options: any
  ) => {
    // Add a global delay here
    const defaultDelay = 100; // Adjust this value to your desired delay in milliseconds

    // Add the delay option to the options object
    const newOptions = {
      ...options,
      delay: defaultDelay,
      force: true,
    };

    // Call the original type command with the modified options
    return originalFn(subject, text, newOptions);
  }
);

Cypress.Commands.add("verifyTheEmailIsSent", (dynamicSubject) => {
  recurse(
    () => {
      return cy
        .task("getEmailsWithAttachmentBySubject", dynamicSubject)
        .then((emailLog) => {
          console.log("emailLog", emailLog);
          return emailLog;
        });
    },
    (emailLog: any) => {
      return emailLog && emailLog["subject"] === dynamicSubject;
    },
    {
      log: true,
      limit: 40, // Max no. of iterations
      timeout: 30000, // Time limit in ms
      delay: 2000, // Delay before next iteration
    }
  ).then((emailLog) => {
    console.log("Final emailLog:", emailLog);
  });
});

Cypress.Commands.add("decodeBase64SvgImage", (base64Data) => {
  return cy.wrap(
    new Cypress.Promise((resolve, reject) => {
      try {
        const svgString = atob(base64Data);
        console.log("Decoded SVG: ", svgString);

        // Convert the SVG to an image (using an <img> tag)
        const img = new Image();
        const svgBlob = new Blob([svgString], { type: "image/svg+xml" });
        const svgUrl = URL.createObjectURL(svgBlob);
        img.src = svgUrl;

        img.onload = () => {
          // Visualize the image for debugging
          const imgElement = document.createElement("img");
          imgElement.src = img.src;
          document.body.appendChild(imgElement); // Append to body to inspect the image

          console.log("Image loaded:", img);
          console.log("Image dimensions:", img.width, img.height);

          // Ensure the image has decent dimensions
          if (img.width < 100 || img.height < 100) {
            return reject("Image is too small to decode QR code");
          }

          // Create a canvas, fill it with a background, and draw the image
          const canvas = document.createElement("canvas");
          const ctx: any = canvas.getContext("2d");
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.fillStyle = "white"; // Set a white background to handle transparency
          ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill the canvas with white
          ctx.drawImage(img, 0, 0); // Draw the image

          // Capture the image data from the canvas
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          if (!imageData) {
            console.error("Failed to capture image data");
            return reject("Failed to capture image data");
          }

          // Log first few pixel values for debugging
          console.log("Captured image data:", imageData.data.slice(0, 100));

          // Decode QR code from the captured image data
          const code = jsQR(imageData.data, img.width, img.height);
          if (code) {
            console.log("Decoded QR Code Result: ", code.data);
            resolve(code.data);
          } else {
            console.error("QR code not detected");
            reject("Failed to decode QR code");
          }
        };

        // Error handling
        img.onerror = (err) => {
          console.error("Error loading image:", err);
          reject("Failed to load image");
        };
      } catch (error) {
        console.error("Error during SVG decoding: ", error);
        reject("Error decoding base64 SVG image");
      }
    })
  );
});
declare global {
  namespace Cypress {
    interface Chainable {
      fillForm(formData: {
        [key: string]: { id: string; value: string };
      }): Chainable<void>;
      verifyDataAreCorrect(formData: {
        [key: string]: { id: string; value: string };
      }): Chainable<void>;
      loginAs(userType: string): Chainable<any>;
      step(desciption: string): Chainable<any>;
      verifyTheEmailIsSent(dynamicSubject: string): Chainable<any>;
      decodeBase64SvgImage(base64Data: any): Chainable<any>;
    }
  }
}
