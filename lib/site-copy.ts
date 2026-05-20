/** Texto mientras carga data.json */
export const LOADING_INTRO = "Cargando datos..."

/** Los 4 bloques narrativos de la home */
export const BLOCKS = {
  previa: {
    number: "01",
    title: "La Previa del Mundial",
    subtitle:
      "Antes de que empiece el partido, el bolsillo ya sintió el golpe. Todo lo que rodea al torneo tiene precio.",
  },
  mundial: {
    number: "02",
    title: "El Mundial",
    subtitle: "Vivirlo desde adentro o seguirlo de lejos: en cualquier caso, cuesta.",
  },
  festejo: {
    number: "03",
    title: "El Festejo",
    subtitle: "Si Argentina vuelve a ser campeona, ¿cuánto sale salir a la calle a celebrarlo?",
  },
  gente: {
    number: "04",
    title: "La Gente",
    subtitle: "Más allá de los goles: bebés, jubilados y derechos que también forman parte del cuadro.",
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
      "Completar el álbum era una promesa de las vacaciones de invierno. Hoy, pegar la última figurita exige varios sueldos de paciencia.",
    closing:
      "El álbum ya no se llena con vuelto: pasó de hobby accesible a proyecto de largo aliento.",
  },
  playstation: {
    number: "02",
    title: "La Play en la previa",
    intro:
      "Antes de que suene el primer silbato, muchos argentinos ya jugaron el Mundial en casa. La consola subió en pesos, pero lo que cambió de verdad es cuántos meses de trabajo vale.",
    closing:
      "La Play sigue siendo la misma; lo que se encogió es la porción de sueldo que alcanza para comprarla.",
  },
  pelota: {
    number: "03",
    title: "La pelota",
    intro:
      "La pelota oficial del torneo siempre fue cara, pero pasó de ser un gasto que se justificaba a uno que se piensa dos veces.",
    closing:
      "Patear la pelota del Mundial cuesta hoy más días de trabajo que en Qatar.",
  },
  camiseta: {
    number: "03",
    title: "La camiseta",
    intro:
      "Vestir los colores de la Selección lleva más días de laburo que en 2022. El celeste y blanco no bajó de precio: subió de valor.",
    closing:
      "Ponerse la camiseta pasó de un gasto a un gesto que se siente en el sueldo.",
  },
  cancha: {
    number: "04",
    title: "El precio de la cancha",
    intro:
      "De los estadios de Primera a los estadios del mundo: llegar hasta donde juega la Selección tiene un costo que pocos pueden calcular de antemano.",
    closing:
      "Entre entrada, vuelo y estadio, cada paso del camino al Mundial pesa más en horas de trabajo.",
  },
  mate: {
    number: "06",
    title: "El mate mundialista",
    intro:
      "El mate acompañó cada partido en Qatar y va a acompañar cada uno en 2026. Lo que cambió es cuánta yerba entra en un sueldo mínimo.",
    closing:
      "El mate sigue siendo el mismo; el sueldo que lo financia, bastante menos generoso.",
  },
  asado: {
    number: "07",
    title: "El asado de la final",
    intro:
      "La parrilla encendida antes del partido es una constante argentina. Lo que varía es cuántos kilos de carne compra un salario desde 2022 a hoy.",
    closing:
      "El asado no cambió de forma; sí cambió cuántas veces por mes un sueldo alcanza para hacerlo.",
  },
  fernet: {
    number: "09",
    title: "El fernet del campeón",
    intro:
      "El brindis del festejo también se mide en salarios. Comparado con Qatar, una botella de fernet pesa más sobre el bolsillo del trabajador.",
    closing:
      "Brindar cuesta lo mismo en botellas; cuesta más en horas trabajadas para pagarlas.",
  },
  micro: {
    number: "11",
    title: "El micro del festejo",
    intro:
      "Si los campeones del mundo hubieran viajado en colectivo, ¿cuánto les hubiera costado el recorrido del festejo? El boleto también registró el paso del tiempo.",
    closing:
      "El recorrido es el mismo; lo que cambió es cuántos días de laburo vale el pasaje.",
  },
  jubilacion: {
    number: "13",
    title: "Los hinchas más grandes",
    intro:
      "Los jubilados vivieron el Mundial de Qatar con una haber mínimo que no alcanzaba para un monoambiente. En 2026, la brecha no se cerró.",
    closing:
      "Ni en 2022 ni en 2026 la jubilación mínima cubre un alquiler básico: el festejo más emotivo quedó lejos de quienes más lo sintieron.",
  },
  ninos: {
    number: "12",
    title: "Los hinchas más chiquitos...",
    intro:
      "Después del título, algunos nombres de la Scaloneta explotaron en los registros civiles. ¿Podés adivinar cuántos bebés de cada 1.000 nacidos en 2023 se llamaron así?",
    body: "Pasá el cursor por los bebés: se van pintando de izquierda a derecha. Cada uno representa 1 niño cada 1.000 nacidos. Hacé clic para confirmar tu respuesta.",
    closing:
      "El Mundial también dejó huella en los padrones: algunos nombres crecieron junto con la copa.",
  },
  derechos: {
    number: "13",
    title: "Derechos: Qatar vs. EEUU, Canadá y México",
    intro:
      "El Mundial no se juega solo en la cancha. Las sedes dicen algo sobre prensa, libertades civiles y condiciones laborales que los goles no muestran.",
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
  titleLine2: "ser campeón del mundo?",
  subtitle:
    "Argentina se coronó en Qatar con un sueldo mínimo que ya no alcanzaba para mucho. Hoy, con el mismo torneo a la vuelta de la esquina, ¿qué tan lejos quedó ese precio?",
  badge2022: { label: "2022", place: "Qatar · Campeones" },
  badge2026: { label: "2026", place: "EEUU · Can · Méx" },
} as const

export const SPREADSHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSzYyEETGt1UHh8grdJj-q4dO63InOpLTQ-La74Jx-AT9QTdS3qlxNECjcpD7DW_d_2M3JA_mN1Jz_S/pubhtml"

export const CIERRE_COPY = {
  closing:
    "Argentina sabe lo que es ser campeona. La pregunta de 2026 es cuánto trabajo hay detrás de poder vivirlo.",
  spreadsheetLabel: "Ver todos los datos en la planilla",
  about: {
    title: "Sobre mí",
    name: "Agustina Nahas",
    photo: "/mundial/author.jpg",
    bio: "Desarrolladora de visualizaciones de datos. Fan de Argentina, de Güemes y de las visualizaciones de datos.",
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
        label: "El Ratón Pérez",
        href: "https://agustinanahas.github.io/raton-perez/",
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
