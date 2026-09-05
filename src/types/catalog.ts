export type ProductListItem = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  images: string[];
  price: string;
  mrp: string;
  unit: string;
  rating: string;
  ratingCount: number;
  isFeatured: boolean;
  isBestSeller: boolean;
  categoryName: string;
  categorySlug: string;
  brandName: string | null;
  stockQty: number;
};

export type ProductDetail = ProductListItem & {
  description: string | null;
  specifications: Record<string, string> | null;
  sku: string;
  categoryId: string;
  brandId: string | null;
  lowStockAt: number;
};

export type CategorySummary = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  icon: string | null;
  productCount: number;
};

export type BrandSummary = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  productCount: number;
};
