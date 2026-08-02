import SaleForm from '@/app/ui/sales/form';
import { fetchCustomers, fetchProductsForSale, fetchKitsForSale } from '@/app/lib/data';

export default async function Page() {
  const [customers, products, kits] = await Promise.all([
    fetchCustomers(),
    fetchProductsForSale(),
    fetchKitsForSale(),
  ]);

  return <SaleForm customers={customers} products={products} kits={kits} />;
}