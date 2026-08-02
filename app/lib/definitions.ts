// This file contains type definitions for your data.
// It describes the shape of the data, and what data type each property should accept.
// For simplicity of teaching, we're manually defining these types.
// However, these types are generated automatically if you're using an ORM such as Prisma.
export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};

export type CustomersTableType = {
  id: string;
  name: string;
  email: string;
  image_url: string;
  total_invoices: number;
  total_pending: number;
  total_paid: number;
};

export type FormattedCustomersTable = {
  id: string;
  name: string;
  email: string;
  image_url: string;
  total_invoices: number;
  total_pending: string;
  total_paid: string;
};

export type CustomerField = {
  id: string;
  name: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: string;
  stock: number;
};

export type ProductState = {
  errors?: {
    name?: string[];
    description?: string[];
    price?: string[];
    category_id?: string[];
    stock?: string[];
  };
  message?: string | null;
};

export type Category = {
  id: string;
  name: string;
  image_url: string | null;
};

export type Customer = {
  id: string;
  first_name: string;
  last_name: string;
  dni: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
};

export type Sale = {
  id: string;
  customer_id: string | null;
  customer_name: string | null;
  sale_date: string;
  total: number;
};

export type SaleItem = {
  id: string;
  sale_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
};

export type SaleWithItems = Sale & {
  customer_full_name: string | null;
  items: {
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
  }[];
};

//comprado

export type Purchase = {
  id: string;
  purchase_date: string;
  supplier: string | null;
  description: string;
  quantity: number;
  unit: string;
  total_cost: number;
};