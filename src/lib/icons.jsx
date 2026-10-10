/**
 * Category icon registry — covers all built-in and user-creatable category icons.
 * A named lookup map prevents wildcard `import * as LucideIcons` in render paths,
 * which would pull the entire lucide-react tree (~1000 icons) into the bundle.
 */
import {
  UtensilsCrossed, Home, Car, ShoppingCart, Film, ShoppingBag,
  Heart, CreditCard, BookOpen, Gift, Zap, MoreHorizontal,
  Briefcase, TrendingUp, Laptop,
} from 'lucide-react';

export const CATEGORY_ICONS = {
  UtensilsCrossed,
  Home,
  Car,
  ShoppingCart,
  Film,
  ShoppingBag,
  Heart,
  CreditCard,
  BookOpen,
  Gift,
  Zap,
  MoreHorizontal,
  Briefcase,
  TrendingUp,
  Laptop,
};

/** Returns the Lucide icon component for the given name, falling back to MoreHorizontal. */
export function getCategoryIconComponent(iconName) {
  return CATEGORY_ICONS[iconName] || MoreHorizontal;
}
