"use client";

import {
  Tag,
  ShoppingCart,
  Home,
  Car,
  UtensilsCrossed,
  Heart,
  Briefcase,
  Zap,
  Wifi,
  Gift,
  Plane,
  BookOpen,
  Music,
  Dumbbell,
  Coffee,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

export const categoryIconMap: Record<string, LucideIcon> = {
  tag: Tag,
  "shopping-cart": ShoppingCart,
  home: Home,
  car: Car,
  utensils: UtensilsCrossed,
  heart: Heart,
  briefcase: Briefcase,
  zap: Zap,
  wifi: Wifi,
  gift: Gift,
  plane: Plane,
  book: BookOpen,
  music: Music,
  dumbbell: Dumbbell,
  coffee: Coffee,
  "trending-up": TrendingUp,
};

export const categoryIconOptions = [
  { value: "tag", label: "Etiqueta" },
  { value: "shopping-cart", label: "Carrinho" },
  { value: "home", label: "Casa" },
  { value: "car", label: "Carro" },
  { value: "utensils", label: "Alimentação" },
  { value: "heart", label: "Saúde" },
  { value: "briefcase", label: "Trabalho" },
  { value: "zap", label: "Energia" },
  { value: "wifi", label: "Internet" },
  { value: "gift", label: "Presente" },
  { value: "plane", label: "Viagem" },
  { value: "book", label: "Educação" },
  { value: "music", label: "Lazer" },
  { value: "dumbbell", label: "Academia" },
  { value: "coffee", label: "Café" },
  { value: "trending-up", label: "Investimento" },
];

export function getCategoryIcon(iconName: string | null | undefined): LucideIcon {
  return (iconName && categoryIconMap[iconName]) || Tag;
}

interface CategoryIconProps {
  icon: string | null | undefined;
  color?: string | null;
  className?: string;
}

export function CategoryIcon({ icon, color, className }: CategoryIconProps) {
  const Icon = getCategoryIcon(icon);
  return (
    <Icon
      className={className}
      style={color ? { color } : undefined}
    />
  );
}
