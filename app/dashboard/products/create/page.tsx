import { fetchCategories, fetchPurchasesForSelect } from '@/app/lib/data';
import Form from '@/app/ui/products/create-form';

export default async function Page() {
  const [categories, purchases] = await Promise.all([
    fetchCategories(),
    fetchPurchasesForSelect(),
  ]);
  return <Form categories={categories} purchases={purchases} />;
}