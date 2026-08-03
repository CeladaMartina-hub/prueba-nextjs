'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Customer } from '@/app/lib/definitions';
import { CustomerState } from '@/app/lib/actions';

export default function CustomerForm({
  customer,
  action,
}: {
  customer?: Customer;
  action: (prevState: CustomerState, formData: FormData) => Promise<CustomerState>;
}) {
  const initialState: CustomerState = { message: null, errors: {} };
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction}>
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl">Clientes</h1>
      </div>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="mb-4">
            <label htmlFor="first_name" className="mb-2 block text-sm font-medium">Nombre</label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              defaultValue={customer?.first_name}
              className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
            />
            {state.errors?.first_name && (
              <p className="mt-1 text-sm text-red-500">{state.errors.first_name[0]}</p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="last_name" className="mb-2 block text-sm font-medium">Apellido</label>
            <input
              id="last_name"
              name="last_name"
              type="text"
              defaultValue={customer?.last_name}
              className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
            />
            {state.errors?.last_name && (
              <p className="mt-1 text-sm text-red-500">{state.errors.last_name[0]}</p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="dni" className="mb-2 block text-sm font-medium">DNI</label>
            <input
              id="dni"
              name="dni"
              type="text"
              defaultValue={customer?.dni ?? ''}
              className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="phone" className="mb-2 block text-sm font-medium">Teléfono</label>
            <input
              id="phone"
              name="phone"
              type="text"
              defaultValue={customer?.phone ?? ''}
              className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="mb-2 block text-sm font-medium">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              defaultValue={customer?.email ?? ''}
              className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
            />
            {state.errors?.email && (
              <p className="mt-1 text-sm text-red-500">{state.errors.email[0]}</p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="address" className="mb-2 block text-sm font-medium">Dirección</label>
            <input
              id="address"
              name="address"
              type="text"
              defaultValue={customer?.address ?? ''}
              className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="city" className="mb-2 block text-sm font-medium">Localidad</label>
            <input
              id="city"
              name="city"
              type="text"
              defaultValue={customer?.city ?? ''}
              className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="postal_code" className="mb-2 block text-sm font-medium">Código postal</label>
            <input
              id="postal_code"
              name="postal_code"
              type="text"
              defaultValue={customer?.postal_code ?? ''}
              className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
            />
          </div>
        </div>

        {state.message && <p className="mt-2 text-sm text-red-500">{state.message}</p>}
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/customers"
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