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
  console.log("name:", formData.get("name"));
  console.log("price:", formData.get("price"));
  console.log("category_id:", formData.get("category_id"));
  console.log("image:", formData.get("image"));

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

  console.log("Imagen subida OK:", imageUrl);

  try {
    await sql`
      INSERT INTO products (name, description, price, image_url, category_id, stock)
      VALUES (${name}, ${description ?? null}, ${price}, ${imageUrl}, ${category_id}, ${stock})
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
          image_url = ${imageUrl}, category_id = ${category_id}, stock = ${stock}
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
  product_id: z.string().min(1),
  product_name: z.string().min(1),
  quantity: z.coerce.number().int().gt(0),
  unit_price: z.coerce.number().gt(0),
});

const SaleSchema = z.object({
  customer_type: z.enum(["registered", "counter"]),
  customer_id: z.string().optional(),
  customer_name: z.string().optional(),
  items: z.array(SaleItemSchema).min(1, "Agregá al menos un producto."),
});

export type SaleState = {
  message?: string | null;
};

export async function createSale(prevState: SaleState, formData: FormData) {
  const customer_type = formData.get("customer_type") as string;
  const customer_id = formData.get("customer_id") as string;
  const customer_name = formData.get("customer_name") as string;
  const itemsRaw = formData.get("items") as string;

  let items;
  try {
    items = JSON.parse(itemsRaw);
  } catch {
    return { message: "Error al leer los productos de la venta." };
  }

  const validatedFields = SaleSchema.safeParse({
    customer_type,
    customer_id: customer_id || undefined,
    customer_name: customer_name || undefined,
    items,
  });

  if (!validatedFields.success) {
    return {
      message: "Faltan datos. Revisá el cliente y los productos agregados.",
    };
  }

  const data = validatedFields.data;
  const finalCustomerId =
    data.customer_type === "registered" ? (data.customer_id ?? null) : null;
  const finalCustomerName =
    data.customer_type === "counter" ? data.customer_name || null : null;
  const total = data.items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0,
  );

  try {
    // Verificamos stock disponible antes de confirmar
    for (const item of data.items) {
      const stockCheck = await sql`
        SELECT stock FROM products WHERE id = ${item.product_id}
      `;
      const currentStock = stockCheck[0]?.stock ?? 0;
      if (currentStock < item.quantity) {
        return {
          message: `Stock insuficiente para "${item.product_name}" (disponible: ${currentStock}).`,
        };
      }
    }

    // Transacción: crea venta, items, y descuenta stock, todo o nada
    await sql.begin(async (sql) => {
      const [sale] = await sql`
        INSERT INTO sales (customer_id, customer_name, total)
        VALUES (${finalCustomerId ?? null}, ${finalCustomerName ?? null}, ${total})
        RETURNING id
      `;

      for (const item of data.items) {
        await sql`
          INSERT INTO sale_items (sale_id, product_id, product_name, quantity, unit_price)
          VALUES (${sale.id}, ${item.product_id}, ${item.product_name}, ${item.quantity}, ${item.unit_price})
        `;

        await sql`
          UPDATE products SET stock = stock - ${item.quantity} WHERE id = ${item.product_id}
        `;
      }
    });
  } catch (error) {
    console.error("Error creando venta:", error);
    return { message: "Database Error: No se pudo registrar la venta." };
  }

  revalidatePath("/dashboard/sales");
  revalidatePath("/dashboard/products");
  redirect("/dashboard/sales");
}
