"use client"

import React from "react"
import { cn } from "@/lib/utils"

// Data Table Component
interface DataTableColumn<T> {
  key: keyof T
  label: string
  render?: (value: any, row: T) => React.ReactNode
  sortable?: boolean
  width?: string
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  isLoading?: boolean
  emptyText?: string
}

export function DataTable<T extends { id: number | string }>({
  columns,
  data,
  isLoading,
  emptyText = "Nenhum dado encontrado",
}: DataTableProps<T>) {
  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={cn(
                    "px-6 py-4 text-left text-xs font-semibold text-gray-700 bg-gray-50",
                    col.width
                  )}
                >
                  <div className="flex items-center gap-2">
                    {col.label}
                    {col.sortable && <span className="text-gray-400">⇅</span>}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center">
                  <div className="flex justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                  {emptyText}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className={cn(
                        "px-6 py-4 text-sm text-gray-700",
                        col.width
                      )}
                    >
                      {col.render
                        ? col.render(row[col.key], row)
                        : String(row[col.key] || "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Form Group Component
interface FormGroupProps {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
}

export function FormGroup({ label, error, required, children }: FormGroupProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}

// Modal Component
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: "sm" | "md" | "lg"
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
}: ModalProps) {
  if (!isOpen) return null

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={cn("relative bg-white rounded-xl shadow-xl", sizes[size])}>
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="p-6">{children}</div>
        {footer && (
          <div className="flex justify-end gap-3 border-t border-gray-200 p-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

// Tabs Component
interface TabItem {
  label: string
  value: string
  icon?: React.ReactNode
  content: React.ReactNode
}

interface TabsProps {
  items: TabItem[]
  defaultTab?: string
  onChange?: (value: string) => void
}

export function Tabs({ items, defaultTab, onChange }: TabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultTab || items[0]?.value || "")

  const handleChange = (value: string) => {
    setActiveTab(value)
    onChange?.(value)
  }

  return (
    <div>
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {items.map((item) => (
          <button
            key={item.value}
            onClick={() => handleChange(item.value)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors border-b-2 -mb-px",
              activeTab === item.value
                ? "text-blue-600 border-blue-600"
                : "text-gray-600 border-transparent hover:text-gray-900"
            )}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>
      <div>
        {items.find((item) => item.value === activeTab)?.content}
      </div>
    </div>
  )
}
