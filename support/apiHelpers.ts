/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import "dotenv/config.js";
// @ts-ignore
import fetch from "node-fetch";

import {
  Carrier,
  Customer,
  Employee,
  Order,
  ProductPayload,
  Profile,
  Recipe,
  Supplier,
} from "../support/endpointParams";

let tenantId: any;
let tenantEmail: any;
let tenantPassword: any;

const EXPO_PUBLIC_APP_API_URL = process.env.EXPO_PUBLIC_APP_API_URL;
const ETE_ENDPOINT_EMAIL = process.env.ETE_ENDPOINT_EMAIL;
const ETE_ENDPOINT_KEY = process.env.ETE_ENDPOINT_KEY;
let tenantData: any;
let customerId: string;
let productId: string;
let carrierId: string;

// Function to get authentication headers
export const getAuthHeaders = async (
  email: string | undefined,
  key: string | undefined
) => {
  try {
    const response = await fetch(`${EXPO_PUBLIC_APP_API_URL}/auth/admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        key,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to authenticate. Status ${response.status}. ${errorText}`
      );
    }

    const data = await response.json();
    const token = data.token;
    return {
      Authorization: `Bearer ${token}`,
    };
  } catch (error: any) {
    throw new Error(`Error in authentication: ${error.message}`);
  }
};

// function to get authentication token
export const getBearerToken = async (email: string, password: string) => {
  const authResponse = await fetch(`${EXPO_PUBLIC_APP_API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (!authResponse.ok) {
    throw new Error("Failed to authenticate");
  }

  const authData = await authResponse.json();
  return authData.token;
};

// Function to create a tenant
export const createTenant = async () => {
  const authHeaders = await getAuthHeaders(
    ETE_ENDPOINT_EMAIL,
    ETE_ENDPOINT_KEY
  );

  const response = await fetch(
    `${EXPO_PUBLIC_APP_API_URL}/internal/tenants/testing`,
    {
      method: "POST",
      headers: {
        ...authHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Add body parameters if needed
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to create tenant. Status ${response.status}`);
  }

  tenantData = await response.json();
  tenantId = tenantData.tenantId;
  tenantEmail = tenantData.email;
  tenantPassword = tenantData.password;
  return tenantData; // Adjust this based on your API response structure
};

// Function to get all Test Tenants
export const getTestTenantList = async () => {
  const url = `${EXPO_PUBLIC_APP_API_URL}/internal/tenants/testing`;
  const authHeaders = await getAuthHeaders(
    ETE_ENDPOINT_EMAIL,
    ETE_ENDPOINT_KEY
  );

  const options = {
    method: "GET",
    headers: {
      ...authHeaders,
      "Content-Type": "application/json",
    },
  };

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`Failed to fetch tenant data. Status ${response.status}`);
    }

    const tenantList = await response.json();
    return tenantList;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

// Function to destroy a tenant
export const destroyTestTenant = async (id?: string) => {
  const authHeaders = await getAuthHeaders(
    ETE_ENDPOINT_EMAIL,
    ETE_ENDPOINT_KEY
  );

  try {
    const response = await fetch(
      `${EXPO_PUBLIC_APP_API_URL}/internal/tenants/testing/${id ? id : tenantId}`,
      {
        method: "DELETE",
        headers: {
          ...authHeaders,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      let errorMessage = `HTTP error! Status: ${response.status}`;
      try {
        const errorResponseData = await response.json();
        // If both message and fields are present in the error response
        if (errorResponseData.message && errorResponseData.fields) {
          errorMessage += `, Message: ${errorResponseData.message}`;
          Object.entries(errorResponseData.fields).forEach(
            ([field, message]) => {
              if (field === "") {
                console.log(`Error: ${message}`);
                errorMessage += `Error: ${message}`;
              } else {
                console.log(`Field '${field}' has error: ${message}`);
                errorMessage += `Field '${field}' has error: ${message}`;
              }
            }
          );
        }
        // If only message is present
        else if (errorResponseData.message) {
          errorMessage += `, Message: ${errorResponseData.message}`;
          console.log(`Error: ${errorResponseData.message}`);
        } else {
          console.log("Unknown error response:", errorResponseData);
        }
      } catch (parseError) {
        console.error("Error parsing error response:", parseError);
      }
      throw new Error(errorMessage);
    }

    console.log(`Successfully deleted test tenant ${id ? id : tenantId}`);
    return response;
  } catch (error) {
    console.error("Error destroying test tenant:", error);
    throw error;
  }
};

// Function to delete all test tenants

export const deleteAllTestTenants = async () => {
  try {
    // Fetch all test tenants
    const tenantList = await getTestTenantList();

    // Iterate through the tenant list
    for (const tenant of tenantList) {
      const { tenantId } = tenant;

      // Check if the tenantId should be excluded from deletion
      // if (
      //   tenantId === "4b7312f7-d3f8-40fc-be2f-921727ab9c92" ||
      //   tenantId === "ce8770c6-ff86-4602-97ce-9eeb3d3ef13b"
      // ) {
      //   console.log(`Skipping deletion of tenant with ID: ${tenantId}`);
      //   continue;
      // }

      // Delete the tenant by ID
      await destroyTestTenant(tenantId);
      console.log(`Deleted tenant with ID: ${tenantId}`);
    }

    console.log("All test tenants deleted successfully.");
  } catch (error) {
    console.error("Error deleting test tenants:", error);
  }
};

// Create a product
export const createProduct = async (
  productData: ProductPayload
): Promise<any> => {
  const baseUrl = `${EXPO_PUBLIC_APP_API_URL}/products/`;
  const accessToken = await getBearerToken(tenantEmail, tenantPassword);
  const requestBody: string = JSON.stringify(productData);
  try {
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: requestBody,
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! Status: ${response.status}`;
      try {
        const errorResponseData = await response.json();
        if (errorResponseData.message && errorResponseData.fields) {
          errorMessage += `, Message: ${errorResponseData.message}`;
          Object.entries(errorResponseData.fields).forEach(
            ([field, message]) => {
              if (field === "") {
                console.log(`Error: ${message}`);
              } else {
                console.log(`Field '${field}' has error: ${message}`);
                errorMessage += `Field '${field}' has error: ${message}`;
              }
            }
          );
        } else if (errorResponseData.message) {
          errorMessage += `, Message: ${errorResponseData.message}`;
          console.log(`Error: ${errorResponseData.message}`);
        } else if (errorResponseData.fields) {
          Object.entries(errorResponseData.fields).forEach(
            ([field, message]) => {
              if (field === "") {
                console.log(`Error: ${message}`);
              } else {
                console.log(`Field '${field}' has error: ${message}`);
              }
            }
          );
        } else {
          console.log("Unknown error response:", errorResponseData);
        }
      } catch (parseError) {
        console.error("Error parsing error response:", parseError);
      }
      throw new Error(errorMessage);
    }
    const responseData = await response.json();
    return responseData; // Return the response data (product) here
  } catch (error) {
    console.error("Error creating product:", error);
    throw error; // Propagate the error back
  }
};

// Create Supplier
export const createSupplier = async (supplerData: Supplier): Promise<any> => {
  const baseUrl = `${EXPO_PUBLIC_APP_API_URL}/suppliers/`;
  const accessToken = await getBearerToken(tenantEmail, tenantPassword);
  const requestBody: string = JSON.stringify(supplerData);
  try {
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: requestBody,
    });
    if (!response.ok) {
      let errorMessage = `HTTP error! Status: ${response.status}`;
      try {
        const errorResponseData = await response.json();
        if (errorResponseData.message && errorResponseData.fields) {
          errorMessage += `, Message: ${errorResponseData.message}`;
          Object.entries(errorResponseData.fields).forEach(
            ([field, message]) => {
              if (field === "") {
                console.log(`Error: ${message}`);
                errorMessage += `Error: ${message}`;
              } else {
                console.log(`Field '${field}' has error: ${message}`);
                errorMessage += `Field '${field}' has error: ${message}`;
              }
            }
          );
        } else if (errorResponseData.message) {
          errorMessage += `, Message: ${errorResponseData.message}`;
          console.log(`Error: ${errorResponseData.message}`);
        } else if (errorResponseData.fields) {
          Object.entries(errorResponseData.fields).forEach(
            ([field, message]) => {
              if (field === "") {
                console.log(`Error: ${message}`);
              } else {
                console.log(`Field '${field}' has error: ${message}`);
              }
            }
          );
        } else {
          console.log("Unknown error response:", errorResponseData);
        }
      } catch (parseError) {
        console.error("Error parsing error response:", parseError);
      }

      throw new Error(errorMessage); // Throw the constructed error message
    }
    const responseData = await response.json();
    console.log("Supplier created with ID:", responseData);
    return responseData; // Return the response data (supplier) here
  } catch (error) {
    console.error("Error creating supplier:", error);
    throw error; // Propagate the error back
  }
};

// Create Customer
export const createCustomer = async (customerData: Customer): Promise<any> => {
  customerData.defaultCarrierId = carrierId; // Add the carrierId to the customerData
  const baseUrl = `${EXPO_PUBLIC_APP_API_URL}/customers/`;
  const accessToken = await getBearerToken(tenantEmail, tenantPassword);
  const requestBody: string = JSON.stringify(customerData);

  try {
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: requestBody,
    });
    if (!response.ok) {
      let errorMessage = `HTTP error! Status: ${response.status}`;
      try {
        const errorResponseData = await response.json();

        if (errorResponseData.message && errorResponseData.fields) {
          errorMessage += `, Message: ${errorResponseData.message}`;
          Object.entries(errorResponseData.fields).forEach(
            ([field, message]) => {
              if (field === "") {
                console.log(`Error: ${message}`);
                errorMessage += `Error: ${message}`;
              } else {
                console.log(`Field '${field}' has error: ${message}`);
                errorMessage += `Field '${field}' has error: ${message}`;
              }
            }
          );
        }
        // If only message is present
        else if (errorResponseData.message) {
          errorMessage += `, Message: ${errorResponseData.message}`;
          console.log(`Error: ${errorResponseData.message}`);
        }
        // If only fields are present
        else if (errorResponseData.fields) {
          Object.entries(errorResponseData.fields).forEach(
            ([field, message]) => {
              if (field === "") {
                console.log(`Error: ${message}`);
              } else {
                console.log(`Field '${field}' has error: ${message}`);
              }
            }
          );
        }
        // Handle any unexpected error structure
        else {
          console.log("Unknown error response:", errorResponseData);
        }
      } catch (parseError) {
        console.error("Error parsing error response:", parseError);
      }
      throw new Error(errorMessage); // Throw the constructed error message
    }
    const responseData = await response.json();
    console.log("Customer created with ID:", responseData.id);
    return responseData; // Return the response data (customer) here
  } catch (error) {
    console.error("Error creating customer:", error);
    throw error; // Propagate the error back
  }
};

// Create Company Profile
export const createCompanyProfile = async (
  profileData: Profile
): Promise<any> => {
  const baseUrl = `${EXPO_PUBLIC_APP_API_URL}/company-profiles`;
  const accessToken = await getBearerToken(tenantEmail, tenantPassword);

  const requestBody: string = JSON.stringify(profileData);

  try {
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: requestBody,
    });
    if (!response.ok) {
      let errorMessage = `HTTP error! Status: ${response.status}`;
      try {
        const errorResponseData = await response.json();
        if (errorResponseData.message && errorResponseData.fields) {
          errorMessage += `, Message: ${errorResponseData.message}`;
          Object.entries(errorResponseData.fields).forEach(
            ([field, message]) => {
              if (field === "") {
                console.log(`Error: ${message}`);
                errorMessage += `Error: ${message}`;
              } else {
                console.log(`Field '${field}' has error: ${message}`);
                errorMessage += `Field '${field}' has error: ${message}`;
              }
            }
          );
        } else if (errorResponseData.message) {
          errorMessage += `, Message: ${errorResponseData.message}`;
          console.log(`Error: ${errorResponseData.message}`);
        } else if (errorResponseData.fields) {
          Object.entries(errorResponseData.fields).forEach(
            ([field, message]) => {
              if (field === "") {
                console.log(`Error: ${message}`);
              } else {
                console.log(`Field '${field}' has error: ${message}`);
              }
            }
          );
        } else {
          console.log("Unknown error response:", errorResponseData);
        }
      } catch (parseError) {
        console.error("Error parsing error response:", parseError);
      }
      throw new Error(errorMessage); // Throw the constructed error message
    }
    const responseData = await response.json();
    console.log("Company profile created with ID:", responseData);
    return responseData; // Return the response data (company profile)
  } catch (error) {
    console.error("Error creating company profile:", error);
    throw error; // Propagate the error back
  }
};

// Create Order
export const createOrder = async (orderData: Order): Promise<void> => {
  orderData.customerId = customerId;
  orderData.orderItems[0].productId = productId;
  const baseUrl = `${EXPO_PUBLIC_APP_API_URL}/orders`;
  const accessToken = await getBearerToken(tenantEmail, tenantPassword);

  const requestBody: string = JSON.stringify(orderData);

  try {
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: requestBody,
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! Status: ${response.status}`;
      try {
        const errorResponseData = await response.json();
        if (errorResponseData.message) {
          errorMessage += `, Message: ${errorResponseData.message}`;
        }
      } catch (parseError) {
        console.error("Error parsing error response:", parseError);
      }
      throw new Error(errorMessage);
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error("Error creating order:", error);
  }
};

// Create Carrier
export const createCarrier = async (carrierData: Carrier): Promise<any> => {
  const baseUrl = `${EXPO_PUBLIC_APP_API_URL}/transports`;
  const accessToken = await getBearerToken(tenantEmail, tenantPassword);
  const requestBody: string = JSON.stringify(carrierData);

  try {
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: requestBody,
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! Status: ${response.status}`;
      try {
        const errorResponseData = await response.json();
        // If both message and fields are present in the error response
        if (errorResponseData.message && errorResponseData.fields) {
          errorMessage += `, Message: ${errorResponseData.message}`;
          Object.entries(errorResponseData.fields).forEach(
            ([field, message]) => {
              if (field === "") {
                console.log(`Error: ${message}`);
                errorMessage += `Error: ${message}`;
              } else {
                console.log(`Field '${field}' has error: ${message}`);
                errorMessage += `Field '${field}' has error: ${message}`;
              }
            }
          );
        }
        // If only message is present
        else if (errorResponseData.message) {
          errorMessage += `, Message: ${errorResponseData.message}`;
          console.log(`Error: ${errorResponseData.message}`);
        }
        if (errorResponseData.fields) {
          Object.entries(errorResponseData.fields).forEach(
            ([field, message]) => {
              if (field === "") {
                console.log(`Error: ${message}`);
              } else {
                console.log(`Field '${field}' has error: ${message}`);
              }
            }
          );
        }
        // Handle any unexpected error structure
        else {
          console.log("Unknown error response:", errorResponseData);
        }
      } catch (parseError) {
        console.error("Error parsing error response:", parseError);
      }
      throw new Error(errorMessage); // Throw the constructed error message
    }
    const responseData = await response.json();
    console.log("Carrier created with ID:", responseData);
    return responseData; // Return the response data (carrier) here
  } catch (error) {
    console.error("Error creating carrier:", error);
    throw error; // Propagate the error back
  }
};

// Create Recipe
export const createRecipe = async (recipeData: Recipe): Promise<any> => {
  const baseUrl = `${EXPO_PUBLIC_APP_API_URL}/recipes`;
  const accessToken = await getBearerToken(tenantEmail, tenantPassword);
  const requestBody: string = JSON.stringify(recipeData);
  try {
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: requestBody,
    });
    if (!response.ok) {
      let errorMessage = `HTTP error! Status: ${response.status}`;
      try {
        const errorResponseData = await response.json();
        if (errorResponseData.message && errorResponseData.fields) {
          errorMessage += `, Message: ${errorResponseData.message}`;
          Object.entries(errorResponseData.fields).forEach(
            ([field, message]) => {
              if (field === "") {
                console.log(`Error: ${message}`);
                errorMessage += `Error: ${message}`;
              } else {
                console.log(`Field '${field}' has error: ${message}`);
                errorMessage += `Field '${field}' has error: ${message}`;
              }
            }
          );
        } else if (errorResponseData.message) {
          errorMessage += `, Message: ${errorResponseData.message}`;
          console.log(`Error: ${errorResponseData.message}`);
        }
        // If only fields are present
        else if (errorResponseData.fields) {
          Object.entries(errorResponseData.fields).forEach(
            ([field, message]) => {
              if (field === "") {
                console.log(`Error: ${message}`);
              } else {
                console.log(`Field '${field}' has error: ${message}`);
              }
            }
          );
        }
        // Handle any unexpected error structure
        else {
          console.log("Unknown error response:", errorResponseData);
        }
      } catch (parseError) {
        console.error("Error parsing error response:", parseError);
      }

      throw new Error(errorMessage); // Throw the constructed error message
    }
    const responseData = await response.json();
    console.log("Recipe created with ID:", responseData);
    return responseData; // Return the response data (recipe)
  } catch (error) {
    console.error("Error creating recipe:", error);
    throw error; // Propagate the error back
  }
};

// create Codes

export const createCodes = async (codesDataPayload: Recipe): Promise<void> => {
  const baseUrl = `${EXPO_PUBLIC_APP_API_URL}/codes`;
  const accessToken = await getBearerToken(tenantEmail, tenantPassword);

  const requestBody: string = JSON.stringify(codesDataPayload);

  try {
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: requestBody,
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! Status: ${response.status}`;
      try {
        const errorResponseData = await response.json();
        if (errorResponseData.message) {
          errorMessage += `, Message: ${errorResponseData.message}`;
        }
      } catch (parseError) {
        console.error("Error parsing error response:", parseError);
      }
      throw new Error(errorMessage);
    }

    const responseData = await response.json();
    carrierId = responseData.id;
    return responseData;
  } catch (error) {
    console.error("Error creating codes:", error);
  }
};
// create Employee
export const createEmployee = async (employee: Employee): Promise<void> => {
  const baseUrl = `${EXPO_PUBLIC_APP_API_URL}/employees`;
  const accessToken = await getBearerToken(tenantEmail, tenantPassword);

  const requestBody: string = JSON.stringify(employee);

  try {
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: requestBody,
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! Status: ${response.status}`;
      try {
        const errorResponseData = await response.json();
        if (errorResponseData.message) {
          errorMessage += `, Message: ${errorResponseData.message}`;
        }
      } catch (parseError) {
        console.error("Error parsing error response:", parseError);
      }
      throw new Error(errorMessage);
    }

    const responseData = await response.json();
    carrierId = responseData.id;
    return responseData;
  } catch (error) {
    console.error("Error creating employee:", error);
  }
};
// Function to get a single Plan Id
export const getProdPlanById = async (id: string): Promise<any> => {
  try {
    const accessToken = await getBearerToken(tenantEmail, tenantPassword);
    const url = `${EXPO_PUBLIC_APP_API_URL}/work/production-plannings/${id}`;
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    };
    const options = {
      method: "GET",
      headers,
    };
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorMsg = `Failed to fetch Production Planning data. Status: ${response.status} ${response.statusText}`;
      throw new Error(errorMsg);
    }
    const prodPlanning = await response.json();
    return prodPlanning;
  } catch (error: any) {
    console.error("Fetch error:", error);
    throw new Error(
      `Error fetching production planning for ID ${id}: ${error.message}`
    );
  }
};

// Update Production Planned Recipe
export const updatePlannedRecipe = async (data: any): Promise<void> => {
  const baseUrl = `${EXPO_PUBLIC_APP_API_URL}/work/production-plannings/${data.id}`;
  const accessToken = await getBearerToken(tenantEmail, tenantPassword);

  // Prepare data for PUT request
  const formatDataForPutRequest = {
    id: data.id,
    userId: data.userId,
    correlationType: data.correlationType,
    correlationId: data.correlationId,
    targets: await Promise.all(
      data.targets.map(
        async (target: {
          quantity: any;
          catalogId: any;
          quantity_unit: any;
          progressPercent: any;
          quantity_scalar: any;
          progressQuantity: any;
        }) => ({
          quantity: target.quantity,
          catalogId: target.catalogId,
          quantity_unit: target.quantity_unit,
          progressPercent: target.progressPercent,
          quantity_scalar: target.quantity_scalar,
          progressQuantity: target.progressQuantity,
        })
      )
    ),
    inputsSources: await Promise.all(
      data.inputsSources.map(async (inputSource: { sources: any[] }) => ({
        sources: await Promise.all(
          inputSource.sources.map(
            async (source: {
              code: any;
              name: any;
              entityId: any;
              quantity: any;
              quantity_unit: any;
              quantity_scalar: any;
            }) => ({
              code: source.code,
              name: source.name,
              entityId: source.entityId,
              quantity: source.quantity,
              quantity_unit: source.quantity_unit,
              quantity_scalar: source.quantity_scalar,
            })
          )
        ),
      }))
    ),
    startDate: data.startDate, // New start date
    endDate: data.endDate, // New end date
    repeat: data.repeat,
  };

  console.log("formatDataForPutRequest", formatDataForPutRequest);

  try {
    const response = await fetch(baseUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(formatDataForPutRequest), // Convert to JSON string
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! Status: ${response.status}`;

      // Check if response is JSON
      const contentType = response.headers.get("Content-Type");
      if (contentType && contentType.includes("application/json")) {
        try {
          const errorResponseData = await response.json();
          if (errorResponseData.message) {
            errorMessage += `, Message: ${errorResponseData.message}`;
          }
        } catch (parseError) {
          console.error("Error parsing JSON from error response:", parseError);
        }
      } else {
        // Handle non-JSON response
        const errorResponseText = await response.text();
        errorMessage += `, Message: ${errorResponseText}`;
      }

      throw new Error(errorMessage);
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error("Error updating planned recipe:", error);
  }
};
