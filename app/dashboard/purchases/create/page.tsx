import PurchaseForm from '@/app/ui/purchases/form';
import { fetchCategories, fetchPackagingPurchases  } from '@/app/lib/data';

export default async function Page() {
  const [categories, packagingOptions] = await Promise.all([
    fetchCategories(),
    fetchPackagingPurchases(),
  ]);
  return <PurchaseForm categories={categories} packagingOptions={packagingOptions} />;
}