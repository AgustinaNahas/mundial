"use client"

import { useEffect, useMemo, useRef } from "react"
import { motion } from "framer-motion"
import { SourcesPanel } from "@/components/sources-panel"
import { DataItem } from "@/lib/data-context"
import { pushDataLayerEvent } from "@/lib/gtm"

interface SectionWrapperProps {
  children: React.ReactNode
  number: string
  title: string
  intro?: string
  bgColor?: "background" | "muted"
  sources?: (DataItem | undefined)[]
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
  bgColor = "background",
  sources,
}: SectionWrapperProps) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const sectionName = useMemo(() => slugify(title), [title])

  useEffect(() => {
    const node = sectionRef.current
    if (!node) return

    let alreadyTracked = false
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (!entry?.isIntersecting || alreadyTracked) return

        alreadyTracked = true
        pushDataLayerEvent("section_view", {
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
    <section ref={sectionRef} className={`py-20 md:py-28 ${bgColor === "muted" ? "bg-muted" : "bg-background"}`}>
      <div className="container mx-auto px-6 md:px-12 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <span className="text-accent text-sm font-medium tracking-wide">{number}</span>
          <h3 className="text-2xl md:text-4xl font-light text-foreground mt-2 tracking-tight text-balance">
            {title}
          </h3>
          {intro && (
            <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed">
              {intro}
            </p>
          )}
        </motion.div>

        {children}

        {sources && <SourcesPanel items={sources} />}
      </div>
    </section>
  )
}
