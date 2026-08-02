import EditForm from '@/app/ui/products/edit-form';
import { fetchProductById, fetchCategories, fetchPurchasesForSelect } from '@/app/lib/data';
import { notFound } from 'next/navigation';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const [product, categories, purchases] = await Promise.all([
    fetchProductById(id),
    fetchCategories(),
     fetchPurchasesForSelect()
  ]);

  if (!product) {
    notFound();
  }

  return <EditForm product={product} categories={categories} purchases={purchases} />;
}