import type { SourceRow } from "@/components/sources-panel"

/** Fuentes metodológicas del radar de derechos (valores 0–100 son normalizados/editoriales). */
export const DERECHOS_SOURCE_ROWS: SourceRow[] = [
  {
    key: "derechos-prensa",
    descripcion: "Libertad de prensa — Reporters Without Borders",
    fuente: "https://rsf.org/en/index",
    fuenteCorta: "RSF",
    fechaFuente: "",
    periodo: 2024,
  },
  {
    key: "derechos-lgbtq",
    descripcion: "Derechos LGBTQ+ — ILGA World",
    fuente: "https://ilga.org/maps-sexual-orientation-laws",
    fuenteCorta: "ILGA",
    fechaFuente: "",
    periodo: 2024,
  },
  {
    key: "derechos-genero",
    descripcion: "Igualdad de género — Global Gender Gap Index",
    fuente: "https://www.weforum.org/publications/global-gender-gap-report-2024/",
    fuenteCorta: "WEF",
    fechaFuente: "",
    periodo: 2024,
  },
  {
    key: "derechos-economia",
    descripcion: "Libertad económica — Heritage Foundation",
    fuente: "https://www.heritage.org/index/ranking",
    fuenteCorta: "Heritage",
    fechaFuente: "",
    periodo: 2024,
  },
  {
    key: "derechos-democracia",
    descripcion: "Índice democrático — Economist Intelligence Unit",
    fuente: "https://www.eiu.com/n/campaigns/democracy-index-2023/",
    fuenteCorta: "EIU",
    fechaFuente: "",
    periodo: 2024,
  },
]
