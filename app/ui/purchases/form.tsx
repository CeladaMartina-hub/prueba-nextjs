'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { createPurchase, PurchaseState } from '@/app/lib/actions';

export default function PurchaseForm() {
  const initialState: PurchaseState = { message: null, errors: {} };
  const [state, formAction] = useActionState(createPurchase, initialState);

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="mb-4">
            <label htmlFor="purchase_date" className="mb-2 block text-sm font-medium">Fecha</label>
            <input
              id="purchase_date"
              name="purchase_date"
              type="date"
              defaultValue={new Date().toISOString().split('T')[0]}
              className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="supplier" className="mb-2 block text-sm font-medium">Proveedor</label>
            <input
              id="supplier"
              name="supplier"
              type="text"
              placeholder="Ej: Granix, Compra mayorista"
              className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
            />
          </div>

          <div className="mb-4 md:col-span-2">
            <label htmlFor="description" className="mb-2 block text-sm font-medium">Descripción del producto comprado</label>
            <input
              id="description"
              name="description"
              type="text"
              placeholder="Ej: Granola crujiente premium"
              className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
            />
            {state.errors?.description && (
              <p className="mt-1 text-sm text-red-500">{state.errors.description[0]}</p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="quantity" className="mb-2 block text-sm font-medium">Cantidad comprada</label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              step="0.01"
              placeholder="Ej: 3"
              className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
            />
            {state.errors?.quantity && (
              <p className="mt-1 text-sm text-red-500">{state.errors.quantity[0]}</p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="unit" className="mb-2 block text-sm font-medium">Unidad</label>
            <select
              id="unit"
              name="unit"
              className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
            >
              <option value="kg">Kilogramos (kg)</option>
              <option value="g">Gramos (g)</option>
              <option value="unit">Unidades</option>
            </select>
          </div>

          <div className="mb-4 md:col-span-2">
            <label htmlFor="total_cost" className="mb-2 block text-sm font-medium">Costo total pagado ($)</label>
            <input
              id="total_cost"
              name="total_cost"
              type="number"
              step="1"
              placeholder="Ej: 47973"
              className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
            />
            {state.errors?.total_cost && (
              <p className="mt-1 text-sm text-red-500">{state.errors.total_cost[0]}</p>
            )}
          </div>
        </div>

        {state.message && <p className="mt-2 text-sm text-red-500">{state.message}</p>}
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/purchases"
          className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium hover:bg-gray-200"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
        >
          Registrar compra
        </button>
      </div>
    </form>
  );
}