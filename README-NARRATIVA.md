# Narrativa del sitio (scrolly)

Documentación de la estructura narrativa, textos y piezas visuales para pulir el hilo del proyecto. Orden según `app/page.tsx`.

## Notas sobre el código

- **`TimelineSection`** y **`ViajeSection`** existen pero **no se montan** en la home. El viaje al Mundial está integrado en el scrolly de **`CanchaSection`**. `ViajeSection` duplica parcialmente esa historia (mapa + barras de vuelo).
- **`ProgressTracker`** (`components/progress-tracker.tsx`): declara 3 subsecciones en “La Previa” y 5 en “El Mundial”, pero la página tiene **4** piezas en previa y **4** en mundial. Conviene alinear si el tracker debe reflejar secciones reales.
- **Numeración** en `SectionWrapper` / headers (`number="01"`, `"03"` duplicado, etc.) no sigue un orden global único; unificar si la narrativa depende de “capítulos”.

---

## Premisa / hilo general

Pieza de scrollytelling con datos que compara **Qatar 2022** vs **Mundial 2026 (EEUU · Can · Méx)** alrededor de la pregunta: *¿Cuánto cuesta ser campeón del mundo?* — en **pesos**, **sueldo mínimo**, **días de trabajo**, **vuelos** y, al cierre, un **índice sintético** más un giro a **derechos** y **jubilación**.

Los montos vienen en gran parte del **CSV** publicado en Google Sheets (`lib/data-context.tsx`), con fallback local si falla la red.

---

## Hero (`HeroSection`)

| Texto principal | Gráfico / interacción |
|-----------------|------------------------|
| **¿Cuánto cuesta** / **ser campeón del mundo?** | Partículas en **canvas** (celeste/blanco), gradiente tipo glow, badge **2022 · Qatar · Campeones** vs **2026 · EEUU · Can · Méx**, indicador de scroll “Deslizá”. |

---

## Bloque 01 — La Previa (`#previa`)

**Cabecera (`BlockHeader`):** “La Previa del Mundial” — *Arranca la fiebre mundialista. Nos preparamos para palpitar lo que van a ser los próximos días.*

### 01 · La Play en la previa (`PlayStationSection`)

| Intro | Visual |
|-------|--------|
| *Jugar al FIFA antes del mundial ya no es lo mismo. Aunque la consola cuesta mas en pesos, el poder adquisitivo cambio.* | **`ComparisonBar`**: PS5 2022 vs 2026 con referencia al **salario mínimo**. **`StatCard`**: salarios mínimos necesarios para comprar la consola cada año. **Fuentes:** `PLAY_STATION`, `SUELDO_MIN_PESOS`. |

### 02 · El álbum del Mundial (`AlbumSection`)

| Intro | Visual |
|-------|--------|
| *Completar el álbum pasó de ser un hobby familiar a un lujo.* | **Álbum interactivo** (grilla 4×3): el usuario pega figuritas en un orden aleatorio fijo; **cursor** con la figurita actual. Paneles **Qatar 2022** / **EEUU 2026**: línea de gasto acumulado, total ARS, **sueldos mínimos**. Abajo, desglose (precio implícito por figurita desde el sobre, etc.). **Fuentes:** `PRECIO_SOBRE_FIGURITAS`, `PRECIO_ALBUM_FIGURITAS`, `SUELDO_MIN_PESOS`. |

### 03 · La pelota (`PelotaSection`)

| Intro | Visual |
|-------|--------|
| *Jugar al fútbol tiene un precio. La pelota oficial del Mundial pasó de ser un capricho caro a un lujo difícil de justificar.* | Dos columnas: imagen **pelota** rotando, precio por año, texto “X días de sueldo mínimo”, **`WorkCalendar`**: grilla L–D que llena días hábiles equivalentes (salario/22). **Fuentes:** `PELOTA_MUNDIAL`, `SUELDO_MIN_PESOS`. |

### 03 · La camiseta (`CamisetaSection`) — mismo `number` que la pelota en código

| Intro | Visual |
|-------|--------|
| *Vestir los colores de la Selección requiere más días de trabajo que hace 4 años.* | Misma lógica que la pelota: **jersey**, precio ARS, **equivalente USD** con tipo de cada año, **`WorkCalendar`**. **Fuentes:** `CAMISETA_ADIDAS`, `SUELDO_MIN_PESOS`, `VALOR_DOLAR_PESO`. |

---

## Bloque 02 — El Mundial (`#mundial`)

**Cabecera:** “El Mundial” — *El momento de vivirlo.*

### 04 · El precio de la cancha (`CanchaSection`) — scrolly con mapa

| Paso | Texto (resumen) | Mapa / piezas |
|------|-----------------|---------------|
| **01 · Buenos Aires** | *Antes de volar, la cancha de casa. Una entrada de primera división en pesos.* | **`ScrollyMap`**: vista regional; tarjeta **entrada Primera** 2022 vs 2026 + **horas de trabajo** al SMVM. |
| **02 · El viaje a Qatar** | *Cruzar el Atlántico; vuelo ida y vuelta BA–Doha al momento del torneo.* | Ruta **gran círculo** BA–Doha; **`FlightBlock`**: ARS + **sueldos mínimos** 2022. |
| **03 · Las entradas en Qatar** | *En Doha, precio de entrada en USD al cambio oficial nov. 2022.* | Zoom Qatar; dos **`TicketBlock`** (más barata / más cara): USD, ARS, horas al SMVM. |
| **04 · El viaje a Miami** | *2026: vuelo más corto, peso más devaluado; BA–Miami.* | Ruta BA–Miami; **`FlightBlock`** 2026. |
| **05 · Las entradas en Miami** | *En Miami, entradas en USD al cambio oficial 2026.* | Zoom Miami; dos **`TicketBlock`**. |

**UI:** mapa **sticky** (desktop), **dots** de paso. **Fuentes:** `ENTRADA_PRIMERA`, `ENTRADA_MUNDIAL_MAS_BARATA`, `ENTRADA_MUNDIAL_MAS_CARA`, `BSAS_DOHA`, `BSAS_MIAMI`, `SUELDO_MIN_PESOS`, `VALOR_DOLAR_PESO`.

### 06 · El mate mundialista (`MateSection`)

| Intro | Visual |
|-------|--------|
| *El mate nunca falta. Veamos cuanto cuesta el ritual mas argentino.* | **`ComparisonBar`** kilo de yerba; caja “kilos de yerba que compra un salario mínimo”; ícono **mate** con animación. **Fuentes:** `KILO_YERBA`, `SUELDO_MIN_PESOS`. |

### 07 · El asado de la final (`AsadoSection`)

| Intro | Visual |
|-------|--------|
| *El ritual argentino por excelencia tambien sintio la inflacion.* | **`ComparisonBar`** asado para 10; resumen de montos; **parrilla** SVG; cuadrados numerados (hasta 10) = asados que compra un SMVM. **Fuentes:** `ASADO_FINAL`, `SUELDO_MIN_PESOS`. |

### 08 · El que falto al laburo (`TrabajoSection`)

| Intro | Visual |
|-------|--------|
| *Faltar en 2022 costaba menos. En 2026, con nuevas reglas, el costo puede ser mayor.* | Dos **relojes** (partido vs laboral); salario diario 2022/2026; **`StatCard`** costo de faltar un día; “7 partidos” (días potenciales de ausencia); bloque **cambios normativos** (texto cualitativo). **Fuentes:** `SUELDO_MIN_PESOS`. |

---

## Bloque 03 — El Festejo (`#festejo`)

**Cabecera:** “El Festejo” — *Argentina campeona.*

### 09 · El fernet del campeon (`FernetSection`)

| Intro | Visual |
|-------|--------|
| *El festejo tambien tiene inflacion.* | **`ComparisonBar`** Fernet 750ml; “fernets que compra un sueldo mínimo”; botellas **SVG** (+ coca); dos cajas resumen. **Fuentes:** `FERNET_COCA`, `SUELDO_MIN_PESOS`. |

### 10 · El depto 2 ambientes (`AlquilerSection`)

| Intro | Visual |
|-------|--------|
| *El balcon del festejo ahora cuesta mas meses de trabajo.* | **`ComparisonBar`** (label en UI: alquiler monoambiente CABA — **revisar coherencia** con el título “2 ambientes”); barras animadas de salarios para alquilar; **edificio** SVG; **`StatCard`**. **Fuentes:** `ALQUILER_FESTEJO`, `SUELDO_MIN_PESOS`. |

### 11 · El micro que no avanzaba (`MicroSection`)

| Intro | Visual |
|-------|--------|
| *Si el recorrido del festejo hubiese sido en colectivo comun...* | **Colectivo** animado + “calle”; precios 2022→2026 (dato: `BOLETO_AMBA` — **el subtítulo menciona BS–Rosario**); pasajes que compra un SMVM; 26 círculos numerados; nota sobre el micro del campeón. |

---

## Bloque 04 — La Gente (`#gente`)

**Cabecera:** “La Gente” — *El tono cambia. Más íntimo.*

### 12 · La abuela que festejó (`JubilacionSection`)

| Intro | Visual |
|-------|--------|
| *Este es uno de los golpes emocionales más fuertes de la comparación.* | Grandes números: **jubilación mínima en USD** 2022 vs 2026. Tres tarjetas: álbumes completos, asados para 10, % del alquiler monoambiente. Callout: la jubilación mínima no alcanza para ese alquiler ni en 2022 ni en 2026. **Fuentes:** `JUBILACION_MIN_DOLARES`, `ALQUILER_FESTEJO`, `ASADO_FINAL`, `PRECIO_ALBUM_FIGURITAS`. |

### 13 · Derechos (`DerechosSection`)

| Intro | Visual |
|-------|--------|
| *No todos los Mundiales se juegan en la cancha.* | **Radar SVG** (5 ejes: prensa, LGBTQ+, género, libertad económica, democracia) con polígonos por país; leyenda con barra de promedio; grilla de tarjetas por categoría. **Datos estáticos en código** (`derechos-section.tsx`), no del CSV. |

---

## Cierre (`CierreSection`)

| Texto | Visual |
|-------|--------|
| **¿Es más caro soñar?** | **Índice “Ser campeón del mundo”**: número prominente (promedio de ítems); texto de variación %; barras por categoría (Play+FIFA, álbum, camiseta, viaje, asado, alquiler, jubilación) como índice con base 100 = costo en salarios mínimos en 2022 vs 2026. |
| Cierre emocional | *En 2022 Argentina fue campeona del mundo. En 2026 quiere volver a serlo.* → *¿cuánto cuesta hoy ese sueño?* — firma “Una visualización de datos”. |

---

## Sección no montada en la home: `ViajeSection`

**Título:** “El Viaje al Mundial” — intro con salarios para volar; **`WorldMap`** con leyenda de rutas; **`ComparisonBar`** vuelos; grillas de celdas por sueldo. **No está importada/usada en `app/page.tsx`**; la narrativa de vuelo está en **`CanchaSection`**.

---

## Hilo narrativo sugerido (edición)

1. Gancho + contraste 2022 / 2026 (hero).  
2. Previa consumista (gaming, álbum, pelota, camiseta) anclada al SMVM.  
3. Mundial vivido: scrolly viaje + entradas; ritual mate/asado; costo de faltar al trabajo.  
4. Festejo urbano: fernet, alquiler, transporte.  
5. Contraste humano: jubilación; derechos en sedes distintas.  
6. Síntesis (índice) + pregunta abierta.

---

## Edición de textos

Los títulos, intros, cierres de sección y textos de los cuatro bloques narrativos se editan en **`lib/site-copy.ts`**. Este README sigue siendo el mapa narrativo y las notas de diseño.

Patrón en pantalla: contenido → **cierre** (itálica, grande) → panel **Fuentes**.

## Archivos clave

| Archivo | Rol |
|---------|-----|
| `lib/site-copy.ts` | Copy centralizado (bloques, secciones, hero, cierre) |
| `app/page.tsx` | Orden de bloques y secciones |
| `components/section-wrapper.tsx` | Título, intro, cierre, fuentes por sección |
| `lib/data-context.tsx` | CSV, indicadores, `getIndicador` |
| `components/scrolly-map.tsx` | Mapa Leaflet del scrolly de cancha |
| `components/comparison-bar.tsx` | Barras 2022 vs 2026 |
| `components/progress-tracker.tsx` | Progreso de scroll por bloque |
