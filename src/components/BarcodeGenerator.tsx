import React from "react";

interface BarcodeGeneratorProps {
  value: string;
  height?: number;
  width?: number;
  showText?: boolean;
  className?: string;
}

// Code 128B patterns (103 symbols)
const CODE128_PATTERNS: string[] = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213", // 0-9
  "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132", // 10-19
  "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211", // 20-29
  "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313", // 30-39
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331", // 40-49
  "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111", // 50-59
  "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214", // 60-69
  "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111", // 70-79
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141", // 80-89
  "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141", // 90-99
  "114131", "311141", "411131", "211412", "211214", "211232", "2331112" // 100-106
];

const START_CODE_B = 104; // 211021 -> 211412 pattern at 104
const STOP_CODE = 106;     // 2331112 pattern at 106

function encodeCode128B(text: string): string {
  const cleanText = text.replace(/[^\x20-\x7E]/g, "");
  if (!cleanText) return "";

  const codes: number[] = [START_CODE_B];
  for (let i = 0; i < cleanText.length; i++) {
    const charCode = cleanText.charCodeAt(i) - 32;
    codes.push(charCode);
  }

  // Calculate Checksum Modulo 103
  let checksum = codes[0];
  for (let i = 1; i < codes.length; i++) {
    checksum += codes[i] * i;
  }
  const checkCode = checksum % 103;
  codes.push(checkCode);
  codes.push(STOP_CODE);

  // Convert pattern digits to bar/space widths
  let binaryString = "";
  for (const code of codes) {
    const pattern = CODE128_PATTERNS[code];
    let isBar = true;
    for (let i = 0; i < pattern.length; i++) {
      const width = parseInt(pattern[i], 10);
      binaryString += (isBar ? "1" : "0").repeat(width);
      isBar = !isBar;
    }
  }

  return binaryString;
}

export const BarcodeGenerator: React.FC<BarcodeGeneratorProps> = ({
  value,
  height = 50,
  width = 2,
  showText = true,
  className = "",
}) => {
  const encodedBits = encodeCode128B(value || "000000");
  const totalWidth = encodedBits.length * width;

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <svg
        width={totalWidth}
        height={height}
        viewBox={`0 0 ${totalWidth} ${height}`}
        className="overflow-visible"
      >
        {encodedBits.split("").map((bit, idx) => {
          if (bit === "1") {
            return (
              <rect
                key={idx}
                x={idx * width}
                y={0}
                width={width}
                height={height}
                fill="black"
              />
            );
          }
          return null;
        })}
      </svg>
      {showText && (
        <span className="font-mono text-xs text-slate-800 tracking-wider mt-1 font-semibold">
          {value}
        </span>
      )}
    </div>
  );
};
