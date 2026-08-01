import postgres from "postgres";
import {
  Customer,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  Product,
  Revenue,
} from "./definitions";
import { formatCurrency } from "./utils";
import { Category } from "./definitions";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export async function fetchRevenue() {
  try {
    // Artificially delay a response for demo purposes.
    // Don't do this in production :)

    // console.log('Fetching revenue data...');
    // await new Promise((resolve) => setTimeout(resolve, 3000));

    const data = await sql<Revenue[]>`SELECT * FROM revenue`;

    // console.log('Data fetch completed after 3 seconds.');

    return data;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch revenue data.");
  }
}

export async function fetchCardData() {
  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const customerCountPromise = sql`SELECT COUNT(*) FROM customers`;

    const data = await Promise.all([customerCountPromise]);

    const numberOfInvoices = Number(data[0][0].count ?? "0");

    return {
      numberOfCustomers: numberOfInvoices      
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch card data.");
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoices = await sql<InvoicesTable[]>`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        customers.name,
        customers.email,
        customers.image_url
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.date::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`}
      ORDER BY invoices.date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return invoices;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoices.");
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
    const data = await sql`SELECT COUNT(*)
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE
      customers.name ILIKE ${`%${query}%`} OR
      customers.email ILIKE ${`%${query}%`} OR
      invoices.amount::text ILIKE ${`%${query}%`} OR
      invoices.date::text ILIKE ${`%${query}%`} OR
      invoices.status ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of invoices.");
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    const data = await sql<InvoiceForm[]>`
      SELECT
        invoices.id,
        invoices.customer_id,
        invoices.amount,
        invoices.status
      FROM invoices
      WHERE invoices.id = ${id};
    `;

    const invoice = data.map((invoice) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
    }));

    return invoice[0];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoice.");
  }
}

export async function fetchCustomers() {
  try {
    const customers = await sql<Customer[]>`
      SELECT * FROM customers
    `;
    return customers;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch customers.");
  }
}

export async function fetchCustomerById(id: string) {
  try {
    const data = await sql<Customer[]>`
      SELECT * FROM customers WHERE id = ${id}
    `;
    return data[0];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch customer.");
  }
}

export async function fetchCategories() {
  try {
    const categories = await sql<Category[]>`
      SELECT id, name FROM categories ORDER BY name ASC
    `;
    return categories;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch categories.");
  }
}

export async function fetchProducts() {
  try {
    const products = await sql<(Product & { category_name: string })[]>`
      SELECT
        products.id,
        products.name,
        products.price,
        products.image_url,
        products.stock,
        categories.name AS category_name
      FROM products
      JOIN categories ON products.category_id = categories.id
      ORDER BY products.created_at DESC
    `;
    return products;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch products.");
  }
}

export async function fetchAllProducts() {
  try {
    const products = await sql<(Product & { category_name: string })[]>`
      SELECT
        products.id,
        products.name,
        products.price,
        products.image_url,
        categories.name AS category_name
      FROM products
      JOIN categories ON products.category_id = categories.id
      ORDER BY products.created_at DESC
    `;
    return products;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch products.");
  }
}

export async function fetchProductById(id: string) {
  try {
    const data = await sql<(Product & { category_name: string })[]>`
      SELECT
        products.id,
        products.name,
        products.description,
        products.price,
        products.image_url,
        products.stock,
        categories.name AS category_name
      FROM products
      JOIN categories ON products.category_id = categories.id
      WHERE products.id = ${id}
    `;
    return data[0];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch product.");
  }
}
