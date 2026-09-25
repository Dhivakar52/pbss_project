import React from 'react'

export interface PrintFieldProps {
  label: React.ReactNode
  value?: React.ReactNode
  labelWidth?: string
  colonWidth?: string
  className?: string
  labelClassName?: string
  valueClassName?: string
  alignTop?: boolean
}

/**
 * Standard 3-column field layout for Print Preview and Print Documents:
 * [ Label (fixed width) ] -> [ : (fixed width centered) ] -> [ Value (flex-1) ]
 *
 * Ensures all labels start from the same left position, all colons align
 * in the exact same vertical column, and all values start from the exact same position.
 */
export const PrintField: React.FC<PrintFieldProps> = ({
  label,
  value,
  labelWidth = 'w-[165px]',
  colonWidth = 'w-4',
  className = '',
  labelClassName = '',
  valueClassName = '',
  alignTop = true,
}) => {
  return (
    <div
      className={`flex ${alignTop ? 'items-start' : 'items-center'} text-[11.5px] leading-snug min-w-0 ${className}`}
    >
      <span
        className={`${labelWidth} shrink-0 font-bold text-black leading-snug ${labelClassName}`}
      >
        {label}
      </span>
      <span
        className={`${colonWidth} shrink-0 font-bold text-center text-black leading-snug select-none`}
      >
        :
      </span>
      <span
        className={`flex-1 min-w-0 font-normal text-black leading-snug break-words ${valueClassName}`}
      >
        {value !== undefined && value !== null ? value : ''}
      </span>
    </div>
  )
}

export default PrintField
