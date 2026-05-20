/** Texto mientras carga data.json */
export const LOADING_INTRO = "Cargando datos..."

/** Los 4 bloques narrativos de la home */
export const BLOCKS = {
  previa: {
    number: "01",
    title: "La Previa del Mundial",
    subtitle:
      "Arranca la fiebre mundialista. Nos preparamos para palpitar lo que van a ser los próximos días.",
  },
  mundial: {
    number: "02",
    title: "El Mundial",
    subtitle: "El momento de vivirlo.",
  },
  festejo: {
    number: "03",
    title: "El Festejo",
    subtitle: "Argentina campeona.",
  },
  gente: {
    number: "04",
    title: "La Gente",
    subtitle: "El tono cambia. Más íntimo.",
  },
} as const

export type BlockId = keyof typeof BLOCKS

export interface SectionCopy {
  number: string
  title: string
  intro: string
  closing: string
  /** Párrafo opcional bajo el intro (instrucciones, contexto extra) */
  body?: string
}

export const SECTIONS = {
  album: {
    number: "01",
    title: "El álbum del Mundial",
    intro: "Completar el álbum pasó de ser un hobby familiar a un lujo.",
    closing:
      "Pegar figuritas dejó de ser ritual barato: hoy el álbum es un proyecto de varios sueldos.",
  },
  playstation: {
    number: "02",
    title: "La Play en la previa",
    intro:
      "Jugar al FIFA antes del mundial ya no es lo mismo. Aunque la consola cuesta mas en pesos, el poder adquisitivo cambio.",
    closing:
      "La consola subió en pesos, pero en salarios mínimos el sueño gamer también pesa distinto.",
  },
  pelota: {
    number: "03",
    title: "La pelota",
    intro:
      "Jugar al fútbol tiene un precio. La pelota oficial del Mundial pasó de ser un capricho caro a un lujo difícil de justificar.",
    closing:
      "La pelota oficial ya no es capricho: son días de laburo que antes no pesaban igual.",
  },
  camiseta: {
    number: "03",
    title: "La camiseta",
    intro: "Vestir los colores de la Selección requiere más días de trabajo que hace 4 años.",
    closing: "Vestir celeste y blanco cuesta más días de trabajo que en Qatar.",
  },
  cancha: {
    number: "04",
    title: "El precio de la cancha",
    intro:
      "De los estadios de primera a los estadios del mundo. ¿Cuánto cuesta ir a ver a la Selección?",
    closing:
      "Del estadio de Primera al Mundial: cada paso del viaje pesa más en pesos y en horas.",
  },
  mate: {
    number: "06",
    title: "El mate mundialista",
    intro: "El mate nunca falta. Veamos cuanto cuesta el ritual mas argentino.",
    closing: "El ritual no cambió; cambió cuánta yerba entra en un sueldo mínimo.",
  },
  asado: {
    number: "07",
    title: "El asado de la final",
    intro: "El ritual argentino por excelencia tambien sintio la inflacion.",
    closing:
      "El asado sigue siendo argentino; lo que no alcanza es cuántos asados compra un salario.",
  },
  fernet: {
    number: "09",
    title: "El fernet del campeon",
    intro: "El festejo tambien tiene inflacion.",
    closing: "Brindar con el campeón también tiene inflación: menos fernet por sueldo.",
  },
  micro: {
    number: "11",
    title: "El micro del festejo",
    intro:
      "Si los campeones del mundo hubieran viajado en colectivo… ¿cuánto les hubiera costado ir a festejar?",
    closing:
      "Si el festejo fuera en colectivo, el boleto pesaría más que la ilusión del recorrido.",
  },
  jubilacion: {
    number: "13",
    title: "Los hinchas más grandes",
    intro: "Este es uno de los golpes emocionales más fuertes de la comparación.",
    closing:
      "Ni en 2022 ni en 2026 alcanza la jubilación mínima para un monoambiente: el festejo quedó lejos de quien más lo vivió.",
  },
  ninos: {
    number: "12",
    title: "Los hinchas más chiquitos...",
    intro:
      "Después del Mundial, algunos nombres de la Scaloneta explotaron en los registros civiles. ¿Podés adivinar cuántos bebés de cada 1.000 nacidos en 2023 se llamaron así?",
    body: "Pasá el cursor por los bebés: se van “pintando” de izquierda a derecha. Cada uno representa 1 niño cada 1.000 nacidos. Hacé clic para confirmar tu respuesta.",
    closing:
      "Después del título, algunos nombres explotaron en los padrones de nacimiento: el Mundial también dejó huella en los recién nacidos.",
  },
  derechos: {
    number: "13",
    title: "Derechos: Qatar vs EEUU vs Canadá vs México",
    intro: "No todos los Mundiales se juegan en la cancha.",
    closing:
      "No todos los Mundiales se juegan en la cancha: en sede también se miden prensa, derechos y democracia.",
  },
  trabajo: {
    number: "08",
    title: "El que falto al laburo",
    intro: "Faltar en 2022 costaba menos. En 2026, con nuevas reglas, el costo puede ser mayor.",
    closing:
      "Faltar para ver el partido ya no es un chiste de oficina: en 2026 el costo puede ser el doble.",
  },
  alquiler: {
    number: "10",
    title: "El depto 2 ambientes",
    intro: "El balcon del festejo ahora cuesta mas meses de trabajo.",
    closing:
      "El balcón del festejo pesa más meses de sueldo: alquilar para celebrar también se encareció.",
  },
  viaje: {
    number: "05",
    title: "El Viaje al Mundial",
    intro: "",
    closing:
      "Cruzar el Atlántico o volar a Miami: el pasaje al Mundial pesa más sueldos mínimos que en Qatar.",
  },
} as const satisfies Record<string, SectionCopy>

export type SectionId = keyof typeof SECTIONS

export function formatViajeIntro(salarios2022: string, salarios2026: string): string {
  return `Costear los vuelos ida y vuelta en 2022 requería ${salarios2022} salarios mínimos. Para 2026, la cifra asciende a ${salarios2026}.`
}

export const HERO_COPY = {
  titleLine1: "¿Cuánto cuesta",
  titleLine2: "ser campeón del mundo?",
  subtitle:
    "En 2022 Argentina se coronó campeona del mundo. ¿Cuál sería el precio de ser campeones hoy?",
  badge2022: { label: "2022", place: "Qatar · Campeones" },
  badge2026: { label: "2026", place: "EEUU · Can · Méx" },
} as const

export const CIERRE_COPY = {
  kicker: "Cierre",
  title: "¿Es más caro soñar?",
  indexLabel: 'Índice "Ser campeón del mundo"',
  indexNote: "Base 100 = Qatar 2022 (medido en salarios mínimos)",
  breakdownTitle: "Desglose por categoría (en salarios mínimos)",
  lines: [
    "En 2022 Argentina fue campeona del mundo.",
    "En 2026 quiere volver a serlo.",
  ],
  questionLead: "La pregunta es:",
  question: "¿cuánto cuesta hoy ese sueño?",
  signature: "Una visualización de datos",
} as const
