"use client";

import { useState, useActionState } from "react";
import Link from "next/link";
import { createPurchase, PurchaseState } from "@/app/lib/actions";

//ver de mejor agregar en otro lado despues
type Category = { id: string; name: string };
type PackagingOption = {
  id: string;
  description: string;
  quantity: number;
  total_cost: number;
};
type PurchaseFormProps = {
  categories: Category[];
  packagingOptions: PackagingOption[];
};

export default function PurchaseForm({
  categories,
  packagingOptions,
}: PurchaseFormProps) {
  const initialState: PurchaseState = { message: null, errors: {} };
  const [state, formAction] = useActionState(createPurchase, initialState);

  const [isProduct, setIsProduct] = useState(false);
  const [isPackaging, setIsPackaging] = useState(false);

  //bolsa
  const [hasPackaging, setHasPackaging] = useState(false);
  const [selectedPackagingId, setSelectedPackagingId] = useState("");

  // Campos de la compra (los necesitamos en estado para calcular el costo del producto en vivo)
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState<"kg" | "g" | "unit">("kg");
  const [totalCost, setTotalCost] = useState("");

  // Campos del producto
  const [portionSize, setPortionSize] = useState("");
  const [portionUnit, setPortionUnit] = useState<"kg" | "g" | "unit">("g");
  const [productCost, setProductCost] = useState("");
  const [costTouched, setCostTouched] = useState(false);
  const [productPrice, setProductPrice] = useState("");
  const [priceTouched, setPriceTouched] = useState(false);

  function convert(value: number, from: string, to: string) {
    if (from === to) return value;
    if (from === "kg" && to === "g") return value * 1000;
    if (from === "g" && to === "kg") return value / 1000;
    return value;
  }

  const selectedPackaging = packagingOptions.find(
    (packaging) => packaging.id === selectedPackagingId,
  );

  const packagingCost =
    selectedPackaging && selectedPackaging.quantity > 0
      ? Math.round(selectedPackaging.total_cost / selectedPackaging.quantity)
      : 0;

  const ingredientCost =
    quantity && totalCost && portionSize
      ? Math.round(
          (Number(totalCost) / convert(Number(quantity), unit, portionUnit)) *
            Number(portionSize),
        )
      : null;

  const calculatedCost =
    ingredientCost !== null
      ? ingredientCost + (hasPackaging ? packagingCost : 0)
      : null;

  const displayedCost =
    !costTouched && calculatedCost !== null
      ? calculatedCost.toString()
      : productCost;

  const suggestedPrice =
    Number(displayedCost) > 0 ? Math.round(Number(displayedCost) * 1.3) : 0;
  const displayedPrice =
    !priceTouched && suggestedPrice > 0
      ? suggestedPrice.toString()
      : productPrice;

  const profit = Number(displayedPrice) - Number(displayedCost);
  const marginPercent =
    Number(displayedCost) > 0 ? (profit / Number(displayedCost)) * 100 : null;

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="mb-4">
            <label
              htmlFor="purchase_date"
              className="mb-2 block text-sm font-medium"
            >
              Fecha
            </label>
            <input
              id="purchase_date"
              name="purchase_date"
              type="date"
              defaultValue={new Date().toISOString().split("T")[0]}
              className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="supplier"
              className="mb-2 block text-sm font-medium"
            >
              Proveedor
            </label>
            <input
              id="supplier"
              name="supplier"
              type="text"
              placeholder="Ej: Granix, Compra mayorista"
              className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
            />
          </div>

          <div className="mb-4 md:col-span-2">
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium"
            >
              Descripción del gasto / producto comprado
            </label>
            <input
              id="description"
              name="description"
              type="text"
              placeholder="Ej: Granola crujiente premium"
              className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
            />
            {state.errors?.description && (
              <p className="mt-1 text-sm text-red-500">
                {state.errors.description[0]}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="quantity"
              className="mb-2 block text-sm font-medium"
            >
              Cantidad comprada
            </label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              step="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Ej: 3"
              className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
            />
            {state.errors?.quantity && (
              <p className="mt-1 text-sm text-red-500">
                {state.errors.quantity[0]}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="unit" className="mb-2 block text-sm font-medium">
              Unidad
            </label>
            <select
              id="unit"
              name="unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value as "kg" | "g" | "unit")}
              className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
            >
              <option value="kg">Kilogramos (kg)</option>
              <option value="g">Gramos (g)</option>
              <option value="unit">Unidades</option>
            </select>
          </div>

          <div className="mb-4 md:col-span-2">
            <label
              htmlFor="total_cost"
              className="mb-2 block text-sm font-medium"
            >
              Costo total pagado ($)
            </label>
            <input
              id="total_cost"
              name="total_cost"
              type="number"
              step="1"
              value={totalCost}
              onChange={(e) => setTotalCost(e.target.value)}
              placeholder="Ej: 47973"
              className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
            />
            {state.errors?.total_cost && (
              <p className="mt-1 text-sm text-red-500">
                {state.errors.total_cost[0]}
              </p>
            )}
          </div>
        </div>

        <div className="mb-4 border-t pt-4 space-y-3">
          {/* Producto para la venta */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={isProduct}
                onChange={(e) => {
                  setIsProduct(e.target.checked);

                  // No puede ser producto y material de embolsado al mismo tiempo
                  if (e.target.checked) {
                    setIsPackaging(false);
                  }
                }}
              />
              Este gasto corresponde a un producto para la venta
            </label>

            <input
              type="hidden"
              name="is_product"
              value={isProduct ? "yes" : "no"}
            />
          </div>

          {/* Material de embolsado */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={isPackaging}
                onChange={(e) => {
                  setIsPackaging(e.target.checked);

                  // No puede ser producto y material de embolsado al mismo tiempo
                  if (e.target.checked) {
                    setIsProduct(false);
                  }
                }}
              />
              Este gasto corresponde a material de embolsado
            </label>

            <input
              type="hidden"
              name="is_packaging"
              value={isPackaging ? "yes" : "no"}
            />

            <p className="ml-6 mt-1 text-xs text-gray-500">
              Marcá esta opción si compraste bolsas, envases u otro material
              utilizado para empaquetar tus productos.
            </p>
          </div>
        </div>

        {isProduct && (
          <div className="mb-4 rounded-md border border-blue-100 bg-blue-50 p-4">
            <p className="mb-3 text-sm font-medium text-blue-900">
              Datos del producto
            </p>

            {/* bolsa */}
            <div className="mb-4 rounded-md border border-gray-200 bg-white p-3">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={hasPackaging}
                  onChange={(e) => {
                    setHasPackaging(e.target.checked);

                    if (!e.target.checked) {
                      setSelectedPackagingId("");
                    }
                  }}
                />
                ¿Viene en bolsa?
              </label>

              <input
                type="hidden"
                name="product_packaging_id"
                value={hasPackaging ? selectedPackagingId : ""}
              />

              <input
                type="hidden"
                name="product_packaging_cost"
                value={hasPackaging ? packagingCost : ""}
              />

              {hasPackaging && (
                <div className="mt-3">
                  {packagingOptions.length > 0 ? (
                    <>
                      <label
                        htmlFor="product_packaging_select"
                        className="mb-1 block text-xs font-medium text-gray-600"
                      >
                        Material de embolsado
                      </label>

                      <select
                        id="product_packaging_select"
                        value={selectedPackagingId}
                        onChange={(e) => setSelectedPackagingId(e.target.value)}
                        className="block w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                      >
                        <option value="">Elegí una bolsa</option>

                        {packagingOptions.map((packaging) => {
                          const costPerUnit =
                            packaging.quantity > 0
                              ? Math.round(
                                  packaging.total_cost / packaging.quantity,
                                )
                              : 0;

                          return (
                            <option key={packaging.id} value={packaging.id}>
                              {packaging.description} — $
                              {costPerUnit.toLocaleString("es-AR")}/unidad
                            </option>
                          );
                        })}
                      </select>

                      {selectedPackaging && (
                        <p className="mt-2 text-xs text-gray-600">
                          Costo de embolsado:{" "}
                          <span className="font-semibold text-gray-900">
                            ${packagingCost.toLocaleString("es-AR")}
                          </span>{" "}
                          por unidad
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="mt-3 text-sm text-gray-500">
                      Todavía no tenés compras marcadas como material de
                      embolsado.
                    </p>
                  )}
                </div>
              )}
            </div>
            {/*  */}

            <div className="mb-3">
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Nombre del producto
              </label>
              <input
                name="product_name"
                type="text"
                placeholder="Ej: Granola bolsa 100g"
                className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
              />
            </div>

            <div className="mb-3">
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Descripción
              </label>
              <textarea
                name="product_description"
                rows={3}
                className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
              />
            </div>

            <div className="mb-3 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Tamaño de la porción
                </label>
                <input
                  name="product_portion_size"
                  type="number"
                  step="0.01"
                  value={portionSize}
                  onChange={(e) => setPortionSize(e.target.value)}
                  placeholder="Ej: 100"
                  className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Unidad de la porción
                </label>
                <select
                  name="product_portion_unit"
                  value={portionUnit}
                  onChange={(e) =>
                    setPortionUnit(e.target.value as "kg" | "g" | "unit")
                  }
                  className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
                >
                  <option value="g">Gramos (g)</option>
                  <option value="kg">Kilogramos (kg)</option>
                  <option value="unit">Unidad</option>
                </select>
              </div>
            </div>

            {calculatedCost !== null && (
              <p className="mb-3 rounded-md bg-white p-3 text-sm">
                Costo estimado de esta porción:{" "}
                <span className="font-semibold text-blue-700">
                  ${calculatedCost.toLocaleString("es-AR")}
                </span>
              </p>
            )}

            <div className="mb-3 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Costo del producto
                </label>
                <input
                  name="product_cost"
                  type="number"
                  step="1"
                  value={displayedCost}
                  onChange={(e) => {
                    setProductCost(e.target.value);
                    setCostTouched(true);
                  }}
                  className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Precio de venta
                </label>
                <input
                  name="product_price"
                  type="number"
                  step="1"
                  value={displayedPrice}
                  onChange={(e) => {
                    setProductPrice(e.target.value);
                    setPriceTouched(true);
                  }}
                  className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
                />
              </div>
            </div>

            {Number(displayedCost) > 0 && Number(displayedPrice) > 0 && (
              <div
                className={`mb-3 rounded-md p-3 text-sm ${
                  profit > 0
                    ? "bg-green-50 text-green-800"
                    : "bg-red-50 text-red-800"
                }`}
              >
                Ganancia:{" "}
                <span className="font-semibold">
                  ${profit.toLocaleString("es-AR")}
                </span>
                {marginPercent !== null && (
                  <span>
                    {" "}
                    ({marginPercent >= 0 ? "+" : ""}
                    {marginPercent.toFixed(0)}% sobre el costo)
                  </span>
                )}
              </div>
            )}

            <div className="mb-3">
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Stock inicial
              </label>
              <input
                name="product_stock"
                type="number"
                defaultValue={0}
                className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
              />
            </div>

            <div className="mb-3">
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Categoría
              </label>
              <select
                name="product_category_id"
                className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
              >
                <option value="">Elegí una categoría</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Foto del producto (opcional)
              </label>
              <input
                name="product_image"
                type="file"
                accept="image/*"
                className="block w-full text-sm"
              />
            </div>
          </div>
        )}

        {state.message && (
          <p className="mt-2 text-sm text-red-500">{state.message}</p>
        )}
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
