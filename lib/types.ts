export interface DataRow {
  id: string
  createTime: string
  phoneNumber: string
  vehicleWeb: string
  gradeWeb: string
  paymentTypeWeb: string
  callAnswered: string
  ifGuestBusySuitableCallbackTime: string
  modelSelection: string
  gradeSelection: string
  colorPreferenceFirst: string
  colorPreferenceSecond: string
  colorPreferenceThird: string
  purchaseType: string
  budgetIfCash: string
  financialEntityIfFinance: string
  purchaseTimeline: string
  confirmToCreateOrder: string
  accessories: string
  postCallLeadClassification: string
  followUpRequired: string
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

export interface ColumnFilter {
  column: string
  value: string
}

export const COLUMN_HEADERS: Record<keyof Omit<DataRow, "id">, string> = {
  createTime: "Create Time",
  phoneNumber: "Phone Number",
  vehicleWeb: "Vehicle (Web)",
  gradeWeb: "Grade (Web)",
  paymentTypeWeb: "Payment Type (Web)",
  callAnswered: "Call Answered",
  ifGuestBusySuitableCallbackTime: "Callback Time",
  modelSelection: "Model Selection",
  gradeSelection: "Grade Selection",
  colorPreferenceFirst: "Color 1st",
  colorPreferenceSecond: "Color 2nd",
  colorPreferenceThird: "Color 3rd",
  purchaseType: "Purchase Type",
  budgetIfCash: "Budget (Cash)",
  financialEntityIfFinance: "Financial Entity",
  purchaseTimeline: "Purchase Timeline",
  confirmToCreateOrder: "Confirm Order",
  accessories: "Accessories",
  postCallLeadClassification: "Lead Classification",
  followUpRequired: "Follow-Up Required",
}
