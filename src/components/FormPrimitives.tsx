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
  error,
  className,
  leftIcon,
  showPasswordToggle,
  autoComplete,
}: {
  id?: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  error?: boolean;
  className?: string;
  leftIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
  autoComplete?: string;
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
        autoComplete={autoComplete}
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
  disabled,
  error,
  className,
}: {
  options: readonly (string | { value: string; label: string })[];
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  className?: string;
}) {
  return (
    <NativeSelect
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.value)}
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
          className={cn(
            "h-9 w-full justify-start px-3 text-left text-[13px] font-normal text-slate-700 rounded-[4px]",
            !date && !defaultLabel && "text-slate-400",
            error && "border-rose-500 focus-visible:ring-rose-500"
          )}
        >
          <CalendarIcon className="mr-2 h-3.5 w-3.5 shrink-0" />
          {date ? format(date, "dd-MM-yyyy") : defaultLabel ?? placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={date} onSelect={handleSelect} disabled={isDateDisabled} />
      </PopoverContent>
    </Popover>
  );
}

// ✅ Controlled DobDateField - Month & Year dropdown caption layout for Date of Birth selection
export function DobDateField({
  placeholder = "Select Date of Birth",
  value,
  onChange,
  disabled,
  error,
}: {
  placeholder?: string;
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  disabled?: boolean;
  error?: boolean;
}) {
  const [internalDate, setInternalDate] = React.useState<Date | undefined>();
  const date = value !== undefined ? value : internalDate;
  const currentYear = new Date().getFullYear();

  const handleSelect = (d: Date | undefined) => {
    if (onChange) {
      onChange(d);
    } else {
      setInternalDate(d);
    }
  };

  return (
    <Popover>
      <PopoverTrigger disabled={disabled} className="w-full">
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-9 w-full justify-start px-3 text-left text-[13px] font-normal text-slate-700 rounded-[4px]",
            !date && "text-slate-400",
            error && "border-rose-500 focus-visible:ring-rose-500"
          )}
        >
          <CalendarIcon className="mr-2 h-3.5 w-3.5 shrink-0" />
          {date ? format(date, "dd-MM-yyyy") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          captionLayout="dropdown"
          startMonth={new Date(1920, 0)}
          endMonth={new Date(currentYear, 11)}
          disabled={(d) => d > new Date()}
        />
      </PopoverContent>
    </Popover>
  );
}