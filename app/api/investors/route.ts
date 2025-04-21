import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: [],
      message: "Successfully fetched all companies",
    })
  } catch (err) {
    console.error("Search API Error:", err)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
