"use client"

import { motion } from "framer-motion"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"

interface StatusBadgeProps {
  status: string
  variant?: "success" | "warning" | "error" | "info" | "default"
  icon?: string
  label?: string
  onClick?: () => void
}

const BADGE_VARIANTS = {
  success: "bg-green-100 text-green-800 border-green-300",
  warning: "bg-yellow-100 text-yellow-800 border-yellow-300",
  error: "bg-red-100 text-red-800 border-red-300",
  info: "bg-blue-100 text-blue-800 border-blue-300",
  default: "bg-gray-100 text-gray-800 border-gray-300",
}

const STATUS_ICONS = {
  active: "✅",
  inactive: "⏸️",
  pending: "⏳",
  completed: "✓",
  failed: "✗",
  warning: "⚠️",
  info: "ℹ️",
}

export function StatusBadge({
  status,
  variant = "default",
  icon,
  label,
  onClick,
}: StatusBadgeProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`px-3 py-1 rounded-full text-sm font-medium border inline-flex items-center gap-1.5 cursor-pointer transition-all ${BADGE_VARIANTS[variant]}`}
      onClick={onClick}
    >
      <span>{icon || STATUS_ICONS[status as keyof typeof STATUS_ICONS] || "•"}</span>
      <span>{label || status}</span>
    </motion.div>
  )
}

interface TrendBadgeProps {
  value: number
  label: string
  positive?: boolean
  showIcon?: boolean
}

export function TrendBadge({ value, label, positive = true, showIcon = true }: TrendBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
        positive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
      }`}
    >
      {showIcon && (positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />)}
      <span>
        {positive ? "+" : "-"}
        {value}%
      </span>
      {label && <span className="text-gray-600 ml-1">{label}</span>}
    </motion.div>
  )
}

interface ColorBadgeProps {
  label: string
  color: "blue" | "red" | "green" | "yellow" | "purple" | "pink" | "indigo"
  icon?: React.ReactNode
}

export function ColorBadge({ label, color, icon }: ColorBadgeProps) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-700 border-blue-300",
    red: "bg-red-100 text-red-700 border-red-300",
    green: "bg-green-100 text-green-700 border-green-300",
    yellow: "bg-yellow-100 text-yellow-700 border-yellow-300",
    purple: "bg-purple-100 text-purple-700 border-purple-300",
    pink: "bg-pink-100 text-pink-700 border-pink-300",
    indigo: "bg-indigo-100 text-indigo-700 border-indigo-300",
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`px-3 py-1 rounded-full text-sm font-medium border inline-flex items-center gap-2 ${colorClasses[color]}`}
    >
      {icon && <span>{icon}</span>}
      <span>{label}</span>
    </motion.div>
  )
}
