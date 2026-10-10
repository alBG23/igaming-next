"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Users, TrendingUp, DollarSign, Activity, Search, Filter, Plus, BarChart2, CheckCircle2, X } from 'lucide-react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { supabase } from "@/lib/supabase"

interface Campaign {
  id: number
  name: string
  channel: string
  status: string
  budget: number
  spent: number
  impressions: number
  clicks: number
  conversions: number
  ctr: number
  cpc: number
  cpa: number
  created_at: string
}

const DEFAULT_CAMPAIGNS: Campaign[] = [
  {
    id: 1,
    name: 'Spring VIP Acquisition',
    channel: 'Search',
    status: 'Active',
    budget: 25000,
    spent: 18450,
    impressions: 420000,
    clicks: 14700,
    conversions: 1120,
    ctr: 3.5,
    cpc: 1.25,
    cpa: 16.47,
    created_at: '2024-03-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Slots Welcome Bonus',
    channel: 'Social',
    status: 'Active',
    budget: 35000,
    spent: 29800,
    impressions: 890000,
    clicks: 28400,
    conversions: 1850,
    ctr: 3.19,
    cpc: 1.05,
    cpa: 16.11,
    created_at: '2024-02-15T00:00:00Z',
  },
  {
    id: 3,
    name: 'Live Casino Retargeting',
    channel: 'Display',
    status: 'Active',
    budget: 15000,
    spent: 9200,
    impressions: 310000,
    clicks: 6500,
    conversions: 410,
    ctr: 2.1,
    cpc: 1.42,
    cpa: 22.44,
    created_at: '2024-03-10T00:00:00Z',
  },
  {
    id: 4,
    name: 'Affiliate Tier-1 Boost',
    channel: 'Affiliate',
    status: 'Paused',
    budget: 20000,
    spent: 19500,
    impressions: 215000,
    clicks: 9800,
    conversions: 890,
    ctr: 4.56,
    cpc: 1.99,
    cpa: 21.91,
    created_at: '2024-01-20T00:00:00Z',
  },
];

export default function CampaignsPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [channelFilter, setChannelFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [campaigns, setCampaigns] = useState<Campaign[]>(DEFAULT_CAMPAIGNS)
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)

  // New Campaign Modal State
  const [isNewOpen, setIsNewOpen] = useState(false)
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    channel: 'Search',
    status: 'Active',
    budget: '10000',
  })
  const [newError, setNewError] = useState('')

  useEffect(() => {
    fetchCampaigns()
    
    const subscription = supabase
      .channel('campaigns')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'campaigns' }, () => {
        fetchCampaigns()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (notification) {
      const t = setTimeout(() => setNotification(null), 4000)
      return () => clearTimeout(t)
    }
  }, [notification])

  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        // Use default fallback campaigns gracefully
        console.warn('Using default campaigns:', error.message)
      } else if (data && data.length > 0) {
        setCampaigns(data)
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCampaign.name.trim()) {
      setNewError('Campaign name is required.')
      return
    }

    const budgetNum = parseFloat(newCampaign.budget) || 5000
    const created: Campaign = {
      id: Date.now(),
      name: newCampaign.name.trim(),
      channel: newCampaign.channel,
      status: newCampaign.status,
      budget: budgetNum,
      spent: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      ctr: 0,
      cpc: 0,
      cpa: 0,
      created_at: new Date().toISOString(),
    }

    setCampaigns(prev => [created, ...prev])
    setIsNewOpen(false)
    setNewCampaign({ name: '', channel: 'Search', status: 'Active', budget: '10000' })
    setNewError('')
    setNotification(`Campaign "${created.name}" created successfully!`)
  }

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.channel.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesChannel = channelFilter === 'All' || c.channel === channelFilter
      const matchesStatus = statusFilter === 'All' || c.status === statusFilter
      return matchesSearch && matchesChannel && matchesStatus
    })
  }, [campaigns, searchQuery, channelFilter, statusFilter])

  const campaignData = campaigns.map(campaign => ({
    name: new Date(campaign.created_at).toLocaleString('default', { month: 'short' }),
    impressions: campaign.impressions,
    clicks: campaign.clicks,
    conversions: campaign.conversions
  }))

  const activeCampaigns = campaigns.filter(c => c.status === 'Active')
  const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0)
  const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0)
  const avgCTR = campaigns.length > 0 
    ? campaigns.reduce((sum, c) => sum + c.ctr, 0) / campaigns.length 
    : 0

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
      {notification && (
        <div className="flex items-center justify-between p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span className="text-sm font-medium">{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="p-1 hover:bg-black/5 rounded">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Campaigns</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Track multi-channel promotional campaigns, conversion funnels, and marketing spend.
            </p>
          </div>
          <Button onClick={() => setIsNewOpen(true)} className="gap-2 shadow-sm">
            <Plus className="h-4 w-4" />
            New Campaign
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeCampaigns.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {activeCampaigns.length > 0 ? 'Active campaigns' : 'No active campaigns'}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalBudget.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Total allocated budget
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalSpent.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Spent across all channels
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average CTR</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{avgCTR.toFixed(2)}%</div>
                  <p className="text-xs text-muted-foreground">
                    Click-through rate average
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Campaign Performance</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={campaignData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="impressions" stroke="#8884d8" />
                      <Line type="monotone" dataKey="clicks" stroke="#82ca9d" />
                      <Line type="monotone" dataKey="conversions" stroke="#ffc658" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Active Campaigns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeCampaigns.map((campaign) => (
                      <div key={campaign.id} className="flex items-center justify-between p-2.5 rounded border bg-muted/20">
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium leading-none">{campaign.name}</p>
                          <p className="text-xs text-muted-foreground">{campaign.channel}</p>
                        </div>
                        <div className="text-right text-xs font-semibold">
                          ${campaign.spent.toLocaleString()} / ${campaign.budget.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search campaigns..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Filter Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filter
                    {(channelFilter !== 'All' || statusFilter !== 'All') && (
                      <span className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-64 p-3 space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Channel</Label>
                    <Select value={channelFilter} onValueChange={setChannelFilter}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="All Channels" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Channels</SelectItem>
                        <SelectItem value="Search">Search</SelectItem>
                        <SelectItem value="Social">Social</SelectItem>
                        <SelectItem value="Display">Display</SelectItem>
                        <SelectItem value="Affiliate">Affiliate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Statuses</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Paused">Paused</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {(channelFilter !== 'All' || statusFilter !== 'All') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs h-7"
                      onClick={() => {
                        setChannelFilter('All')
                        setStatusFilter('All')
                      }}
                    >
                      Reset Filters
                    </Button>
                  )}
                </PopoverContent>
              </Popover>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Channel</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Spent</TableHead>
                      <TableHead>Impressions</TableHead>
                      <TableHead>Clicks</TableHead>
                      <TableHead>Conversions</TableHead>
                      <TableHead>CTR</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCampaigns.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                          No campaigns found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCampaigns.map((campaign) => (
                        <TableRow key={campaign.id}>
                          <TableCell className="font-medium">{campaign.name}</TableCell>
                          <TableCell>{campaign.channel}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              campaign.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {campaign.status}
                            </span>
                          </TableCell>
                          <TableCell>${campaign.budget.toLocaleString()}</TableCell>
                          <TableCell>${campaign.spent.toLocaleString()}</TableCell>
                          <TableCell>{campaign.impressions.toLocaleString()}</TableCell>
                          <TableCell>{campaign.clicks.toLocaleString()}</TableCell>
                          <TableCell>{campaign.conversions.toLocaleString()}</TableCell>
                          <TableCell>{campaign.ctr}%</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle>Campaign ROI & Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded border bg-card">
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Cost Per Click (Avg CPC)</p>
                    <p className="text-2xl font-bold mt-1">$1.43</p>
                    <p className="text-xs text-emerald-600 mt-1">↓ 8.2% vs previous period</p>
                  </div>
                  <div className="p-4 rounded border bg-card">
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Cost Per Acquisition (CPA)</p>
                    <p className="text-2xl font-bold mt-1">$18.35</p>
                    <p className="text-xs text-emerald-600 mt-1">↓ 4.1% vs target CPA</p>
                  </div>
                  <div className="p-4 rounded border bg-card">
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Return on Ad Spend (ROAS)</p>
                    <p className="text-2xl font-bold mt-1">3.4x</p>
                    <p className="text-xs text-emerald-600 mt-1">↑ 12% profit margin</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* New Campaign Modal */}
      <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
            <DialogDescription>
              Launch a marketing campaign across acquisition and conversion channels.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCampaign} className="space-y-4 py-2">
            {newError && (
              <div className="p-2.5 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded">
                {newError}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="camp-name">Campaign Name *</Label>
              <Input
                id="camp-name"
                placeholder="e.g. Summer High Roller Push"
                value={newCampaign.name}
                onChange={(e) => setNewCampaign(p => ({ ...p, name: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="camp-channel">Channel</Label>
                <Select
                  value={newCampaign.channel}
                  onValueChange={(val) => setNewCampaign(p => ({ ...p, channel: val }))}
                >
                  <SelectTrigger id="camp-channel">
                    <SelectValue placeholder="Channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Search">Search</SelectItem>
                    <SelectItem value="Social">Social</SelectItem>
                    <SelectItem value="Display">Display</SelectItem>
                    <SelectItem value="Affiliate">Affiliate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="camp-status">Initial Status</Label>
                <Select
                  value={newCampaign.status}
                  onValueChange={(val) => setNewCampaign(p => ({ ...p, status: val }))}
                >
                  <SelectTrigger id="camp-status">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="camp-budget">Allocated Budget ($)</Label>
              <Input
                id="camp-budget"
                type="number"
                min="100"
                step="100"
                value={newCampaign.budget}
                onChange={(e) => setNewCampaign(p => ({ ...p, budget: e.target.value }))}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsNewOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Launch Campaign
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}