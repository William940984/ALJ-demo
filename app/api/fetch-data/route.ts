import { NextRequest, NextResponse } from "next/server"

interface SegmentItem {
  segment_code: string
  message_source: string
  create_time: string
}

interface DetailItem {
  answer: string
  create_time: string
  message_source: string
}

export interface DataRow {
  id: string
  createTime: string
  rawData: Record<string, unknown>
}

function parseAnswer(answer: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(answer)
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>
    }
    return null
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const { robotKey, robotToken, username, page = 1, pagesize = 100 } = await request.json()

    if (!robotKey || !robotToken) {
      return NextResponse.json(
        { error: "Missing required parameters: robotKey or robotToken" },
        { status: 400 }
      )
    }
    
    const effectiveUsername = username || "william.pang@dyna.ai"

    const headers = {
      "Content-Type": "application/json",
      "cybertron-robot-key": robotKey,
      "cybertron-robot-token": robotToken,
    }

    // API 1: Get segment list
    const segmentListResponse = await fetch(
      "https://agents.dyna.ai/openapi/v1/conversation/segment/get_list/",
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          username: effectiveUsername,
          filter_mode: 0,
          filter_user_code: "",
          create_start_time: "",
          create_end_time: "",
          page,
          pagesize,
        }),
      }
    )

    if (!segmentListResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch segment list" },
        { status: segmentListResponse.status }
      )
    }

    const segmentData = await segmentListResponse.json()

    if (segmentData.code !== "000000") {
      return NextResponse.json(
        { error: segmentData.message || "API 1 returned an error" },
        { status: 400 }
      )
    }

    const segments: SegmentItem[] = segmentData.data?.list || []

    // Filter only openapi-ws segments
    const openapiWsSegments = segments.filter(
      (seg) => seg.message_source === "openapi-ws"
    )

    // API 2: Get details for each segment
    const detailPromises = openapiWsSegments.map(async (segment) => {
      const detailResponse = await fetch(
        "https://agents.dyna.ai/openapi/v1/conversation/segment/detail_list/",
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            username: effectiveUsername,
            segment_code: segment.segment_code,
            page: 1,
            pagesize: 100,
          }),
        }
      )

      if (!detailResponse.ok) {
        return []
      }

      const detailData = await detailResponse.json()

      if (detailData.code !== "000000") {
        return []
      }

      const details: DetailItem[] = detailData.data?.list || []

      // Filter only openapi-ws messages with valid JSON answers
      return details
        .filter((detail) => detail.message_source === "openapi-ws")
        .map((detail, index) => {
          const parsed = parseAnswer(detail.answer)
          
          // Skip rows where answer is not valid JSON
          if (!parsed) {
            return null
          }

          const row: DataRow = {
            id: `${segment.segment_code}-${index}`,
            createTime: detail.create_time,
            rawData: parsed,
          }

          return row
        })
        .filter((row): row is DataRow => row !== null)
    })

    const allDetails = await Promise.all(detailPromises)
    const flattenedData = allDetails.flat()

    // Sort by create_time descending (newest first)
    flattenedData.sort((a, b) => {
      return new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
    })

    return NextResponse.json({
      success: true,
      data: flattenedData,
      total: flattenedData.length,
    })
  } catch (error) {
    console.error("Error fetching data:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
