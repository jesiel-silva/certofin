import {
  Shield,
  Plane,
  Car,
  Home,
  GraduationCap,
  TrendingUp,
  Target,
  Gift,
  Laptop,
  Heart,
  PiggyBank,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export interface DefaultGoalCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const DEFAULT_GOAL_CATEGORIES: DefaultGoalCategory[] = [
  { id: "reserva", name: "Reserva de Emergência", icon: "Shield", color: "#00ffcc" },
  { id: "viagem", name: "Viagem & Férias", icon: "Plane", color: "#3b82f6" },
  { id: "veiculo", name: "Veículo (Carro / Moto)", icon: "Car", color: "#f59e0b" },
  { id: "casa", name: "Casa Própria / Reforma", icon: "Home", color: "#ec4899" },
  { id: "educacao", name: "Educação & Cursos", icon: "GraduationCap", color: "#8b5cf6" },
  { id: "investimentos", name: "Investimentos & Liberdade", icon: "TrendingUp", color: "#10b981" },
  { id: "eletronicos", name: "Eletrônicos & Equipamentos", icon: "Laptop", color: "#06b6d4" },
  { id: "sonhos", name: "Sonho / Projeto Pessoal", icon: "Sparkles", color: "#eab308" },
];

export const GOAL_ICON_MAP: Record<string, LucideIcon> = {
  Target,
  Shield,
  Plane,
  Car,
  Home,
  GraduationCap,
  TrendingUp,
  Gift,
  Laptop,
  Heart,
  PiggyBank,
  Sparkles,
};

export const GOAL_ICON_OPTIONS = [
  { value: "Target", label: "Alvo" },
  { value: "Shield", label: "Reserva" },
  { value: "PiggyBank", label: "Cofrinho" },
  { value: "TrendingUp", label: "Investimento" },
  { value: "Plane", label: "Viagem" },
  { value: "Car", label: "Veículo" },
  { value: "Home", label: "Casa" },
  { value: "GraduationCap", label: "Estudos" },
  { value: "Laptop", label: "Tecnologia" },
  { value: "Gift", label: "Presente" },
  { value: "Heart", label: "Saúde / Bem-estar" },
  { value: "Sparkles", label: "Sonho" },
];

export const GOAL_COLOR_OPTIONS = [
  "#00ffcc", // Cyan neon
  "#10b981", // Emerald
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#06b6d4", // Sky
];
