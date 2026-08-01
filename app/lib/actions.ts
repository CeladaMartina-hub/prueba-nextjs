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

//sirve  para validar los datos que vienen del formulario, y para tipar los datos que vienen del formulario
//coerce.number() sirve para convertir el valor que viene del formulario a number, ya que por defecto viene como string
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: "Please select a customer.",
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: "Please enter an amount greater than $0." }),
  status: z.enum(["pending", "paid"], {
    invalid_type_error: "Please select an invoice status.",
  }),
  date: z.string(),
});

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(prevState: State, formData: FormData) {
  // Validate form using Zod
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Invoice.",
    };
  }

  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split("T")[0];

  try {
    await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;
  } catch (error) {
    // If a database error occurs, return a more specific error.
    return {
      message: "Database Error: Failed to Create Invoice.",
    };
  }

  //revalidatePath sirve para que nextjs vuelva a renderizar la pagina de invoices, ya que al ser server component no se actualiza automaticamente
  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

// Use Zod to update the expected types
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData,
) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Update Invoice.",
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;

  try {
    await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;
  } catch (error) {
    return { message: "Database Error: Failed to Update Invoice." };
  }

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function deleteInvoice(id: string) {
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
  } catch (error) {
    console.error(error);
    throw new Error("Database Error: Failed to Delete Invoice.");
  }

  revalidatePath("/dashboard/invoices");
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

//clientes
const CustomerSchema = z.object({
  first_name: z.string().min(1, 'El nombre es obligatorio.'),
  last_name: z.string().min(1, 'El apellido es obligatorio.'),
  dni: z.string().optional(),
  email: z.string().email('Email inválido.').optional().or(z.literal('')),
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

export async function createCustomer(prevState: CustomerState, formData: FormData) {
  const validatedFields = CustomerSchema.safeParse({
    first_name: formData.get('first_name'),
    last_name: formData.get('last_name'),
    dni: formData.get('dni'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    address: formData.get('address'),
    city: formData.get('city'),
    postal_code: formData.get('postal_code'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Faltan campos. No se pudo crear el cliente.',
    };
  }

  const { first_name, last_name, dni, email, phone, address, city, postal_code } =
    validatedFields.data;

  try {
    await sql`
      INSERT INTO customers (first_name, last_name, dni, email, phone, address, city, postal_code)
      VALUES (
        ${first_name}, ${last_name}, ${dni || null}, ${email || null},
        ${phone || null}, ${address || null}, ${city || null}, ${postal_code || null}
      )
    `;
  } catch (error) {
    console.error('Error creando cliente:', error);
    return { message: 'Database Error: No se pudo crear el cliente.' };
  }

  revalidatePath('/dashboard/customers');
  redirect('/dashboard/customers');
}

export async function updateCustomer(
  id: string,
  prevState: CustomerState,
  formData: FormData,
) {
  const validatedFields = CustomerSchema.safeParse({
    first_name: formData.get('first_name'),
    last_name: formData.get('last_name'),
    dni: formData.get('dni'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    address: formData.get('address'),
    city: formData.get('city'),
    postal_code: formData.get('postal_code'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Faltan campos. No se pudo actualizar el cliente.',
    };
  }

  const { first_name, last_name, dni, email, phone, address, city, postal_code } =
    validatedFields.data;

  try {
    await sql`
      UPDATE customers
      SET first_name = ${first_name}, last_name = ${last_name}, dni = ${dni || null},
          email = ${email || null}, phone = ${phone || null}, address = ${address || null},
          city = ${city || null}, postal_code = ${postal_code || null}
      WHERE id = ${id}
    `;
  } catch (error) {
    return { message: 'Database Error: No se pudo actualizar el cliente.' };
  }

  revalidatePath('/dashboard/customers');
  redirect('/dashboard/customers');
}

export async function deleteCustomer(id: string) {
  try {
    await sql`DELETE FROM customers WHERE id = ${id}`;
    revalidatePath('/dashboard/customers');
  } catch (error) {
    console.error(error);
    throw new Error('Database Error: No se pudo eliminar el cliente.');
  }
}
