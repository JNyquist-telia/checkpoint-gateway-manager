"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, RefreshCw, Copy, Save } from "lucide-react"
import GatewayList from "@/components/gateway-list"
import GatewayDetails from "@/components/gateway-details"
import type { Gateway } from "@/types/gateway"

export default function Home() {
  const [apiKey, setApiKey] = useState("")
  const [domain, setDomain] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [gateways, setGateways] = useState<Gateway[]>([])
  const [selectedGateway, setSelectedGateway] = useState<Gateway | null>(null)
  const [copiedGateway, setCopiedGateway] = useState<Gateway | null>(null)
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/checkpoint/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey,
          domain,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to authenticate")
      }

      setIsAuthenticated(true)
      toast({
        title: "Authentication successful",
        description: `Connected to domain: ${domain}`,
      })

      // Fetch gateways after successful login
      fetchGateways()
    } catch (error) {
      toast({
        title: "Authentication failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchGateways = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/checkpoint/gateways")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch gateways")
      }

      setGateways(data.objects)
      toast({
        title: "Gateways loaded",
        description: `Successfully loaded ${data.objects.length} gateway objects`,
      })
    } catch (error) {
      toast({
        title: "Failed to load gateways",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectGateway = (gateway: Gateway) => {
    setSelectedGateway(gateway)
    setCopiedGateway(null)
  }

  const handleCopyGateway = () => {
    if (!selectedGateway) return

    // Create a copy with a new name
    const copy = {
      ...selectedGateway,
      name: `${selectedGateway.name}_copy`,
      uid: "", // UID will be assigned by the server
    }

    setCopiedGateway(copy)
    toast({
      title: "Gateway copied",
      description: "You can now edit the copy before saving",
    })
  }

  const handleSaveGateway = async () => {
    if (!copiedGateway) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/checkpoint/create-gateway", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(copiedGateway),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to create gateway")
      }

      toast({
        title: "Gateway created",
        description: `Successfully created gateway: ${copiedGateway.name}`,
      })

      // Refresh the gateway list
      fetchGateways()
    } catch (error) {
      toast({
        title: "Failed to create gateway",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateCopiedGateway = (updatedGateway: Gateway) => {
    setCopiedGateway(updatedGateway)
  }

  return (
    <main className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Check Point Gateway Manager</h1>

      {!isAuthenticated ? (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Connect to Management Server</CardTitle>
            <CardDescription>Enter your Check Point Management API key to connect</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="domain">Domain</Label>
                <Input id="domain" value={domain} onChange={(e) => setDomain(e.target.value)} required />
                <p className="text-xs text-muted-foreground">Enter the management domain name</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">Enter your Check Point Management API key</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Connect"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Gateway Objects</CardTitle>
                  <CardDescription>Select a gateway to view details</CardDescription>
                </div>
                <Button variant="outline" size="icon" onClick={fetchGateways} disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                </Button>
              </CardHeader>
              <CardContent>
                <GatewayList
                  gateways={gateways}
                  selectedGateway={selectedGateway}
                  onSelectGateway={handleSelectGateway}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Gateway Details</CardTitle>
                <CardDescription>
                  {selectedGateway ? `Viewing details for ${selectedGateway.name}` : "Select a gateway from the list"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="original">
                  <TabsList className="mb-4">
                    <TabsTrigger value="original">Original</TabsTrigger>
                    <TabsTrigger value="copy" disabled={!copiedGateway}>
                      Copy
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="original">
                    {selectedGateway ? (
                      <>
                        <GatewayDetails gateway={selectedGateway} readOnly />
                        <div className="mt-4">
                          <Button onClick={handleCopyGateway} disabled={isLoading}>
                            <Copy className="mr-2 h-4 w-4" />
                            Create Copy
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        Select a gateway from the list to view details
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="copy">
                    {copiedGateway ? (
                      <>
                        <GatewayDetails gateway={copiedGateway} readOnly={false} onChange={handleUpdateCopiedGateway} />
                        <div className="mt-4">
                          <Button onClick={handleSaveGateway} disabled={isLoading}>
                            <Save className="mr-2 h-4 w-4" />
                            {isLoading ? "Saving..." : "Save to Server"}
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        Create a copy of a gateway to edit and save
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </main>
  )
}

