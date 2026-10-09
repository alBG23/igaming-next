import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sliders,
  Send,
  Wrench,
  Clock,
  ArrowRight,
  Database,
  Lock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function DataAccuracyDashboard() {
  const [loading, setLoading] = useState(true);
  const [reconciling, setReconciling] = useState(false);
  const [healing, setHealing] = useState(false);
  const [data, setData] = useState(null);
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'discrepancies' | 'safe_healable'
  const [showPlanDetails, setShowPlanDetails] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/data-accuracy/status');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Error fetching data accuracy status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleRunReconcile = async () => {
    setReconciling(true);
    setActionMessage(null);
    try {
      const res = await fetch('/api/data-accuracy/reconcile?days=7', { method: 'POST' });
      if (res.ok) {
        setActionMessage({ type: 'success', text: 'Reconciliation pass completed across 7-day window.' });
        await fetchStatus();
      } else {
        setActionMessage({ type: 'error', text: 'Failed to complete reconciliation cycle.' });
      }
    } catch {
      setActionMessage({ type: 'error', text: 'Network error executing reconciliation.' });
    } finally {
      setReconciling(false);
    }
  };

  const handleExecuteSafeHeal = async (findingId = null) => {
    setHealing(true);
    setActionMessage(null);
    try {
      const payload = findingId ? { findingIds: [findingId] } : { allSafeOnly: true };
      const res = await fetch('/api/data-accuracy/heal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = await res.json();
        setActionMessage({
          type: 'success',
          text: `Auto-heal finished: Successfully restored ${json.totalHealed} / ${json.totalAttempted} safe slices without risk.`,
        });
        await fetchStatus();
      } else {
        setActionMessage({ type: 'error', text: 'Auto-healing operation failed.' });
      }
    } catch {
      setActionMessage({ type: 'error', text: 'Network error executing safe heal.' });
    } finally {
      setHealing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="h-8 w-8 animate-spin text-purple-600 mr-3" />
        <span className="text-gray-600 font-medium">Loading Data Accuracy Matrix & Reconciler...</span>
      </div>
    );
  }

  const findings = data?.findings || [];
  const filteredFindings = findings.filter(f => {
    if (filterMode === 'discrepancies') return f.status !== 'MATCH';
    if (filterMode === 'safe_healable') return f.riskClassification === 'SAFE_AUTO_HEAL' && f.reviewStatus !== 'AUTO_HEALED';
    return true;
  });

  const accuracyScore = data?.accuracyScorePct ?? 100;

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <ShieldCheck className="mr-2 h-7 w-7 text-emerald-600" />
            Data Accuracy & Continuous Reconciliation
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Authoritative verification vs Source of Truth (Softswiss / Affilka / BO), SLA alerts, and risk-gated auto-healing.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleRunReconcile}
            disabled={reconciling}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${reconciling ? 'animate-spin' : ''}`} />
            Run Reconcile Pass
          </Button>
          <Button
            onClick={() => handleExecuteSafeHeal()}
            disabled={healing || (data?.summary?.safeHealable === 0)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
          >
            <Wrench className="h-4 w-4" />
            Safe Auto-Heal ({data?.summary?.safeHealable || 0})
          </Button>
        </div>
      </div>

      {actionMessage && (
        <div
          className={`p-4 rounded-lg flex items-center gap-2 text-sm ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-red-600" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Accuracy Score
            </CardDescription>
            <CardTitle className="text-2xl font-extrabold text-emerald-600">
              {accuracyScore}%
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-gray-500">
            {data?.summary?.matches} of {data?.summary?.totalChecks} metrics tied exactly
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-rose-500">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Critical Discrepancies
            </CardDescription>
            <CardTitle className="text-2xl font-extrabold text-rose-600">
              {data?.summary?.critical || 0}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-gray-500">
            &gt;1.0% variance on closed days
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Drifts & Warnings
            </CardDescription>
            <CardTitle className="text-2xl font-extrabold text-amber-600">
              {data?.summary?.warning || 0}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-gray-500">
            0.1% - 1.0% drift under watch
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Safe Heal Candidates
            </CardDescription>
            <CardTitle className="text-2xl font-extrabold text-blue-600">
              {data?.summary?.safeHealable || 0}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-gray-500">
            Non-risky, prebuilt-under / old version
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Quarantined (Risky)
            </CardDescription>
            <CardTitle className="text-2xl font-extrabold text-purple-600">
              {data?.summary?.quarantined || 0}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-gray-500">
            Source-depleted / human triage required
          </CardContent>
        </Card>
      </div>

      {/* Plan & Architecture Accordion */}
      <Card className="bg-slate-50 border-slate-200">
        <CardHeader className="p-4 cursor-pointer" onClick={() => setShowPlanDetails(!showPlanDetails)}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-base text-gray-900">
                The Plan: How We Guarantee Data Accuracy & Safe Healing
              </CardTitle>
            </div>
            <Button variant="ghost" size="sm">
              {showPlanDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {showPlanDetails && (
          <CardContent className="p-4 pt-0 space-y-3 text-sm text-gray-600 border-t border-slate-200 mt-2">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
              <div className="p-3 bg-white rounded border border-gray-100">
                <span className="font-semibold text-gray-900 block mb-1">1. Check & Identity Rules</span>
                <p className="text-xs">
                  Asserts hard invariants at write-time: NGR = GGR - Bonuses + Corrections. Non-negative counts. Subunits scaled by currency divisor (Fiat ÷100, ETH ÷10⁹, Crypto ÷10⁸).
                </p>
              </div>
              <div className="p-3 bg-white rounded border border-gray-100">
                <span className="font-semibold text-gray-900 block mb-1">2. Constant SoT Comparison</span>
                <p className="text-xs">
                  Intraday comparator cross-checks prebuilt aggregates against Softswiss Replica, Affilka API, and Back Office (BO). Closed days (T-1) tie to the cent; live day is flagged accruing.
                </p>
              </div>
              <div className="p-3 bg-white rounded border border-gray-100">
                <span className="font-semibold text-gray-900 block mb-1">3. Automated Alerts & SLA</span>
                <p className="text-xs">
                  Digest alerts to Telegram/Slack on discrepancies &gt;1.0%. Watchdog tracks finding age (first_seen_at) and escalates if SLA is breached (4h for Critical, 24h for Warn). Auto-closes on recovery.
                </p>
              </div>
              <div className="p-3 bg-white rounded border border-gray-100">
                <span className="font-semibold text-gray-900 block mb-1">4. Risk-Gated Auto-Heal</span>
                <p className="text-xs">
                  Safe: prebuilt &lt; source (additive rebuild), version-stuck days. Risky: source &lt; prebuilt (quarantined to prevent masking upstream replication outages). Strict 5-day / €10k budget.
                </p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Comparison Matrix Table */}
      <Card>
        <CardHeader className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <CardTitle className="text-lg">Continuous Reconcile Matrix</CardTitle>
            <CardDescription className="text-xs">
              Direct comparison between Prebuilt Tables and authoritative Source of Truth (SoT).
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={filterMode === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterMode('all')}
            >
              All ({findings.length})
            </Button>
            <Button
              size="sm"
              variant={filterMode === 'discrepancies' ? 'default' : 'outline'}
              onClick={() => setFilterMode('discrepancies')}
            >
              Discrepancies Only
            </Button>
            <Button
              size="sm"
              variant={filterMode === 'safe_healable' ? 'default' : 'outline'}
              onClick={() => setFilterMode('safe_healable')}
            >
              Safe Heal Candidates
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date / Window</TableHead>
                  <TableHead>Metric</TableHead>
                  <TableHead>Source of Truth</TableHead>
                  <TableHead className="text-right">SoT Value</TableHead>
                  <TableHead className="text-right">Local Prebuilt</TableHead>
                  <TableHead className="text-right">Delta / Variance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Heal Safety</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFindings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      No matching records found for this filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFindings.map(f => {
                    const isSafeHeal = f.riskClassification === 'SAFE_AUTO_HEAL' && f.reviewStatus !== 'AUTO_HEALED';
                    const isHealed = f.reviewStatus === 'AUTO_HEALED';
                    const isRisky = f.riskClassification === 'RISKY_MANUAL_REVIEW';

                    return (
                      <TableRow key={f.id} className={f.slaBreached ? 'bg-rose-50/50' : ''}>
                        <TableCell className="font-mono text-xs">
                          <div>{f.date}</div>
                          <Badge variant="outline" className={`text-[10px] ${f.isClosedDay ? 'bg-gray-100' : 'bg-amber-100 text-amber-800'}`}>
                            {f.isClosedDay ? 'Closed (T-1)' : 'Live Accruing'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-xs uppercase text-gray-700">
                          {f.metric.replace('_', ' ')}
                        </TableCell>
                        <TableCell className="text-xs text-gray-500">
                          <span className="capitalize">{f.sourceOfTruth.replace('_', ' ')}</span>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs font-medium">
                          €{f.sourceValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          €{f.prebuiltValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          {Math.abs(f.delta) < 0.01 ? (
                            <span className="text-emerald-600">0.00 (0%)</span>
                          ) : (
                            <span className={f.deltaPct > 1 ? 'text-rose-600 font-bold' : 'text-amber-600'}>
                              {f.delta > 0 ? '+' : ''}€{f.delta.toFixed(2)} ({f.deltaPct.toFixed(1)}%)
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {f.status === 'MATCH' ? (
                            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">MATCH</Badge>
                          ) : f.status === 'DRIFT' ? (
                            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">DRIFT</Badge>
                          ) : (
                            <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100">MISMATCH</Badge>
                          )}
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          {isHealed ? (
                            <Badge className="bg-blue-100 text-blue-800">Auto-Healed</Badge>
                          ) : isSafeHeal ? (
                            <Badge className="bg-emerald-100 text-emerald-800">Safe to Heal</Badge>
                          ) : isRisky ? (
                            <Badge className="bg-purple-100 text-purple-800">Quarantined (Risky)</Badge>
                          ) : (
                            <Badge variant="outline">Live Window</Badge>
                          )}
                          <div className="text-[10px] text-gray-500 truncate" title={f.riskReason}>
                            {f.riskReason}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {isSafeHeal && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleExecuteSafeHeal(f.id)}
                              disabled={healing}
                              className="text-xs h-7 text-emerald-700 hover:bg-emerald-50"
                            >
                              Heal Slice
                            </Button>
                          )}
                          {isRisky && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => alert(`Quarantine Details for ${f.metric} on ${f.date}:\nDelta: €${f.delta.toFixed(2)}\nReason: ${f.riskReason}\nRequires analytics engineer manual approval before rebuilding.`)}
                              className="text-xs h-7 text-purple-700 hover:bg-purple-50"
                            >
                              Review
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Healing Audit Trail & Alert Logs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-600" />
              Safe Auto-Healer Audit Log
            </CardTitle>
            <CardDescription className="text-xs">
              Cryptographically verified ledger of self-healing operations executed.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            {(!data?.auditLog || data.auditLog.length === 0) ? (
              <p className="text-xs text-gray-500 py-4 text-center">No auto-heal operations executed yet.</p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {data.auditLog.map((log, idx) => (
                  <div key={idx} className="p-2 text-xs bg-slate-50 rounded border border-slate-100 flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-gray-800 uppercase">{log.metric}</span>
                      <span className="text-gray-500 ml-1">({log.date})</span>
                      <p className="text-[11px] text-emerald-700 mt-0.5">{log.message}</p>
                    </div>
                    <span className="text-[10px] text-gray-400">
                      {new Date(log.healedAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Send className="h-4 w-4 text-purple-600" />
              Watchdog & Alert Activity
            </CardTitle>
            <CardDescription className="text-xs">
              Telegram / Slack notifications dispatched with SLA tracking.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            {(!data?.recentAlerts || data.recentAlerts.length === 0) ? (
              <p className="text-xs text-gray-500 py-4 text-center">No active alerts. All systems healthy.</p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {data.recentAlerts.map(alt => (
                  <div key={alt.id} className="p-2 text-xs bg-slate-50 rounded border border-slate-100">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-800">{alt.title}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {alt.sentChannels.join(', ')}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-gray-600 mt-0.5">{alt.summary}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
