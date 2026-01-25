"use client"

import React from "react"
import { cn } from "@/lib/utils"

// Stat Card Component
interface StatCardProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  trend?: { value: number; isPositive: boolean }
  gradient: string
}

export function StatCard({ label, value, icon, trend, gradient }: StatCardProps) {
  return (
    <div className={cn("rounded-xl p-6 text-white overflow-hidden relative group", gradient)}>
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-sm font-medium opacity-90 mb-1">{label}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
          {icon && <div className="text-3xl opacity-20">{icon}</div>}
        </div>
        {trend && (
          <div className={cn("text-xs font-semibold flex items-center gap-1 mt-3", 
            trend.isPositive ? "text-green-200" : "text-red-200"
          )}>
            <span>{trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
    </div>
  )
}

// Feature Card Component
interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
  isDisabled?: boolean
}

export function FeatureCard({
  icon,
  title,
  description,
  action,
  isDisabled,
}: FeatureCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border-2 border-gray-200 p-6 hover:border-blue-400 hover:shadow-lg transition-all duration-300 cursor-pointer group",
        isDisabled && "opacity-50 cursor-not-allowed hover:border-gray-200 hover:shadow-sm"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

// Loading Skeleton Component
export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-gray-200 p-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
      <div className="space-y-3">
        <div className="h-3 bg-gray-100 rounded" />
        <div className="h-3 bg-gray-100 rounded w-5/6" />
      </div>
    </div>
  )
}

// Badge Component with variants
interface BadgeProps {
  variant?: "default" | "success" | "warning" | "error" | "info"
  size?: "sm" | "md"
  children: React.ReactNode
}

export function Badge({ variant = "default", size = "md", children }: BadgeProps) {
  const variants = {
    default: "bg-blue-100 text-blue-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-orange-100 text-orange-700",
    error: "bg-red-100 text-red-700",
    info: "bg-indigo-100 text-indigo-700",
  }

  const sizes = {
    sm: "px-2.5 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  }

  return (
    <span className={cn("font-medium rounded-full", variants[variant], sizes[size])}>
      {children}
    </span>
  )
}

// Empty State Component
interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-6xl mb-4 opacity-20">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-6 max-w-sm text-center">{description}</p>
      {action}
    </div>
  )
}

// Data Table Header Component
interface DataTableHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export function DataTableHeader({ title, description, action }: DataTableHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {description && <p className="text-gray-600 text-sm mt-1">{description}</p>}
      </div>
      {action}
    </div>
  )
}
