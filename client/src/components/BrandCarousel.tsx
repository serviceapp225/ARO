import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const brands = [
  { name: 'BMW', logo: 'BMW' },
  { name: 'Mercedes', logo: 'Mercedes' },
  { name: 'Audi', logo: 'Audi' },
  { name: 'Porsche', logo: 'Porsche' },
  { name: 'Tesla', logo: 'Tesla' },
  { name: 'Ferrari', logo: 'Ferrari' },
];

export function BrandCarousel() {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <h2 className="text-2xl font-bold text-center mb-8 text-neutral-900">
          Популярные марки
        </h2>
        
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex items-center justify-center space-x-8 md:space-x-12 pb-4">
            {brands.map((brand) => (
              <div
                key={brand.name}
                className="flex-shrink-0 text-center group cursor-pointer"
              >
                <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center group-hover:bg-neutral-200 transition-colors">
                  <span className="font-bold text-neutral-700 text-sm">
                    {brand.logo}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </section>
  );
}
