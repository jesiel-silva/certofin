import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CertoFin - Gestão Financeira Inteligente",
    short_name: "CertoFin",
    description:
      "SaaS de gerenciamento financeiro para pessoas físicas e pequenos empreendedores.",
    start_url: "/",
    display: "standalone",
    background_color: "#0B1221",
    theme_color: "#0B1221",
    lang: "pt-BR",
  };
}