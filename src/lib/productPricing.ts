import { Product } from '@/types';

export type DisplayPriceFrom = 'base' | 'left' | 'right';

export function resolveDisplayPriceFrom(product: Product): DisplayPriceFrom {
  if (product.displayPriceFrom) return product.displayPriceFrom;
  if (product.leftButton) return 'left';
  if (product.rightButton) return 'right';
  return 'base';
}

export function getMainDisplayPricing(product: Product): {
  price: number;
  originalPrice?: number;
  from: DisplayPriceFrom;
} {
  const from = resolveDisplayPriceFrom(product);

  if (from === 'left' && product.leftButton) {
    return {
      price: product.leftButton.price,
      originalPrice: product.leftButton.originalPrice ?? undefined,
      from,
    };
  }

  if (from === 'right' && product.rightButton) {
    return {
      price: product.rightButton.price,
      originalPrice: product.rightButton.originalPrice ?? undefined,
      from,
    };
  }

  return {
    price: product.price,
    originalPrice: product.originalPrice ?? undefined,
    from: 'base',
  };
}
