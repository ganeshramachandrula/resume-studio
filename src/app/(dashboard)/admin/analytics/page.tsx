'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Globe, Activity, ShieldBan, ShieldCheck, Loader2, AlertTriangle,
  ArrowLeft, Ban, CheckCircle,
} from 'lucide-react'
import Link from 'next/link'

interface CountryUsers {
  country: string
  user_count: number
}

interface TopIp {
  ip_address: string
  request_count: number
  last_seen: string
  is_blocked: boolean
}

interface EventTypeCount {
  event_type: string
  event_count: number
}

interface GeoHit {
  country: string
  hit_count: number
  unique_users: number
}

interface SecurityEvent {
  id: string
  event_type: string
  user_id: string | null
  ip_address: string
  metadata: Record<string, unknown>
  created_at: string
}

interface BlockedIp {
  id: string
  ip_address: string
  reason: string
  created_at: string
}

const SUSPICIOUS_EVENTS = new Set([
  'rate_limit_hit', 'usage_limit_hit', 'validation_error',
  'email_not_verified', 'disposable_email_blocked', 'invalid_redirect_blocked',
])

const EVENT_COLORS: Record<string, string> = {
  rate_limit_hit: 'bg-red-100 text-red-700',
  usage_limit_hit: 'bg-amber-100 text-amber-700',
  validation_error: 'bg-orange-100 text-orange-700',
  generation_attempt: 'bg-green-100 text-green-700',
  checkout_initiated: 'bg-blue-100 text-blue-700',
  webhook_received: 'bg-purple-100 text-purple-700',
  admin_user_update: 'bg-indigo-100 text-indigo-700',
  admin_user_delete: 'bg-red-100 text-red-700',
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<{
    countryUsers: CountryUsers[]
    recentEvents: SecurityEvent[]
    blockedIps: BlockedIp[]
    topIps: TopIp[]
    eventTypeCounts: EventTypeCount[]
    geoHits: GeoHit[]
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [blockIp, setBlockIp] = useState('')
  const [blockReason, setBlockReason] = useState('')
  const [blocking, setBlocking] = useState(false)
  const [actionMessage, setActionMessage] = useState('')

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/analytics')
      if (!res.ok) { setError('Failed to load analytics'); return }
      setData(await res.json())
    } catch {
      setError('Failed to load analytics')
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleBlockIp = async (ip: string, reason: string) => {
    setBlocking(true)
    setActionMessage('')
    try {
      const res = await fetch('/api/admin/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'block', ip_address: ip, reason }),
      })
      if (res.ok) {
        setActionMessage(`Blocked ${ip}`)
        setBlockIp('')
        setBlockReason('')
        fetchData()
      }
    } catch { setActionMessage('Failed to block IP') }
    setBlocking(false)
  }

  const handleUnblockIp = async (ip: string) => {
    setBlocking(true)
    try {
      const res = await fetch('/api/admin/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unblock', ip_address: ip }),
      })
      if (res.ok) {
        setActionMessage(`Unblocked ${ip}`)
        fetchData()
      }
    } catch { setActionMessage('Failed to unblock IP') }
    setBlocking(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    )
  }

  if (error || !data) {
    return <p className="text-red-500">{error}</p>
  }

  const suspiciousEvents = data.recentEvents.filter(
    (e) => SUSPICIOUS_EVENTS.has(e.event_type)
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display text-gray-900">Analytics & Security</h1>
          <p className="text-gray-500 text-sm mt-1">IP tracking, geo stats, and threat monitoring.</p>
        </div>
        <Link href="/admin">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </Link>
      </div>

      {actionMessage && (
        <div className="bg-green-50 text-green-700 text-sm p-3 rounded-xl border border-green-200 flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          {actionMessage}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Globe className="h-8 w-8 text-brand" />
              <div>
                <p className="text-2xl font-bold">{data.countryUsers.length}</p>
                <p className="text-xs text-gray-500">Countries</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-accent" />
              <div>
                <p className="text-2xl font-bold">
                  {data.eventTypeCounts.reduce((s, e) => s + Number(e.event_count), 0)}
                </p>
                <p className="text-xs text-gray-500">Events (24h)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
              <div>
                <p className="text-2xl font-bold">{suspiciousEvents.length}</p>
                <p className="text-xs text-gray-500">Suspicious (recent)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ShieldBan className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{data.blockedIps.length}</p>
                <p className="text-xs text-gray-500">Blocked IPs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Country-wise Users */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-[family-name:var(--font-body)] flex items-center gap-2">
              <Globe className="h-4 w-4 text-brand" />
              Users by Country
            </CardTitle>
            <CardDescription>Registered user distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {data.countryUsers.length === 0 ? (
                <p className="text-sm text-gray-400">No country data yet</p>
              ) : (
                data.countryUsers.map((c) => (
                  <div key={c.country} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{c.country}</span>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 rounded-full bg-brand"
                        style={{ width: `${Math.min(200, (Number(c.user_count) / Math.max(1, Number(data.countryUsers[0]?.user_count))) * 200)}px` }}
                      />
                      <span className="text-gray-500 tabular-nums w-8 text-right">{c.user_count}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Geo Hits (7 days) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-[family-name:var(--font-body)] flex items-center gap-2">
              <Activity className="h-4 w-4 text-accent" />
              Geo Hits (7 Days)
            </CardTitle>
            <CardDescription>Country-wise request volume + unique users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {data.geoHits.length === 0 ? (
                <p className="text-sm text-gray-400">No geo data yet</p>
              ) : (
                data.geoHits.map((g) => (
                  <div key={g.country} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{g.country}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400">{g.unique_users} users</span>
                      <span className="text-gray-600 font-medium tabular-nums">{g.hit_count} hits</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top IPs (24h) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-[family-name:var(--font-body)] flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Top IPs (24 Hours)
          </CardTitle>
          <CardDescription>Highest request volume by IP address</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left p-2 font-medium text-gray-500">IP Address</th>
                  <th className="text-left p-2 font-medium text-gray-500">Requests</th>
                  <th className="text-left p-2 font-medium text-gray-500">Last Seen</th>
                  <th className="text-left p-2 font-medium text-gray-500">Status</th>
                  <th className="text-right p-2 font-medium text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.topIps.length === 0 ? (
                  <tr><td colSpan={5} className="p-4 text-center text-gray-400">No data</td></tr>
                ) : (
                  data.topIps.map((ip) => (
                    <tr key={ip.ip_address} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="p-2 font-mono text-xs">{ip.ip_address}</td>
                      <td className="p-2">
                        <span className={Number(ip.request_count) > 100 ? 'text-red-600 font-semibold' : ''}>
                          {ip.request_count}
                        </span>
                      </td>
                      <td className="p-2 text-gray-500 text-xs">
                        {new Date(ip.last_seen).toLocaleString()}
                      </td>
                      <td className="p-2">
                        {ip.is_blocked ? (
                          <Badge variant="destructive">Blocked</Badge>
                        ) : (
                          <Badge className="bg-green-50 text-green-700 border-green-200">Active</Badge>
                        )}
                      </td>
                      <td className="p-2 text-right">
                        {ip.is_blocked ? (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={blocking}
                            onClick={() => handleUnblockIp(ip.ip_address)}
                          >
                            <ShieldCheck className="h-3 w-3" /> Unblock
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={blocking}
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => handleBlockIp(ip.ip_address, 'Blocked from analytics')}
                          >
                            <Ban className="h-3 w-3" /> Block
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Manual IP Block */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-[family-name:var(--font-body)] flex items-center gap-2">
            <ShieldBan className="h-4 w-4 text-red-500" />
            Block IP Address
          </CardTitle>
          <CardDescription>Manually block a suspicious IP. Blocked IPs are denied at the API level.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="IP address (e.g. 192.168.1.1)"
              value={blockIp}
              onChange={(e) => setBlockIp(e.target.value)}
              className="max-w-xs font-mono text-sm"
            />
            <Input
              placeholder="Reason (optional)"
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              className="max-w-xs"
            />
            <Button
              variant="destructive"
              disabled={blocking || !blockIp.trim()}
              onClick={() => handleBlockIp(blockIp.trim(), blockReason.trim())}
            >
              {blocking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
              Block
            </Button>
          </div>
          {/* Currently blocked IPs */}
          {data.blockedIps.length > 0 && (
            <div className="mt-4 space-y-1">
              <p className="text-xs font-medium text-gray-500 mb-2">Currently Blocked:</p>
              {data.blockedIps.map((b) => (
                <div key={b.id} className="flex items-center justify-between bg-red-50 rounded-lg px-3 py-1.5 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-red-700">{b.ip_address}</span>
                    {b.reason && <span className="text-red-500 text-xs">{b.reason}</span>}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:bg-red-100 h-7"
                    disabled={blocking}
                    onClick={() => handleUnblockIp(b.ip_address)}
                  >
                    Unblock
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Type Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-[family-name:var(--font-body)]">
            Event Breakdown (24h)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {data.eventTypeCounts.map((e) => (
              <div
                key={e.event_type}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${EVENT_COLORS[e.event_type] || 'bg-gray-100 text-gray-700'}`}
              >
                {e.event_type.replace(/_/g, ' ')}: {e.event_count}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Suspicious Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-[family-name:var(--font-body)] flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Suspicious Activity (Recent)
          </CardTitle>
          <CardDescription>Rate limits, validation errors, and blocked attempts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {suspiciousEvents.length === 0 ? (
              <p className="text-sm text-gray-400">No suspicious activity detected</p>
            ) : (
              suspiciousEvents.slice(0, 50).map((e) => (
                <div key={e.id} className="flex items-start justify-between p-2 rounded-lg bg-amber-50/50 text-sm">
                  <div className="flex items-start gap-3">
                    <Badge className={EVENT_COLORS[e.event_type] || 'bg-gray-100 text-gray-700'}>
                      {e.event_type.replace(/_/g, ' ')}
                    </Badge>
                    <div>
                      <span className="font-mono text-xs text-gray-600">{e.ip_address}</span>
                      {e.metadata && Object.keys(e.metadata).length > 0 && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {JSON.stringify(e.metadata).slice(0, 100)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-gray-400">
                      {new Date(e.created_at).toLocaleString()}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:bg-red-100 h-6 px-2"
                      disabled={blocking}
                      onClick={() => handleBlockIp(e.ip_address, `Suspicious: ${e.event_type}`)}
                    >
                      <Ban className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
