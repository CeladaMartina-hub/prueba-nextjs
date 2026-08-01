import CategoryForm from '@/app/ui/categories/form';
import { fetchCategoryById } from '@/app/lib/data';
import { updateCategory } from '@/app/lib/actions';
import { notFound } from 'next/navigation';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const category = await fetchCategoryById(id);

  if (!category) {
    notFound();
  }

  const updateCategoryWithId = updateCategory.bind(null, id);

  return <CategoryForm category={category} action={updateCategoryWithId} />;
}