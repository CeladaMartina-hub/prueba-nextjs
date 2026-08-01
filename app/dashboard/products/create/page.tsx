import { fetchCategories } from '@/app/lib/data';
import Form from '@/app/ui/products/create-form';

export default async function Page() {
  const categories = await fetchCategories();
  return <Form categories={categories} />;
}