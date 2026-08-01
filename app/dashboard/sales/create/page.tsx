import SaleForm from '@/app/ui/sales/form';
import { fetchCustomers, fetchProductsForSale } from '@/app/lib/data';

export default async function Page() {
  const [customers, products] = await Promise.all([
    fetchCustomers(),
    fetchProductsForSale(),
  ]);

  return <SaleForm customers={customers} products={products} />;
}