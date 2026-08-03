import PurchaseForm from '@/app/ui/purchases/form';
import { fetchCategories } from '@/app/lib/data';

export default async function Page() {
  const categories = await fetchCategories();
  return <PurchaseForm categories={categories} />;
}