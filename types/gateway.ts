export interface NetworkInterface {
  name: string
  ipv4Address?: string
  ipv6Address?: string
  mask?: string
  type?: string
}

export interface Gateway {
  uid: string
  name: string
  type?: string
  domain?: string
  comments?: string
  ipv4Address?: string
  ipv6Address?: string
  sicName?: string
  version?: string
  interfaces?: NetworkInterface[]
  tags?: string[]
  properties?: Record<string, any>
}

