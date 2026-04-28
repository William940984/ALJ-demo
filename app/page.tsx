"use client"

import { useState, useEffect, useCallback } from "react"
import { RefreshCw, Database, TrendingUp, Users, PhoneCall, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SettingsDialog } from "@/components/settings-dialog"
import { DataTable } from "@/components/data-table"
import { Empty } from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { DEFAULT_CONFIG, DEFAULT_USERNAME } from "@/lib/types"
import type { ApiConfig, DataRow } from "@/lib/types"

const STORAGE_KEY = "dyna-api-config"

export default function DashboardPage() {
  const [config, setConfig] = useState<ApiConfig>(DEFAULT_CONFIG)
  const [data, setData] = useState<DataRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)

  // Load config from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setConfig(parsed)
      } catch {
        console.error("Failed to parse stored config")
      }
    }
  }, [])

  // Save config to localStorage
  const handleSaveConfig = (newConfig: ApiConfig) => {
    setConfig(newConfig)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig))
  }

  const fetchData = useCallback(async () => {
    if (!config.robotKey || !config.robotToken) {
      setError(
        "Please configure API credentials first by clicking the settings button."
      )
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/fetch-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          robotKey: config.robotKey,
          robotToken: config.robotToken,
          username: DEFAULT_USERNAME,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch data")
      }

      setData(result.data || [])
      setLastFetch(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [config])

  const isConfigured = config.robotKey && config.robotToken

  // Calculate stats
  const stats = {
    totalRecords: data.length,
    answeredCalls: data.filter((d) => d.callAnswered === "Y").length,
    hotLeads: data.filter((d) => d.postCallLeadClassification === "Hot").length,
    followUpRequired: data.filter((d) => d.followUpRequired === "Yes").length,
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Database className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Conversation Analytics</h1>
              <p className="text-xs text-muted-foreground">Real-time lead tracking dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {lastFetch && (
              <div className="flex items-center gap-2 rounded-md bg-secondary/50 px-3 py-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {lastFetch.toLocaleTimeString()}
                </span>
              </div>
            )}
            <Button
              onClick={fetchData}
              disabled={loading || !isConfigured}
              className="bg-primary hover:bg-primary/90"
            >
              {loading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Fetch Data
                </>
              )}
            </Button>
            <SettingsDialog config={config} onSave={handleSaveConfig} />
          </div>
        </div>
      </header>

      <main className="p-6">
        {error && (
          <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {!isConfigured ? (
          <Card className="border-border/50 bg-card">
            <CardContent className="py-12">
              <Empty
                icon={Database}
                title="Configuration Required"
                description="Please configure your API credentials to start fetching data. Click the settings button in the top right corner."
              />
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border-border/50 bg-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Total Records</p>
                      <p className="mt-1 text-2xl font-bold text-foreground">{stats.totalRecords}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/50 bg-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Answered Calls</p>
                      <p className="mt-1 text-2xl font-bold text-foreground">{stats.answeredCalls}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[oklch(0.7_0.18_150/0.1)]">
                      <PhoneCall className="h-5 w-5 text-[oklch(0.7_0.18_150)]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/50 bg-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Hot Leads</p>
                      <p className="mt-1 text-2xl font-bold text-foreground">{stats.hotLeads}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[oklch(0.75_0.2_50/0.1)]">
                      <TrendingUp className="h-5 w-5 text-[oklch(0.75_0.2_50)]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/50 bg-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Follow-up Required</p>
                      <p className="mt-1 text-2xl font-bold text-foreground">{stats.followUpRequired}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[oklch(0.7_0.15_230/0.1)]">
                      <Clock className="h-5 w-5 text-[oklch(0.7_0.15_230)]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Data Table */}
            <Card className="border-border/50 bg-card">
              <CardHeader className="border-b border-border/50 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">Conversation Records</CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Detailed view of all conversation data with filtering options
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <Spinner className="h-8 w-8 text-primary" />
                    <span className="ml-3 text-sm text-muted-foreground">
                      Fetching data from API...
                    </span>
                  </div>
                ) : data.length === 0 ? (
                  <div className="py-16">
                    <Empty
                      icon={Database}
                      title="No Data Yet"
                      description="Click the 'Fetch Data' button to load conversation data from the API."
                    />
                  </div>
                ) : (
                  <DataTable data={data} />
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  )
}
