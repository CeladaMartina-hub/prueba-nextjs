'use client';

import { useMemo, useState } from 'react';

type PurchaseOption = {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  total_cost: number;
};

export default function CostCalculator({
  purchases,
  defaultPurchaseId,
  defaultPortionSize,
  defaultPortionUnit,
  defaultCost,
  defaultPrice,
}: {
  purchases: PurchaseOption[];
  defaultPurchaseId?: string;
  defaultPortionSize?: number;
  defaultPortionUnit?: string;
  defaultCost?: number;
  defaultPrice?: number;
}) {
  const [purchaseId, setPurchaseId] = useState(defaultPurchaseId ?? '');
  const [portionSize, setPortionSize] = useState(defaultPortionSize?.toString() ?? '');
  const [portionUnit, setPortionUnit] = useState(defaultPortionUnit ?? 'g');
  const [manualCost, setManualCost] = useState(defaultCost?.toString() ?? '');
  const [price, setPrice] = useState(defaultPrice?.toString() ?? '');

  const selectedPurchase = purchases.find((p) => p.id === purchaseId);

  const calculatedCost = useMemo(() => {
    if (!selectedPurchase || !portionSize) return null;

    const size = Number(portionSize);
    if (size <= 0) return null;

    let purchaseQtyInSameUnit = selectedPurchase.quantity;
    if (selectedPurchase.unit === 'kg' && portionUnit === 'g') {
      purchaseQtyInSameUnit = selectedPurchase.quantity * 1000;
    } else if (selectedPurchase.unit === 'g' && portionUnit === 'kg') {
      purchaseQtyInSameUnit = selectedPurchase.quantity / 1000;
    }

    const costPerUnit = selectedPurchase.total_cost / purchaseQtyInSameUnit;
    return Math.round(costPerUnit * size);
  }, [selectedPurchase, portionSize, portionUnit]);

  const finalCost = calculatedCost !== null && !manualCost ? calculatedCost : Number(manualCost) || 0;
  const finalPrice = Number(price) || 0;

  const profit = finalPrice - finalCost;
  const marginPercent = finalCost > 0 ? (profit / finalCost) * 100 : null;

  return (
    <div className="mb-6 rounded-md border border-blue-100 bg-blue-50 p-4">
      <p className="mb-3 text-sm font-medium text-blue-900">
        Calculadora de costo y ganancia
      </p>

      <div className="mb-3">
        <label className="mb-1 block text-xs font-medium text-gray-600">
          ¿De qué compra sale este producto?
        </label>
        <select
          value={purchaseId}
          onChange={(e) => setPurchaseId(e.target.value)}
          className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
        >
          <option value="">No asociar / cargar costo manual</option>
          {purchases.map((p) => (
            <option key={p.id} value={p.id}>
              {p.description} — {p.quantity}{p.unit} por ${p.total_cost.toLocaleString('es-AR')}
            </option>
          ))}
        </select>
      </div>

      {purchaseId && (
        <div className="mb-3 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Tamaño de la porción</label>
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
            <label className="mb-1 block text-xs font-medium text-gray-600">Unidad</label>
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

      <div className="mb-3 grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Costo {calculatedCost !== null && !manualCost ? '(calculado)' : ''}
          </label>
          <input
            type="number"
            name="cost"
            step="1"
            value={calculatedCost !== null && !manualCost ? calculatedCost : manualCost}
            onChange={(e) => setManualCost(e.target.value)}
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Precio de venta</label>
          <input
            type="number"
            step="1"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
          />
          {/* Espejo hidden para que llegue con el name="price" que espera el form */}
          <input type="hidden" name="price" value={price} />
        </div>
      </div>

      {finalCost > 0 && finalPrice > 0 && (
        <div
          className={`rounded-md p-3 text-sm ${
            profit > 0 ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          Ganancia: <span className="font-semibold">${profit.toLocaleString('es-AR')}</span>
          {marginPercent !== null && (
            <span> ({marginPercent >= 0 ? '+' : ''}{marginPercent.toFixed(0)}% sobre el costo)</span>
          )}
          {profit <= 0 && <span> — ¡Estás vendiendo a pérdida o sin margen!</span>}
        </div>
      )}

      <input type="hidden" name="purchase_id" value={purchaseId} />
      <input type="hidden" name="portion_size" value={portionSize} />
      <input type="hidden" name="portion_unit" value={portionUnit} />
    </div>
  );
}