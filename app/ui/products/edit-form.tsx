'use client';

import { useActionState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Category, Product, ProductState } from '@/app/lib/definitions';
import { updateProduct } from '@/app/lib/actions';

export default function EditForm({
  product,
  categories,
}: {
  product: Product;
  categories: Category[];
}) {
  const initialState: ProductState = { message: null, errors: {} };
  const updateProductWithId = updateProduct.bind(null, product.id, product.image_url);
  const [state, formAction] = useActionState(updateProductWithId, initialState);

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        <div className="mb-4">
          <label htmlFor="name" className="mb-2 block text-sm font-medium">Nombre</label>
          <input
            id="name"
            name="name"
            type="text"
            defaultValue={product.name}
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
          />
          {state.errors?.name && (
            <p className="mt-1 text-sm text-red-500">{state.errors.name[0]}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="description" className="mb-2 block text-sm font-medium">Descripción</label>
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={product.description}
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="price" className="mb-2 block text-sm font-medium">Precio</label>
          <input
            id="price"
            name="price"
            type="number"
            step="1"
            defaultValue={product.price}
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
          />
          {state.errors?.price && (
            <p className="mt-1 text-sm text-red-500">{state.errors.price[0]}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="stock" className="mb-2 block text-sm font-medium">Stock</label>
          <input
            id="stock"
            name="stock"
            type="number"
            defaultValue={product.stock}
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="category_id" className="mb-2 block text-sm font-medium">Categoría</label>
          <select
            id="category_id"
            name="category_id"
            defaultValue={product.category_id}
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
            <p className="mt-1 text-sm text-red-500">{state.errors.category_id[0]}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">Foto actual</label>
          <Image
            src={product.image_url}
            alt={product.name}
            width={100}
            height={100}
            className="rounded-md object-cover"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="image" className="mb-2 block text-sm font-medium">
            Reemplazar foto (opcional)
          </label>
          <input
            id="image"
            name="image"
            type="file"
            accept="image/*"
            className="block w-full text-sm"
          />
        </div>

        {state.message && <p className="mt-2 text-sm text-red-500">{state.message}</p>}
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
          Guardar cambios
        </button>
      </div>
    </form>
  );
}