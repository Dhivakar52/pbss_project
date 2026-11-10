import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label as ShadLabel } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <ShadLabel className="mb-1.5 block text-[12.5px] font-medium text-muted-foreground">
      {children}
      {required && <span className="ml-0.5 text-rose-500">*</span>}
    </ShadLabel>
  );
}

export function Field({
  label,
  required,
  children,
  span = 1,
  error,
  errorText,
  className,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  span?: number;
  error?: boolean;
  errorText?: string;
  className?: string;
}) {
  const getColSpanClass = (spanVal: number) => {
    switch (spanVal) {
      case 2: return "col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-2";
      case 3: return "col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-3";
      case 4: return "col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-4";
      default: return "col-span-1";
    }
  };

  return (
    <div className={cn("w-full min-w-0", getColSpanClass(span), className)}>
      <FieldLabel required={required}>{label}</FieldLabel>
      {children}
      {(error || errorText) && (
        <p className="mt-1 text-[11px] font-medium text-rose-500">{errorText || "This field is required"}</p>
      )}
    </div>
  );
}


// ✅ Controlled TextField - accepts value/onChange so it can be wired into filter state
export function TextField({
  id,
  type = "text",
  placeholder,
  disabled,
  value,
  defaultValue,
  onChange,
  onBlur,
  error,
  className,
  leftIcon,
  showPasswordToggle,
  autoComplete,
  maxLength,
}: {
  id?: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: boolean;
  className?: string;
  leftIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
  autoComplete?: string;
  maxLength?: number;
}) {
  const [showPass, setShowPass] = React.useState(false);
  const actualType = showPasswordToggle ? (showPass ? "text" : "password") : type;

  return (
    <div className="relative w-full">
      {leftIcon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          {leftIcon}
        </div>
      )}
      <Input
        id={id}
        type={actualType}
        placeholder={placeholder}
        disabled={disabled}
        value={value}
        defaultValue={defaultValue}
        onChange={(e) => onChange?.(e.target.value)}
        onBlur={onBlur}
        autoComplete={autoComplete}
        maxLength={maxLength}
        className={cn(
          "h-9 text-[13px] rounded-[4px]",
          leftIcon && "pl-9",
          showPasswordToggle && "pr-9",
          error && "border-rose-500 focus-visible:ring-rose-500",
          className
        )}
      />
      {showPasswordToggle && (
        <button
          type="button"
          onClick={() => setShowPass(!showPass)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
          tabIndex={-1}
        >
          {showPass ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
}

// ✅ Controlled SelectField - accepts value/onChange so it can be wired into filter state
export function SelectField({
  options,
  placeholder = "Select",
  value,
  onChange,
  onBlur,
  disabled,
  error,
  className,
}: {
  options: readonly (string | { value: string; label: string })[];
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  error?: boolean;
  className?: string;
}) {
  return (
    <NativeSelect
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.value)}
      onBlur={onBlur}
      disabled={disabled}
      className={cn(
        "h-9 text-[13px] w-full",
        error && "border-rose-500 focus-visible:ring-rose-500",
        className
      )}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => {
        const optValue = typeof opt === "string" ? opt : opt.value;
        const optLabel = typeof opt === "string" ? opt : opt.label;
        return (
          <option key={optValue} value={optValue}>
            {optLabel}
          </option>
        );
      })}
    </NativeSelect>
  );
}

// ✅ Controlled DateField - accepts value/onChange so it can be wired into filter state
export function DateField({
  placeholder = "Pick a date",
  defaultLabel,
  value,
  onChange,
  onBlur,
  disabled,
  disabledDays,
  minDate,
  maxDate,
  error,
}: {
  placeholder?: string;
  defaultLabel?: string;
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  onBlur?: (e: React.FocusEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  disabledDays?: (date: Date) => boolean;
  minDate?: Date;
  maxDate?: Date;
  error?: boolean;
}) {
  const [internalDate, setInternalDate] = React.useState<Date | undefined>();
  const date = value !== undefined ? value : internalDate;

  const handleSelect = (d: Date | undefined) => {
    if (onChange) {
      onChange(d);
    } else {
      setInternalDate(d);
    }
  };

  const isDateDisabled = (d: Date) => {
    if (disabled) return true;
    if (disabledDays && disabledDays(d)) return true;
    if (minDate) {
      const min = new Date(minDate);
      min.setHours(0, 0, 0, 0);
      if (d < min) return true;
    }
    if (maxDate) {
      const max = new Date(maxDate);
      max.setHours(23, 59, 59, 999);
      if (d > max) return true;
    }
    return false;
  };

  return (
    <Popover>
      <PopoverTrigger className="w-full" disabled={disabled}>
        <Button
          variant="outline"
          disabled={disabled}
          onBlur={onBlur}
          className={cn(
            "h-9 w-full justify-start px-3 text-left text-[13px] font-normal text-slate-700 rounded-[4px]",
            !date && !defaultLabel && "text-slate-400",
            error && "border-rose-500 focus-visible:ring-rose-500"
          )}
        >
          <CalendarIcon className="mr-2 h-3.5 w-3.5 shrink-0" />
          {date ? format(date, "dd/MM/yyyy") : defaultLabel ?? placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={date} onSelect={handleSelect} disabled={isDateDisabled} />
      </PopoverContent>
    </Popover>
  );
}

function parseDobValue(value: Date | string | null | undefined): Date | undefined {
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? undefined : new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }
  if (typeof value !== "string" || !value.trim()) return undefined;

  const trimmed = value.trim();
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:T.*)?$/.exec(trimmed);
  const dayFirst = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/.exec(trimmed);
  if (!iso && !dayFirst) return undefined;

  const isValidDate = (year: number, month: number, day: number): Date | undefined => {
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
      ? date
      : undefined;
  };
  if (iso) return isValidDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));
  if (!dayFirst) return undefined;

  const year = Number(dayFirst[3]);
  return isValidDate(year, Number(dayFirst[2]), Number(dayFirst[1]))
    ?? isValidDate(year, Number(dayFirst[1]), Number(dayFirst[2]));
}

function formatDobValue(value: Date | string | null | undefined): string {
  const date = parseDobValue(value);
  return date ? format(date, "dd/MM/yyyy") : (typeof value === "string" ? value : "");
}

// ✅ Controlled Unified Date Control (HTML5 native date picker matching Forgot Password)
export interface DobDateFieldProps {
  id?: string;
  placeholder?: string;
  value?: Date | string | null;
  onChange?: ((val: string) => void) | ((date: Date | undefined) => void) | any;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  min?: string;
  max?: string;
}

export function DobDateField({
  id,
  placeholder = "dd/mm/yyyy",
  value,
  onChange,
  onBlur,
  disabled = false,
  error = false,
  className,
  min,
  max,
}: DobDateFieldProps) {
  const [displayValue, setDisplayValue] = React.useState(() => formatDobValue(value));
  const lastValueRef = React.useRef(value);
  const dateInputRef = React.useRef<HTMLInputElement>(null);
  const selectedDate = parseDobValue(value);
  const minDate = parseDobValue(min);
  const maxDate = parseDobValue(max) ?? new Date();

  React.useEffect(() => {
    if (value !== lastValueRef.current) {
      lastValueRef.current = value;
      setDisplayValue(formatDobValue(value));
    }
  }, [value]);

  const handleNativeDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = parseDobValue(e.target.value);
    if (!date) return;
    const nextValue = format(date, "yyyy-MM-dd");
    setDisplayValue(format(date, "dd/MM/yyyy"));
    lastValueRef.current = nextValue;
    onChange?.(nextValue);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (displayValue && !parseDobValue(displayValue)) {
      setDisplayValue(formatDobValue(value));
    }
    onBlur?.(e);
  };

  return (
    <div className="relative w-full">
      <Input
        id={id}
        type="text"
        inputMode="none"
        readOnly
        autoComplete="off"
        maxLength={10}
        value={displayValue}
        onChange={(e) => {
          e.preventDefault()
        }}
        onKeyDown={(e) => {
          e.preventDefault()
        }}
        onPaste={(e) => {
          e.preventDefault()
        }}
        onDrop={(e) => {
          e.preventDefault()
        }}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder={placeholder}
        aria-invalid={error}
        aria-label="Date of birth in day-month-year format"
        className={cn(
          "h-9 w-full pr-10 text-[13px] text-slate-800 font-sans transition-all",
          error && "border-rose-500 focus-visible:border-rose-500 focus-visible:ring-rose-500",
          disabled && "bg-slate-100 text-slate-400 cursor-not-allowed",
          className
        )}
      />
      <button
        type="button"
        onClick={() => {
          const dateInput = dateInputRef.current;
          if (!dateInput) return;
          try {
            dateInput.showPicker();
          } catch {
            dateInput.click();
          }
        }}
        disabled={disabled}
        aria-label="Open date picker"
        className="absolute right-0 top-0 flex h-full w-10 items-center justify-center rounded-r-[4px] text-slate-600 hover:text-slate-900 disabled:cursor-not-allowed"
      >
        <CalendarIcon className="h-4 w-4" />
      </button>
      <input
        ref={dateInputRef}
        type="date"
        tabIndex={-1}
        aria-hidden="true"
        value={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""}
        onChange={handleNativeDateChange}
        disabled={disabled}
        min={minDate ? format(minDate, "yyyy-MM-dd") : undefined}
        max={maxDate ? format(maxDate, "yyyy-MM-dd") : undefined}
        className="pointer-events-none absolute right-0 top-0 h-9 w-10 opacity-0"
      />
    </div>
  );
}
