"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import type { Gateway } from "@/types/gateway"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface GatewayDetailsProps {
  gateway: Gateway
  readOnly: boolean
  onChange?: (updatedGateway: Gateway) => void
}

export default function GatewayDetails({ gateway, readOnly, onChange }: GatewayDetailsProps) {
  const [editableGateway, setEditableGateway] = useState<Gateway>(gateway)

  useEffect(() => {
    setEditableGateway(gateway)
  }, [gateway])

  const handleChange = (field: keyof Gateway, value: any) => {
    if (readOnly) return

    const updated = { ...editableGateway, [field]: value }
    setEditableGateway(updated)
    onChange?.(updated)
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="general">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={editableGateway.name}
                onChange={(e) => handleChange("name", e.target.value)}
                readOnly={readOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Input id="type" value={editableGateway.type || "Gateway"} readOnly />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comments">Comments</Label>
            <Textarea
              id="comments"
              value={editableGateway.comments || ""}
              onChange={(e) => handleChange("comments", e.target.value)}
              readOnly={readOnly}
              rows={3}
            />
          </div>

          {gateway.tags && gateway.tags.length > 0 && (
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2">
                {gateway.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="network" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ipv4Address">IPv4 Address</Label>
              <Input
                id="ipv4Address"
                value={editableGateway.ipv4Address || ""}
                onChange={(e) => handleChange("ipv4Address", e.target.value)}
                readOnly={readOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ipv6Address">IPv6 Address</Label>
              <Input
                id="ipv6Address"
                value={editableGateway.ipv6Address || ""}
                onChange={(e) => handleChange("ipv6Address", e.target.value)}
                readOnly={readOnly}
              />
            </div>
          </div>

          {editableGateway.interfaces && (
            <div className="space-y-2">
              <Label>Network Interfaces</Label>
              <div className="space-y-2">
                {editableGateway.interfaces.map((iface, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Name</Label>
                          <div>{iface.name}</div>
                        </div>
                        <div>
                          <Label className="text-xs">IP Address</Label>
                          <div>{iface.ipv4Address || iface.ipv6Address || "Not set"}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sic-name">SIC Name</Label>
              <Input
                id="sic-name"
                value={editableGateway.sicName || ""}
                onChange={(e) => handleChange("sicName", e.target.value)}
                readOnly={readOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="version">Version</Label>
              <Input id="version" value={editableGateway.version || ""} readOnly />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="properties">Additional Properties</Label>
            <Textarea
              id="properties"
              value={editableGateway.properties ? JSON.stringify(editableGateway.properties, null, 2) : ""}
              readOnly
              rows={6}
              className="font-mono text-xs"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

