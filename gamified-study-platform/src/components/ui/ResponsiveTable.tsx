import React, { useState } from 'react'
import { clsx } from 'clsx'
import { useIsMobile } from '../../hooks/useResponsive'

interface Column<T> {
  key: keyof T | string
  header: string
  accessor?: (item: T) => React.ReactNode
  sortable?: boolean
  width?: string
  mobileLabel?: string
  hideOnMobile?: boolean
  align?: 'left' | 'center' | 'right'
}

interface ResponsiveTableProps<T> {
  data: T[]
  columns: Column<T>[]
  keyExtractor: (item: T, index: number) => string | number
  variant?: 'default' | 'striped' | 'bordered'
  size?: 'sm' | 'md' | 'lg'
  stickyHeader?: boolean
  loading?: boolean
  emptyMessage?: string
  onRowClick?: (item: T, index: number) => void
  className?: string
  'aria-label'?: string
}

export function ResponsiveTable<T>({
  data,
  columns,
  keyExtractor,
  variant = 'default',
  size = 'md',
  stickyHeader = false,
  loading = false,
  emptyMessage = 'No data available',
  onRowClick,
  className = '',
  'aria-label': ariaLabel = 'Data table'
}: ResponsiveTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const isMobile = useIsMobile()

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(columnKey)
      setSortDirection('asc')
    }
  }

  const sortedData = React.useMemo(() => {
    if (!sortColumn) return data

    const column = columns.find(col => col.key === sortColumn)
    if (!column || !column.sortable) return data

    return [...data].sort((a, b) => {
      let aValue: any
      let bValue: any

      if (column.accessor) {
        aValue = column.accessor(a)
        bValue = column.accessor(b)
      } else {
        aValue = (a as any)[column.key]
        bValue = (b as any)[column.key]
      }

      // Handle different data types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [data, sortColumn, sortDirection, columns])

  const baseClasses = 'w-full'
  const variantClasses = {
    default: 'border-collapse',
    striped: 'border-collapse',
    bordered: 'border border-gray-200 dark:border-gray-700'
  }

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  const visibleColumns = columns.filter(col => !col.hideOnMobile || !isMobile)

  // Mobile card view
  if (isMobile) {
    return (
      <div className={clsx('space-y-4', className)} role="table" aria-label={ariaLabel}>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="space-y-3">
                  {visibleColumns.map((column, j) => (
                    <div key={j} className="flex justify-between">
                      <div className="w-1/3 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      <div className="w-1/2 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : sortedData.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {emptyMessage}
          </div>
        ) : (
          sortedData.map((item, index) => (
            <div
              key={keyExtractor(item, index)}
              className={clsx(
                'bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700',
                onRowClick && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
              )}
              onClick={() => onRowClick?.(item, index)}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && onRowClick) {
                  e.preventDefault()
                  onRowClick(item, index)
                }
              }}
              tabIndex={onRowClick ? 0 : -1}
              role="row"
            >
              <div className="space-y-3">
                {visibleColumns.map((column) => {
                  const value = column.accessor ? column.accessor(item) : (item as any)[column.key]
                  return (
                    <div key={String(column.key)} className="flex justify-between items-start">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 w-1/3">
                        {column.mobileLabel || column.header}
                      </dt>
                      <dd className="text-sm text-gray-900 dark:text-white w-2/3 text-right">
                        {value}
                      </dd>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    )
  }

  // Desktop table view
  return (
    <div className={clsx('overflow-x-auto', className)}>
      <table
        className={clsx(baseClasses, variantClasses[variant], sizeClasses[size])}
        role="table"
        aria-label={ariaLabel}
      >
        <thead
          className={clsx(
            'bg-gray-50 dark:bg-gray-800',
            stickyHeader && 'sticky top-0 z-10'
          )}
        >
          <tr role="row">
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={clsx(
                  'px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider',
                  column.sortable && 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none',
                  column.align === 'center' && 'text-center',
                  column.align === 'right' && 'text-right',
                  column.width && `w-${column.width}`
                )}
                onClick={() => column.sortable && handleSort(String(column.key))}
                role="columnheader"
                aria-sort={
                  sortColumn === column.key
                    ? sortDirection === 'asc' ? 'ascending' : 'descending'
                    : column.sortable ? 'none' : undefined
                }
                tabIndex={column.sortable ? 0 : -1}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && column.sortable) {
                    e.preventDefault()
                    handleSort(String(column.key))
                  }
                }}
              >
                <div className="flex items-center space-x-1">
                  <span>{column.header}</span>
                  {column.sortable && (
                    <svg
                      className={clsx(
                        'w-4 h-4 transition-transform',
                        sortColumn === column.key && sortDirection === 'desc' && 'rotate-180'
                      )}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {loading ? (
            [...Array(5)].map((_, i) => (
              <tr key={i} role="row">
                {columns.map((_, j) => (
                  <td key={j} className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))
          ) : sortedData.length === 0 ? (
            <tr role="row">
              <td
                colSpan={columns.length}
                className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((item, index) => (
              <tr
                key={keyExtractor(item, index)}
                className={clsx(
                  variant === 'striped' && index % 2 === 1 && 'bg-gray-50 dark:bg-gray-800',
                  onRowClick && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
                )}
                onClick={() => onRowClick?.(item, index)}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && onRowClick) {
                    e.preventDefault()
                    onRowClick(item, index)
                  }
                }}
                tabIndex={onRowClick ? 0 : -1}
                role="row"
              >
                {columns.map((column) => {
                  const value = column.accessor ? column.accessor(item) : (item as any)[column.key]
                  return (
                    <td
                      key={String(column.key)}
                      className={clsx(
                        'px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white',
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right'
                      )}
                      role="cell"
                    >
                      {value}
                    </td>
                  )
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}