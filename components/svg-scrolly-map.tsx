"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import * as d3 from "d3"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { MotionPathPlugin } from "gsap/MotionPathPlugin"
import type { GeoJsonObject, FeatureCollection } from "geojson"
import { getCountriesGeoCached, loadCountriesGeo } from "@/lib/countries-geo"
import { debugLog } from "@/lib/debug-log"
import {
  MAP_COLORS,
  BSAS,
  DOHA,
  MIAMI,
  CITIES,
  CAMERA_BY_STEP,
  LABEL_FONT_PX,
  CITY_DOT_R,
  CITY_DOT_R_ACTIVE,
  CITY_DOT_STROKE,
  COUNTRY_STROKE_PX,
  ROUTE_STROKE_PX,
  ROUTE_DASH_PX,
  PLANE_SIZE_PX,
  PLANE_ROTATE_OFFSET,
  routeOpacity,
  cityActive,
} from "@/lib/scrolly-map-config"
import { greatCircleCoords, projectLineString } from "@/lib/scrolly-map-paths"

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin)

/* ─── Utilidades ─── */

function useNarrowMap() {
  const [narrow, setNarrow] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)")
    const sync = () => setNarrow(mq.matches)
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])
  return narrow
}

/** Transform de “cámara falsa”: escala alrededor del punto focal proyectado. */
function cameraTransform(
  projection: d3.GeoProjection,
  width: number,
  height: number,
  center: [number, number],
  scale: number,
): string {
  const [px, py] = projection(center) as [number, number]
  return `translate(${width / 2},${height / 2}) scale(${scale}) translate(${-px},${-py})`
}

/** Coordenadas de pantalla de un punto geo con la cámara activa (para etiquetas fijas). */
function geoToScreen(
  projection: d3.GeoProjection,
  width: number,
  height: number,
  center: [number, number],
  scale: number,
  coords: [number, number],
): [number, number] {
  const [fx, fy] = projection(center) as [number, number]
  const [gx, gy] = projection(coords) as [number, number]
  return [width / 2 + scale * (gx - fx), height / 2 + scale * (gy - fy)]
}

const PLANE_SVG = `<path d="M12 2 10.5 9 4 11v2l6.5 1.5V18l-2 2v2.5L12 21l3.5-.5V20l-2-2v-5.5L20 13v-2l-6.5-2L12 2z" fill="currentColor"/>`

export interface SvgScrollyMapProps {
  step: number
  /** Refs de cada panel de scroll; ScrollTrigger sincroniza la cámara con el viewport. */
  stepRefs?: React.RefObject<HTMLDivElement | null>[]
}

/** Mapa mundial SVG + D3 para scrollytelling editorial (sin tiles ni Leaflet). */
export function SvgScrollyMap({ step, stepRefs }: SvgScrollyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const cameraRef = useRef<SVGGElement>(null)
  const routeDohaRef = useRef<SVGPathElement>(null)
  const routeMiamiRef = useRef<SVGPathElement>(null)
  const planeDohaRef = useRef<SVGGElement>(null)
  const planeMiamiRef = useRef<SVGGElement>(null)

  const projectionRef = useRef<d3.GeoProjection | null>(null)
  const sizeRef = useRef({ width: 800, height: 600 })
  const cameraTweenRef = useRef<gsap.core.Tween | null>(null)
  const labelTweenRef = useRef<gsap.core.Tween | null>(null)
  const prevCameraStepRef = useRef<number | null>(null)
  const step0 = CAMERA_BY_STEP[0]
  const cameraStateRef = useRef({
    scale: step0.scale.wide,
    center: step0.center,
    centerLon: step0.center[0],
    centerLat: step0.center[1],
  })
  const scrollTriggersRef = useRef<ScrollTrigger[]>([])
  const planeTweensRef = useRef<gsap.core.Tween[]>([])

  const [geoData, setGeoData] = useState<GeoJsonObject | null>(() =>
    getCountriesGeoCached("full"),
  )
  const [ready, setReady] = useState(false)
  const narrow = useNarrowMap()

  const routeDohaCoords = useMemo(() => greatCircleCoords(BSAS, DOHA), [])
  const routeMiamiCoords = useMemo(() => greatCircleCoords(BSAS, MIAMI), [])

  /* Carga GeoJSON 50m (vector SVG = siempre nítido en retina/4K). */
  useEffect(() => {
    const t0 = Date.now()
    void loadCountriesGeo({ detail: "full" })
      .then((data) => {
        setGeoData(data)
        debugLog("scrolly-map.tsx", "geo loaded in map", { ms: Date.now() - t0 }, "H7")
      })
      .catch((err) => {
        debugLog(
          "scrolly-map.tsx",
          "geo load failed in map",
          { err: String(err), ms: Date.now() - t0 },
          "H7",
        )
      })
  }, [])

  /**
   * Equirectangular: menos curvatura en Argentina que Natural Earth;
   * lectura más “plana” para scrolly editorial.
   */
  const buildProjection = useCallback((width: number, height: number) => {
    const projection = d3
      .geoEquirectangular()
      .fitExtent(
        [
          [8, 8],
          [width - 8, height - 8],
        ],
        { type: "Sphere" } as d3.GeoSphere,
      )
      .precision(0.1)
    projectionRef.current = projection
    sizeRef.current = { width, height }
    return projection
  }, [])

  /** Puntos y etiquetas en pantalla (fuera de la cámara → tamaño constante). */
  const syncCityOverlay = useCallback((scale: number, center: [number, number]) => {
    const projection = projectionRef.current
    const svg = svgRef.current
    if (!projection || !svg) return
    const { width, height } = sizeRef.current
    CITIES.forEach((city) => {
      const [x, y] = geoToScreen(projection, width, height, center, scale, city.coords)
      d3.select(svg)
        .select<SVGGElement>(`.city-overlay-${city.id}`)
        .attr("transform", `translate(${x},${y})`)
    })
  }, [])

  const setCityOverlayOpacity = useCallback((opacity: number) => {
    const svg = svgRef.current
    if (!svg) return
    gsap.set(d3.select(svg).selectAll(".city-overlay").nodes(), { opacity })
  }, [])

  const fadeCityOverlay = useCallback((visible: boolean, duration = 0.28) => {
    const svg = svgRef.current
    if (!svg) return
    labelTweenRef.current?.kill()
    if (!visible) {
      setCityOverlayOpacity(0)
      return
    }
    labelTweenRef.current = gsap.to(d3.select(svg).selectAll(".city-overlay").nodes(), {
      opacity: 1,
      duration,
      ease: "power2.out",
    })
  }, [setCityOverlayOpacity])

  /**
   * Compensa el zoom de la cámara: trazos, guiones y avión mantienen tamaño en pantalla.
   * Los paths geográficos escalan; el grosor visual no.
   */
  const syncVisualScale = useCallback((scale: number) => {
    const svg = svgRef.current
    if (!svg || scale <= 0) return
    const inv = 1 / scale
    const [dashA, dashB] = ROUTE_DASH_PX
    const dash = `${dashA * inv} ${dashB * inv}`

    d3.select(svg)
      .selectAll(".scrolly-countries path")
      .attr("stroke-width", COUNTRY_STROKE_PX * inv)

    for (const sel of [".route-doha", ".route-miami"] as const) {
      const path = d3.select(svg).select<SVGPathElement>(sel).node()
      if (!path) continue
      const dashAttr = path.getAttribute("stroke-dasharray") ?? ""
      const firstDash = parseFloat(dashAttr.split(" ")[0] || "0")
      const isDrawing = firstDash > ROUTE_DASH_PX[0] * 4
      d3.select(path).attr("stroke-width", ROUTE_STROKE_PX * inv)
      if (!isDrawing) {
        d3.select(path).attr("stroke-dasharray", dash)
      }
    }

    const planeSize = PLANE_SIZE_PX * inv
    const half = planeSize / 2
    d3.select(svg)
      .selectAll(".scrolly-planes [class^='plane-'] > svg")
      .attr("width", planeSize)
      .attr("height", planeSize)
      .attr("x", -half)
      .attr("y", -half)
  }, [])

  /** Dibuja países una sola vez; rutas y ciudades se actualizan con la proyección. */
  const renderMap = useCallback(
    (projection: d3.GeoProjection, geo: GeoJsonObject) => {
      const svg = d3.select(svgRef.current)
      const pathGen = d3.geoPath(projection)
      const collection = geo as FeatureCollection
      const { width, height } = sizeRef.current

      svg.selectAll("*").remove()
      svg
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid slice")
        .style("background", MAP_COLORS.ocean)

      const camera = svg
        .append("g")
        .attr("class", "scrolly-camera")
        .attr("shape-rendering", "geometricPrecision")

      cameraRef.current = camera.node()
      const { scale: initScale, center: initCenter } = cameraStateRef.current
      camera.attr(
        "transform",
        cameraTransform(projection, width, height, initCenter, initScale),
      )

      /* Capa de países */
      camera
        .append("g")
        .attr("class", "scrolly-countries")
        .selectAll("path")
        .data(collection.features)
        .join("path")
        .attr("d", (d) => pathGen(d as d3.GeoPermissibleObjects) ?? "")
        .attr("fill", MAP_COLORS.landFill)
        .attr("stroke", MAP_COLORS.landStroke)
        .attr("stroke-width", COUNTRY_STROKE_PX)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")

      /* Rutas de vuelo (gran círculo → path SVG) */
      const routes = camera.append("g").attr("class", "scrolly-routes")

      const dDoha = projectLineString(projection, routeDohaCoords)
      const dMiami = projectLineString(projection, routeMiamiCoords)

      routes
        .append("path")
        .attr("class", "route-doha")
        .attr("d", dDoha)
        .attr("fill", "none")
        .attr("stroke", MAP_COLORS.routeDoha)
        .attr("stroke-width", ROUTE_STROKE_PX)
        .attr("stroke-linecap", "round")
        .attr("stroke-dasharray", `${ROUTE_DASH_PX[0]} ${ROUTE_DASH_PX[1]}`)
        .attr("opacity", 0.22)

      routes
        .append("path")
        .attr("class", "route-miami")
        .attr("d", dMiami)
        .attr("fill", "none")
        .attr("stroke", MAP_COLORS.routeMiami)
        .attr("stroke-width", ROUTE_STROKE_PX)
        .attr("stroke-linecap", "round")
        .attr("stroke-dasharray", `${ROUTE_DASH_PX[0]} ${ROUTE_DASH_PX[1]}`)
        .attr("opacity", 0.22)

      routeDohaRef.current = routes.select<SVGPathElement>(".route-doha").node()
      routeMiamiRef.current = routes.select<SVGPathElement>(".route-miami").node()

      /* Aviones minimalistas (MotionPathPlugin recorre el path) */
      const planes = camera.append("g").attr("class", "scrolly-planes")

      const mkPlane = (color: string, className: string) => {
        const g = planes
          .append("g")
          .attr("class", className)
          .attr("opacity", 0)
        g.append("svg")
          .attr("width", PLANE_SIZE_PX)
          .attr("height", PLANE_SIZE_PX)
          .attr("x", -PLANE_SIZE_PX / 2)
          .attr("y", -PLANE_SIZE_PX / 2)
          .attr("viewBox", "0 0 24 24")
          .attr("color", color)
          .html(PLANE_SVG)
        return g.node()
      }

      planeDohaRef.current = mkPlane(MAP_COLORS.routeDoha, "plane-doha")
      planeMiamiRef.current = mkPlane(MAP_COLORS.routeMiami, "plane-miami")

      /* Ciudades en capa fija: puntos + etiquetas con tamaño constante en pantalla */
      const overlay = svg.append("g").attr("class", "scrolly-cities-overlay")
      CITIES.forEach((city) => {
        const g = overlay
          .append("g")
          .attr("class", `city-overlay city-overlay-${city.id}`)
          .attr("data-city", city.id)
          .attr("opacity", 1)

        g.append("circle")
          .attr("class", "city-halo")
          .attr("r", CITY_DOT_R)
          .attr("fill", city.color)
          .attr("fill-opacity", 0.45)
          .attr("stroke", MAP_COLORS.cityRing)
          .attr("stroke-width", CITY_DOT_STROKE)

        g.append("circle")
          .attr("class", "city-core")
          .attr("r", CITY_DOT_R)
          .attr("fill", city.color)
          .attr("stroke", MAP_COLORS.cityRing)
          .attr("stroke-width", CITY_DOT_STROKE)

        g.append("text")
          .attr("class", "city-label")
          .attr("y", -12)
          .attr("text-anchor", "middle")
          .attr("fill", city.color)
          .attr("font-size", LABEL_FONT_PX)
          .attr("font-weight", 700)
          .attr("font-family", "var(--font-sans), system-ui, sans-serif")
          .text(city.label)
      })

      const { scale, center } = cameraStateRef.current
      syncCityOverlay(scale, center)
      syncVisualScale(scale)
      setCityOverlayOpacity(1)
      prevCameraStepRef.current = null

      setReady(true)
    },
    [routeDohaCoords, routeMiamiCoords, syncCityOverlay, syncVisualScale, setCityOverlayOpacity],
  )

  /* Montaje / resize: recalcula proyección y paths. */
  useEffect(() => {
    if (!geoData || !containerRef.current || !svgRef.current) return

    const run = () => {
      const rect = containerRef.current!.getBoundingClientRect()
      const width = Math.max(1, Math.round(rect.width))
      const height = Math.max(1, Math.round(rect.height))
      const projection = buildProjection(width, height)
      renderMap(projection, geoData)
      ScrollTrigger.refresh()
    }

    run()
    const ro = new ResizeObserver(run)
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [geoData, buildProjection, renderMap])

  const animateCameraTo = useCallback(
    (targetStep: number) => {
      const projection = projectionRef.current
      const camera = cameraRef.current
      if (!projection || !camera) return

      const cfg = CAMERA_BY_STEP[targetStep] ?? CAMERA_BY_STEP[0]
      const targetScale = narrow ? cfg.scale.narrow : cfg.scale.wide
      const { width, height } = sizeRef.current
      const state = cameraStateRef.current
      const stepChanged =
        prevCameraStepRef.current !== null && prevCameraStepRef.current !== targetStep
      prevCameraStepRef.current = targetStep

      cameraTweenRef.current?.kill()
      if (stepChanged) {
        fadeCityOverlay(false, 0.2)
      } else {
        setCityOverlayOpacity(1)
      }

      cameraTweenRef.current = gsap.to(state, {
        scale: targetScale,
        centerLon: cfg.center[0],
        centerLat: cfg.center[1],
        duration: 1.05,
        ease: "power3.inOut",
        overwrite: "auto",
        onUpdate: () => {
          const center: [number, number] = [state.centerLon, state.centerLat]
          camera.setAttribute(
            "transform",
            cameraTransform(projection, width, height, center, state.scale),
          )
          syncCityOverlay(state.scale, center)
          syncVisualScale(state.scale)
        },
        onComplete: () => {
          state.center = [state.centerLon, state.centerLat]
          syncVisualScale(state.scale)
          fadeCityOverlay(true, 0.35)
        },
        onInterrupt: () => setCityOverlayOpacity(1),
      })
    },
    [narrow, fadeCityOverlay, setCityOverlayOpacity, syncCityOverlay, syncVisualScale],
  )

  const animateRoutesForStep = useCallback((targetStep: number) => {
    const dohaOp = routeOpacity(targetStep, "doha")
    const miamiOp = routeOpacity(targetStep, "miami")
    const dohaPath = routeDohaRef.current
    const miamiPath = routeMiamiRef.current

    const scale = cameraStateRef.current.scale
    const inv = 1 / scale
    const [dashA, dashB] = ROUTE_DASH_PX
    const dashRest = `${dashA * inv} ${dashB * inv}`

    const animateDraw = (path: SVGPathElement, active: boolean, op: number) => {
      const len = path.getTotalLength()
      gsap.set(path, { attr: { "stroke-width": ROUTE_STROKE_PX * inv } })
      if (active) {
        gsap.set(path, { strokeDasharray: `${len} ${len}`, strokeDashoffset: len, opacity: op })
        gsap.to(path, {
          strokeDashoffset: 0,
          duration: 1.35,
          ease: "power2.inOut",
          onComplete: () => {
            gsap.set(path, { strokeDasharray: dashRest, strokeDashoffset: 0 })
          },
        })
      } else {
        gsap.to(path, {
          opacity: op,
          strokeDasharray: dashRest,
          strokeDashoffset: 0,
          duration: 0.55,
          ease: "power2.out",
        })
      }
    }

    if (dohaPath) animateDraw(dohaPath, targetStep === 1, dohaOp)
    if (miamiPath) animateDraw(miamiPath, targetStep === 3, miamiOp)

    const planeDoha = planeDohaRef.current
    const planeMiami = planeMiamiRef.current
    if (planeDoha) gsap.to(planeDoha, { opacity: dohaOp > 0.5 ? 1 : 0, duration: 0.5 })
    if (planeMiami) gsap.to(planeMiami, { opacity: miamiOp > 0.5 ? 1 : 0, duration: 0.5 })

    CITIES.forEach((city) => {
      const active = cityActive(targetStep, city.id)
      const r = active ? CITY_DOT_R_ACTIVE : CITY_DOT_R
      const sel = d3.select(svgRef.current).select(`.city-overlay-${city.id}`)
      gsap.to(sel.select(".city-halo").node(), {
        attr: { r },
        duration: 0.35,
        ease: "power2.out",
      })
      gsap.to(sel.select(".city-core").node(), {
        attr: { r },
        duration: 0.35,
        ease: "power2.out",
      })
      gsap.to(sel.select(".city-halo").node(), {
        attr: { "fill-opacity": active ? 1 : 0.45 },
        duration: 0.35,
      })
    })
  }, [])

  /** Aviones: MotionPathPlugin sobre el path (loop suave, sin flyTo). */
  const setupPlaneMotion = useCallback(() => {
    planeTweensRef.current.forEach((t) => t.kill())
    planeTweensRef.current = []

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const dohaPath = routeDohaRef.current
    const miamiPath = routeMiamiRef.current
    const planeDoha = planeDohaRef.current
    const planeMiami = planeMiamiRef.current

    if (!dohaPath || !miamiPath || !planeDoha || !planeMiami) return

    if (reduced) {
      gsap.set(planeDoha, { opacity: 0 })
      gsap.set(planeMiami, { opacity: 0 })
      return
    }

    const mk = (
      target: SVGGElement,
      path: SVGPathElement,
      duration: number,
      startOffset: number,
      color: string,
    ) => {
      gsap.set(target, { opacity: 0, transformOrigin: "50% 50%", svgOrigin: "50% 50%" })
      const tween = gsap.to(target, {
        duration,
        repeat: -1,
        ease: "none",
        motionPath: {
          path,
          align: path,
          alignOrigin: [0.5, 0.5],
          autoRotate: PLANE_ROTATE_OFFSET,
          start: startOffset,
          end: 1 + startOffset,
        },
      })
      planeTweensRef.current.push(tween)
      gsap.set(target.querySelector("svg"), { attr: { color } })
    }

    mk(planeDoha, dohaPath, 12, 0, MAP_COLORS.routeDoha)
    mk(planeMiami, miamiPath, 9, 0.45, MAP_COLORS.routeMiami)
  }, [])

  useEffect(() => {
    if (!ready) return
    setupPlaneMotion()
    return () => {
      planeTweensRef.current.forEach((t) => t.kill())
    }
  }, [ready, setupPlaneMotion])

  /* Sincronización con scroll: ScrollTrigger en cada panel (si hay refs) + prop `step`. */
  useEffect(() => {
    if (!ready) return

    scrollTriggersRef.current.forEach((st) => st.kill())
    scrollTriggersRef.current = []

    if (stepRefs?.length) {
      stepRefs.forEach((ref, i) => {
        const el = ref.current
        if (!el) return
        const st = ScrollTrigger.create({
          trigger: el,
          start: "top 55%",
          end: "bottom 45%",
          onEnter: () => {
            animateCameraTo(i)
            animateRoutesForStep(i)
          },
          onEnterBack: () => {
            animateCameraTo(i)
            animateRoutesForStep(i)
          },
        })
        scrollTriggersRef.current.push(st)
      })
    }

    return () => {
      scrollTriggersRef.current.forEach((st) => st.kill())
      scrollTriggersRef.current = []
    }
  }, [ready, stepRefs, animateCameraTo, animateRoutesForStep])

  useEffect(() => {
    if (!ready) return
    animateCameraTo(step)
    animateRoutesForStep(step)
  }, [step, ready, narrow, animateCameraTo, animateRoutesForStep])

  useEffect(() => {
    return () => {
      cameraTweenRef.current?.kill()
      labelTweenRef.current?.kill()
      planeTweensRef.current.forEach((t) => t.kill())
      scrollTriggersRef.current.forEach((st) => st.kill())
    }
  }, [])

  if (!geoData) {
    return (
      <div
        className="h-full w-full rounded-2xl bg-[#080e1c] animate-pulse"
        aria-hidden
      />
    )
  }

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden rounded-2xl">
      <svg
        ref={svgRef}
        className="h-full w-full block antialiased"
        role="img"
        aria-label="Mapa mundial con rutas Buenos Aires, Doha y Miami"
      />
    </div>
  )
}
