"use client"

import { motion, useScroll } from "framer-motion"
import { useEffect, useState, useCallback } from "react"

interface Section {
  id: string
  label: string
  shortLabel: string
  color: string
}

const sections: Section[] = [
  { id: "previa", label: "La Previa", shortLabel: "Previa", color: "bg-primary" },
  { id: "mundial", label: "El Mundial", shortLabel: "Mundial", color: "bg-secondary" },
  { id: "festejo", label: "El Festejo", shortLabel: "Festejo", color: "bg-accent" },
]

export function ProgressTracker() {
  const [activeSection, setActiveSection] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [progress, setProgress] = useState(0)
  const { scrollYProgress } = useScroll()
  
  const handleScroll = useCallback(() => {
    const scrollPosition = window.scrollY
    const windowHeight = window.innerHeight
    const documentHeight = document.documentElement.scrollHeight
    
    // Show tracker after hero section (approx 100vh)
    setIsVisible(scrollPosition > windowHeight * 0.8)
    
    // Calculate overall progress
    const totalProgress = (scrollPosition / (documentHeight - windowHeight)) * 100
    setProgress(Math.min(totalProgress, 100))
    
    // Find which section is currently in view
    const sectionElements = sections.map(s => document.getElementById(s.id))
    
    for (let i = sectionElements.length - 1; i >= 0; i--) {
      const element = sectionElements[i]
      if (element) {
        const rect = element.getBoundingClientRect()
        if (rect.top <= windowHeight * 0.4) {
          setActiveSection(i)
          break
        }
      }
    }
  }, [])
  
  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    
    return () => window.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }
  
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ 
        y: isVisible ? 0 : 100, 
        opacity: isVisible ? 1 : 0 
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border shadow-lg"
    >
      <div className="max-w-4xl mx-auto px-4 py-3">
        {/* Progress bar */}
        <div className="relative h-1.5 bg-muted rounded-full mb-3 overflow-hidden">
          {/* Background gradient showing section colors */}
          <div className="absolute inset-0 flex">
            <div className="flex-1 bg-primary/20" />
            <div className="flex-1 bg-secondary/20" />
            <div className="flex-1 bg-accent/20" />
          </div>
          
          {/* Active progress bar */}
          <motion.div
            className="absolute top-0 left-0 h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1, ease: "linear" }}
            style={{
              background: `linear-gradient(to right, 
                hsl(var(--primary)) 0%, 
                hsl(var(--primary)) 33%, 
                hsl(var(--secondary)) 33%, 
                hsl(var(--secondary)) 66%, 
                hsl(var(--accent)) 66%, 
                hsl(var(--accent)) 100%
              )`
            }}
          />
          
          {/* Section dividers */}
          <div className="absolute top-0 left-1/3 w-px h-full bg-border/60" />
          <div className="absolute top-0 left-2/3 w-px h-full bg-border/60" />
        </div>
        
        {/* Section labels */}
        <div className="flex justify-between items-center">
          {sections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`flex items-center gap-2 transition-all duration-300 group px-2 py-1 rounded-md ${
                activeSection === index 
                  ? "opacity-100" 
                  : "opacity-50 hover:opacity-75 hover:bg-muted/50"
              }`}
            >
              {/* Indicator dot with pulse animation when active */}
              <div className="relative">
                <motion.div
                  animate={{
                    scale: activeSection === index ? 1 : 0.7,
                  }}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    activeSection === index ? section.color : "bg-muted-foreground"
                  }`}
                />
                {activeSection === index && (
                  <motion.div
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className={`absolute inset-0 rounded-full ${section.color}`}
                  />
                )}
              </div>
              
              {/* Label */}
              <span className={`text-xs md:text-sm font-medium transition-colors ${
                activeSection === index 
                  ? "text-foreground" 
                  : "text-muted-foreground group-hover:text-foreground"
              }`}>
                <span className="hidden sm:inline">{section.label}</span>
                <span className="sm:hidden">{section.shortLabel}</span>
              </span>
              
              {/* Section number badge */}
              <span className={`hidden md:inline text-[10px] px-1.5 py-0.5 rounded font-medium transition-colors ${
                activeSection === index 
                  ? `${section.color}/10 text-foreground` 
                  : "bg-muted text-muted-foreground"
              }`}>
                0{index + 1}
              </span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
