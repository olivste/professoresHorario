"use client"

import React from "react"
import { motion } from "framer-motion"

// Loading Spinner
export function LoadingSpinner() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="h-8 w-8 rounded-full border-3 border-gray-300 border-t-blue-600"
    />
  )
}

// Page Transition Wrapper
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}

// Staggered Container for list animations
export function StaggeredContainer({
  children,
  delayChildren = 0.1,
}: {
  children: React.ReactNode
  delayChildren?: number
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: delayChildren,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

// Staggered Item
export function StaggeredItem({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.4 },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

// Bounce animation for cards
export function BounceCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 10 }}
    >
      {children}
    </motion.div>
  )
}

// Fade in on scroll
export function FadeInOnScroll({ children }: { children: React.ReactNode }) {
  const ref = React.useRef(null)
  const isInView = useInView(ref)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  )
}

// Simple utility - useInView
function useInView(ref: React.RefObject<HTMLElement>) {
  const [isInView, setIsInView] = React.useState(false)

  React.useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true)
        observer.unobserve(entry.target)
      }
    })

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [ref])

  return isInView
}

// Pulse effect
export function PulseEffect({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      animate={{ scale: [1, 1.02, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      {children}
    </motion.div>
  )
}
