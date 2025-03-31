import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = cookies()
    const sid = cookieStore.get("checkpoint_sid")?.value
    const domain = cookieStore.get("checkpoint_domain")?.value

    if (!sid) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    if (!domain) {
      return NextResponse.json({ message: "Domain not specified" }, { status: 401 })
    }

    // Use the static server URL
    const serverUrl = "https://90.226.248.6:443"

    // Make the request to Check Point API to get gateways
    const response = await fetch(`${serverUrl}/web_api/show-gateways-and-servers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-chkp-sid": sid,
      },
      body: JSON.stringify({
        details_level: "full",
        domain: domain,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ message: data.message || "Failed to fetch gateways" }, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching gateways:", error)
    return NextResponse.json({ message: "An error occurred while fetching gateways" }, { status: 500 })
  }
}

