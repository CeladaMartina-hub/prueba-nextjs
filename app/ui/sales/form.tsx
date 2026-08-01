"use client";

import { useState, useActionState } from "react";
import Link from "next/link";
import { createSale, SaleState } from "@/app/lib/actions";

type Customer = { id: string; first_name: string; last_name: string };
type Product = { id: string; name: string; price: number; stock: number };

type SaleLine = {
  product_id: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  maxStock: number;
};

export default function SaleForm({
  customers,
  products,
}: {
  customers: Customer[];
  products: Product[];
}) {
  const initialState: SaleState = { message: null };
  const [state, formAction] = useActionState(createSale, initialState);

  const [customerType, setCustomerType] = useState<"registered" | "counter">(
    "registered",
  );
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");

  const [lines, setLines] = useState<SaleLine[]>([]);
  const [productToAdd, setProductToAdd] = useState("");

  function addLine() {
    if (!productToAdd) return;
    const product = products.find((p) => p.id === productToAdd);
    if (!product) return;

    // Si ya está agregado, no lo duplicamos
    if (lines.some((l) => l.product_id === product.id)) return;

    setLines([
      ...lines,
      {
        product_id: product.id,
        product_name: product.name,
        unit_price: product.price,
        quantity: 1,
        maxStock: product.stock,
      },
    ]);
    setProductToAdd("");
  }

  // Actualizamos la cantidad de un producto en las líneas
  function updateQuantity(productId: string, quantity: number) {
    setLines(
      lines.map((l) => (l.product_id === productId ? { ...l, quantity } : l)),
    );
  }

  function normalizeQuantity(productId: string) {
    setLines(
      lines.map((l) =>
        l.product_id === productId
          ? {
              ...l,
              quantity: Math.min(Math.max(1, l.quantity || 1), l.maxStock),
            }
          : l,
      ),
    );
  }

  function removeLine(productId: string) {
    setLines(lines.filter((l) => l.product_id !== productId));
  }

  const total = lines.reduce((sum, l) => sum + l.quantity * l.unit_price, 0);

  return (
    <form action={formAction}>
      <input type="hidden" name="customer_type" value={customerType} />
      <input type="hidden" name="customer_id" value={selectedCustomerId} />
      <input type="hidden" name="customer_name" value={customerName} />
      <input type="hidden" name="items" value={JSON.stringify(lines)} />

      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Tipo de cliente */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">Cliente</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                checked={customerType === "registered"}
                onChange={() => setCustomerType("registered")}
              />
              Cliente registrado
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                checked={customerType === "counter"}
                onChange={() => setCustomerType("counter")}
              />
              Mostrador
            </label>
          </div>
        </div>

        {customerType === "registered" ? (
          <div className="mb-6">
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
            >
              <option value="">Elegí un cliente</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.first_name} {c.last_name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="mb-6">
            <input
              type="text"
              placeholder="Nombre (opcional)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
            />
          </div>
        )}

        {/* Agregar productos */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">
            Agregar producto
          </label>
          <div className="flex gap-2">
            <select
              value={productToAdd}
              onChange={(e) => setProductToAdd(e.target.value)}
              className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
            >
              <option value="">Elegí un producto</option>
              {products.map((p) => (
                <option key={p.id} value={p.id} disabled={p.stock === 0}>
                  {p.name} — stock: {p.stock}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={addLine}
              className="rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
            >
              Agregar
            </button>
          </div>
        </div>

        {/* Líneas agregadas */}
        {lines.length > 0 && (
          <div className="mb-4 rounded-md border">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-100 text-left">
                  <th className="px-3 py-2">Producto</th>
                  <th className="px-3 py-2">Cantidad</th>
                  <th className="px-3 py-2">Precio unit.</th>
                  <th className="px-3 py-2">Subtotal</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line) => (
                  <tr
                    key={line.product_id}
                    className="border-b last:border-none"
                  >
                    <td className="px-3 py-2">{line.product_name}</td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min={1}
                        max={line.maxStock}
                        value={line.quantity || ""}
                        onChange={(e) =>
                          updateQuantity(
                            line.product_id,
                            Number(e.target.value),
                          )
                        }
                        onBlur={() => normalizeQuantity(line.product_id)}
                        className="w-20 rounded-md border border-gray-200 px-2 py-1"
                      />
                    </td>
                    <td className="px-3 py-2">
                      ${line.unit_price.toLocaleString("es-AR")}
                    </td>
                    <td className="px-3 py-2">
                      $
                      {(line.quantity * line.unit_price).toLocaleString(
                        "es-AR",
                      )}
                    </td>
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

        <p className="text-right text-lg font-semibold">
          Total: ${total.toLocaleString("es-AR")}
        </p>

        {state.message && (
          <p className="mt-2 text-sm text-red-500">{state.message}</p>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/sales"
          className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium hover:bg-gray-200"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={lines.length === 0}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
        >
          Confirmar venta
        </button>
      </div>
    </form>
  );
}
