import { defineConfig } from "cypress";
import dotenv from "dotenv";
import EmailHelper from "./cypress/support/emailHelper";
import {
  createProduct,
  createSupplier,
  createTenant,
  createCustomer,
  destroyTestTenant,
  createCompanyProfile,
  createOrder,
  createCarrier,
  createRecipe,
  getProdPlanById,
  updatePlannedRecipe,
  deleteAllTestTenants,
} from "./cypress/support/apiHelpers";

// Load environment variables
dotenv.config();

let tenantId: string | undefined;
let tenantEmail: string | undefined;
let tenantPassword: string | undefined;

export default defineConfig({
  projectId: "cpo4k7",
  experimentalMemoryManagement: true,
  e2e: {
    viewportHeight: 1080,
    viewportWidth: 1920,
    trashAssetsBeforeRuns: false,
    chromeWebSecurity: false,
    defaultCommandTimeout: 20000,
    pageLoadTimeout: 40000,
    video: false,
    specPattern: "cypress/e2e/features/**/*.cy.ts",
    baseUrl:
      process.env.EXPO_PUBLIC_APP_ENV === "production"
        ? "https://app.tracktile.io/"
        : process.env.EXPO_PUBLIC_APP_ENV === "pre-release"
          ? "https://pre-release-app.dev.tracktile.io/"
          : "https://next-app.dev.tracktile.io/",
    env: {
      EXPO_PUBLIC_APP_ENV: process.env.EXPO_PUBLIC_APP_ENV,
      EXPO_PUBLIC_APP_API_URL: process.env.EXPO_PUBLIC_APP_API_URL,
      ETE_ENDPOINT_EMAIL: process.env.ETE_ENDPOINT_EMAIL,
      ETE_ENDPOINT_KEY: process.env.ETE_ENDPOINT_KEY,
    },
    setupNodeEvents(on, config) {
      on("before:browser:launch", (browser, launchOptions) => {
        if (browser.name === "chrome" || browser.name === "electron") {
          launchOptions.args.push("--disable-gpu");
        }
        return launchOptions;
      });
      on("task", {
        async createTenant() {
          try {
            const newTenant = await createTenant();
            tenantId = newTenant.tenantId;
            tenantEmail = newTenant.email;
            tenantPassword = newTenant.password;
            return tenantId;
          } catch (error: any) {
            throw new Error(`Failed to create tenant: ${error.message}`);
          }
        },
        async destroyTestTenant(id?: string) {
          try {
            const response = await destroyTestTenant(id ?? tenantId);
            return response;
          } catch (error: any) {
            throw new Error(`Failed to destroy tenant: ${error.message}`);
          }
        },
        async deleteAllTestTenants() {
          try {
            const deletedTenants = await deleteAllTestTenants();
            return deletedTenants;
          } catch (error: any) {
            throw new Error(`Unable to delete test tenant: ${error.message}`);
          }
        },
        async createProduct(productData: any) {
          try {
            const newProduct = await createProduct(productData);
            return newProduct;
          } catch (error: any) {
            throw new Error(`Failed to create product: ${error.message}`);
          }
        },
        async createSupplier(supplierData: any) {
          try {
            const newSupplier = await createSupplier(supplierData);
            return newSupplier;
          } catch (error: any) {
            throw new Error(`Failed to create supplier: ${error.message}`);
          }
        },
        async createCustomer(customerData: any) {
          try {
            const customer = await createCustomer(customerData);
            return customer;
          } catch (error: any) {
            throw new Error(`Failed to create customer: ${error.message}`);
          }
        },
        async createCustProfile(custProfileData: any) {
          try {
            const custProfile = await createCompanyProfile(custProfileData);
            return custProfile;
          } catch (error: any) {
            throw new Error(
              `Failed to create customer profile: ${error.message}`
            );
          }
        },
        async createOrder(orderData: any) {
          try {
            const newOrder = await createOrder(orderData);
            return newOrder;
          } catch (error: any) {
            throw new Error(`Failed to create order: ${error.message}`);
          }
        },
        async createCarrier(carrierData: any) {
          try {
            const carrier = await createCarrier(carrierData);
            return carrier;
          } catch (error: any) {
            throw new Error(`Failed to create carrier: ${error.message}`);
          }
        },
        async createRecipe(recipeData: any) {
          try {
            const recipe = await createRecipe(recipeData);
            return recipe;
          } catch (error: any) {
            throw new Error(`Failed to create recipe: ${error.message}`);
          }
        },
        async getDynamicUserData() {
          return {
            tenantId,
            email: tenantEmail,
            password: tenantPassword,
          };
        },
        async getProdPlanById(id: string) {
          try {
            const planData = await getProdPlanById(id);
            return planData;
          } catch (error: any) {
            throw new Error(
              `Failed to get Production Planning: ${error.message}`
            );
          }
        },
        async updatePlannedRecipe(plannedData: any) {
          try {
            const plannedRecipe = await updatePlannedRecipe(plannedData);
            return plannedRecipe;
          } catch (error: any) {
            throw new Error(`Failed to update recipe: ${error.message}`);
          }
        },
        async getEmailsWithAttachmentBySubject(dynamicSubject: string) {
          return await EmailHelper.getLastEmailWithAttachment(dynamicSubject);
        },
      });
      return config;
    },
  },
});
