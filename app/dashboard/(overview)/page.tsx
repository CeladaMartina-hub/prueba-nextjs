
import { Suspense } from "react";
import {
  CardsSkeleton 
} from "@/app/ui/skeletons";
import CardWrapper from "@/app/ui/dashboard/cards";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function Page() {
  return (
    <main>      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<CardsSkeleton />}>
          <CardWrapper />
        </Suspense>
      </div>      
    </main>
  );
}
