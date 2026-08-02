import KitBuilder from '@/app/ui/kits/kit-builder';
import { fetchProductsForKit } from '@/app/lib/data';
import { createKit } from '@/app/lib/actions';

export default async function Page() {
  const products = await fetchProductsForKit();
  return <KitBuilder products={products} action={createKit} />;
}