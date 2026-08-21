'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Slide = {
  image: string;
  title?: string;
  subtitle?: string;
};

const AUTOPLAY_INTERVAL = 5000;

export default function HeroCarousel({ slides }: { slides: Slide[] }) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setCurrent((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const timer = setInterval(next, AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [isPaused, next, slides.length]);

  if (slides.length === 0) return null;

  return (
    <section
      className="relative w-full bg-[#e9f5e8] aspect-[16/9] sm:aspect-[16/7] lg:aspect-[16/6]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === current ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        >
          <Image
            src={slide.image}
            alt={slide.title ?? `Slide ${index + 1}`}
            fill
            priority={index === 0}
            className="object-contain "
          />
          {(slide.title || slide.subtitle) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 px-4 text-center text-white">
              {slide.title && (
                <h2 className="text-2xl font-semibold md:text-4xl">{slide.title}</h2>
              )}
              {slide.subtitle && (
                <p className="mt-2 text-sm md:text-base">{slide.subtitle}</p>
              )}
            </div>
          )}
        </div>
      ))}

      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Imagen anterior"
            className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-2 hover:bg-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Imagen siguiente"
            className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-2 hover:bg-white"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrent(index)}
                aria-label={`Ir a la imagen ${index + 1}`}
                className={`h-2 rounded-full transition-all ${
                  index === current ? 'w-6 bg-white' : 'w-2 bg-white/60'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}