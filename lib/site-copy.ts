/** Texto mientras carga la planilla */
export const LOADING_INTRO = "Cargando datos..."

/** Los 4 bloques narrativos de la home */
export const BLOCKS = {
  previa: {
    number: "01",
    title: "La Previa del Mundial",
    subtitle:
      "Antes de que empiece el partido, ya nos sentimos adentro de la cancha. Pero, ¿cuánto nos cuesta el precalentamiento?",
  },
  mundial: {
    number: "02",
    title: "El Mundial",
    subtitle:
      "Entradas, viajes y rituales del torneo: cuánto cuesta estar en la cancha o seguirlo desde casa.",
  },
  festejo: {
    number: "03",
    title: "El Festejo",
    subtitle: "¿Cuánto cuesta salir a la calle a celebrar el triunfo?",
  },
  gente: {
    number: "04",
    title: "La Gente",
    subtitle: "22 campeones que representan a todo un país.",
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
    intro:
      "Completar el álbum era un desafío de las vacaciones de invierno (¡o de verano, como en el 2022!).",
 
    closing:
      "Hoy, llenar el album no solo no se llena con el vuelto, sino que puede que se estire hasta después del receso.",
  },
  playstation: {
    number: "02",
    title: "La Play en la previa",
    intro:
      "Antes de que suene el primer silbato, muchos argentinos ya le ganaron a Mbappé en su casa.",
    closing:
      "La Play sigue siendo la misma; lo que se encogió es el sueldo.",
  },
  pelota: {
    number: "03",
    title: "La pelota",
    intro:
      "La pelota oficial del torneo siempre fue cara, pero ¿en qué momento se hizo un lujo?",
    closing:
      "Ganamos el partido, nos llevamos la pelota... ¿por qué entonces cuesta tanto?",
  },
  camiseta: {
    number: "04",
    title: "La camiseta",
    intro:
      "El celeste y blanco no bajó de precio: subió de valor.",
    closing:
      "Ponerse la camiseta quizás sea la cábala más costosa este año.",
  },
  cancha: {
    number: "05",
    title: "El precio de la cancha",
    intro:
      "De los estadios de Primera a los estadios del mundo: Entrar al estadio cuesta más que nunca.",
    closing:
      "Qatar puede estar más lejos, pero Miami sigue costando más.",
  },
  mate: {
    number: "06",
    title: "El mate mundialista",
    intro:
      "El mate acompañó a muchos en los partidos de Qatar y seguramente los va a acompañar en el 2026. "+
      "En el supuesto caso de que te gastes todo tu sueldo en yerba... (¡escuchamos pero no juzgamos! 😅)",
    closing:
      "El mate del campeón subió más que los likes en la foto de Messi.",
  },
  asado: {
    number: "07",
    title: "El asado de la final",
    intro:
      "¿Cuánto cuesta prender la parrilla el día de la final del mundo?",
    closing:
      "El asado no cambió de gusto, pero el sueldo cada vez sabe a menos.",
  },
  fernet: {
    number: "08",
    title: "El fernet del campeón",
    intro:
      "La copa del mundo (que parece que solo podia llenarse con fernet) está más costosa que nunca.",
    closing:
      "El 'viajero' en cualquier momento nos cuesta como si fuese un viaje a Miami.",
  },
  micro: {
    number: "09",
    title: "El micro del festejo",
    intro:
      "Si los campeones del mundo hubieran viajado en colectivo, ¿cuánto les hubiera costado el recorrido del festejo?",
    closing:
      "🕯️ Si pasa lo que queremos que pase 🕯️, este 2026 ir al obelisco nos costaría casi 4 veces más que en 2022.",
  },
  ninos: {
    number: "10",
    title: "Los hinchas más chiquitos...",
    intro:
      "Después del título, algunos nombres de la Scaloneta explotaron en los registros civiles. ¿Podés adivinar cuántos bebés de cada 1.000 nacidos en 2023 se llamaron así?",
    body: "Cada bebé representa 1 niño cada 1.000 nacidos. Intentá estimar cuántos se llamaron así en el 2023.",
    closing:
      "El Mundial también dejó huella en los padrones: algunos nombres crecieron junto con la copa.",
  },
  jubilacion: {
    number: "11",
    title: "Los hinchas más grandes...",
    intro:
      "Nos emocionamos con la abuela la la la la la, ¿pero cómo vivieron y viven los hinchas más longevos?",
    closing:
      "La jubilación aleja a los adultos mayores de la cancha y de la calle",
  },
  derechos: {
    number: "12",
    title: "Derechos: Qatar vs. EEUU, Canadá y México",
    intro:
      "El Mundial no se juega solo en la cancha. Todas las sedes se paran distinto respecto derechos de sus hinchas.",
    closing:
      "Cambiar de sede no es solo cambiar de continente: también cambia qué derechos garantiza el anfitrión.",
  },
  trabajo: {
    number: "08",
    title: "El que faltó al laburo",
    intro:
      "Faltar el día del partido en 2022 tenía un costo acotado. En 2026, con nuevas reglas laborales, ausentarse puede salir el doble.",
    closing:
      "Lo que en 2022 era una travesura de oficina, en 2026 puede ser un descuento que duela.",
  },
  alquiler: {
    number: "10",
    title: "El depto de dos ambientes",
    intro:
      "El balcón desde donde se festejó el título ahora cuesta más meses de trabajo. Alquilar en Buenos Aires se fue del alcance de varios sueldos mínimos.",
    closing:
      "El festejo desde el balcón sigue siendo gratis; lo que subió es lo que cuesta tener ese balcón.",
  },
  viaje: {
    number: "05",
    title: "El viaje al Mundial",
    intro: "",
    closing:
      "Llegar a ver a la Selección en vivo requiere más sueldos mínimos que en Qatar: la distancia geográfica se redujo, la económica no.",
  },
} as const satisfies Record<string, SectionCopy>

export type SectionId = keyof typeof SECTIONS

export function formatViajeIntro(salarios2022: string, salarios2026: string): string {
  return `En 2022, los pasajes ida y vuelta equivalían a ${salarios2022} salarios mínimos. Para 2026, esa cifra trepa a ${salarios2026}.`
}

export const HERO_COPY = {
  titleLine1: "¿Cuánto cuesta",
  titleLine2: "alentar al campeón del mundo?",
  deckline: "Precios y sueldos mínimos en Argentina: Qatar 2022 vs. Mundial 2026.",
  subtitle:
    "Argentina se coronó en Qatar mientras sus ciudadanos contaban con un sueldo mínimo" + 
    " que ya no alcanzaba para mucho. " + 
    "Hoy, con el mismo torneo a la vuelta de la esquina, ¿qué tan lejos quedó ese precio?",
  spreadsheetLabel: "Ver datos",
  badge2022: { label: "2022", place: "Qatar", emoji: "🇶🇦" },
  badge2026: {
    label: "2026",
    place: "EEUU · Canadá · México",
    emojis: ["🇺🇸", "🇨🇦", "🇲🇽"],
  },
} as const

export const CHART_LEGEND_COPY = {
  ariaLabel: "Leyenda: precio, sueldo mínimo y porcentaje",
  price: "Precio · 2022 y 2026",
  salary: "Sueldo mínimo",
  percent: "% = suba en pesos",
} as const

export const SPREADSHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSzYyEETGt1UHh8grdJj-q4dO63InOpLTQ-La74Jx-AT9QTdS3qlxNECjcpD7DW_d_2M3JA_mN1Jz_S/pubhtml"

export const REPO_URL = "https://github.com/AgustinaNahas/mundial"

export const PROJECT_INFO_COPY = {
  title: "Sobre este proyecto",
  description:
    "Precios, sueldos y rituales entre Qatar 2022 y el Mundial 2026, con datos abiertos y visualizaciones.",
  spreadsheetLabel: "Ver datos",
  repoLabel: "Ver código en GitHub",
  aboutTitle: "Sobre mí",
  closeLabel: "Cerrar",
} as const

export const RESUMEN_COPY = {
  title: "Entre pitada y pitada",
  intro:
    "Recorrimos precios, sueldos y rituales entre Qatar 2022 y el Mundial 2026. Estas barras muestran cuánto alcanza hoy un salario mínimo frente a lo que alcanzaba entonces: cuando la barra de 2026 es más corta, el poder adquisitivo se achicó.",
  methodologyNote:
    "Cada barra muestra cuántas unidades (asados, viajes en colectivo, etc.) compraba un salario mínimo en diciembre 2022 y en marzo 2026.",
  closing:
    "Argentina sabe lo que es ser campeona. La pregunta de 2026 es cuánto trabajo hay detrás de poder vivirlo.",
  spreadsheetLabel: "Ver todos los datos en la planilla",
} as const

export const CIERRE_COPY = {
  about: {
    title: "Sobre mí",
    name: "Agustina Nahas",
    photo: "/mundial/author.jpg",
    bio: "Desarrolladora de visualizaciones de datos. Fan de la Patria 🇦🇷, de Güemes 🐎 y de las visualizaciones de datos 📊.",
    portfolio: {
      label: "Portfolio",
      href: "https://www.notion.so/agusnahas/Agustina-Nahas-75b175948cf0415a885f8a148e94b1b7",
    },
    email: "m.agustina.nahas@gmail.com",
    social: [
      { label: "Twitter", href: "https://x.com/AgusNahas_" },
      { label: "Instagram", href: "https://www.instagram.com/agus.nahas/" },
      {
        label: "LinkedIn",
        href: "https://www.linkedin.com/in/agustina-nahas/en/",
      },
    ],
    projectsLabel: "Otros proyectos",
    projects: [
      {
        label: "El Alquilista",
        href: "https://agustinanahas.github.io/el-alquilista/",
      },
      {
        label: "Gastos",
        href: "https://agustinanahas.github.io/gastos/",
      },
      {
        label: "Spotify Wrapped",
        href: "https://agustinanahas.github.io/spotify-wrapped/",
      },
    ],
  },
} as const
