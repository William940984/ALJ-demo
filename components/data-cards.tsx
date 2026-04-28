"use client"

import { useState, useMemo } from "react"
import { Search, Calendar, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import type { DataRow } from "@/lib/types"
import { formatKey, extractPhoneNumber } from "@/lib/types"

interface DataCardsProps {
  data: DataRow[]
}

// Render a value based on its type
function renderValue(value: unknown, depth = 0): React.ReactNode {
  if (value === null || value === undefined || value === "" || value === "invalid") {
    return <span className="text-muted-foreground/50">-</span>
  }

  if (typeof value === "boolean") {
    return (
      <Badge variant="outline" className={value ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-rose-500/10 text-rose-400 border-rose-500/30"}>
        {value ? "Yes" : "No"}
      </Badge>
    )
  }

  if (typeof value === "string") {
    // Check for specific status values
    const lowerVal = value.toLowerCase()
    if (lowerVal === "y" || lowerVal === "yes" || lowerVal === "true") {
      return (
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
          {value}
        </Badge>
      )
    }
    if (lowerVal === "n" || lowerVal === "no" || lowerVal === "false") {
      return (
        <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/30">
          {value}
        </Badge>
      )
    }
    if (lowerVal === "hot") {
      return (
        <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/30">
          {value}
        </Badge>
      )
    }
    if (lowerVal === "warm") {
      return (
        <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30">
          {value}
        </Badge>
      )
    }
    if (lowerVal === "cold") {
      return (
        <Badge variant="outline" className="bg-slate-500/10 text-slate-400 border-slate-500/30">
          {value}
        </Badge>
      )
    }
    return <span className="text-sm text-foreground break-words">{value}</span>
  }

  if (typeof value === "number") {
    return <span className="text-sm font-mono text-foreground">{value}</span>
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-muted-foreground/50">-</span>
    return (
      <div className="flex flex-wrap gap-1">
        {value.map((item, i) => (
          <span key={i} className="text-sm text-foreground">
            {typeof item === "object" ? JSON.stringify(item) : String(item)}
            {i < value.length - 1 && ","}
          </span>
        ))}
      </div>
    )
  }

  if (typeof value === "object" && value !== null) {
    // Render nested object
    const entries = Object.entries(value as Record<string, unknown>)
    if (entries.length === 0) return <span className="text-muted-foreground/50">-</span>
    
    if (depth > 0) {
      // For nested objects, render inline
      return (
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {entries.map(([k, v]) => (
            <div key={k} className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase text-muted-foreground">{formatKey(k)}:</span>
              {renderValue(v, depth + 1)}
            </div>
          ))}
        </div>
      )
    }
    
    // For top-level nested objects, render as a sub-section
    return (
      <div className="mt-1 rounded-md bg-secondary/30 p-2">
        <div className="grid gap-2">
          {entries.map(([k, v]) => (
            <div key={k} className="flex flex-col gap-0.5">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{formatKey(k)}</span>
              {renderValue(v, depth + 1)}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return <span className="text-sm text-foreground">{String(value)}</span>
}

export function DataCards({ data }: DataCardsProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data
    const query = searchQuery.toLowerCase()
    return data.filter((row) => {
      const phone = extractPhoneNumber(row.rawData)
      return phone && phone.toLowerCase().includes(query)
    })
  }, [data, searchQuery])

  return (
    <div className="flex flex-col gap-4">
      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by phone number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 hover:bg-secondary"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground">{filteredData.length}</span> of{" "}
        <span className="font-medium text-foreground">{data.length}</span> records
      </div>

      {/* Cards Grid */}
      {filteredData.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          No matching records found
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredData.map((row) => {
            const phoneNumber = extractPhoneNumber(row.rawData)
            const entries = Object.entries(row.rawData)

            return (
              <Card key={row.id} className="border-border/50 bg-card transition-shadow hover:shadow-md">
                <CardContent className="p-4">
                  {/* Header - Time */}
                  <div className="mb-3 flex items-center justify-between border-b border-border/50 pb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{row.createTime}</span>
                    </div>
                    {phoneNumber && (
                      <Badge variant="outline" className="font-mono text-xs">
                        {phoneNumber}
                      </Badge>
                    )}
                  </div>

                  {/* Dynamic Fields */}
                  <div className="grid gap-3">
                    {entries.map(([key, value]) => (
                      <div key={key} className="flex flex-col gap-0.5">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          {formatKey(key)}
                        </span>
                        {renderValue(value)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
