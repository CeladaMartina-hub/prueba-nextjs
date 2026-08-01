import CategoryForm from '@/app/ui/categories/form';
import { createCategory } from '@/app/lib/actions';

export default function Page() {
  return <CategoryForm action={createCategory} />;
}