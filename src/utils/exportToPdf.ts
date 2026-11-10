import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { ExportColumn } from './exportToExcel'

export interface ExportPdfOptions {
  title?: string
  academicYear?: string
  fileName?: string
}

/**
 * Generates and downloads a clean landscape PDF file directly to the user's computer
 * containing the FULL grid dataset (all pages/rows).
 */
export function exportToPdf<T extends Record<string, any>>(
  data: T[],
  columns: ExportColumn[],
  options?: ExportPdfOptions
): void {
  if (!data || data.length === 0) return

  // Orientation: landscape for multi-column data tables
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
  })

  const title = options?.title || 'Report'
  const academicYear = options?.academicYear || ''
  const fileName = (options?.fileName || 'Report_Export').replace(/[^a-zA-Z0-9_-]/g, '_')

  const colCount = columns.length
  // Dynamically compute margins and font sizing based on column count
  const marginHorizontal = colCount > 14 ? 18 : colCount > 9 ? 24 : 32
  const fontSize = colCount > 15 ? 5.8 : colCount > 11 ? 6.5 : colCount > 7 ? 7.2 : 8
  const headFontSize = colCount > 15 ? 6.2 : colCount > 11 ? 7.0 : colCount > 7 ? 7.8 : 8.5
  const cellPadding = colCount > 14 ? 2.5 : colCount > 8 ? 3.0 : 4.0

  // Header Title
  doc.setFontSize(13)
  doc.setTextColor(10, 111, 156) // PSBB Blue #0a6f9c
  doc.setFont('helvetica', 'bold')
  doc.text('PADMA SESHADRI BALA BHAVAN SENIOR SECONDARY SCHOOL', marginHorizontal, 30)

  doc.setFontSize(10)
  doc.setTextColor(51, 65, 85) // Slate-700
  doc.setFont('helvetica', 'normal')
  const yearText = academicYear ? `Academic Year: ${academicYear}  |  ` : ''
  doc.text(`${title}  |  ${yearText}Total Records: ${data.length}`, marginHorizontal, 45)

  // Subtitle / generated timestamp
  doc.setFontSize(8)
  doc.setTextColor(100, 116, 139)
  const now = new Date()
  doc.text(`Generated on: ${now.toLocaleDateString('en-GB')} ${now.toLocaleTimeString()}`, marginHorizontal, 57)

  // Table headers
  const headers = [columns.map((c) => c.label)]

  // Table rows with case-insensitive and serial number support
  const rows = data.map((row, idx) => {
    return columns.map((c) => {
      if (c.key === '_sno' || c.key === 'slNo') return String(idx + 1)
      let val = row[c.key]
      if (val === undefined || val === null || val === '') {
        // Fallback for case-insensitive lookup
        const cleanKey = c.key.toLowerCase().replace(/[^a-z0-9]/g, '')
        const found = Object.entries(row).find(
          ([k]) => k.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanKey
        )
        if (found) val = found[1]
      }
      if (val === undefined || val === null || val === '') return '-'
      if (typeof val === 'boolean') return val ? 'Yes' : 'No'
      return String(val)
    })
  })

  // Render AutoTable with PSBB styling across all pages
  autoTable(doc, {
    head: headers,
    body: rows,
    startY: 65,
    margin: { left: marginHorizontal, right: marginHorizontal, bottom: 30 },
    theme: 'striped',
    headStyles: {
      fillColor: [10, 111, 156],
      textColor: [255, 255, 255],
      fontSize: headFontSize,
      fontStyle: 'bold',
      halign: 'left',
      valign: 'middle',
    },
    bodyStyles: {
      fontSize: fontSize,
      textColor: [30, 41, 59],
      cellPadding: cellPadding,
      valign: 'middle',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    styles: {
      overflow: 'linebreak',
      cellWidth: 'auto',
    },
    didDrawPage: (pageData) => {
      const pageCount = doc.getNumberOfPages()
      doc.setFontSize(8)
      doc.setTextColor(148, 163, 184)
      doc.text(
        `Page ${pageData.pageNumber} of ${pageCount}`,
        doc.internal.pageSize.width - marginHorizontal - 50,
        doc.internal.pageSize.height - 12
      )
    },
  })

  // Triggers immediate file download as .pdf
  doc.save(`${fileName}.pdf`)
}

