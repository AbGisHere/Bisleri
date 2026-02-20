"use client";

import { useState } from "react";
import { Search, MapPin, SlidersHorizontal, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

const CATEGORIES = ["All", "Weaving", "Pottery", "Embroidery", "Food", "Jewellery", "Painting", "Basket Weaving"];

const PRODUCTS = [
  {
    id: "1",
    name: "Handwoven Dhurrie Rug",
    seller: "Meena Devi",
    location: "Jaipur, Rajasthan",
    price: 2400,
    category: "Weaving",
    demand: "high" as const,
    color: "from-terracotta/20 to-saffron/10",
    initial: "D",
  },
  {
    id: "2",
    name: "Terracotta Wind Chimes",
    seller: "Sunita Bai",
    location: "Khurja, UP",
    price: 340,
    category: "Pottery",
    demand: "medium" as const,
    color: "from-clay/30 to-terracotta/10",
    initial: "T",
  },
  {
    id: "3",
    name: "Bamboo Storage Basket",
    seller: "Priya Das",
    location: "Guwahati, Assam",
    price: 180,
    category: "Basket Weaving",
    demand: "high" as const,
    color: "from-forest/15 to-forest/5",
    initial: "B",
  },
  {
    id: "4",
    name: "Block Print Kurta",
    seller: "Radha Kumari",
    location: "Bagru, Gujarat",
    price: 850,
    category: "Embroidery",
    demand: "medium" as const,
    color: "from-saffron/20 to-saffron/5",
    initial: "K",
  },
  {
    id: "5",
    name: "Cold-Pressed Sesame Oil",
    seller: "Lakshmi SHG",
    location: "Tumkur, Karnataka",
    price: 290,
    category: "Food",
    demand: "high" as const,
    color: "from-forest/20 to-saffron/10",
    initial: "O",
  },
  {
    id: "6",
    name: "Madhubani Wall Painting",
    seller: "Sita Devi",
    location: "Mithila, Bihar",
    price: 1200,
    category: "Painting",
    demand: "high" as const,
    color: "from-primary/15 to-accent/10",
    initial: "M",
  },
  {
    id: "7",
    name: "Silver Filigree Earrings",
    seller: "Fatima Bibi",
    location: "Cuttack, Odisha",
    price: 680,
    category: "Jewellery",
    demand: "medium" as const,
    color: "from-muted/60 to-saffron/10",
    initial: "E",
  },
  {
    id: "8",
    name: "Phulkari Dupatta",
    seller: "Gurpreet Kaur",
    location: "Patiala, Punjab",
    price: 1100,
    category: "Embroidery",
    demand: "high" as const,
    color: "from-saffron/25 to-terracotta/10",
    initial: "P",
  },
  {
    id: "9",
    name: "Warli Art Tote Bag",
    seller: "Asha Warli",
    location: "Dahanu, Maharashtra",
    price: 420,
    category: "Painting",
    demand: "medium" as const,
    color: "from-clay/20 to-muted/30",
    initial: "W",
  },
];

const DEMAND_STYLES = {
  high: { label: "High demand", className: "bg-forest/10 text-forest dark:bg-forest/20 dark:text-forest" },
  medium: { label: "Trending", className: "bg-saffron/20 text-accent-foreground dark:bg-saffron/15 dark:text-saffron" },
  low: { label: "Low demand", className: "bg-muted text-muted-foreground" },
};

function ProductCard({ product }: { product: typeof PRODUCTS[0] }) {
  const demand = DEMAND_STYLES[product.demand];
  return (
    <Link
      href={`/marketplace/${product.id}` as never}
      className="group flex flex-col rounded-2xl border border-border overflow-hidden hover:shadow-md hover:shadow-primary/5 hover:border-primary/20 transition-all"
    >
      <div className={`aspect-[4/3] bg-gradient-to-br ${product.color} flex items-center justify-center`}>
        <span className="font-display text-5xl text-foreground/20 select-none">
          {product.initial}
        </span>
      </div>
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
            <MapPin className="w-3 h-3 shrink-0" />
            {product.location}
          </p>
          <h3 className="font-medium text-sm leading-snug group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">by {product.seller}</p>
        </div>
        <div className="flex items-center justify-between mt-auto">
          <span className="font-semibold text-base">₹{product.price.toLocaleString("en-IN")}</span>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${demand.className}`}>
            {demand.label}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function MarketplacePage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = PRODUCTS.filter((p) => {
    const matchesCategory = category === "All" || p.category === category;
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase()) ||
      p.seller.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <button
          onClick={() => router.back()}
          className="sm:hidden flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">
          Browse
        </p>
        <h1 className="font-display text-5xl sm:text-6xl tracking-tight">Marketplace</h1>
        <div className="mt-5 h-[3px] w-10 rounded-full bg-primary" />
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
          <Input
            placeholder="Search products, sellers, or locations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 pl-10 rounded-xl bg-muted/40 border-border/40 focus-visible:bg-background focus-visible:border-border placeholder:text-muted-foreground/50"
          />
        </div>
        <button className="flex items-center gap-2 px-4 h-11 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors shrink-0">
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2 mb-10">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              category === cat
                ? "bg-primary text-primary-foreground"
                : "border border-border text-muted-foreground hover:text-foreground hover:border-border/80"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-5">
        {filtered.length} {filtered.length === 1 ? "product" : "products"}
      </p>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-16 text-center">
          <p className="text-muted-foreground text-sm">No products match your search.</p>
          <button
            onClick={() => { setSearch(""); setCategory("All"); }}
            className="text-primary text-sm font-medium mt-2 hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
