import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

/**
 * Formats a date string to DD-MM-YYYY format.
 * Handles common date formats: YYYY-MM-DD, ISO, DD/MM/YYYY, etc.
 * Returns the original value if it cannot be parsed.
 */
export function formatDateToDDMMYYYY(value: string): string {
  if (!value || typeof value !== 'string') return value

  // Try parsing as a date
  const date = new Date(value)
  if (isNaN(date.getTime())) return value

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  // Only format if the year looks reasonable (1900-2100)
  if (year < 1900 || year > 2100) return value

  return `${day}-${month}-${year}`
}

/**
 * Detects whether a column key represents a date field.
 */
export function isDateField(key: string): boolean {
  const lowerKey = key.toLowerCase()
  return (
    lowerKey === 'dob' ||
    lowerKey === 'date' ||
    lowerKey === 'date_of_submission' ||
    lowerKey === 'father_dob' ||
    lowerKey === 'mother_dob' ||
    lowerKey.endsWith('_date') ||
    lowerKey.startsWith('date_') ||
    lowerKey.endsWith('_dob')
  )
}

export interface ExportColumn {
  key: string
  label: string
}

/**
 * Exports data to an Excel (.xlsx) file and triggers a download.
 *
 * @param data - Array of row objects to export.
 * @param columns - Array of column definitions { key, label }.
 * @param fileName - File name for the downloaded file (without extension).
 * @param sheetName - Name of the worksheet tab.
 */
export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  columns: ExportColumn[],
  fileName: string = 'Export',
  sheetName: string = 'Sheet1'
): void {
  if (!data || data.length === 0) {
    return
  }

  // Build header row from column labels
  const headers = columns.map((col) => col.label)

  // Build data rows — extract value for each column key, format dates to DD-MM-YYYY
  const rows = data.map((row) => {
    return columns.map((col) => {
      const rawValue = row[col.key]

      // Handle undefined/null
      if (rawValue === undefined || rawValue === null) return ''

      // Convert booleans to Yes/No
      if (typeof rawValue === 'boolean') return rawValue ? 'Yes' : 'No'

      // Format date fields to DD-MM-YYYY
      if (isDateField(col.key) && typeof rawValue === 'string') {
        return formatDateToDDMMYYYY(rawValue)
      }

      return String(rawValue)
    })
  })

  // Combine headers + data rows
  const worksheetData = [headers, ...rows]

  // Create workbook and worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

  // Auto-size columns based on content width
  const colWidths = columns.map((col, colIndex) => {
    const headerLen = col.label.length
    const maxDataLen = rows.reduce((max, row) => {
      const cellLen = String(row[colIndex] || '').length
      return Math.max(max, cellLen)
    }, 0)
    return { wch: Math.min(Math.max(headerLen, maxDataLen) + 2, 50) }
  })
  worksheet['!cols'] = colWidths

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

  // Generate binary string and trigger download
  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
  })

  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })

  saveAs(blob, `${fileName}.xlsx`)
}
