"use client"

import { useState } from "react"
import { ProjectInfoModal } from "@/components/project-info-modal"
import { InfoIconButton } from "@/components/ui/info-icon-button"
import { cn } from "@/lib/utils"

type ProjectInfoButtonProps = {
  className?: string
}

/** Barra de avance: click/tap abre el modal con info del sitio (en todos los breakpoints). */
export function ProjectInfoButton({ className }: ProjectInfoButtonProps) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <InfoIconButton
        size="sm"
        label="Sobre el proyecto"
        className={cn("shrink-0 mb-0.5 cursor-pointer", className)}
        onClick={() => setModalOpen(true)}
      />
      <ProjectInfoModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
