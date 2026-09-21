import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Filter } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface FilterOption {
  id: string
  label: string
  icon?: React.ReactNode
}

interface DataTableFiltersProps {
  options: FilterOption[]
  selected: string[]
  onChange: (selected: string[]) => void
  className?: string
}

export function FilterTable({
  options,
  selected,
  onChange,
  className,
}: DataTableFiltersProps) {
  const toggleFilter = (filterId: string) => {
    if (selected.includes(filterId)) {
      onChange(selected.filter(id => id !== filterId))
    } else {
      onChange([...selected, filterId])
    }
  }

  const clearAll = () => {
    onChange([])
  }

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      <Popover>
        <PopoverTrigger >
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {selected.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {selected.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-3" align="start">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Filters</h4>
              {selected.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs text-muted-foreground"
                  onClick={clearAll}
                >
                  Clear all
                </Button>
              )}
            </div>
            <div className="space-y-1">
              {options.map((option) => (
                <button
                  key={option.id}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                    selected.includes(option.id) && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => toggleFilter(option.id)}
                >
                  {option.icon}
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {selected.map((id) => {
        const option = options.find(o => o.id === id)
        if (!option) return null
        return (
          <Badge key={id} variant="secondary" className="gap-1">
            {option.icon}
            {option.label}
            <button
              className="ml-1 hover:text-foreground"
              onClick={() => toggleFilter(id)}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )
      })}
    </div>
  )
}