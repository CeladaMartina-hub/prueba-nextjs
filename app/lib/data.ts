import postgres from "postgres";
import { Customer, Product, Sale } from "./definitions";
import { Category } from "./definitions";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export async function fetchCardData() {
  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const customerCountPromise = sql`SELECT COUNT(*) FROM customers`;

    const data = await Promise.all([customerCountPromise]);

    const numberOfInvoices = Number(data[0][0].count ?? "0");

    return {
      numberOfCustomers: numberOfInvoices,
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch card data.");
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
        products.category_id,
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

//categorias
export async function fetchCategoryById(id: string) {
  try {
    const data = await sql<Category[]>`
      SELECT * FROM categories WHERE id = ${id}
    `;
    return data[0];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch category.");
  }
}

//ventas
export async function fetchSales() {
  try {
    const sales = await sql<(Sale & { customer_full_name: string | null })[]>`
      SELECT
        sales.id,
        sales.customer_id,
        sales.customer_name,
        sales.sale_date,
        sales.total,
        CASE
          WHEN customers.id IS NOT NULL
          THEN customers.first_name || ' ' || customers.last_name
          ELSE sales.customer_name
        END AS customer_full_name
      FROM sales
      LEFT JOIN customers ON sales.customer_id = customers.id
      ORDER BY sales.sale_date DESC
    `;
    return sales;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch sales.");
  }
}

export async function fetchSaleById(id: string) {
  try {
    const saleData = await sql<
      (Sale & { customer_full_name: string | null })[]
    >`
      SELECT
        sales.id,
        sales.customer_id,
        sales.customer_name,
        sales.sale_date,
        sales.total,
        CASE
          WHEN customers.id IS NOT NULL
          THEN customers.first_name || ' ' || customers.last_name
          ELSE sales.customer_name
        END AS customer_full_name
      FROM sales
      LEFT JOIN customers ON sales.customer_id = customers.id
      WHERE sales.id = ${id}
    `;

    const items = await sql`
      SELECT product_id, product_name, quantity, unit_price
      FROM sale_items
      WHERE sale_id = ${id}
    `;

    if (!saleData[0]) return undefined;

    return { ...saleData[0], items };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch sale.");
  }
}

// Traemos productos con stock disponible, para el selector del formulario
export async function fetchProductsForSale() {
  try {
    const products = await sql<
      { id: string; name: string; price: number; stock: number }[]
    >`
      SELECT id, name, price, stock FROM products ORDER BY name ASC
    `;
    return products;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch products.");
  }
}
