"use client"

import { useEffect, useMemo, useRef } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { SectionClosing } from "@/components/section-closing"
import { SourcesPanel, type SourceRow } from "@/components/sources-panel"
import { DataItem } from "@/lib/data-context"
import { sendGaEvent } from "@/lib/analytics"

interface SectionWrapperProps {
  children: React.ReactNode
  number: string
  title: string
  intro?: string
  closing?: string
  bgColor?: "background" | "muted"
  sources?: (DataItem | undefined)[]
  extraSources?: SourceRow[]
  /** Imagen decorativa a la derecha del título (mobile y desktop). */
  titleImage?: { src: string; alt: string }
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function SectionWrapper({
  children,
  number,
  title,
  intro,
  closing,
  bgColor = "background",
  sources,
  extraSources,
  titleImage,
}: SectionWrapperProps) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const sectionName = useMemo(() => slugify(title), [title])
  const showSources = (sources && sources.length > 0) || (extraSources && extraSources.length > 0)

  useEffect(() => {
    const node = sectionRef.current
    if (!node) return

    let alreadyTracked = false
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (!entry?.isIntersecting || alreadyTracked) return

        alreadyTracked = true
        sendGaEvent("section_view", {
          section_name: sectionName,
          section_title: title,
          section_number: number,
        })
        observer.disconnect()
      },
      { threshold: 0.35 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [number, sectionName, title])

  return (
    <section
      ref={sectionRef}
      data-progress-anchor=""
      className={`py-20 md:py-28 ${bgColor === "muted" ? "bg-muted" : "bg-background"}`}
    >
      <div className="container mx-auto px-6 md:px-12 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <span className="text-accent text-sm font-medium tracking-wide">{number}</span>
          <div className="flex items-start justify-between gap-3 mt-2">
            <h3 className="text-2xl md:text-4xl font-light text-foreground tracking-tight text-balance min-w-0 flex-1">
              {title}
            </h3>
            {titleImage && (
              <Image
                src={titleImage.src}
                alt={titleImage.alt}
                width={96}
                height={96}
                className="shrink-0 w-12 h-12 md:w-20 md:h-20 object-contain"
              />
            )}
          </div>
          {intro && (
            <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed">
              {intro}
            </p>
          )}
        </motion.div>

        {children}

        {closing && <SectionClosing>{closing}</SectionClosing>}

        {showSources && (
          <SourcesPanel items={sources} extraRows={extraSources} />
        )}
      </div>
    </section>
  )
}
