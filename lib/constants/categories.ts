import React from "react";
import {
  Globe,
  Briefcase,
  Landmark,
  Users,
  ShoppingCart,
  GraduationCap,
  Code,
  Building2,
  Heart,
  Gamepad2,
  MoreHorizontal,
  Folder,
  Key,
  Shield,
  Lock,
  Star,
  Bookmark,
  Archive,
  FileText,
  Cloud,
  Server,
  Smartphone,
  Mail,
  CreditCard,
  Database,
  type LucideIcon,
} from "lucide-react";
import type { Category } from "@/types/category";

export type { Category };

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  globe: Globe,
  briefcase: Briefcase,
  landmark: Landmark,
  users: Users,
  "shopping-cart": ShoppingCart,
  "graduation-cap": GraduationCap,
  code: Code,
  "building-2": Building2,
  heart: Heart,
  gamepad: Gamepad2,
  more: MoreHorizontal,
  folder: Folder,
  key: Key,
  shield: Shield,
  lock: Lock,
  star: Star,
  bookmark: Bookmark,
  archive: Archive,
  file: FileText,
  cloud: Cloud,
  server: Server,
  smartphone: Smartphone,
  mail: Mail,
  "credit-card": CreditCard,
  database: Database,
};

export const AVAILABLE_CATEGORY_ICONS: {
  name: string;
  label: string;
  icon: LucideIcon;
}[] = [
  { name: "folder", label: "Folder", icon: Folder },
  { name: "key", label: "Key", icon: Key },
  { name: "shield", label: "Shield", icon: Shield },
  { name: "lock", label: "Lock", icon: Lock },
  { name: "star", label: "Star", icon: Star },
  { name: "bookmark", label: "Bookmark", icon: Bookmark },
  { name: "archive", label: "Archive", icon: Archive },
  { name: "file", label: "Document", icon: FileText },
  { name: "cloud", label: "Cloud", icon: Cloud },
  { name: "server", label: "Server", icon: Server },
  { name: "smartphone", label: "Mobile", icon: Smartphone },
  { name: "mail", label: "Mail", icon: Mail },
  { name: "credit-card", label: "Payment", icon: CreditCard },
  { name: "database", label: "Database", icon: Database },
  { name: "globe", label: "Web", icon: Globe },
  { name: "briefcase", label: "Work", icon: Briefcase },
  { name: "landmark", label: "Finance", icon: Landmark },
  { name: "users", label: "Social", icon: Users },
  { name: "shopping-cart", label: "Shopping", icon: ShoppingCart },
  { name: "graduation-cap", label: "Education", icon: GraduationCap },
  { name: "code", label: "Development", icon: Code },
  { name: "building-2", label: "Government", icon: Building2 },
  { name: "heart", label: "Health", icon: Heart },
  { name: "gamepad", label: "Gaming", icon: Gamepad2 },
];

export function getCategoryIcon(iconName?: string): LucideIcon {
  if (!iconName) return Folder;
  const normalized = iconName.toLowerCase().trim();
  return CATEGORY_ICONS[normalized] || Folder;
}

export function CategoryIcon({
  name,
  className,
}: {
  name?: string;
  className?: string;
}) {
  const Icon = getCategoryIcon(name);
  return React.createElement(Icon, { className });
}

export const SYSTEM_CATEGORIES: Category[] = [
  { id: "personal", label: "Personal", icon: "globe", isCustom: false },
  { id: "work", label: "Work", icon: "briefcase", isCustom: false },
  { id: "finance", label: "Finance", icon: "landmark", isCustom: false },
  { id: "social", label: "Social", icon: "users", isCustom: false },
  { id: "shopping", label: "Shopping", icon: "shopping-cart", isCustom: false },
  { id: "education", label: "Education", icon: "graduation-cap", isCustom: false },
  { id: "development", label: "Development", icon: "code", isCustom: false },
  { id: "government", label: "Government", icon: "building-2", isCustom: false },
  { id: "health", label: "Health", icon: "heart", isCustom: false },
  { id: "entertainment", label: "Entertainment", icon: "gamepad", isCustom: false },
  { id: "other", label: "Other", icon: "more", isCustom: false },
];

export const categories = SYSTEM_CATEGORIES;
