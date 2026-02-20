"use client";

import { useState, useRef } from "react";
import type { AnimatedIconHandle } from "@/components/ui/types";
import { ArrowLeft, MapPin, Package } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DemandMeter } from "@/components/ui/demand-meter";
import SparklesIcon from "@/components/ui/sparkles-icon";
import { LoadingIcon } from "@/components/ui/loading-icon";
import CameraIcon from "@/components/ui/camera-icon";

const CATEGORIES = ["Weaving", "Pottery", "Embroidery", "Food", "Jewellery", "Painting", "Basket Weaving", "Tailoring"];

export default function AddProductPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    imagePreview: "",
    name: "",
    description: "",
    category: "",
    price: "",
    demandScale: 0,
    quantity: "",
    location: "",
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const descSparkleRef = useRef<AnimatedIconHandle>(null);
  const priceSparkleRef = useRef<AnimatedIconHandle>(null);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDemandChange = (demandScore: number) => {
    setFormData(prev => ({ ...prev, demandScale: demandScore }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, imagePreview: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.name || !formData.price || !formData.quantity || !formData.location) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || undefined,
          category: formData.category || undefined,
          price: formData.price.replace(/[^0-9.]/g, ""),
          quantity: Number(formData.quantity),
          location: formData.location,
          demandScale: formData.demandScale || undefined,
          imageUrl: formData.imagePreview || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to list product");
      }
      toast.success("Product listed!");
      router.push("/marketplace");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 max-w-2xl mx-auto">
      <div className="mb-10">
        <button
          onClick={() => router.back()}
          className="sm:hidden flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <Link
          href="/seller/dashboard"
          className="hidden sm:inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </Link>
        <h1 className="font-display text-5xl sm:text-6xl tracking-tight">
          New Listing
        </h1>
        <div className="mt-5 h-[3px] w-10 rounded-full bg-terracotta" />
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-12">

        {/* Image */}
        <div>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <label htmlFor="image" className="cursor-pointer block">
            {formData.imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={formData.imagePreview}
                  alt="Product preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                  <span className="text-white text-sm font-medium">Change photo</span>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-border hover:border-primary/40 rounded-2xl aspect-video flex flex-col items-center justify-center gap-3 transition-colors bg-muted/20 hover:bg-muted/40">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <CameraIcon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">Upload a photo</p>
                  <p className="text-xs text-muted-foreground mt-1">Click to browse · JPG, PNG, WEBP</p>
                </div>
              </div>
            )}
          </label>
        </div>

        {/* Details */}
        <div>
          <h2 className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-6">
            Details
          </h2>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Product name</Label>
              <Input
                id="name"
                placeholder="e.g., Handwoven Cotton Basket"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                className="h-12 rounded-xl px-4 bg-muted/40 border-border/40 focus-visible:bg-background focus-visible:border-border placeholder:text-muted-foreground/50"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                <button
                  type="button"
                  disabled={isGenerating}
                  onMouseEnter={() => descSparkleRef.current?.startAnimation()}
                  onMouseLeave={() => descSparkleRef.current?.stopAnimation()}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors disabled:opacity-40"
                >
                  {isGenerating ? (
                    <LoadingIcon size={13} />
                  ) : (
                    <SparklesIcon ref={descSparkleRef} size={13} plain className="text-primary" />
                  )}
                  AI generate
                </button>
              </div>
              <Textarea
                id="description"
                placeholder="Describe your product — materials, size, and what makes it special."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={4}
                className="rounded-xl px-4 py-3 bg-muted/40 border-border/40 focus-visible:bg-background focus-visible:border-border placeholder:text-muted-foreground/50 resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Category</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleInputChange("category", formData.category === cat ? "" : cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                      formData.category === cat
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div>
          <h2 className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-6">
            Pricing &amp; Stock
          </h2>
          <div className="grid grid-cols-2 gap-4 items-end">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="price" className="text-sm font-medium">Price</Label>
                <button
                  type="button"
                  disabled={isGenerating}
                  onMouseEnter={() => priceSparkleRef.current?.startAnimation()}
                  onMouseLeave={() => priceSparkleRef.current?.stopAnimation()}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors disabled:opacity-40"
                >
                  {isGenerating ? (
                    <LoadingIcon size={13} />
                  ) : (
                    <SparklesIcon ref={priceSparkleRef} size={13} plain className="text-primary" />
                  )}
                  Suggest
                </button>
              </div>
              <Input
                id="price"
                type="text"
                placeholder="₹299"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                required
                className="h-12 rounded-xl px-4 bg-muted/40 border-border/40 focus-visible:bg-background focus-visible:border-border placeholder:text-muted-foreground/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-sm font-medium flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-muted-foreground" />
                Quantity
              </Label>
              <Input
                id="quantity"
                type="number"
                placeholder="10"
                value={formData.quantity}
                onChange={(e) => handleInputChange("quantity", e.target.value)}
                required
                min="1"
                className="h-12 rounded-xl px-4 bg-muted/40 border-border/40 focus-visible:bg-background focus-visible:border-border placeholder:text-muted-foreground/50"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div>
          <h2 className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-6">
            Location
          </h2>
          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-medium">Where is this product?</Label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
              <Input
                id="location"
                placeholder="Village, District, or State"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                required
                className="h-12 rounded-xl pl-10 pr-4 bg-muted/40 border-border/40 focus-visible:bg-background focus-visible:border-border placeholder:text-muted-foreground/50"
              />
            </div>
          </div>
        </div>

        {/* Demand */}
        <div>
          <h2 className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-6">
            Demand Forecast
          </h2>
          <DemandMeter
            productName={formData.name}
            description={formData.description}
            price={formData.price}
            onDemandChange={handleDemandChange}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 h-12 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Listing…" : "List Product"}
          </button>
          <Link
            href="/seller/dashboard"
            className="px-6 h-12 rounded-full border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors flex items-center"
          >
            Cancel
          </Link>
        </div>

      </form>
    </div>
  );
}
