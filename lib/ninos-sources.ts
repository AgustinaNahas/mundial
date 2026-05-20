import type { SourceRow } from "@/components/sources-panel"
import { NOMBRES_NINOS_FUENTE } from "@/lib/nombres-ninos"

export const NINOS_SOURCE_ROWS: SourceRow[] = [
  {
    key: "ninos-padron",
    descripcion: "Padrón de nombres — Argentina (2012–2024)",
    fuente: NOMBRES_NINOS_FUENTE,
    fuenteCorta: "Google Sheets",
    fechaFuente: "",
    periodo: 2023,
  },
]
