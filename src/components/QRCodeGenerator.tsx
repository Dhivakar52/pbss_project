import React from "react";

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  className?: string;
}

// Generates pseudo QR code matrix deterministically from string value
function generateQRMatrix(value: string, size = 21): boolean[][] {
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  // Helper to draw position detection pattern (7x7 finder pattern)
  const drawFinderPattern = (row: number, col: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 ||
          r === 6 ||
          c === 0 ||
          c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          matrix[row + r][col + c] = true;
        }
      }
    }
  };

  // 1. Top-Left, Top-Right, Bottom-Left Finder Patterns
  drawFinderPattern(0, 0);
  drawFinderPattern(0, size - 7);
  drawFinderPattern(size - 7, 0);

  // 2. Timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // 3. Hash value string to populate data bits
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }

  let seed = Math.abs(hash);
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Skip finder pattern zones
      if (
        (r < 8 && c < 8) ||
        (r < 8 && c >= size - 8) ||
        (r >= size - 8 && c < 8) ||
        (r === 6 || c === 6)
      ) {
        continue;
      }
      seed = (seed * 9301 + 49297) % 233280;
      matrix[r][c] = seed / 233280 > 0.45;
    }
  }

  return matrix;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  value,
  size = 90,
  className = "",
}) => {
  const matrixSize = 21;
  const matrix = React.useMemo(() => generateQRMatrix(value || "000000", matrixSize), [value]);
  const cellSize = size / matrixSize;

  return (
    <div className={`inline-block ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="bg-white p-1 rounded border border-slate-200"
      >
        {matrix.map((row, r) =>
          row.map((cell, c) => {
            if (cell) {
              return (
                <rect
                  key={`${r}-${c}`}
                  x={c * cellSize}
                  y={r * cellSize}
                  width={cellSize}
                  height={cellSize}
                  fill="#0f172a"
                />
              );
            }
            return null;
          })
        )}
      </svg>
    </div>
  );
};
