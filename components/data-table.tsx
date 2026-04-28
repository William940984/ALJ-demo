"use client"

import { useState, useMemo } from "react"
import { ChevronDown, X, Filter } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import type { DataRow } from "@/lib/types"
import { COLUMN_HEADERS } from "@/lib/types"

interface DataTableProps {
  data: DataRow[]
}

type FilterKey = keyof Omit<DataRow, "id">

// Status badge styling based on value
function getStatusStyle(column: string, value: string) {
  // Call Answered
  if (column === "callAnswered") {
    if (value === "Y") return "bg-[oklch(0.7_0.18_150/0.15)] text-[oklch(0.7_0.18_150)] border-[oklch(0.7_0.18_150/0.3)]"
    if (value === "N") return "bg-[oklch(0.55_0.22_25/0.15)] text-[oklch(0.65_0.22_25)] border-[oklch(0.55_0.22_25/0.3)]"
  }
  // Lead Classification
  if (column === "postCallLeadClassification") {
    if (value === "Hot") return "bg-[oklch(0.75_0.2_50/0.15)] text-[oklch(0.75_0.2_50)] border-[oklch(0.75_0.2_50/0.3)]"
    if (value === "Warm") return "bg-[oklch(0.7_0.15_230/0.15)] text-[oklch(0.7_0.15_230)] border-[oklch(0.7_0.15_230/0.3)]"
    if (value === "Cold") return "bg-muted text-muted-foreground border-border"
  }
  // Follow Up Required
  if (column === "followUpRequired") {
    if (value === "Yes") return "bg-[oklch(0.7_0.15_230/0.15)] text-[oklch(0.7_0.15_230)] border-[oklch(0.7_0.15_230/0.3)]"
    if (value === "No") return "bg-muted text-muted-foreground border-border"
  }
  // Confirm to Create Order
  if (column === "confirmToCreateOrder") {
    if (value === "Yes") return "bg-[oklch(0.7_0.18_150/0.15)] text-[oklch(0.7_0.18_150)] border-[oklch(0.7_0.18_150/0.3)]"
    if (value === "No") return "bg-muted text-muted-foreground border-border"
  }
  return ""
}

// Columns that should show as badges
const badgeColumns = ["callAnswered", "postCallLeadClassification", "followUpRequired", "confirmToCreateOrder"]

export function DataTable({ data }: DataTableProps) {
  const [filters, setFilters] = useState<Record<string, string>>({})

  const columns: FilterKey[] = [
    "createTime",
    "phoneNumber",
    "vehicleWeb",
    "gradeWeb",
    "paymentTypeWeb",
    "callAnswered",
    "ifGuestBusySuitableCallbackTime",
    "modelSelection",
    "gradeSelection",
    "colorPreferenceFirst",
    "colorPreferenceSecond",
    "colorPreferenceThird",
    "purchaseType",
    "budgetIfCash",
    "financialEntityIfFinance",
    "purchaseTimeline",
    "confirmToCreateOrder",
    "accessories",
    "postCallLeadClassification",
    "followUpRequired",
  ]

  // Get unique values for each column for filtering
  const uniqueValues = useMemo(() => {
    const values: Record<string, string[]> = {}
    columns.forEach((col) => {
      const unique = [...new Set(data.map((row) => row[col]))].filter(
        (v) => v && v !== "-"
      )
      values[col] = unique.sort()
    })
    return values
  }, [data])

  // Apply filters to data
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true
        return row[key as FilterKey] === value
      })
    })
  }, [data, filters])

  const setFilter = (column: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [column]: value,
    }))
  }

  const clearFilter = (column: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev }
      delete newFilters[column]
      return newFilters
    })
  }

  const clearAllFilters = () => {
    setFilters({})
  }

  const activeFilters = Object.entries(filters).filter(
    ([, value]) => value !== ""
  )

  return (
    <div className="flex flex-col">
      {/* Filter Bar */}
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{filteredData.length}</span> of{" "}
            <span className="font-medium text-foreground">{data.length}</span> records
          </span>
        </div>
        {activeFilters.length > 0 && (
          <div className="flex items-center gap-2">
            {activeFilters.map(([key, value]) => (
              <Badge
                key={key}
                variant="secondary"
                className="flex items-center gap-1.5 bg-primary/10 text-primary hover:bg-primary/20"
              >
                {COLUMN_HEADERS[key as FilterKey]}: {value}
                <button
                  onClick={() => clearFilter(key)}
                  className="ml-0.5 rounded-full hover:bg-primary/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <ScrollArea className="w-full">
        <div className="min-w-max">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                {columns.map((col) => (
                  <TableHead
                    key={col}
                    className="whitespace-nowrap bg-secondary/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-8 -ml-2 text-xs font-semibold uppercase tracking-wider hover:bg-secondary ${
                            filters[col] ? "text-primary" : "text-muted-foreground"
                          }`}
                        >
                          {COLUMN_HEADERS[col]}
                          <ChevronDown className="ml-1 h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="max-h-60 overflow-y-auto bg-popover">
                        <DropdownMenuItem onClick={() => clearFilter(col)} className="text-muted-foreground">
                          Show all
                        </DropdownMenuItem>
                        {uniqueValues[col]?.map((value) => (
                          <DropdownMenuItem
                            key={value}
                            onClick={() => setFilter(col, value)}
                            className={filters[col] === value ? "bg-primary/10 text-primary" : ""}
                          >
                            {value}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No matching records found
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((row, index) => (
                  <TableRow
                    key={row.id}
                    className={`border-border/30 transition-colors hover:bg-secondary/20 ${
                      index % 2 === 0 ? "bg-transparent" : "bg-secondary/10"
                    }`}
                  >
                    {columns.map((col) => (
                      <TableCell key={col} className="whitespace-nowrap py-3 text-sm">
                        {row[col] === "-" ? (
                          <span className="text-muted-foreground/50">-</span>
                        ) : badgeColumns.includes(col) ? (
                          <Badge
                            variant="outline"
                            className={`font-medium ${getStatusStyle(col, row[col])}`}
                          >
                            {row[col]}
                          </Badge>
                        ) : col === "createTime" ? (
                          <span className="font-mono text-xs text-muted-foreground">{row[col]}</span>
                        ) : col === "phoneNumber" ? (
                          <span className="font-mono">{row[col]}</span>
                        ) : (
                          <span className="text-foreground">{row[col]}</span>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}
