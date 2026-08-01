import { fetchCategories } from "@/app/lib/data";
import Form from "@/app/ui/products/create-form";
import { lusitana } from '@/app/ui/fonts';
import { CreateProduct } from "@/app/ui/products/buttons";

export default async function Page() {
//   const categories = await fetchCategories();
//   return <Form categories={categories} />;
 <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Products</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <CreateProduct />
      </div>
    </div>
}   