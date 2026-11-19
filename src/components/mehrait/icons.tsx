import {
  Apple,
  Baby,
  Cable,
  Coffee,
  CookingPot,
  Croissant,
  CupSoda,
  Droplets,
  Flower2,
  Lamp,
  Milk,
  Package,
  PawPrint,
  Pencil,
  ShoppingBasket,
  SprayCan,
  Wheat,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  "fruits-vegetables": Apple,
  dairy: Milk,
  staples: Wheat,
  snacks: ShoppingBasket,
  beverages: CupSoda,
  tea: Coffee,
  packaged: Package,
  bakery: Croissant,
  personal: Droplets,
  baby: Baby,
  household: Lamp,
  cleaning: SprayCan,
  pet: PawPrint,
  kitchen: CookingPot,
  electronics: Cable,
  beauty: Flower2,
  stationery: Pencil,
};

export function CategoryGlyph({ slug, className }: { slug: string; className?: string }) {
  const Icon = ICONS[slug] ?? ShoppingBasket;
  return <Icon className={className} strokeWidth={1.75} aria-hidden="true" />;
}
