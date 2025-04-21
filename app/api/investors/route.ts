import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const url = new URL(req.url)
    const params = url.searchParams

    const investorType = params.getAll("investorType")
    const revenueMin = params.get("revenueMin")
    const revenueMax = params.get("revenueMax")
    const ebitdaMin = params.get("ebitdaMin")
    const ebitdaMax = params.get("ebitdaMax")
    const industry = params.getAll("industry")
    const investorLocation = params.getAll("investorLocation")

    let query = supabase.from("investors").select(
      `*, 
        companies:investor_companies(
          companies (
            id, logo, name, description
          )
        )`
    )

    if (investorType.length > 0) query = query.in("investor_type", investorType)
    if (investorLocation.length > 0) query = query.in("hq_country", investorLocation)
    if (industry.length > 0) {
      // "pe_industry_focus" is an array column
      industry.forEach((ind) => {
        query = query.contains("pe_industry_focus", [ind])
      })
    }
    if (revenueMin) query = query.gte("min_deal_size_meur", Number(revenueMin))
    if (revenueMax) query = query.lte("max_deal_size_meur", Number(revenueMax))
    if (ebitdaMin) query = query.gte("min_ebitda_meur", Number(ebitdaMin))
    if (ebitdaMax) query = query.lte("max_ebitda_meur", Number(ebitdaMax))

    const { data, error } = await query

    if (error) {
      console.error("Supabase error:", error.message)
      return NextResponse.json({ error: "Failed to fetch companies" }, { status: 500 })
    }
    const investorsWithCompanies = data.map((investor) => ({
      ...investor,
      companies:
        investor.companies.map((link: any) => ({
          // @ts-ignore
          id: link.companies.id,
          // @ts-ignore
          logo: link.companies.logo,
          // @ts-ignore
          name: link.companies.name,
          // @ts-ignore
          description: link.companies.description,
        })) || [],
    }))

    return NextResponse.json({
      success: true,
      data: investorsWithCompanies,
      message: "Successfully fetched all companies",
    })
  } catch (err) {
    console.error("Search API Error:", err)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
