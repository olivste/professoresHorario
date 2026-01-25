"use client"

import { motion } from "framer-motion"
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from "lucide-react"
import React from "react"

type AlertType = "info" | "success" | "warning" | "error"

interface InfoCardProps {
  type?: AlertType
  title: string
  description?: string
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
  onClose?: () => void
  dismissible?: boolean
  className?: string
}

const ALERT_STYLES = {
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    title: "text-blue-900",
    desc: "text-blue-700",
    icon: "text-blue-600",
    button: "bg-blue-600 hover:bg-blue-700 text-white",
  },
  success: {
    bg: "bg-green-50",
    border: "border-green-200",
    title: "text-green-900",
    desc: "text-green-700",
    icon: "text-green-600",
    button: "bg-green-600 hover:bg-green-700 text-white",
  },
  warning: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    title: "text-yellow-900",
    desc: "text-yellow-700",
    icon: "text-yellow-600",
    button: "bg-yellow-600 hover:bg-yellow-700 text-white",
  },
  error: {
    bg: "bg-red-50",
    border: "border-red-200",
    title: "text-red-900",
    desc: "text-red-700",
    icon: "text-red-600",
    button: "bg-red-600 hover:bg-red-700 text-white",
  },
}

const DEFAULT_ICONS = {
  info: <Info className="h-5 w-5" />,
  success: <CheckCircle className="h-5 w-5" />,
  warning: <AlertTriangle className="h-5 w-5" />,
  error: <AlertCircle className="h-5 w-5" />,
}

export function InfoCard({
  type = "info",
  title,
  description,
  icon,
  action,
  onClose,
  dismissible = true,
  className = "",
}: InfoCardProps) {
  const [isVisible, setIsVisible] = React.useState(true)

  const handleClose = () => {
    setIsVisible(false)
    onClose?.()
  }

  const style = ALERT_STYLES[type]

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className={`p-4 rounded-lg border ${style.bg} ${style.border} ${className}`}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 ${style.icon} mt-0.5`}>
          {icon || DEFAULT_ICONS[type]}
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className={`font-semibold text-sm ${style.title}`}>{title}</h3>
          {description && (
            <p className={`text-sm mt-1 ${style.desc}`}>{description}</p>
          )}

          {action && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={action.onClick}
              className={`mt-3 px-4 py-2 rounded text-sm font-medium transition-colors ${style.button}`}
            >
              {action.label}
            </motion.button>
          )}
        </div>

        {/* Close Button */}
        {dismissible && (
          <motion.button
            whileHover={{ rotate: 90 }}
            onClick={handleClose}
            className={`flex-shrink-0 ${style.icon} hover:opacity-80 transition-opacity`}
          >
            <X className="h-5 w-5" />
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}

interface NotificationProps {
  type?: AlertType
  message: string
  duration?: number
  onClose?: () => void
}

export function Notification({
  type = "info",
  message,
  duration = 5000,
  onClose,
}: NotificationProps) {
  const [isVisible, setIsVisible] = React.useState(true)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const style = ALERT_STYLES[type]

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={`fixed top-4 right-4 max-w-sm p-4 rounded-lg border ${style.bg} ${style.border} shadow-lg flex gap-3 items-center z-50`}
    >
      <div className={`flex-shrink-0 ${style.icon}`}>
        {DEFAULT_ICONS[type]}
      </div>
      <p className={`text-sm ${style.desc}`}>{message}</p>
      <motion.button
        whileHover={{ rotate: 90 }}
        onClick={() => setIsVisible(false)}
        className={`flex-shrink-0 ${style.icon} hover:opacity-80 transition-opacity ml-auto`}
      >
        <X className="h-4 w-4" />
      </motion.button>
    </motion.div>
  )
}

interface HelperBoxProps {
  title: string
  items: Array<{
    icon?: string
    label: string
    description?: string
  }>
  variant?: "tips" | "features" | "steps"
}

export function HelperBox({ title, items, variant = "tips" }: HelperBoxProps) {
  const variantStyles = {
    tips: {
      bg: "bg-gradient-to-br from-blue-50 to-indigo-50",
      border: "border-blue-200",
      badge: "bg-blue-100 text-blue-700",
      title: "text-blue-900",
    },
    features: {
      bg: "bg-gradient-to-br from-green-50 to-emerald-50",
      border: "border-green-200",
      badge: "bg-green-100 text-green-700",
      title: "text-green-900",
    },
    steps: {
      bg: "bg-gradient-to-br from-purple-50 to-pink-50",
      border: "border-purple-200",
      badge: "bg-purple-100 text-purple-700",
      title: "text-purple-900",
    },
  }

  const style = variantStyles[variant]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`p-6 rounded-lg border ${style.bg} ${style.border}`}
    >
      <h3 className={`font-bold text-lg ${style.title} mb-4`}>
        {variant === "tips" && "💡 "}
        {variant === "features" && "✨ "}
        {variant === "steps" && "🚀 "}
        {title}
      </h3>

      <div className="space-y-3">
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex gap-3"
          >
            <div className={`flex-shrink-0 w-6 h-6 rounded-full ${style.badge} flex items-center justify-center text-xs font-bold`}>
              {item.icon || (variant === "steps" ? index + 1 : "•")}
            </div>
            <div className="flex-1">
              <p className={`font-medium text-sm ${style.title}`}>{item.label}</p>
              {item.description && (
                <p className={`text-xs ${style.title} opacity-70 mt-0.5`}>{item.description}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
