'use client';

import { useState, useActionState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { KitState } from '@/app/lib/actions';

type ProductOption = {
  id: string;
  name: string;
  cost: number | null;
  price: number | null;
  stock: number;
  portion_size: number | null;
  portion_unit: string | null;
};

type KitLine = {
  product_id: string;
  product_name: string;
  quantity: number; // cantidad de "unidades de venta" (ej: 2 bolsas)
  unit: string; // etiqueta descriptiva, ej: "bolsa de 250g"
  item_cost: number;
};

type ExistingKit = {
  id: string;
  name: string;
  description: string | null;
  image_url: string;
  price: number;
  items: { product_id: string; product_name: string; quantity: number; unit: string; item_cost: number }[];
};

export default function KitBuilder({
  products,
  kit,
  action,
}: {
  products: ProductOption[];
  kit?: ExistingKit;
  action: (prevState: KitState, formData: FormData) => Promise<KitState>;
}) {
  const initialState: KitState = { message: null };
  const [state, formAction] = useActionState(action, initialState);

  const [name, setName] = useState(kit?.name ?? '');
  const [description, setDescription] = useState(kit?.description ?? '');
  const [price, setPrice] = useState(kit?.price?.toString() ?? '');

  const [lines, setLines] = useState<KitLine[]>(kit?.items ?? []);
  const [productToAdd, setProductToAdd] = useState('');
  const [quantityToAdd, setQuantityToAdd] = useState('1');

  const selectedProduct = products.find((p) => p.id === productToAdd);
  const portionLabel = selectedProduct
    ? `${selectedProduct.portion_size}${selectedProduct.portion_unit}`
    : '';

  function addLine() {
    if (!productToAdd || !selectedProduct || !selectedProduct.price) return;
    if (lines.some((l) => l.product_id === selectedProduct.id)) return;

    const qty = Number(quantityToAdd) || 1;
    const itemCost = Math.round(selectedProduct.price * qty);

    setLines([
      ...lines,
      {
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        quantity: qty,
        unit: `x ${portionLabel} c/u`,
        item_cost: itemCost,
      },
    ]);
    setProductToAdd('');
    setQuantityToAdd('1');
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
            value={description ?? ''}
            onChange={(e) => setDescription(e.target.value)}
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
          />
        </div>

        {kit?.image_url && (
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium">Foto actual</label>
            <Image
              src={kit.image_url}
              alt={kit.name}
              width={100}
              height={100}
              className="rounded-md object-cover"
            />
          </div>
        )}

        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">
            {kit ? 'Reemplazar foto (opcional)' : 'Foto del kit'}
          </label>
          <input name="image" type="file" accept="image/*" className="block w-full text-sm" />
        </div>

        {!kit && (
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium">¿Cuántos kits vas a armar?</label>
            <input
              name="build_quantity"
              type="number"
              min={1}
              defaultValue={1}
              className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
            />
          </div>
        )}

        <div className="mb-4 border-t pt-4">
          <label className="mb-2 block text-sm font-medium">Agregar producto al kit</label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <select
              value={productToAdd}
              onChange={(e) => setProductToAdd(e.target.value)}
              className="rounded-md border border-gray-200 py-2 px-3 text-sm sm:col-span-2"
            >
              <option value="">Elegí un producto</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.portion_size}{p.portion_unit} c/u — ${p.price?.toLocaleString('es-AR')} (stock: {p.stock})
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              placeholder="Cantidad"
              value={quantityToAdd}
              onChange={(e) => setQuantityToAdd(e.target.value)}
              className="rounded-md border border-gray-200 py-2 px-3 text-sm"
            />
          </div>
          {selectedProduct && (
            <p className="mt-2 text-xs text-gray-500">
              Vas a agregar {quantityToAdd || 1} unidad(es) de {portionLabel} cada una — costo estimado: $
              {Math.round((selectedProduct.price ?? 0) * (Number(quantityToAdd) || 1)).toLocaleString('es-AR')}
            </p>
          )}
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
               <table className="min-w-full text-gray-900">
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
          {kit ? 'Guardar cambios' : 'Crear kit'}
        </button>
      </div>
    </form>
  );
}