"use client";

import { useMemo, useState } from "react";

type PurchaseOption = {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  total_cost: number;
};

type PackagingOption = {
  id: string;
  description: string;
  quantity: number;
  total_cost: number;
};

export default function CostCalculator({
  purchases,
  packagingOptions = [],
  defaultPurchaseId,
  defaultPortionSize,
  defaultPortionUnit,
  defaultCost,
  defaultPrice,
  defaultPackagingPurchaseId,
}: {
  purchases: PurchaseOption[];
  packagingOptions?: PackagingOption[];
  defaultPurchaseId?: string;
  defaultPortionSize?: number;
  defaultPortionUnit?: string;
  defaultCost?: number;
  defaultPrice?: number;
  defaultPackagingPurchaseId?: string;
}) {
  const [purchaseId, setPurchaseId] = useState(defaultPurchaseId ?? "");
  const [portionSize, setPortionSize] = useState(defaultPortionSize?.toString() ?? "");
  const [portionUnit, setPortionUnit] = useState(defaultPortionUnit ?? "g");

  // Solo guardamos costo manual si NO venimos de una compra asociada
  const [manualCost, setManualCost] = useState(
    !defaultPurchaseId && defaultCost ? defaultCost.toString() : ""
  );

  const [price, setPrice] = useState(defaultPrice?.toString() ?? "");
  const [priceTouched, setPriceTouched] = useState(false);

  // Estados de Packaging
  const [hasPackaging, setHasPackaging] = useState(Boolean(defaultPackagingPurchaseId));
  const [packagingId, setPackagingId] = useState(defaultPackagingPurchaseId ?? "");

  // 1. Cálculo del ingrediente
  const selectedPurchase = purchases.find((p) => p.id === purchaseId);

  const calculatedIngredientCost = useMemo(() => {
    if (!selectedPurchase || !portionSize) return null;
    const size = Number(portionSize);
    if (size <= 0) return null;

    let purchaseQtyInSameUnit = selectedPurchase.quantity;
    if (selectedPurchase.unit === "kg" && portionUnit === "g") {
      purchaseQtyInSameUnit = selectedPurchase.quantity * 1000;
    } else if (selectedPurchase.unit === "g" && portionUnit === "kg") {
      purchaseQtyInSameUnit = selectedPurchase.quantity / 1000;
    }

    const costPerUnit = selectedPurchase.total_cost / purchaseQtyInSameUnit;
    return Math.round(costPerUnit * size);
  }, [selectedPurchase, portionSize, portionUnit]);

  // Si hay compra asociada, la prioridad SIEMPRE es el cálculo automático
  const ingredientCost = purchaseId
    ? (calculatedIngredientCost ?? 0)
    : (Number(manualCost) || 0);

  // 2. Cálculo del envase / packaging
  const selectedPackaging = packagingOptions.find((p) => p.id === packagingId);
  const packagingCost = useMemo(() => {
    if (!hasPackaging || !selectedPackaging || selectedPackaging.quantity <= 0) return 0;
    return Math.round(selectedPackaging.total_cost / selectedPackaging.quantity);
  }, [hasPackaging, selectedPackaging]);

  // 3. COSTO TOTAL (Ingrediente + Envase)
  const finalCost = ingredientCost + packagingCost;

  // 4. Precio sugerido y ganancias basadas en COSTO TOTAL
  const suggestedPrice = finalCost > 0 ? Math.round(finalCost * 1.3) : 0;
  const finalPrice = Number(price) || 0;
  const profit = finalPrice - finalCost;
  const marginPercent = finalCost > 0 ? (profit / finalCost) * 100 : null;
  const displayedPrice = !priceTouched && suggestedPrice > 0 ? suggestedPrice.toString() : price;

  return (
    <div className="mb-6 rounded-md border border-blue-100 bg-blue-50 p-4">
      <p className="mb-3 text-sm font-medium text-blue-900">
        Calculadora de costo y ganancia
      </p>

      {/* 1. Selección de Ingrediente */}
      <div className="mb-3">
        <label className="mb-1 block text-xs font-medium text-gray-600">
          ¿De qué compra sale este producto?
        </label>
        <select
          value={purchaseId}
          onChange={(e) => {
            setPurchaseId(e.target.value);
            if (!e.target.value) setManualCost("");
          }}
          className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
        >
          <option value="">No asociar / cargar costo manual</option>
          {purchases.map((p) => (
            <option key={p.id} value={p.id}>
              {p.description} — {p.quantity}{p.unit} por ${p.total_cost.toLocaleString("es-AR")}
            </option>
          ))}
        </select>
      </div>

      {purchaseId && (
        <div className="mb-3 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Tamaño de la porción
            </label>
            <input
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
              Unidad
            </label>
            <select
              value={portionUnit}
              onChange={(e) => setPortionUnit(e.target.value)}
              className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
            >
              <option value="g">Gramos (g)</option>
              <option value="kg">Kilogramos (kg)</option>
              <option value="unit">Unidad</option>
            </select>
          </div>
        </div>
      )}

      {/* 2. Sección de Packaging / Envase */}
      <div className="mb-4 mt-2 rounded-md border border-blue-200 bg-white p-3">
        <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={hasPackaging}
            onChange={(e) => {
              setHasPackaging(e.target.checked);
              if (!e.target.checked) setPackagingId("");
            }}
            className="rounded border-gray-300 text-blue-600"
          />
          ¿Viene en bolsa / envase?
        </label>

        {hasPackaging && (
          <div className="mt-2">
            <select
              value={packagingId}
              onChange={(e) => setPackagingId(e.target.value)}
              className="block w-full rounded-md border border-gray-200 py-1.5 px-2 text-xs"
            >
              <option value="">Elegí un envase</option>
              {packagingOptions.map((pkg) => {
                const costPerUnit = pkg.quantity > 0 ? Math.round(pkg.total_cost / pkg.quantity) : 0;
                return (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.description} — ${costPerUnit.toLocaleString("es-AR")}/unidad
                  </option>
                );
              })}
            </select>
          </div>
        )}
      </div>

      {/* 3. Costo y Precio de Venta */}
      <div className="mb-3 grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            {purchaseId
              ? `Costo total ${hasPackaging && packagingCost > 0 ? `($${ingredientCost} + $${packagingCost} envase)` : ""}`
              : "Costo ingrediente (manual)"}
          </label>
          <input
            type="number"
            step="1"
            value={purchaseId ? finalCost : manualCost}
            onChange={(e) => {
              if (!purchaseId) setManualCost(e.target.value);
            }}
            readOnly={Boolean(purchaseId)}
            className={`block w-full rounded-md border border-gray-200 py-2 px-3 text-sm font-semibold ${
              purchaseId ? "bg-gray-100 text-gray-700" : "bg-white text-gray-900"
            }`}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Precio de venta
          </label>
          <input
            type="number"
            step="1"
            value={displayedPrice}
            onChange={(e) => {
              setPrice(e.target.value);
              setPriceTouched(true);
            }}
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
          />
          <input type="hidden" name="price" value={displayedPrice} />
        </div>
      </div>

      {/* 4. Resumen de Ganancia */}
      {finalCost > 0 && finalPrice > 0 && (
        <div
          className={`rounded-md p-3 text-sm ${
            profit > 0 ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
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
              {marginPercent.toFixed(0)}% sobre costo total)
            </span>
          )}
          {profit <= 0 && <span> — ¡Estás vendiendo a pérdida!</span>}
        </div>
      )}

      {/* Inputs Ocultos para el Formulario */}
      <input type="hidden" name="cost" value={finalCost} />
      <input type="hidden" name="purchase_id" value={purchaseId} />
      <input type="hidden" name="portion_size" value={portionSize} />
      <input type="hidden" name="portion_unit" value={portionUnit} />
      <input type="hidden" name="packaging_purchase_id" value={hasPackaging ? packagingId : ""} />
      <input type="hidden" name="packaging_cost" value={packagingCost} />
    </div>
  );
}