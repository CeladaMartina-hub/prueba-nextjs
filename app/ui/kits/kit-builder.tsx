'use client';

import { useState, useActionState } from 'react';
import Link from 'next/link';
import { createKit, KitState } from '@/app/lib/actions';

type ProductOption = {
  id: string;
  name: string;
  cost: number | null;
  portion_size: number | null;
  portion_unit: string | null;
};

type KitLine = {
  product_id: string;
  product_name: string;
  quantity: number;
  unit: string;
  item_cost: number;
};

function convert(value: number, from: string, to: string) {
  if (from === to) return value;
  if (from === 'kg' && to === 'g') return value * 1000;
  if (from === 'g' && to === 'kg') return value / 1000;
  return value; // unit no se convierte
}

export default function KitBuilder({ products }: { products: ProductOption[] }) {
  const initialState: KitState = { message: null };
  const [state, formAction] = useActionState(createKit, initialState);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');

  const [lines, setLines] = useState<KitLine[]>([]);
  const [productToAdd, setProductToAdd] = useState('');
  const [quantityToAdd, setQuantityToAdd] = useState('');
  const [unitToAdd, setUnitToAdd] = useState('g');

  function addLine() {
    const product = products.find((p) => p.id === productToAdd);
    if (!product || !quantityToAdd || !product.cost || !product.portion_size) return;
    if (lines.some((l) => l.product_id === product.id)) return;

    const qty = Number(quantityToAdd);
    const portionUnit = product.portion_unit ?? 'g';
    const qtyInPortionUnit = convert(qty, unitToAdd, portionUnit);
    const costPerPortionUnit = product.cost / product.portion_size;
    const itemCost = Math.round(costPerPortionUnit * qtyInPortionUnit);

    setLines([
      ...lines,
      {
        product_id: product.id,
        product_name: product.name,
        quantity: qty,
        unit: unitToAdd,
        item_cost: itemCost,
      },
    ]);
    setProductToAdd('');
    setQuantityToAdd('');
  }

  function removeLine(productId: string) {
    setLines(lines.filter((l) => l.product_id !== productId));
  }

  const totalCost = lines.reduce((sum, l) => sum + l.item_cost, 0);
  const finalPrice = Number(price) || 0;
  const profit = finalPrice - totalCost;
  const marginPercent = totalCost > 0 ? (profit / totalCost) * 100 : null;

  return (
    <form action={formAction} encType="multipart/form-data">
      <input type="hidden" name="items" value={JSON.stringify(lines)} />
      <input type="hidden" name="cost" value={totalCost} />

      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">Nombre del kit</label>
          <input
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Kit desayuno saludable"
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
          />
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">Descripción</label>
          <textarea
            name="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
          />
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">Foto del kit</label>
          <input name="image" type="file" accept="image/*" className="block w-full text-sm" />
        </div>

        <div className="mb-4 border-t pt-4">
          <label className="mb-2 block text-sm font-medium">Agregar producto al kit</label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
            <select
              value={productToAdd}
              onChange={(e) => setProductToAdd(e.target.value)}
              className="rounded-md border border-gray-200 py-2 px-3 text-sm sm:col-span-2"
            >
              <option value="">Elegí un producto</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              step="0.01"
              placeholder="Cantidad"
              value={quantityToAdd}
              onChange={(e) => setQuantityToAdd(e.target.value)}
              className="rounded-md border border-gray-200 py-2 px-3 text-sm"
            />
            <select
              value={unitToAdd}
              onChange={(e) => setUnitToAdd(e.target.value)}
              className="rounded-md border border-gray-200 py-2 px-3 text-sm"
            >
              <option value="g">g</option>
              <option value="kg">kg</option>
              <option value="unit">unidad</option>
            </select>
          </div>
          <button
            type="button"
            onClick={addLine}
            className="mt-2 rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            Agregar al kit
          </button>
        </div>

        {lines.length > 0 && (
          <div className="mb-4 rounded-md border">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-100 text-left">
                  <th className="px-3 py-2">Producto</th>
                  <th className="px-3 py-2">Cantidad</th>
                  <th className="px-3 py-2">Costo</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line) => (
                  <tr key={line.product_id} className="border-b last:border-none">
                    <td className="px-3 py-2">{line.product_name}</td>
                    <td className="px-3 py-2">{line.quantity} {line.unit}</td>
                    <td className="px-3 py-2">${line.item_cost.toLocaleString('es-AR')}</td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => removeLine(line.product_id)}
                        className="text-red-500 hover:underline"
                      >
                        Quitar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mb-3 grid grid-cols-2 gap-3 border-t pt-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Costo total del kit</label>
            <div className="rounded-md bg-white px-3 py-2 text-sm font-medium">
              ${totalCost.toLocaleString('es-AR')}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Precio de venta</label>
            <input
              name="price"
              type="number"
              step="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
            />
          </div>
        </div>

        {totalCost > 0 && finalPrice > 0 && (
          <div
            className={`rounded-md p-3 text-sm ${
              profit > 0 ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}
          >
            Ganancia: <span className="font-semibold">${profit.toLocaleString('es-AR')}</span>
            {marginPercent !== null && (
              <span> ({marginPercent >= 0 ? '+' : ''}{marginPercent.toFixed(0)}% sobre el costo)</span>
            )}
          </div>
        )}

        {state.message && <p className="mt-2 text-sm text-red-500">{state.message}</p>}
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/kits"
          className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium hover:bg-gray-200"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={lines.length === 0}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
        >
          Crear kit
        </button>
      </div>
    </form>
  );
}