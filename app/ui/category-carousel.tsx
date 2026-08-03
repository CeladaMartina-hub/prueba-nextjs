'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Category = { id: string; name: string; image_url: string | null };
type Kit = { id: string; image_url: string };

export default function CategoryCarousel({
  categories,
  kits,
}: {
  categories: Category[];
  kits: Kit[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    function checkOverflow() {
      const el = scrollRef.current;
      if (!el) return;
      setIsOverflowing(el.scrollWidth > el.clientWidth + 1);
    }

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [categories, kits]);

  function scroll(direction: 'left' | 'right') {
    if (!scrollRef.current) return;
    const amount = 300;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  }

  return (
    <div className="relative">
      {isOverflowing && (
        <button
          type="button"
          onClick={() => scroll('left')}
          aria-label="Desplazar a la izquierda"
          className="absolute left-0 top-1/2 z-10 hidden -translate-y-1/2 -translate-x-3 rounded-full border bg-white p-2 shadow hover:bg-gray-50 md:flex"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      <div
        ref={scrollRef}
        className={`flex gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory scroll-smooth ${
          isOverflowing ? '' : 'justify-center'
        }`}
      >
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/products?category=${category.id}`}
            className="group min-w-[130px] snap-start flex-shrink-0 text-center"
          >
            <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-full border-4 border-green-600 bg-white shadow transition-all duration-300 group-hover:scale-105 group-hover:border-green-700">
              {category.image_url ? (
                <Image
                  src={category.image_url}
                  alt={category.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-green-50 text-sm text-green-700">
                  {category.name}
                </div>
              )}
            </div>
            <p className="mt-2 line-clamp-2 text-sm font-medium">{category.name}</p>
          </Link>
        ))}

        {kits.length > 0 && (
          <Link
            href="/kits"
            className="group min-w-[130px] snap-start flex-shrink-0 text-center"
          >
            <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-full border-4 border-green-600 bg-white shadow transition-all duration-300 group-hover:scale-105 group-hover:border-green-700">
              <Image
                src={kits[0].image_url}
                alt="Kits armados"
                fill
                className="object-cover transition group-hover:scale-105"
              />
            </div>
            <p className="mt-2 text-center text-sm font-medium">Kits armados</p>
          </Link>
        )}
      </div>

      {isOverflowing && (
        <button
          type="button"
          onClick={() => scroll('right')}
          aria-label="Desplazar a la derecha"
          className="absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 translate-x-3 rounded-full border bg-white p-2 shadow hover:bg-gray-50 md:flex"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
