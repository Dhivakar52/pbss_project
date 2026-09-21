import { cn } from "@/lib/utils";

type StepKey = 1 | 2 | 3 | 4;

interface StepDef {
  key: StepKey;
  label: string;
}

const STEPS: StepDef[] = [
  { key: 1, label: "Patient Details" },
  { key: 2, label: "Address & Contact" },
  { key: 3, label: "Insurance Details" },
  { key: 4, label: "Additional Information" },
];

interface StepperProps {
  current: StepKey;
  onStepClick?: (step: StepKey) => void;
}

export function Stepper({ current, onStepClick }: StepperProps) {
  const total = STEPS.length;

  return (
    <div className="flex items-center px-4 sm:px-6 py-4 sm:py-5 overflow-x-auto">
      {STEPS.map((s) => {
        const stepNum = s.key;
        const label = s.label;
        const isActive = stepNum === current;
        const isCompleted = stepNum < current;
        
        return (
          <div 
            key={label} 
            className="flex flex-1 items-center last:flex-none min-w-fit"
          >
            <button
              type="button"
              onClick={() => onStepClick?.(stepNum)}
              className="flex items-center gap-1 sm:gap-2 text-left cursor-pointer hover:opacity-80 transition-opacity outline-none"
            >
              {/* Step Number Circle */}
              <div
                style={
                  isActive
                    ? {
                        background: "var(--blue-text-color)",
                      }
                    : isCompleted
                    ? {
                        background: "var(--blue-text-color)",
                        opacity: 0.7,
                      }
                    : undefined
                }
                className={cn(
                  "flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-full text-[11px] sm:text-[14px] font-semibold transition-all duration-200",
                  isActive 
                    ? "text-white shadow-md" 
                    : isCompleted
                    ? "text-white"
                    : "border border-slate-300 text-slate-400 hover:border-blue-400 hover:text-blue-600"
                )}
              >
                {isCompleted ? (
                  <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  stepNum
                )}
              </div>

              {/* Step Label */}
              <span
                className={cn(
                  "whitespace-nowrap text-[11px] sm:text-[13px] transition-all duration-200",
                  isActive 
                    ? "font-bold" 
                    : isCompleted
                    ? "font-semibold text-slate-700"
                    : "font-medium text-slate-400 hover:text-slate-600"
                )}
                style={
                  isActive
                    ? {
                        color: "var(--blue-text-color)",
                      }
                    : undefined
                }
              >
                {/* Show short label on mobile, full label on larger screens */}
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">
                  {label === "Patient Details" ? "Details" :
                   label === "Address & Contact" ? "Address" :
                   label === "Insurance Details" ? "Insurance" :
                   "Additional"}
                </span>
              </span>
            </button>

            {/* Connector Line */}
            {stepNum !== total && (
              <div 
                className={cn(
                  "mx-1 sm:mx-3 h-px flex-1 transition-all duration-300",
                  isCompleted ? "bg-blue-500" : "bg-slate-200"
                )}
                style={
                  isCompleted
                    ? {
                        background: "var(--blue-text-color)",
                        opacity: 0.5,
                      }
                    : undefined
                }
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
