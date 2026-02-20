"use client";

import { useState } from "react";
import { ArrowLeft, TrendingUp, MapPin, Package } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DemandMeter } from "@/components/ui/demand-meter";
import SparklesIcon from "@/components/ui/sparkles-icon";
import { LoadingIcon } from "@/components/ui/loading-icon";
import CameraIcon from "@/components/ui/camera-icon";

export default function AddProductPage() {
  const [formData, setFormData] = useState({
    image: "",
    name: "",
    description: "",
    price: "",
    demandScale: 0,
    quantity: "",
    location: "",
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDemandChange = (demandScore: number) => {
    setFormData(prev => ({ ...prev, demandScale: demandScore }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // For now, just store the file name
      // In a real app, you'd upload to cloud storage
      handleInputChange("image", file.name);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Product data:", formData);
    // Handle form submission
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/seller/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">Add New Product</h1>
            <p className="text-muted-foreground">List your product on the marketplace</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Image */}
          <Card className="border-terracotta/20 bg-cream/50 dark:bg-clay/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-terracotta dark:text-foreground">
                <CameraIcon className="h-5 w-5" />
                Product Image
              </CardTitle>
              <CardDescription className="text-muted-foreground font-light">
                Upload a clear photo of your product
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-terracotta/30 rounded-2xl p-8 text-center bg-cream/30 dark:bg-clay/5">
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="image"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <CameraIcon className="h-8 w-8 text-terracotta/60 dark:text-saffron/60" />
                    <span className="text-sm text-muted-foreground font-light">
                      Click to upload image
                    </span>
                  </label>
                </div>
                {formData.image && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {formData.image}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Product Name */}
          <Card className="border-terracotta/20 bg-cream/50 dark:bg-clay/10">
            <CardHeader>
              <CardTitle className="text-terracotta dark:text-foreground">Product Name</CardTitle>
              <CardDescription className="text-muted-foreground font-light">
                Give your product a clear, descriptive name
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                id="name"
                placeholder="e.g., Handwoven Cotton Basket"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                className="border-terracotta/20 focus:border-terracotta dark:border-foreground/20 dark:focus:border-foreground"
              />
            </CardContent>
          </Card>

          {/* Product Description */}
          <Card className="border-terracotta/20 bg-cream/50 dark:bg-clay/10">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  Product Description
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 border-0 bg-transparent hover:bg-transparent p-0"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <LoadingIcon size={16} />
                  ) : (
                    <SparklesIcon size={16} />
                  )}
                </Button>
              </CardTitle>
              <CardDescription className="text-muted-foreground font-light">
                Describe your product materials, size, and unique features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                id="description"
                placeholder="Describe your product..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Product Price */}
          <Card className="border-terracotta/20 bg-cream/50 dark:bg-clay/10">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  Product Price
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 border-0 bg-transparent hover:bg-transparent p-0"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <LoadingIcon size={16} />
                  ) : (
                    <SparklesIcon size={16} />
                  )}
                </Button>
              </CardTitle>
              <CardDescription className="text-muted-foreground font-light">
                Set a competitive price for your product
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                id="price"
                type="text"
                placeholder="₹299"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                required
                className="border-terracotta/20 focus:border-terracotta dark:border-foreground/20 dark:focus:border-foreground"
              />
            </CardContent>
          </Card>

          {/* Product Demand Scale */}
          <Card className="border-terracotta/20 bg-cream/50 dark:bg-clay/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-terracotta dark:text-foreground">
                <TrendingUp className="h-5 w-5" />
                Demand Analysis
              </CardTitle>
              <CardDescription className="text-muted-foreground font-light">
                AI-powered demand prediction based on product details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DemandMeter
                productName={formData.name}
                description={formData.description}
                price={formData.price}
                onDemandChange={handleDemandChange}
              />
            </CardContent>
          </Card>

          {/* Product Quantity */}
          <Card className="border-terracotta/20 bg-cream/50 dark:bg-clay/10">
            <CardHeader>
              <CardTitle className="text-terracotta dark:text-foreground">Product Quantity</CardTitle>
              <CardDescription className="text-muted-foreground font-light">
                How many units do you have available?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                id="quantity"
                type="number"
                placeholder="10"
                value={formData.quantity}
                onChange={(e) => handleInputChange("quantity", e.target.value)}
                required
                min="1"
                className="border-terracotta/20 focus:border-terracotta dark:border-foreground/20 dark:focus:border-foreground"
              />
            </CardContent>
          </Card>

          {/* Product Location */}
          <Card className="border-terracotta/20 bg-cream/50 dark:bg-clay/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-terracotta dark:text-foreground">
                <MapPin className="h-5 w-5" />
                Product Location
              </CardTitle>
              <CardDescription className="text-muted-foreground font-light">
                Where is this product located?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                id="location"
                placeholder="e.g., Jaipur, Rajasthan"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                required
                className="border-terracotta/20 focus:border-terracotta dark:border-foreground/20 dark:focus:border-foreground"
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button 
              type="submit" 
              className="flex-1 bg-terracotta hover:bg-terracotta/90 text-primary-foreground dark:bg-foreground dark:hover:bg-foreground/90 dark:text-foreground font-medium"
            >
              List Product
            </Button>
            <Link href="/seller/dashboard">
              <Button 
                type="button" 
                variant="outline"
                className="border-terracotta/30 text-terracotta hover:bg-terracotta hover:text-primary-foreground dark:border-foreground/30 dark:text-foreground dark:hover:bg-foreground/90 dark:hover:text-foreground"
              >
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
