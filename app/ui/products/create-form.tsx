"use client";

import { useActionState } from "react";
import { Category, ProductState } from "@/app/lib/definitions";
import { createProduct } from "@/app/lib/actions";
import Link from "next/link";
import CostCalculator from "@/app/ui/products/cost-calculator";

export default function Form({
  categories,
  purchases,
}: {
  categories: Category[];
  purchases: {
    id: string;
    description: string;
    quantity: number;
    unit: string;
    total_cost: number;
  }[];
}) {
  const initialState: ProductState = { message: null, errors: {} };
  const [state, formAction] = useActionState(createProduct, initialState);

  return (
    <form action={formAction} encType="multipart/form-data">
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        <div className="flex w-full items-center justify-between">
          <h1 className="text-2xl">Productos</h1>
        </div>
        <br/>
        <div className="mb-4">
          <label htmlFor="name" className="mb-2 block text-sm font-medium">
            Nombre
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
          />
          {state.errors?.name && (
            <p className="mt-1 text-sm text-red-500">{state.errors.name[0]}</p>
          )}
        </div>

        <div className="mb-4">
          <label
            htmlFor="description"
            className="mb-2 block text-sm font-medium"
          >
            Descripción
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
          />
        </div>

        <CostCalculator purchases={purchases} />

        <div className="mb-4">
          <label htmlFor="stock" className="mb-2 block text-sm font-medium">
            Stock
          </label>
          <input
            id="stock"
            name="stock"
            type="number"
            defaultValue={0}
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="category_id"
            className="mb-2 block text-sm font-medium"
          >
            Categoría
          </label>
          <select
            id="category_id"
            name="category_id"
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
          >
            <option value="">Elegí una categoría</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {state.errors?.category_id && (
            <p className="mt-1 text-sm text-red-500">
              {state.errors.category_id[0]}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="image" className="mb-2 block text-sm font-medium">
            Foto del producto
          </label>
          <input
            id="image"
            name="image"
            type="file"
            accept="image/*"
            className="block w-full text-sm"
          />
        </div>

        {state.message && (
          <p className="mt-2 text-sm text-red-500">{state.message}</p>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/products"
          className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium hover:bg-gray-200"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
        >
          Crear producto
        </button>
      </div>
    </form>
  );
}
