import postgres from "postgres";
import { Customer, Product, Purchase, Sale } from "./definitions";
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
  products.cost,
  products.purchase_id,
  products.portion_size,
  products.portion_unit,
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

//filtrado de reporte de ingresos
export async function fetchRevenueSummary() {
  try {
    const today = await sql`
      SELECT COALESCE(SUM(total), 0) AS total
      FROM sales
      WHERE sale_date >= CURRENT_DATE
    `;

    const thisWeek = await sql`
      SELECT COALESCE(SUM(total), 0) AS total
      FROM sales
      WHERE sale_date >= date_trunc('week', CURRENT_DATE)
    `;

    const thisMonth = await sql`
      SELECT COALESCE(SUM(total), 0) AS total
      FROM sales
      WHERE sale_date >= date_trunc('month', CURRENT_DATE)
    `;

    return {
      today: Number(today[0].total),
      thisWeek: Number(thisWeek[0].total),
      thisMonth: Number(thisMonth[0].total),
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch revenue summary.");
  }
}

// Para el gráfico: ventas agrupadas por día, últimos 30 días
export async function fetchDailyRevenue() {
  try {
    const data = await sql<{ day: string; total: number }[]>`
      SELECT
        TO_CHAR(sale_date, 'YYYY-MM-DD') AS day,
        SUM(total) AS total
      FROM sales
      WHERE sale_date >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY day
      ORDER BY day ASC
    `;
    return data;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch daily revenue.");
  }
}

//home
export async function fetchCategoriesWithImage() {
  try {
    const categories = await sql<Category[]>`
      SELECT id, name, image_url FROM categories ORDER BY name ASC
    `;
    return categories;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch categories.");
  }
}

//comprado
export async function fetchPurchases() {
  try {
    const purchases = await sql<Purchase[]>`
      SELECT * FROM purchases ORDER BY purchase_date DESC
    `;
    return purchases;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch purchases.");
  }
}

export async function fetchPurchaseById(id: string) {
  try {
    const data = await sql<Purchase[]>`
      SELECT * FROM purchases WHERE id = ${id}
    `;
    return data[0];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch purchase.");
  }
}

export async function fetchPurchasesForSelect() {
  try {
    const purchases = await sql<
      {
        id: string;
        description: string;
        quantity: number;
        unit: string;
        total_cost: number;
      }[]
    >`
      SELECT id, description, quantity, unit, total_cost
      FROM purchases
      ORDER BY purchase_date DESC
    `;
    return purchases;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch purchases.");
  }
}
