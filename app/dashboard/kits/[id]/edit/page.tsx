import KitBuilder from '@/app/ui/kits/kit-builder';
import { fetchKitById, fetchProductsForKit } from '@/app/lib/data';
import { updateKit } from '@/app/lib/actions';
import { notFound } from 'next/navigation';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const [kit, products] = await Promise.all([
    fetchKitById(id),
    fetchProductsForKit(),
  ]);

  if (!kit) {
    notFound();
  }

  const updateKitWithId = updateKit.bind(null, id, kit.image_url);

  return <KitBuilder products={products} kit={kit} action={updateKitWithId} />;
}