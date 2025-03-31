"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Gateway } from "@/types/gateway"
import { Search, Loader2 } from "lucide-react"

interface GatewayListProps {
  gateways: Gateway[]
  selectedGateway: Gateway | null
  onSelectGateway: (gateway: Gateway) => void
  isLoading: boolean
}

export default function GatewayList({ gateways, selectedGateway, onSelectGateway, isLoading }: GatewayListProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredGateways = gateways.filter((gateway) => gateway.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search gateways..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredGateways.length > 0 ? (
        <ScrollArea className="h-[500px]">
          <div className="space-y-1">
            {filteredGateways.map((gateway) => (
              <button
                key={gateway.uid}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  selectedGateway?.uid === gateway.uid ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
                onClick={() => onSelectGateway(gateway)}
              >
                <div className="font-medium">{gateway.name}</div>
                <div className="text-xs opacity-70 truncate">
                  {gateway.ipv4Address || gateway.ipv6Address || "No IP address"}
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          {gateways.length === 0 ? "No gateways found" : "No matching gateways"}
        </div>
      )}
    </div>
  )
}

