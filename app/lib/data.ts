import postgres from "postgres";
import { Customer, Product, Purchase, Sale, Category } from "./definitions";

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

//products
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

export async function fetchFilteredProducts(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const products = await sql<(Product & { category_name: string })[]>`
      select products.id,
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
      WHERE products.name ILIKE ${`%${query}%`} OR products.description ILIKE ${`%${query}%`}
      ORDER BY products.created_at DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;
    return products;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch products.");
  }
}

export async function fetchProductsPages(query: string) {
  try {
    const data = await sql`
      SELECT COUNT(*) FROM products
      WHERE name ILIKE ${`%${query}%`} OR description ILIKE ${`%${query}%`}
    `;
    return Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of products.");
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
      SELECT product_id, kit_id, item_type, item_name, quantity, unit_price
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

export async function fetchProductByCategoryId(categoryId: string) {
  try {
    const products = await sql<(Product & { category_name: string })[]>`
      SELECT
        products.id,
        products.name,
        products.price,
        products.image_url,
        categories.name AS category_name
      FROM products
      JOIN categories
        ON products.category_id = categories.id
      WHERE products.category_id = ${categoryId}
      ORDER BY products.created_at DESC
    `;

    return products;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch products by category.");
  }
}

const PUBLIC_ITEMS_PER_PAGE = 8;

export async function fetchPaginatedProducts(
  categoryId: string | undefined,
  currentPage: number,
) {
  const offset = (currentPage - 1) * PUBLIC_ITEMS_PER_PAGE;

  try {
    const products = categoryId
      ? await sql<(Product & { category_name: string })[]>`
          SELECT products.id, products.name, products.price, products.image_url, categories.name AS category_name
          FROM products
          JOIN categories ON products.category_id = categories.id
          WHERE products.category_id = ${categoryId}
          ORDER BY products.created_at DESC
          LIMIT ${PUBLIC_ITEMS_PER_PAGE} OFFSET ${offset}
        `
      : await sql<(Product & { category_name: string })[]>`
          SELECT products.id, products.name, products.price, products.image_url, categories.name AS category_name
          FROM products
          JOIN categories ON products.category_id = categories.id
          ORDER BY products.created_at DESC
          LIMIT ${PUBLIC_ITEMS_PER_PAGE} OFFSET ${offset}
        `;
    return products;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch products.");
  }
}

export async function fetchPublicProductsPages(categoryId: string | undefined) {
  try {
    const data = categoryId
      ? await sql`SELECT COUNT(*) FROM products WHERE category_id = ${categoryId}`
      : await sql`SELECT COUNT(*) FROM products`;
    return Math.ceil(Number(data[0].count) / PUBLIC_ITEMS_PER_PAGE);
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of products.");
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

const ITEMS_PER_PAGE = 8;

export async function fetchFilteredPurchases(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const purchases = await sql<Purchase[]>`
      SELECT * FROM purchases
      WHERE description ILIKE ${`%${query}%`} OR supplier ILIKE ${`%${query}%`}
      ORDER BY purchase_date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;
    return purchases;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch purchases.");
  }
}

export async function fetchPurchasesPages(query: string) {
  try {
    const data = await sql`
      SELECT COUNT(*) FROM purchases
      WHERE description ILIKE ${`%${query}%`} OR supplier ILIKE ${`%${query}%`}
    `;
    return Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of purchases.");
  }
}

//embolsados disponibles
export async function fetchPackagingPurchases() {
  try {
    const purchases = await sql<
      { id: string; description: string; quantity: number; total_cost: number }[]
    >`
      SELECT id, description, quantity, total_cost
      FROM purchases
      WHERE is_packaging = true
      ORDER BY purchase_date DESC
    `;
    return purchases;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch packaging purchases.');
  }
}

//kits
export async function fetchProductsForKit() {
  try {
    const products = await sql<
      {
        id: string;
        name: string;
        cost: number | null;
        price: number | null;
        stock: number;
        portion_size: number | null;
        portion_unit: string | null;
      }[]
    >`
      SELECT id, name, cost, price, stock, portion_size, portion_unit
      FROM products
      WHERE price IS NOT NULL AND portion_size IS NOT NULL
      ORDER BY name ASC
    `;
    return products;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch products.");
  }
}

export async function fetchKits() {
  try {
    const kits = await sql<
      {
        id: string;
        name: string;
        image_url: string;
        price: number;
        cost: number;
      }[]
    >`
      SELECT id, name, image_url, price, cost FROM kits ORDER BY created_at DESC
    `;
    return kits;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch kits.");
  }
}

export async function fetchKitById(id: string) {
  try {
    const kitData = await sql<
      {
        id: string;
        name: string;
        description: string | null;
        image_url: string;
        price: number;
        cost: number;
      }[]
    >`
      SELECT id, name, description, image_url, price, cost FROM kits WHERE id = ${id}
    `;

    if (!kitData[0]) return undefined;

    const items = await sql<
      {
        product_id: string;
        product_name: string;
        quantity: number;
        unit: string;
        item_cost: number;
      }[]
    >`
      SELECT product_id, product_name, quantity, unit, item_cost
      FROM kit_items
      WHERE kit_id = ${id}
    `;

    return { ...kitData[0], items };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch kit.");
  }
}

export async function fetchKitsForSale() {
  try {
    const kits = await sql<
      { id: string; name: string; price: number; stock: number }[]
    >`
      SELECT id, name, price, stock FROM kits WHERE stock > 0 ORDER BY name ASC
    `;
    return kits;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch kits.");
  }
}

export async function fetchPublicKits() {
  try {
    const kits = await sql<
      {
        id: string;
        name: string;
        image_url: string;
        price: number;
        stock: number;
      }[]
    >`
      SELECT id, name, image_url, price, stock
      FROM kits
      WHERE stock > 0
      ORDER BY created_at DESC
    `;
    return kits;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch kits.");
  }
}

//exportar
export async function fetchAllProductsForExport(query: string = '') {
  try {
    const data = await sql`
      SELECT
        products.name,
        categories.name AS category_name,
        products.price,
        products.stock
      FROM products
      LEFT JOIN categories ON products.category_id = categories.id
      WHERE
        products.name ILIKE ${`%${query}%`} OR
        categories.name ILIKE ${`%${query}%`}
      ORDER BY products.name ASC
    `;
    return data; // <-- antes era data.rows
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('No se pudieron obtener los productos para exportar.');
  }
}