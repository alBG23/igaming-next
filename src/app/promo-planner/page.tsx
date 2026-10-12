'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Sparkles,
  Calendar,
  Users,
  Target,
  DollarSign,
  TrendingUp,
  Download,
  Plus,
  CheckCircle2,
  Clock,
  Send,
  Zap,
  Copy,
  Check,
  Layers,
} from 'lucide-react';

export default function PromoPlannerPage() {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [generating, setGenerating] = useState(false);
  const [campaignTitle, setCampaignTitle] = useState('Weekend High-Roller Reload');
  const [targetUplift, setTargetUplift] = useState('50000');
  const [targetRoi, setTargetRoi] = useState('4.0');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const [campaigns, setCampaigns] = useState([
    {
      id: 'promo-101',
      title: 'Weekend High-Roller Reload',
      mechanic: '100% Match up to €500 + 50 Free Spins',
      audience: 'VIP Whales (LTV > €5,000)',
      targetNgr: '€50,000',
      budget: '€12,500',
      status: 'ACTIVE',
      launchDate: '2026-10-17',
    },
    {
      id: 'promo-102',
      title: 'Churn Prevention Retention Boost',
      mechanic: '25% Loss Cashback + 20 No-Wager Spins',
      audience: 'At-Risk Players (14d Inactive)',
      targetNgr: '€32,000',
      budget: '€8,000',
      status: 'SCHEDULED',
      launchDate: '2026-10-20',
    },
    {
      id: 'promo-103',
      title: 'Crypto Friday Double Deposit',
      mechanic: '50% Crypto Match up to 0.05 BTC',
      audience: 'Crypto Tier 1 Depositors',
      targetNgr: '€45,000',
      budget: '€10,000',
      status: 'DRAFT',
      launchDate: '2026-10-24',
    },
  ]);

  const audienceCohorts = [
    { name: 'VIP Whales', size: 340, avgDeposit: '€4,250', churnRisk: 'Low', expectedLift: '+28%' },
    { name: 'At-Risk Re-engagement', size: 1250, avgDeposit: '€680', churnRisk: 'High', expectedLift: '+18%' },
    { name: 'Weekend Slots Spinners', size: 4800, avgDeposit: '€210', churnRisk: 'Medium', expectedLift: '+35%' },
    { name: 'Crypto High Rollers', size: 520, avgDeposit: '€3,100', churnRisk: 'Low', expectedLift: '+42%' },
  ];

  const handleCreateCampaign = () => {
    setGenerating(true);
    setActionNotice(null);
    setTimeout(() => {
      const budgetCalc = Math.round(Number(targetUplift || 50000) / Number(targetRoi || 4.0));
      const newPromo = {
        id: `promo-${Date.now().toString().slice(-3)}`,
        title: campaignTitle || 'New Optimized Campaign',
        mechanic: '75% Reload Boost + 40 VIP Spins',
        audience: 'Targeted High-Value Cohort',
        targetNgr: `€${Number(targetUplift || 50000).toLocaleString()}`,
        budget: `€${budgetCalc.toLocaleString()}`,
        status: 'SCHEDULED',
        launchDate: '2026-10-28',
      };
      setCampaigns([newPromo, ...campaigns]);
      setGenerating(false);
      setActionNotice(`Successfully generated & scheduled campaign: "${newPromo.title}"!`);
    }, 700);
  };

  const handleCopyText = (text: string, id: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleExportBrief = () => {
    const payload = {
      exportDate: new Date().toISOString(),
      activeCampaigns: campaigns,
      audienceCohorts,
      forecasting: {
        targetUplift: `€${Number(targetUplift).toLocaleString()}`,
        projectedBudget: `€${Math.round(Number(targetUplift) / Number(targetRoi)).toLocaleString()}`,
        projectedRoi: `${targetRoi}x`,
      },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `promo-planner-brief-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setActionNotice('Campaign brief exported as JSON package.');
  };

  const budgetEstimate = Math.round(Number(targetUplift || 50000) / Number(targetRoi || 4.0));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-purple-800/40">
        <div>
          <div className="flex items-center gap-2">
            <Badge className="bg-purple-500/30 text-purple-200 border-purple-400/40 font-semibold px-2.5 py-0.5">
              CRM Intelligence Flagship (CR8)
            </Badge>
            <span className="text-xs text-purple-300">End-to-End Campaign Suite</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mt-2 flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-amber-400" />
            Promo Planner
          </h1>
          <p className="text-purple-200 text-sm mt-1 max-w-2xl">
            Design, simulate, and schedule targeted CRM promotions with automated budget allocation,
            audience cohort selection, and A/B creative generation.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleExportBrief}
            variant="secondary"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Brief
          </Button>
          <Button
            onClick={handleCreateCampaign}
            disabled={generating}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold flex items-center gap-2"
          >
            <Zap className={`h-4 w-4 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Simulating...' : 'Generate AI Campaign'}
          </Button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg flex items-center gap-2 text-sm">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-amber-500 bg-white">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-bold uppercase text-gray-500">Target NGR Uplift</CardDescription>
            <CardTitle className="text-2xl font-black text-gray-900 mt-1">
              €{Number(targetUplift || 50000).toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-gray-500 flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-600" /> +32% projected uplift
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 bg-white">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-bold uppercase text-gray-500">Allocated Promo Budget</CardDescription>
            <CardTitle className="text-2xl font-black text-purple-600 mt-1">
              €{budgetEstimate.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-gray-500 flex items-center gap-1">
            <DollarSign className="h-3.5 w-3.5 text-purple-600" /> Auto-calculated from ROI target
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-indigo-500 bg-white">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-bold uppercase text-gray-500">Target ROI Multiplier</CardDescription>
            <CardTitle className="text-2xl font-black text-indigo-600 mt-1">
              {targetRoi}x
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-gray-500 flex items-center gap-1">
            <Target className="h-3.5 w-3.5 text-indigo-600" /> Minimum efficiency guard
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 bg-white">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-bold uppercase text-gray-500">Active / Scheduled</CardDescription>
            <CardTitle className="text-2xl font-black text-emerald-600 mt-1">
              {campaigns.length} Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-gray-500 flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-emerald-600" /> Across October 2026
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-gray-100 p-1 rounded-xl">
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Active Campaigns
          </TabsTrigger>
          <TabsTrigger value="audience" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Audience Segments
          </TabsTrigger>
          <TabsTrigger value="creative" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Creative Studio & A/B Copy
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Promo Calendar
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Campaigns */}
        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-bold text-gray-900">Promotional Campaigns</CardTitle>
                <CardDescription className="text-sm text-gray-500">
                  Manage live, scheduled, and draft promotional journeys.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Campaign Title..."
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                  className="w-64"
                />
                <Button onClick={handleCreateCampaign} disabled={generating} size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Add Campaign
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead>Campaign Name</TableHead>
                    <TableHead>Bonus Mechanic</TableHead>
                    <TableHead>Target Audience</TableHead>
                    <TableHead className="text-right">Target NGR</TableHead>
                    <TableHead className="text-right">Budget</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Launch Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-bold text-gray-900">{c.title}</TableCell>
                      <TableCell className="text-xs text-gray-600 font-mono">{c.mechanic}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                          {c.audience}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-emerald-600">{c.targetNgr}</TableCell>
                      <TableCell className="text-right font-medium text-gray-700">{c.budget}</TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={
                            c.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : c.status === 'SCHEDULED'
                              ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
                              : 'bg-gray-100 text-gray-700 border-gray-300'
                          }
                        >
                          {c.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-xs text-gray-500">{c.launchDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Audience Segments */}
        <TabsContent value="audience" className="space-y-4">
          <Card>
            <CardHeader className="p-6">
              <CardTitle className="text-lg font-bold text-gray-900">High-Impact Player Cohorts</CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Segmented targets dynamically synthesized from player engagement and RFM analysis.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead>Cohort Segment</TableHead>
                    <TableHead className="text-right">Active Players</TableHead>
                    <TableHead className="text-right">Avg Deposit</TableHead>
                    <TableHead className="text-center">Churn Risk</TableHead>
                    <TableHead className="text-right">Projected Uplift</TableHead>
                    <TableHead className="text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {audienceCohorts.map((ac, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-bold text-gray-900">{ac.name}</TableCell>
                      <TableCell className="text-right font-mono">{ac.size.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono font-medium">{ac.avgDeposit}</TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={
                            ac.churnRisk === 'Low'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ac.churnRisk === 'Medium'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }
                        >
                          {ac.churnRisk}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-emerald-600">{ac.expectedLift}</TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setCampaignTitle(`${ac.name} Exclusive Boost`);
                            setActiveTab('campaigns');
                          }}
                        >
                          Create Promo
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Creative Studio & A/B Copy */}
        <TabsContent value="creative" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border border-indigo-200">
              <CardHeader className="p-6 bg-indigo-50/50">
                <div className="flex items-center justify-between">
                  <Badge className="bg-indigo-600 text-white">Variant A (Value Hook)</Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopyText("Claim 100% Reload Match up to €500 this weekend. VIP bonus code: BOOST500", "copy-a")}
                    className="h-8 flex items-center gap-1 text-xs"
                  >
                    {copiedId === "copy-a" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    Copy
                  </Button>
                </div>
                <CardTitle className="text-base font-bold text-indigo-950 mt-2">
                  Double Your Weekend Action
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 text-sm space-y-3 text-gray-700">
                <p><strong>Email Subject:</strong> Your Weekend VIP Bonus is Ready: 100% Match up to €500</p>
                <p><strong>SMS Hook:</strong> VIP Alert: Deposit today and get 100% extra + 50 spins. Code: BOOST500</p>
                <p><strong>Channel:</strong> Email + In-App Notification</p>
              </CardContent>
            </Card>

            <Card className="border border-purple-200">
              <CardHeader className="p-6 bg-purple-50/50">
                <div className="flex items-center justify-between">
                  <Badge className="bg-purple-600 text-white">Variant B (Urgency Hook)</Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopyText("48 Hours Only: 100% Match + 50 Spins waiting in your cashier.", "copy-b")}
                    className="h-8 flex items-center gap-1 text-xs"
                  >
                    {copiedId === "copy-b" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    Copy
                  </Button>
                </div>
                <CardTitle className="text-base font-bold text-purple-950 mt-2">
                  Exclusive 48-Hour Cashier Boost
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 text-sm space-y-3 text-gray-700">
                <p><strong>Email Subject:</strong> ⏳ 48 Hours Left: Unlock your 100% Weekend Boost</p>
                <p><strong>SMS Hook:</strong> Flash reload: 100% match awaits you this weekend only.</p>
                <p><strong>Channel:</strong> Push Notification + SMS</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 4: Promo Calendar */}
        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader className="p-6">
              <CardTitle className="text-lg font-bold text-gray-900">Promotional Event Calendar</CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Synchronized schedule with game releases, provider network tournaments, and localized sports moments.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-indigo-600" />
                    <div>
                      <div className="font-bold text-gray-900">Pragmatic Drops & Wins October Stage</div>
                      <div className="text-xs text-gray-500">Provider Network Tournament • Daily Prize Pools €30,000</div>
                    </div>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-800">RUNNING</Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-indigo-600" />
                    <div>
                      <div className="font-bold text-gray-900">Halloween Spooky Spins Festival</div>
                      <div className="text-xs text-gray-500">Seasonal Campaign • Target NGR €65,000</div>
                    </div>
                  </div>
                  <Badge className="bg-indigo-100 text-indigo-800">LAUNCH OCT 25</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
