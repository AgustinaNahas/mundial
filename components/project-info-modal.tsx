"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import { ExternalLink, X } from "lucide-react"
import {
  CIERRE_COPY,
  PROJECT_INFO_COPY,
  REPO_URL,
  SPREADSHEET_URL,
} from "@/lib/site-copy"
import { cn } from "@/lib/utils"

const linkClass =
  "inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors underline underline-offset-2"

type ProjectInfoModalProps = {
  open: boolean
  onClose: () => void
}

export function ProjectInfoModal({ open, onClose }: ProjectInfoModalProps) {
  const [mounted, setMounted] = useState(false)
  const { about } = CIERRE_COPY
  const { title, description, spreadsheetLabel, repoLabel, aboutTitle, closeLabel } =
    PROJECT_INFO_COPY

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open, onClose])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="presentation"
        >
          <button
            type="button"
            aria-label={closeLabel}
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-info-title"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={cn(
              "relative z-10 w-full max-w-md max-h-[min(88dvh,640px)] overflow-y-auto",
              "rounded-t-2xl sm:rounded-2xl border border-border/60 bg-card shadow-xl",
              "text-card-foreground",
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:pb-5">
              <div className="flex items-start justify-between gap-3">
                <h2
                  id="project-info-title"
                  className="text-base font-semibold tracking-tight text-foreground pr-2"
                >
                  {title}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label={closeLabel}
                  className="shrink-0 rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                >
                  <X className="size-4" strokeWidth={2.4} aria-hidden />
                </button>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>

              <ul className="mt-5 flex flex-col gap-2.5">
                <li>
                  <a
                    href={SPREADSHEET_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    {spreadsheetLabel}
                    <ExternalLink className="size-3.5 shrink-0" strokeWidth={2.4} aria-hidden />
                  </a>
                </li>
                <li>
                  <a
                    href={REPO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    {repoLabel}
                    <ExternalLink className="size-3.5 shrink-0" strokeWidth={2.4} aria-hidden />
                  </a>
                </li>
              </ul>

              <div className="mt-6 pt-5 border-t border-border/50">
                <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground/80 mb-4">
                  {aboutTitle}
                </p>
                <div className="flex items-start gap-3.5">
                  <Image
                    src={about.photo}
                    alt={about.name}
                    width={56}
                    height={56}
                    className="size-14 rounded-full object-cover ring-2 ring-border/60 shrink-0"
                  />
                  <div className="min-w-0 pt-0.5">
                    <p className="text-sm font-medium text-foreground">{about.name}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{about.bio}</p>
                    <a
                      href={about.portfolio.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(linkClass, "mt-2.5")}
                    >
                      {about.portfolio.label}
                      <ExternalLink className="size-3.5 shrink-0" strokeWidth={2.4} aria-hidden />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
