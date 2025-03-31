import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { apiKey, domain } = await request.json()

    // Validate inputs
    if (!apiKey) {
      return NextResponse.json({ message: "API key is required" }, { status: 400 })
    }

    if (!domain) {
      return NextResponse.json({ message: "Domain is required" }, { status: 400 })
    }

    // Use the static API URL
    const apiUrl = "https://90.226.248.6:443/web_api/login"

    // Make the login request to Check Point API using API key and domain
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "api-key": apiKey,
        domain: domain,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ message: data.message || "Authentication failed" }, { status: response.status })
    }

    // Store the session ID and domain in secure cookies
    const { sid } = data

    return NextResponse.json(
      {
        message: "Authentication successful",
        sid,
        domain,
      },
      {
        status: 200,
        headers: {
          "Set-Cookie": [
            `checkpoint_sid=${sid}; Path=/; HttpOnly; SameSite=Strict`,
            `checkpoint_domain=${domain}; Path=/; HttpOnly; SameSite=Strict`,
          ].join(", "),
        },
      },
    )
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "An error occurred during authentication" }, { status: 500 })
  }
}

