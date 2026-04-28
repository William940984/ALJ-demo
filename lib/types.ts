// Dynamic data row - supports any JSON structure
export interface DataRow {
  id: string
  createTime: string
  rawData: Record<string, unknown>
}

export interface ApiConfig {
  robotKey: string
  robotToken: string
}

export const DEFAULT_CONFIG: ApiConfig = {
  robotKey: "ld5DUU9nIHm3mQXKcXMqoEgdi2Q%3D",
  robotToken: "MTc3NzI4MDA4ODk1MQp4a2l6UVlYY1BzMENrTEF3alhINFgraGN0YU09",
}

export const DEFAULT_USERNAME = "william.pang@dyna.ai"

// Helper to format camelCase/snake_case keys to readable labels
export function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^\s+/, "")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

// Helper to get phone number from any JSON structure
export function extractPhoneNumber(data: Record<string, unknown>): string | null {
  const phoneKeys = ["phoneNumber", "phone_number", "phone", "mobile", "tel", "telephone"]
  for (const key of phoneKeys) {
    if (data[key] && typeof data[key] === "string") {
      return data[key] as string
    }
  }
  // Check nested objects
  for (const value of Object.values(data)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const nested = extractPhoneNumber(value as Record<string, unknown>)
      if (nested) return nested
    }
  }
  return null
}
