import global from "../../pageObjects/global.json";
import profiles from "../../pageObjects/profiles.json";
import sideMenu from "../../pageObjects/sideMenu.json";
Cypress.on("uncaught:exception", (err, runnable) => {
  return false;
});
const companyName = "ETE PROFILE";
const newCompanyName = "ETE NEW PROFILE NAME";
describe(
  "Facility Profiles CRUD functionality",
  { testIsolation: false, scrollBehavior: "center" },
  () => {
    before(() => {
      cy.clearAllCookies();
      cy.clearAllLocalStorage();
      cy.clearAllSessionStorage();
      cy.task("createTenant");
      cy.loginAs("dynamicUser");
      cy.step("navigate to facility -> Profile page");
      cy.wait(5000);
      cy.get(sideMenu.facilityMenu).click({ force: true });
      cy.url().should("contain", "/admin/facility");
      cy.get('[data-testid="card"]').should("be.visible");
      cy.get(profiles.profilesTab).click();
      cy.url().should("contain", "facility/profiles");
      cy.contains("Facility Settings");
      cy.wait(4000);
    });
    after(() => {
      cy.task("destroyTestTenant");
      cy.wait(800);
    });
    it("Admin is able to add a Profile", () => {
      cy.step("I click the **Add Profile** btn");
      cy.get(profiles.addProfileBtn).click();
      cy.url().should("contain", "facility/profiles/new");
      cy.contains("New Profile");
      cy.step("I fill in the **Company Information** form");
      cy.get(profiles.companyNameInput).type(companyName);
      cy.get(profiles.companyEmailInput).type("ete.fake@email.com");
      cy.get(profiles.phoneInput).type("44444444444");
      cy.get(profiles.websiteInput).type("https://tracktile.io/");
      cy.get(profiles.businessNumberInput).type("5555555555");
      cy.step("I fill in the **Company Address** form");
      cy.get(profiles.streetInput).type("288 Lemarchant Rd");
      cy.get(profiles.cityInput).type("St John's");
      cy.get(profiles.provinceInput).type("Newfoundland and Labrador");
      cy.get(profiles.countryInput).type("Canada");
      cy.get(profiles.postalCodeInput).type("A1E 1R2");
      cy.wait(2000);
      cy.step("I save the new Profile");
      cy.get(profiles.saveProfileBtn).click();
      cy.wait(1000);
      cy.step("Assert that the new profile is saved correctly");
      cy.get(global.banner).should("contain", `Saved Profile: ${companyName}`);
      cy.get("[data-testid='table-row-0-profiles']").should(($newProfile) => {
        expect($newProfile).to.contain(companyName);
        expect($newProfile).to.contain("a few seconds ago");
      });
    });
    it("Admin is able to edit a Profile", () => {
      cy.wait(3000);
      cy.step("I click a Profile");
      cy.get("[data-testid='table-row-0-profiles']")
        .contains(companyName)
        .click();
      cy.step("I enter a new Company Name");
      cy.get(profiles.companyNameInput).clear().type(newCompanyName);
      cy.wait(1000);
      cy.step("I remove the Conpamy website");
      cy.get(profiles.websiteInput).clear();
      cy.wait(1500);
      cy.step("I saved the Profile");
      cy.get(profiles.saveProfileBtn).click();
      cy.wait(2000);
      cy.step("Assert that the new profile is saved correctly");
      cy.get(global.banner).should(
        "contain",
        `Saved Profile: ${newCompanyName}`
      );
      cy.get("[data-testid='table-row-0-profiles']").should(($newProfile) => {
        expect($newProfile).to.contain(newCompanyName);
        expect($newProfile).to.contain("a few seconds ago");
      });
      cy.step(
        "I click a Profile and verify the new Nmae is correct and the website input has no value"
      );
      cy.get("[data-testid='table-row-0-profiles']")
        .contains(newCompanyName)
        .click();
      cy.wait(2000);
      cy.get(profiles.companyNameInput).should("have.value", newCompanyName);
      cy.get(profiles.websiteInput).should("not.have.value");
      cy.get(profiles.backProfileBtn).click();
      cy.wait(2000);
    });
    it("Admin is able to delete a Profile", () => {
      cy.wait(3000);
      cy.step("I click the Profile");
      cy.get("[data-testid='table-row-0-profiles']")
        .contains(newCompanyName)
        .click();
      cy.wait(4000);
      cy.step("I click the **Delete Profile** button");
      cy.get(profiles.deleteProfileBtn).click();
      cy.get("[data-testid='modal-surface']").should(
        "contain",
        "Confirm Delete"
      );
      cy.get("[data-testid='surface']").contains("Delete Item").click();
      cy.wait(1000);
      cy.step("Assert the banner message");
      cy.get(global.banner).should("contain", "Deleted Profile");
      cy.step("Assert that the profile is deleted");
      cy.get("[data-testid='surface']").should("not.contain", newCompanyName);
      cy.get("[data-testid='surface']").should("not.contain", companyName);
    });
  }
);
