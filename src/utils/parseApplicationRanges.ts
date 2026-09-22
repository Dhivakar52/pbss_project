export interface ParseRangeResult {
  isValid: boolean
  numbers: number[]
  error?: string
  duplicates?: number[]
  rawInput: string
}

/**
 * Parse application range string (e.g. "100-110,113-150,155,160,170-180")
 * 
 * Supports:
 * - Single Number: "100"
 * - Multiple Numbers: "100,105,110"
 * - Range: "100-110"
 * - Multiple Ranges: "100-110,113-150"
 * - Mixed Format: "100-110,113-150,155,160,170-180"
 * 
 * Validates:
 * - Invalid ranges (e.g. "110-100")
 * - Duplicate numbers (e.g. "100-105,103")
 * - Empty values
 * - Incorrect formats (e.g. "100--", "abc", "10-")
 */
export function parseApplicationRanges(input: string): ParseRangeResult {
  const trimmed = input.trim()

  if (!trimmed) {
    return {
      isValid: false,
      numbers: [],
      error: 'Please enter application numbers or ranges.',
      rawInput: input,
    }
  }

  // Split by comma
  const parts = trimmed.split(',').map((p) => p.trim()).filter(Boolean)

  if (parts.length === 0) {
    return {
      isValid: false,
      numbers: [],
      error: 'Invalid input format. No application numbers found.',
      rawInput: input,
    }
  }

  const generatedNumbers: number[] = []
  const seenNumbers = new Set<number>()
  const duplicates: number[] = []

  for (const part of parts) {
    // Check range format "X-Y"
    if (part.includes('-')) {
      // Must match exactly two numbers separated by a hyphen
      const rangeMatch = part.match(/^(\d+)\s*-\s*(\d+)$/)
      if (!rangeMatch) {
        return {
          isValid: false,
          numbers: [],
          error: `Invalid range format: "${part}". Expected format like "100-110".`,
          rawInput: input,
        }
      }

      const start = parseInt(rangeMatch[1], 10)
      const end = parseInt(rangeMatch[2], 10)

      if (isNaN(start) || isNaN(end)) {
        return {
          isValid: false,
          numbers: [],
          error: `Invalid numeric range: "${part}".`,
          rawInput: input,
        }
      }

      if (start > end) {
        return {
          isValid: false,
          numbers: [],
          error: `Invalid range bounds: "${part}" (Start value ${start} cannot be greater than end value ${end}).`,
          rawInput: input,
        }
      }

      // Check max range size to prevent accidental massive memory alloc
      if (end - start > 5000) {
        return {
          isValid: false,
          numbers: [],
          error: `Range "${part}" is too large (maximum range limit is 5000 records).`,
          rawInput: input,
        }
      }

      for (let num = start; num <= end; num++) {
        if (seenNumbers.has(num)) {
          if (!duplicates.includes(num)) duplicates.push(num)
        } else {
          seenNumbers.add(num)
          generatedNumbers.push(num)
        }
      }
    } else {
      // Single number check
      if (!/^\d+$/.test(part)) {
        return {
          isValid: false,
          numbers: [],
          error: `Invalid number format: "${part}". Only positive integers are allowed.`,
          rawInput: input,
        }
      }

      const num = parseInt(part, 10)
      if (isNaN(num)) {
        return {
          isValid: false,
          numbers: [],
          error: `Invalid numeric value: "${part}".`,
          rawInput: input,
        }
      }

      if (seenNumbers.has(num)) {
        if (!duplicates.includes(num)) duplicates.push(num)
      } else {
        seenNumbers.add(num)
        generatedNumbers.push(num)
      }
    }
  }

  if (duplicates.length > 0) {
    return {
      isValid: false,
      numbers: generatedNumbers,
      duplicates,
      error: `Duplicate application numbers found: ${duplicates.join(', ')}. Please remove duplicates.`,
      rawInput: input,
    }
  }

  return {
    isValid: true,
    numbers: generatedNumbers,
    rawInput: input,
  }
}
