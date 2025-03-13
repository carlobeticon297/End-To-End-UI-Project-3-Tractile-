// Create Product types
export type Categorization = {
  name: string;
  description: string;
  price: number;
  min?: number;
  max?: number;
  toInfinity?: boolean;
};

export type ProductPayload = {
  name: string;
  variant: string;
  code: string;
  price: number;
  traits: string[];
  unitKind: string;
  unitOfMeasurement: string;
  attributes: any[]; // assuming attributes can be any structure
  weightPerUnit: string;
  casingOptions?: any[]; // optional
  categorizations: Categorization[];
  categoryType: string;
};

// Create Supplier

export type Supplier = {
  supplierName: string;
  supplierCode: string;
  contactName: string | null;
  contacts: Contact[];
  supplies: any[]; // Define a more specific type if possible
  supplierProductPrices: any[]; // Define a more specific type if possible
  defaultPurchaseOrder: any[]; // Define a more specific type if possible
  email: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  country: string | null;
  postalCode: string | null;
  phoneNumber: string | null;
  cellNumber: string | null;
  faxNumber: string | null;
};

export type Contact = {
  name: string;
  email: string;
  phone: string;
};

export type Customer = {
  companyName: string;
  locations: any[];
  attributes: any;
  contacts: any[];
  defaultCarrierId: string;
  defaultOrder: any[];
  currency: string | null;
  usedBy: any;
  code: string | null;
  taxRateId: string | null;
};

export type Profile = {
  companyName: string;
  companyAddress: string;
  companyCity: string;
  companyProvince: string;
  companyCountry: string;
  companyPostalCode: string;
  companyEmail: string;
  companyPhone: string;
};

export type Order = {
  shortId: string;
  customerId: string;
  dueDate: string;
  currency: string;
  orderItems: any[];
};

export type Carrier = {
  companyName: string;
  contactName: string;
  phoneNumber: string;
  address: string;
  city: string;
  province: string;
  country: string;
  postalCode: string;
};

export type Recipe = {
  name: string;
  description: string;
  inputs: any[];
  outputs: any[];
  instructions: any[];
  type: string;
};

export type Employee = {
  firstName: string;
  lastName: string;
  type: string;
};
