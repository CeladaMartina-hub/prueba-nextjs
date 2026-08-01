'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Category } from '@/app/lib/definitions';
import { CategoryState } from '@/app/lib/actions';

export default function CategoryForm({
  category,
  action,
}: {
  category?: Category;
  action: (prevState: CategoryState, formData: FormData) => Promise<CategoryState>;
}) {
  const initialState: CategoryState = { message: null, errors: {} };
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        <div className="mb-4">
          <label htmlFor="name" className="mb-2 block text-sm font-medium">Nombre</label>
          <input
            id="name"
            name="name"
            type="text"
            defaultValue={category?.name}
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
          />
          {state.errors?.name && (
            <p className="mt-1 text-sm text-red-500">{state.errors.name[0]}</p>
          )}
        </div>

        {state.message && <p className="mt-2 text-sm text-red-500">{state.message}</p>}
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/categories"
          className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium hover:bg-gray-200"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
        >
          Guardar
        </button>
      </div>
    </form>
  );
}