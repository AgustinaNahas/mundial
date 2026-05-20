"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { ExternalLink } from "lucide-react"
import { CIERRE_COPY, SPREADSHEET_URL } from "@/lib/site-copy"

const linkClass =
  "text-sm text-accent hover:text-accent/80 transition-colors underline underline-offset-2"

export function CierreSection() {
  const { closing, spreadsheetLabel, about } = CIERRE_COPY

  return (
    <section className="py-20 md:py-28 bg-primary text-primary-foreground">
      <div className="container mx-auto px-6 md:px-12 max-w-3xl">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-xl md:text-2xl lg:text-3xl font-light italic text-center text-balance leading-snug"
        >
          {closing}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="mt-14 pt-10 border-t border-primary-foreground/20 text-center"
        >
          <a
            href={SPREADSHEET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm md:text-base text-accent hover:text-accent/80 transition-colors underline underline-offset-4"
          >
            {spreadsheetLabel}
            <ExternalLink className="size-4 shrink-0" aria-hidden />
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25, duration: 0.7 }}
          className="mt-14 pt-10 border-t border-primary-foreground/20"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-primary-foreground/50 mb-8 text-center">
            {about.title}
          </p>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
            <Image
              src={about.photo}
              alt={about.name}
              width={96}
              height={96}
              className="size-24 rounded-full object-cover ring-2 ring-primary-foreground/20 shrink-0"
            />
            <div className="text-center sm:text-left min-w-0">
              <p className="text-lg font-medium text-primary-foreground">{about.name}</p>
              <p className="mt-2 text-sm md:text-base text-primary-foreground/75 leading-relaxed max-w-md">
                {about.bio}
              </p>
              <ul className="mt-5 flex flex-wrap justify-center sm:justify-start gap-x-5 gap-y-2">
                <li>
                  <a
                    href={about.portfolio.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    {about.portfolio.label}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${about.email}`} className={linkClass}>
                    Email
                  </a>
                </li>
                {about.social.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkClass}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-xs uppercase tracking-[0.16em] text-primary-foreground/50">
                {about.projectsLabel}
              </p>
              <ul className="mt-2 flex flex-wrap justify-center sm:justify-start gap-x-5 gap-y-2">
                {about.projects.map((project) => (
                  <li key={project.href}>
                    <a
                      href={project.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkClass}
                    >
                      {project.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
