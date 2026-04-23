import React from "react";
import ProductCard from "./ProductCard";

export default function CategorySection({ id, title, products }) {
  if (!products?.length) return null;
  return (
    <section
      id={id}
      data-testid={`category-section-${id}`}
      className="px-3 md:px-6 mx-auto max-w-6xl pt-10 md:pt-14"
    >
      <div className="flex items-center gap-3 mb-5 md:mb-7">
        <h2
          className="font-bangers tbx-title text-3xl md:text-5xl text-white"
          data-testid={`category-title-${id}`}
        >
          {title}
        </h2>
        <div className="tbx-stamp flex-1" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
