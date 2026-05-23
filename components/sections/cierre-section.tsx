"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { CIERRE_COPY } from "@/lib/site-copy"

const linkClass =
  "text-sm text-primary hover:text-primary/80 transition-colors underline underline-offset-2"

export function CierreSection() {
  const { about } = CIERRE_COPY

  return (
    <section id="cierre" className="py-20 md:py-28 bg-card border-t border-border/50 text-card-foreground">
      <div className="container mx-auto px-6 md:px-12 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-8 text-center">
            {about.title}
          </p>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
            <Image
              src={about.photo}
              alt={about.name}
              width={96}
              height={96}
              className="size-24 rounded-full object-cover ring-2 ring-border/60 shrink-0"
            />
            <div className="text-center sm:text-left min-w-0">
              <p className="text-lg font-medium text-foreground">{about.name}</p>
              <p className="mt-2 text-sm md:text-base text-muted-foreground leading-relaxed max-w-md">
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
              <p className="mt-5 text-xs uppercase tracking-[0.16em] text-muted-foreground/80">
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
