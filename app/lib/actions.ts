"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import postgres from "postgres";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { put } from "@vercel/blob";
import { ProductState } from "./definitions";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials.";
        default:
          return "Something went wrong.";
      }
    }
    throw error;
  }
}

//productos
const ProductSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio."),
  description: z.string().optional(),
  price: z.coerce.number().gt(0, "El precio debe ser mayor a 0."),
  category_id: z.string().min(1, "Elegí una categoría."),
  stock: z.coerce.number().int().min(0),
});

export async function createProduct(
  prevState: ProductState,
  formData: FormData,
) {
  const cost = formData.get("cost");
  const purchase_id = formData.get("purchase_id") as string;
  const portion_size = formData.get("portion_size");
  const portion_unit = formData.get("portion_unit") as string;

  const validatedFields = ProductSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    category_id: formData.get("category_id"),
    stock: formData.get("stock"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Faltan campos. No se pudo crear el producto.",
    };
  }

  const { name, description, price, category_id, stock } = validatedFields.data;

  const imageFile = formData.get("image") as File;
  if (!imageFile || imageFile.size === 0) {
    return { message: "La imagen es obligatoria." };
  }

  let imageUrl: string;
  try {
    const blob = await put(imageFile.name, imageFile, {
      access: "public",
      addRandomSuffix: true,
    });
    imageUrl = blob.url;
  } catch (error) {
    console.error("Error subiendo a Blob:", error);
    return { message: "Error al subir la imagen." };
  }

  try {
    await sql`
      INSERT INTO products (name, description, price, image_url, category_id, stock, cost, purchase_id, portion_size, portion_unit)
  VALUES (
    ${name}, ${description ?? null}, ${price}, ${imageUrl}, ${category_id}, ${stock},
    ${cost ? Number(cost) : null}, ${purchase_id || null},
    ${portion_size ? Number(portion_size) : null}, ${portion_unit || null}
  )
    `;
  } catch (error) {
    return { message: "Database Error: No se pudo crear el producto." };
  }

  revalidatePath("/dashboard/products");
  redirect("/dashboard/products");
}

export async function updateProduct(
  id: string,
  currentImageUrl: string,
  prevState: ProductState,
  formData: FormData,
) {
  const cost = formData.get("cost");
  const purchase_id = formData.get("purchase_id") as string;
  const portion_size = formData.get("portion_size");
  const portion_unit = formData.get("portion_unit") as string;

  const validatedFields = ProductSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    category_id: formData.get("category_id"),
    stock: formData.get("stock"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Faltan campos. No se pudo actualizar el producto.",
    };
  }

  const { name, description, price, category_id, stock } = validatedFields.data;

  let imageUrl = currentImageUrl;
  const imageFile = formData.get("image") as File;

  if (imageFile && imageFile.size > 0) {
    try {
      const blob = await put(imageFile.name, imageFile, {
        access: "public",
        addRandomSuffix: true,
      });
      imageUrl = blob.url;
    } catch (error) {
      return { message: "Error al subir la imagen." };
    }
  }

  try {
    await sql`
     UPDATE products
  SET name = ${name}, description = ${description ?? null}, price = ${price},
      image_url = ${imageUrl}, category_id = ${category_id}, stock = ${stock},
      cost = ${cost ? Number(cost) : null}, purchase_id = ${purchase_id || null},
      portion_size = ${portion_size ? Number(portion_size) : null},
      portion_unit = ${portion_unit || null}
  WHERE id = ${id}
    `;
  } catch (error) {
    return { message: "Database Error: No se pudo actualizar el producto." };
  }

  revalidatePath("/dashboard/products");
  redirect("/dashboard/products");
}

export async function deleteProduct(id: string) {
  try {
    await sql`DELETE FROM products WHERE id = ${id}`;
    revalidatePath("/dashboard/products");
  } catch (error) {
    console.error(error);
    throw new Error("Database Error: No se pudo eliminar el producto.");
  }
}

//clientes
const CustomerSchema = z.object({
  first_name: z.string().min(1, "El nombre es obligatorio."),
  last_name: z.string().min(1, "El apellido es obligatorio."),
  dni: z.string().optional(),
  email: z.string().email("Email inválido.").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
});

export type CustomerState = {
  errors?: {
    first_name?: string[];
    last_name?: string[];
    dni?: string[];
    email?: string[];
    phone?: string[];
    address?: string[];
    city?: string[];
    postal_code?: string[];
  };
  message?: string | null;
};

export async function createCustomer(
  prevState: CustomerState,
  formData: FormData,
) {
  const validatedFields = CustomerSchema.safeParse({
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    dni: formData.get("dni"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    city: formData.get("city"),
    postal_code: formData.get("postal_code"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Faltan campos. No se pudo crear el cliente.",
    };
  }

  const {
    first_name,
    last_name,
    dni,
    email,
    phone,
    address,
    city,
    postal_code,
  } = validatedFields.data;

  try {
    await sql`
      INSERT INTO customers (first_name, last_name, dni, email, phone, address, city, postal_code)
      VALUES (
        ${first_name}, ${last_name}, ${dni || null}, ${email || null},
        ${phone || null}, ${address || null}, ${city || null}, ${postal_code || null}
      )
    `;
  } catch (error) {
    console.error("Error creando cliente:", error);
    return { message: "Database Error: No se pudo crear el cliente." };
  }

  revalidatePath("/dashboard/customers");
  redirect("/dashboard/customers");
}

export async function updateCustomer(
  id: string,
  prevState: CustomerState,
  formData: FormData,
) {
  const validatedFields = CustomerSchema.safeParse({
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    dni: formData.get("dni"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    city: formData.get("city"),
    postal_code: formData.get("postal_code"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Faltan campos. No se pudo actualizar el cliente.",
    };
  }

  const {
    first_name,
    last_name,
    dni,
    email,
    phone,
    address,
    city,
    postal_code,
  } = validatedFields.data;

  try {
    await sql`
      UPDATE customers
      SET first_name = ${first_name}, last_name = ${last_name}, dni = ${dni || null},
          email = ${email || null}, phone = ${phone || null}, address = ${address || null},
          city = ${city || null}, postal_code = ${postal_code || null}
      WHERE id = ${id}
    `;
  } catch (error) {
    return { message: "Database Error: No se pudo actualizar el cliente." };
  }

  revalidatePath("/dashboard/customers");
  redirect("/dashboard/customers");
}

export async function deleteCustomer(id: string) {
  try {
    await sql`DELETE FROM customers WHERE id = ${id}`;
    revalidatePath("/dashboard/customers");
  } catch (error) {
    console.error(error);
    throw new Error("Database Error: No se pudo eliminar el cliente.");
  }
}

//categorias
const CategorySchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio."),
});

export type CategoryState = {
  errors?: {
    name?: string[];
  };
  message?: string | null;
};

export async function createCategory(
  prevState: CategoryState,
  formData: FormData,
) {
  const validatedFields = CategorySchema.safeParse({
    name: formData.get("name"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Faltan campos. No se pudo crear la categoría.",
    };
  }

  const { name } = validatedFields.data;

  let imageUrl: string | null = null;
  const imageFile = formData.get("image") as File;
  if (imageFile && imageFile.size > 0) {
    try {
      const blob = await put(imageFile.name, imageFile, {
        access: "public",
        addRandomSuffix: true,
      });
      imageUrl = blob.url;
    } catch (error) {
      return { message: "Error al subir la imagen." };
    }
  }

  try {
    await sql`INSERT INTO categories (name, image_url) VALUES (${name}, ${imageUrl})`;
  } catch (error) {
    return {
      message:
        "Database Error: No se pudo crear la categoría (¿ya existe ese nombre?).",
    };
  }

  revalidatePath("/dashboard/categories");
  redirect("/dashboard/categories");
}

export async function updateCategory(
  id: string,
  prevState: CategoryState,
  formData: FormData,
) {
  const validatedFields = CategorySchema.safeParse({
    name: formData.get("name"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Faltan campos. No se pudo actualizar la categoría.",
    };
  }

  const { name } = validatedFields.data;

  let imageUrl: string | null = null;
  const imageFile = formData.get("image") as File;
  if (imageFile && imageFile.size > 0) {
    try {
      const blob = await put(imageFile.name, imageFile, {
        access: "public",
        addRandomSuffix: true,
      });
      imageUrl = blob.url;
    } catch (error) {
      return { message: "Error al subir la imagen." };
    }
  }

  try {
    await sql`UPDATE categories SET name = ${name}, image_url = ${imageUrl} WHERE id = ${id}`;
  } catch (error) {
    return { message: "Database Error: No se pudo actualizar la categoría." };
  }

  revalidatePath("/dashboard/categories");
  redirect("/dashboard/categories");
}

export async function deleteCategory(id: string) {
  try {
    await sql`DELETE FROM categories WHERE id = ${id}`;
    revalidatePath("/dashboard/categories");
  } catch (error) {
    console.error(error);
    throw new Error(
      "Database Error: No se pudo eliminar la categoría (puede tener productos asociados).",
    );
  }
}

//ventas

const SaleItemSchema = z.object({
  item_id: z.string().min(1),
  item_type: z.enum(['product', 'kit']),
  item_name: z.string().min(1),
  quantity: z.coerce.number().int().gt(0),
  unit_price: z.coerce.number().gt(0),
});

const SaleSchema = z.object({
  customer_type: z.enum(['registered', 'counter']),
  customer_id: z.string().optional(),
  customer_name: z.string().optional(),
  items: z.array(SaleItemSchema).min(1, 'Agregá al menos un producto o kit.'),
});

export type SaleState = {
  message?: string | null;
};

export async function createSale(prevState: SaleState, formData: FormData) {
  const customer_type = formData.get('customer_type') as string;
  const customer_id = formData.get('customer_id') as string;
  const customer_name = formData.get('customer_name') as string;
  const itemsRaw = formData.get('items') as string;

  let items;
  try {
    items = JSON.parse(itemsRaw);
  } catch {
    return { message: 'Error al leer los productos de la venta.' };
  }

  const validatedFields = SaleSchema.safeParse({
    customer_type,
    customer_id: customer_id || undefined,
    customer_name: customer_name || undefined,
    items,
  });

  if (!validatedFields.success) {
    return { message: 'Faltan datos. Revisá el cliente y los productos agregados.' };
  }

  const data = validatedFields.data;
  const finalCustomerId = data.customer_type === 'registered' ? (data.customer_id ?? null) : null;
  const finalCustomerName = data.customer_type === 'counter' ? (data.customer_name || null) : null;
  const total = data.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

  try {
    // Verificamos stock disponible antes de confirmar
    for (const item of data.items) {
      const table = item.item_type === 'kit' ? 'kits' : 'products';
      const stockCheck = await sql`
        SELECT stock FROM ${sql(table)} WHERE id = ${item.item_id}
      `;
      const currentStock = stockCheck[0]?.stock ?? 0;
      if (currentStock < item.quantity) {
        return {
          message: `Stock insuficiente para "${item.item_name}" (disponible: ${currentStock}).`,
        };
      }
    }

    await sql.begin(async (sql) => {
      const [sale] = await sql`
        INSERT INTO sales (customer_id, customer_name, total)
        VALUES (${finalCustomerId}, ${finalCustomerName}, ${total})
        RETURNING id
      `;

      for (const item of data.items) {
        await sql`
          INSERT INTO sale_items (sale_id, product_id, kit_id, item_type, item_name, quantity, unit_price)
          VALUES (
            ${sale.id},
            ${item.item_type === 'product' ? item.item_id : null},
            ${item.item_type === 'kit' ? item.item_id : null},
            ${item.item_type},
            ${item.item_name},
            ${item.quantity},
            ${item.unit_price}
          )
        `;

        const table = item.item_type === 'kit' ? 'kits' : 'products';
        await sql`
          UPDATE ${sql(table)} SET stock = stock - ${item.quantity} WHERE id = ${item.item_id}
        `;
      }
    });
  } catch (error) {
    console.error('Error creando venta:', error);
    return { message: 'Database Error: No se pudo registrar la venta.' };
  }

  revalidatePath('/dashboard/sales');
  revalidatePath('/dashboard/products');
  revalidatePath('/dashboard/kits');
  redirect('/dashboard/sales');
}

//comprado
const PurchaseSchema = z.object({
  purchase_date: z.string().min(1, "La fecha es obligatoria."),
  supplier: z.string().optional(),
  description: z.string().min(1, "La descripción es obligatoria."),
  quantity: z.coerce.number().gt(0, "La cantidad debe ser mayor a 0."),
  unit: z.enum(["kg", "g", "unit"]),
  total_cost: z.coerce.number().gt(0, "El costo debe ser mayor a 0."),
});

export type PurchaseState = {
  errors?: {
    purchase_date?: string[];
    description?: string[];
    quantity?: string[];
    total_cost?: string[];
  };
  message?: string | null;
};

export async function createPurchase(
  prevState: PurchaseState,
  formData: FormData,
) {
  const validatedFields = PurchaseSchema.safeParse({
    purchase_date: formData.get("purchase_date"),
    supplier: formData.get("supplier"),
    description: formData.get("description"),
    quantity: formData.get("quantity"),
    unit: formData.get("unit"),
    total_cost: formData.get("total_cost"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Faltan campos. No se pudo registrar la compra.",
    };
  }

  const { purchase_date, supplier, description, quantity, unit, total_cost } =
    validatedFields.data;

  try {
    await sql`
      INSERT INTO purchases (purchase_date, supplier, description, quantity, unit, total_cost)
      VALUES (${purchase_date}, ${supplier || null}, ${description}, ${quantity}, ${unit}, ${total_cost})
    `;
  } catch (error) {
    return { message: "Database Error: No se pudo registrar la compra." };
  }

  revalidatePath("/dashboard/purchases");
  redirect("/dashboard/purchases");
}

//kits
const KitItemSchema = z.object({
  product_id: z.string().min(1),
  product_name: z.string().min(1),
  quantity: z.coerce.number().gt(0),
  unit: z.string().min(1),
  item_cost: z.coerce.number().gte(0),
});

const KitSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio."),
  description: z.string().optional(),
  price: z.coerce.number().gt(0, "El precio debe ser mayor a 0."),
  cost: z.coerce.number().gte(0),
  items: z.array(KitItemSchema).min(1, "Agregá al menos un producto al kit."),
});

export type KitState = {
  message?: string | null;
};

function convertUnits(value: number, from: string, to: string) {
  if (from === to) return value;
  if (from === "kg" && to === "g") return value * 1000;
  if (from === "g" && to === "kg") return value / 1000;
  return value;
}

const KitSchemaExtended = KitSchema.extend({
  build_quantity: z.coerce
    .number()
    .int()
    .gt(0, "Indicá cuántos kits vas a armar."),
});

export async function createKit(prevState: KitState, formData: FormData) {
  const itemsRaw = formData.get("items") as string;

  let items;
  try {
    items = JSON.parse(itemsRaw);
  } catch {
    return { message: "Error al leer los productos del kit." };
  }

  const validatedFields = KitSchemaExtended.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    cost: formData.get("cost"),
    build_quantity: formData.get("build_quantity"),
    items,
  });

  if (!validatedFields.success) {
    return {
      message:
        "Faltan datos. Revisá nombre, precio, cantidad y los productos agregados.",
    };
  }

  const {
    name,
    description,
    price,
    cost,
    build_quantity,
    items: kitItems,
  } = validatedFields.data;

  const imageFile = formData.get("image") as File;
  if (!imageFile || imageFile.size === 0) {
    return { message: "La foto del kit es obligatoria." };
  }

  // Validamos stock disponible de cada producto antes de confirmar
  const deductions: { product_id: string; units: number }[] = [];
  for (const item of kitItems) {
    const productData = await sql`
      SELECT stock, portion_size, portion_unit FROM products WHERE id = ${item.product_id}
    `;
    const product = productData[0];
    if (!product) {
      return { message: `No se encontró el producto "${item.product_name}".` };
    }

    const qtyInPortionUnit = convertUnits(
      item.quantity,
      item.unit,
      product.portion_unit,
    );
    const unitsNeededPerKit = qtyInPortionUnit / product.portion_size;
    const totalUnitsNeeded = Math.round(unitsNeededPerKit * build_quantity);

    if (product.stock < totalUnitsNeeded) {
      return {
        message: `Stock insuficiente de "${item.product_name}" para armar ${build_quantity} kit(s) (necesitás ${totalUnitsNeeded}, hay ${product.stock}).`,
      };
    }

    deductions.push({ product_id: item.product_id, units: totalUnitsNeeded });
  }

  let imageUrl: string;
  try {
    const blob = await put(imageFile.name, imageFile, {
      access: "public",
      addRandomSuffix: true,
    });
    imageUrl = blob.url;
  } catch (error) {
    return { message: "Error al subir la imagen." };
  }

  try {
    await sql.begin(async (sql) => {
      const [kit] = await sql`
        INSERT INTO kits (name, description, image_url, price, cost, stock)
        VALUES (${name}, ${description ?? null}, ${imageUrl}, ${price}, ${cost}, ${build_quantity})
        RETURNING id
      `;

      for (const item of kitItems) {
        await sql`
          INSERT INTO kit_items (kit_id, product_id, product_name, quantity, unit, item_cost)
          VALUES (${kit.id}, ${item.product_id}, ${item.product_name}, ${item.quantity}, ${item.unit}, ${item.item_cost})
        `;
      }

      for (const d of deductions) {
        await sql`UPDATE products SET stock = stock - ${d.units} WHERE id = ${d.product_id}`;
      }
    });
  } catch (error) {
    console.error("Error creando kit:", error);
    return { message: "Database Error: No se pudo crear el kit." };
  }

  revalidatePath("/dashboard/kits");
  revalidatePath("/dashboard/products");
  redirect("/dashboard/kits");
}

export async function deleteKit(id: string) {
  try {
    await sql.begin(async (sql) => {
      const items = await sql`
        SELECT product_id, quantity, unit FROM kit_items WHERE kit_id = ${id}
      `;

      const kitData = await sql`SELECT stock FROM kits WHERE id = ${id}`;
      const kitStock = kitData[0]?.stock ?? 0;

      for (const item of items) {
        const productData = await sql`
          SELECT portion_size, portion_unit FROM products WHERE id = ${item.product_id}
        `;
        const product = productData[0];
        if (!product) continue;

        const qtyInPortionUnit = convertUnits(Number(item.quantity), item.unit, product.portion_unit);
        const unitsPerKit = qtyInPortionUnit / product.portion_size;
        const totalUnitsToRestore = Math.round(unitsPerKit * kitStock);

        await sql`
          UPDATE products SET stock = stock + ${totalUnitsToRestore} WHERE id = ${item.product_id}
        `;
      }

      await sql`DELETE FROM kits WHERE id = ${id}`;
    });

    revalidatePath('/dashboard/kits');
    revalidatePath('/dashboard/products');
  } catch (error) {
    console.error(error);
    throw new Error('Database Error: No se pudo eliminar el kit.');
  }
}

export async function updateKit(
  id: string,
  currentImageUrl: string,
  prevState: KitState,
  formData: FormData,
) {
  const itemsRaw = formData.get("items") as string;

  let items;
  try {
    items = JSON.parse(itemsRaw);
  } catch {
    return { message: "Error al leer los productos del kit." };
  }

  const validatedFields = KitSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    cost: formData.get("cost"),
    items,
  });

  if (!validatedFields.success) {
    return {
      message:
        "Faltan datos. Revisá el nombre, precio y los productos agregados.",
    };
  }

  const {
    name,
    description,
    price,
    cost,
    items: kitItems,
  } = validatedFields.data;

  let imageUrl = currentImageUrl;
  const imageFile = formData.get("image") as File;
  if (imageFile && imageFile.size > 0) {
    try {
      const blob = await put(imageFile.name, imageFile, {
        access: "public",
        addRandomSuffix: true,
      });
      imageUrl = blob.url;
    } catch (error) {
      return { message: "Error al subir la imagen." };
    }
  }

  try {
    await sql.begin(async (sql) => {
      await sql`
        UPDATE kits
        SET name = ${name}, description = ${description ?? null}, image_url = ${imageUrl},
            price = ${price}, cost = ${cost}
        WHERE id = ${id}
      `;

      await sql`DELETE FROM kit_items WHERE kit_id = ${id}`;

      for (const item of kitItems) {
        await sql`
          INSERT INTO kit_items (kit_id, product_id, product_name, quantity, unit, item_cost)
          VALUES (${id}, ${item.product_id}, ${item.product_name}, ${item.quantity}, ${item.unit}, ${item.item_cost})
        `;
      }
    });
  } catch (error) {
    console.error("Error actualizando kit:", error);
    return { message: "Database Error: No se pudo actualizar el kit." };
  }

  revalidatePath("/dashboard/kits");
  redirect(`/dashboard/kits/${id}`);
}
