export interface RecentProduct {
  ProductId: number;
  ProductName: string;
  MinPrice: number;
  ThumbnailImagePath?: string;
}

export const MAX_RECENT = 12;

/** Puts the product first; a product seen again moves up instead of being listed twice. Pure. */
export function mergeRecent(list: RecentProduct[], product: RecentProduct, max = MAX_RECENT): RecentProduct[] {
  return [product, ...list.filter((item) => item.ProductId !== product.ProductId)].slice(0, max);
}
