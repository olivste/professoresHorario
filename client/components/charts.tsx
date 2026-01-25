"use client"

import { motion } from "framer-motion"
import React from "react"

interface ChartBarProps {
  label: string
  value: number
  maxValue: number
  color: string
  icon?: string
}

export function ChartBar({ label, value, maxValue, color, icon }: ChartBarProps) {
  const percentage = (value / maxValue) * 100

  return (
    <motion.div
      className="space-y-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          {icon && <span className="mr-2">{icon}</span>}
          {label}
        </span>
        <span className="text-sm font-bold text-gray-900">{value}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={`h-full bg-gradient-to-r ${color}`}
        />
      </div>
    </motion.div>
  )
}

interface CircleProgressProps {
  value: number
  maxValue?: number
  label: string
  color: string
  size?: "sm" | "md" | "lg"
  showPercentage?: boolean
}

export function CircleProgress({
  value,
  maxValue = 100,
  label,
  color,
  size = "md",
  showPercentage = true,
}: CircleProgressProps) {
  const percentage = (value / maxValue) * 100
  const circumference = 2 * Math.PI * 45

  const sizeClasses = {
    sm: "w-24 h-24",
    md: "w-32 h-32",
    lg: "w-40 h-40",
  }

  return (
    <motion.div
      className="flex flex-col items-center justify-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className={`relative ${sizeClasses[size]}`}>
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
          {/* Background circle */}
          <circle cx="60" cy="60" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
          {/* Progress circle */}
          <motion.circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - (percentage / 100) * circumference }}
            transition={{ duration: 0.8, delay: 0.2 }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {showPercentage && (
            <motion.span
              className={`font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {Math.round(percentage)}%
            </motion.span>
          )}
          <span className="text-xs text-gray-600 mt-1">{value}</span>
        </div>
      </div>
      <p className="mt-4 text-sm font-medium text-gray-700 text-center">{label}</p>
    </motion.div>
  )
}

interface SimpleLineChartProps {
  data: number[]
  labels: string[]
  color: string
  height?: number
}

export function SimpleLineChart({ data, labels, color, height = 200 }: SimpleLineChartProps) {
  if (data.length === 0) return null

  const maxValue = Math.max(...data)
  const minValue = Math.min(...data)
  const range = maxValue - minValue || 1

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1 || 1)) * 100
    const y = 100 - ((value - minValue) / range) * 100
    return { x, y, value }
  })

  const pathData = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")

  return (
    <div className="w-full" style={{ height }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        {/* Grid lines */}
        <line x1="0" y1="25" x2="100" y2="25" stroke="#e5e7eb" strokeWidth="0.5" />
        <line x1="0" y1="50" x2="100" y2="50" stroke="#e5e7eb" strokeWidth="0.5" />
        <line x1="0" y1="75" x2="100" y2="75" stroke="#e5e7eb" strokeWidth="0.5" />

        {/* Area under curve */}
        <motion.path
          d={`${pathData} L 100 100 L 0 100 Z`}
          fill={color}
          fillOpacity="0.1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />

        {/* Line */}
        <motion.path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1 }}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((p, i) => (
          <motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="1.5"
            fill={color}
            initial={{ opacity: 0, r: 0 }}
            animate={{ opacity: 1, r: 1.5 }}
            transition={{ delay: i * 0.1 + 0.5, duration: 0.3 }}
          />
        ))}
      </svg>

      {/* Labels */}
      <div className="flex justify-between mt-2 text-xs text-gray-600">
        {labels.map((label, i) => (
          <span key={i}>{label}</span>
        ))}
      </div>
    </div>
  )
}

interface DonutChartProps {
  data: Array<{ label: string; value: number; color: string }>
  size?: number
  showLegend?: boolean
}

export function DonutChart({ data, size = 200, showLegend = true }: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const circumference = 2 * Math.PI * 45

  let currentOffset = 0
  const segments = data.map((item) => {
    const percentage = (item.value / total) * 100
    const segmentLength = (percentage / 100) * circumference
    const offset = currentOffset
    currentOffset += segmentLength

    return {
      ...item,
      percentage,
      segmentLength,
      offset,
    }
  })

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-center">
        <div style={{ width: size, height: size }} className="relative">
          <svg viewBox="0 0 120 120" className="w-full h-full">
            {segments.map((segment, index) => (
              <motion.circle
                key={index}
                cx="60"
                cy="60"
                r="45"
                fill="none"
                stroke={segment.color}
                strokeWidth="12"
                strokeDasharray={`${segment.segmentLength} ${circumference}`}
                strokeDashoffset={-segment.offset}
                initial={{ strokeDasharray: `0 ${circumference}` }}
                animate={{ strokeDasharray: `${segment.segmentLength} ${circumference}` }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                strokeLinecap="round"
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{total}</p>
              <p className="text-xs text-gray-600">Total</p>
            </div>
          </div>
        </div>
      </div>

      {showLegend && (
        <div className="space-y-2">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="text-gray-700">{segment.label}</span>
              </div>
              <span className="font-medium text-gray-900">
                {segment.value} ({segment.percentage.toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
