import KitBuilder from '@/app/ui/kits/kit-builder';
import { fetchProductsForKit } from '@/app/lib/data';

export default async function Page() {
  const products = await fetchProductsForKit();
  return <KitBuilder products={products} />;
}