import { GoalsView } from "@/components/goals/goals-view";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Metas Financeiras | CertoFin",
  description: "Defina seus objetivos e acompanhe seu progresso de economia.",
};

export default function GoalsPage() {
  return <GoalsView />;
}
