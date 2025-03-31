import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import type { Gateway } from "@/types/gateway"

export async function POST(request: Request) {
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

    const gateway = (await request.json()) as Gateway

    // Validate the gateway object
    if (!gateway.name) {
      return NextResponse.json({ message: "Gateway name is required" }, { status: 400 })
    }

    // Use the static server URL
    const serverUrl = "https://90.226.248.6:443"

    // Prepare the payload for the Check Point API
    const payload = {
      name: gateway.name,
      ipv4_address: gateway.ipv4Address,
      ipv6_address: gateway.ipv6Address,
      comments: gateway.comments,
      domain: domain,
      // Add other fields as needed
    }

    // Make the request to Check Point API to create a new gateway
    const response = await fetch(`${serverUrl}/web_api/add-simple-gateway`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-chkp-sid": sid,
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ message: data.message || "Failed to create gateway" }, { status: response.status })
    }

    // Publish changes to make them effective
    await fetch(`${serverUrl}/web_api/publish`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-chkp-sid": sid,
      },
      body: JSON.stringify({
        domain: domain,
      }),
    })

    return NextResponse.json({
      message: "Gateway created successfully",
      uid: data.uid,
    })
  } catch (error) {
    console.error("Error creating gateway:", error)
    return NextResponse.json({ message: "An error occurred while creating the gateway" }, { status: 500 })
  }
}

