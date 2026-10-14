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
  HelpCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  FileText,
  Download,
  Copy,
  Check,
} from 'lucide-react';

export default function DataAccuracyDashboard() {
  const [loading, setLoading] = useState(true);
  const [reconciling, setReconciling] = useState(false);
  const [updatingAutofix, setUpdatingAutofix] = useState(false);
  const [loadingParity, setLoadingParity] = useState(false);
  const [parityReport, setParityReport] = useState(null);
  const [showParityModal, setShowParityModal] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [filterMode, setFilterMode] = useState('all');
  const [showPlanDetails, setShowPlanDetails] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/data-accuracy/status');
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setLoadError(null);
      } else {
        const body = await res.json().catch(() => ({}));
        setLoadError(body.detail || body.error || `Unable to load backend status (${res.status}).`);
      }
    } catch (err) {
      console.error('Error fetching data accuracy status:', err);
      setLoadError('Unable to reach the data-accuracy status endpoint.');
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

  const handleAutofixToggle = async (on) => {
    setUpdatingAutofix(true);
    setActionMessage(null);
    try {
      const res = await fetch(`/api/data-accuracy/autofix?on=${on}`, { method: 'POST' });
      if (res.ok) {
        setActionMessage({ type: 'success', text: `Backend auto-fix ${on ? 'resumed' : 'paused'}.` });
        await fetchStatus();
      } else {
        const body = await res.json().catch(() => ({}));
        setActionMessage({ type: 'error', text: body.detail || body.error || 'Unable to update backend auto-fix.' });
      }
    } catch {
      setActionMessage({ type: 'error', text: 'Network error updating backend auto-fix.' });
    } finally {
      setUpdatingAutofix(false);
    }
  };

  const handleGenerateParityProof = async () => {
    setLoadingParity(true);
    setActionMessage(null);
    try {
      const res = await fetch('/api/data-accuracy/parity-proof?days=7');
      if (res.ok) {
        const json = await res.json();
        setParityReport(json);
        setShowParityModal(true);
        setActionMessage({
          type: 'success',
          text: `Parity evidence report generated: ${json.status || 'UNVERIFIED'}.`,
        });
      } else {
        const body = await res.json().catch(() => ({}));
        setActionMessage({ type: 'error', text: body.detail || body.error || 'Failed to generate parity evidence report.' });
      }
    } catch {
      setActionMessage({ type: 'error', text: 'Network error retrieving parity proof.' });
    } finally {
      setLoadingParity(false);
    }
  };

  const handleCopyProofHash = (hash) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(hash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  const handleDownloadProofJson = () => {
    if (!parityReport) return;
    const blob = new Blob([JSON.stringify(parityReport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maximoos-parity-proof-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
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
    return true;
  });

  const accuracyScore = data?.accuracyScorePct;
  const autofix = data?.loop?.autofix;
  const autofixCanBeEnabled = Boolean(data?.loop?.loop_enabled && autofix?.master_env_enabled);
  const formatMoney = (value, currency) => (
    value == null || !Number.isFinite(Number(value))
      ? '—'
      : `${currency} ${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  );

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
            Evidence from the operator-supplied Back Office snapshot and protected backend QA loop.
          </p>
        </div>
        <div className="flex items-center flex-wrap gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <Switch
              checked={Boolean(autofix?.operator_switch_on)}
              onCheckedChange={handleAutofixToggle}
              disabled={updatingAutofix || !autofixCanBeEnabled}
              aria-label="Backend auto-fix"
            />
            Backend auto-fix
          </label>
          <Button
            variant="default"
            onClick={handleGenerateParityProof}
            disabled={loadingParity}
            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
          >
            <FileText className={`h-4 w-4 ${loadingParity ? 'animate-spin' : ''}`} />
            One-Click Parity Proof
          </Button>
          <Button
            variant="outline"
            onClick={handleRunReconcile}
            disabled={reconciling}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${reconciling ? 'animate-spin' : ''}`} />
            Run Reconcile Pass
          </Button>
        </div>
      </div>

      {/* Repeatable Parity Proof Report Modal / Card (Priority CR1) */}
      {showParityModal && parityReport && (
        <Card className="border-2 border-indigo-500 shadow-lg bg-white overflow-hidden animate-in fade-in duration-300">
          <CardHeader className="bg-gradient-to-r from-indigo-900 to-indigo-800 text-white p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Badge className={parityReport.status === 'VERIFIED_PARITY' ? 'bg-emerald-400 text-emerald-950 font-bold px-3 py-1' : 'bg-amber-200 text-amber-950 font-bold px-3 py-1'}>
                    {parityReport.status || 'UNVERIFIED'}
                  </Badge>
                  <span className="text-xs text-indigo-200">
                    Evaluated: {new Date(parityReport.evaluated_at).toLocaleString()}
                  </span>
                </div>
                <CardTitle className="text-2xl font-bold mt-2 text-white">
                  Repeatable Parity Proof Report (CR1)
                </CardTitle>
                <CardDescription className="text-indigo-200 text-sm mt-1">
                  {parityReport.prospect_summary}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleDownloadProofJson}
                  className="bg-white/10 hover:bg-white/20 text-white border-0 flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Proof JSON
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowParityModal(false)}
                  className="bg-transparent hover:bg-white/10 text-white border-white/20"
                >
                  Close
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="text-xs font-semibold uppercase text-gray-500">Parity Match Rate</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {parityReport.overall_match_rate == null ? 'Unverified' : `${parityReport.overall_match_rate}%`}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {parityReport.coverage?.matched ?? 0} matched of {parityReport.coverage?.compared ?? 0} comparisons
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="text-xs font-semibold uppercase text-gray-500">Closed Days Evaluated</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">{parityReport.closed_days_count} Days</div>
                <div className="text-xs text-gray-500 mt-0.5">Trailing settled window</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="text-xs font-semibold uppercase text-gray-500">Source of Truth</div>
                <div className="text-sm font-bold text-gray-900 mt-2">
                  {parityReport.source_of_truth || 'Operator-supplied Back Office snapshot'}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">Source represented in this report</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="text-xs font-semibold uppercase text-gray-500">Cryptographic Proof Hash</div>
                <div className="flex items-center gap-2 mt-2">
                  <code className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-800 font-mono truncate max-w-[140px]">
                    {parityReport.repeatable_proof_hash}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopyProofHash(parityReport.repeatable_proof_hash)}
                    className="h-7 w-7 p-0"
                    title="Copy Hash"
                  >
                    {copiedHash ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-gray-500" />}
                  </Button>
                </div>
              </div>
            </div>

            {/* Parity Ledger Table */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Audited Financial Reconciliation (Closed Days)
              </h4>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead>Financial Metric</TableHead>
                      <TableHead>Authoritative Source of Truth</TableHead>
                      <TableHead className="text-right">Application Value</TableHead>
                      <TableHead className="text-right">Source Value</TableHead>
                      <TableHead className="text-right">Delta</TableHead>
                      <TableHead className="text-center">Parity Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parityReport.metrics?.map((m) => (
                      <TableRow key={`${m.metric_id}:${m.currency || 'unverified'}`}>
                        <TableCell className="font-semibold">
                          {m.name}
                        </TableCell>
                        <TableCell>{parityReport.source_of_truth}</TableCell>
                        <TableCell className="text-right">{formatMoney(m.app_value, m.currency)}</TableCell>
                        <TableCell className="text-right">{formatMoney(m.source_value, m.currency)}</TableCell>
                        <TableCell className="text-right">{formatMoney(m.delta, m.currency)}</TableCell>
                        <TableCell className="text-center">
                          <Badge className={
                            m.status === 'MATCH'
                              ? 'bg-emerald-100 text-emerald-800'
                              : m.status === 'UNVERIFIED'
                                ? 'bg-slate-100 text-slate-800'
                                : 'bg-rose-100 text-rose-800'
                          }>
                            {m.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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

      {loadError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Unable to load data-accuracy evidence: {loadError}
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
              {accuracyScore == null ? 'Unverified' : `${accuracyScore}%`}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-gray-500">
            {data?.summary?.matches ?? 0} of {data?.summary?.totalChecks ?? 0} observed comparisons matched
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
            Observed source gaps or missing application values
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
            Open findings reported by the backend
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Backend QA Loop
            </CardDescription>
            <CardTitle className="text-2xl font-extrabold text-blue-600">
              {data ? (data.loop?.loop_enabled ? 'Enabled' : 'Disabled') : 'Unknown'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-gray-500">
            Scheduled checks are backend-owned
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Open Backend Findings
            </CardDescription>
            <CardTitle className="text-2xl font-extrabold text-purple-600">
              {data?.summary?.openFindings ?? '—'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-gray-500">
            Findings returned by protected backend queue
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
                The Plan: How We Check Data Accuracy and Control Remediation
              </CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowPlanDetails(!showPlanDetails)}>
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
                  Backend write-time integrity checks validate casino aggregate identities, uniqueness, and non-negative counts.
                </p>
              </div>
              <div className="p-3 bg-white rounded border border-gray-100">
                <span className="font-semibold text-gray-900 block mb-1">2. Constant SoT Comparison</span>
                <p className="text-xs">
                  Current independent comparisons use operator-supplied Back Office snapshots against application aggregates for supported metrics and native currencies.
                </p>
              </div>
              <div className="p-3 bg-white rounded border border-gray-100">
                <span className="font-semibold text-gray-900 block mb-1">3. Automated Alerts & SLA</span>
                <p className="text-xs">
                  The backend QA loop and its existing alert configuration own scheduled checks and alerts. This dashboard displays backend evidence; it does not claim provider coverage.
                </p>
              </div>
              <div className="p-3 bg-white rounded border border-gray-100">
                <span className="font-semibold text-gray-900 block mb-1">4. Risk-Gated Auto-Heal</span>
                <p className="text-xs">
                  The dashboard cannot trigger individual heals. The backend master setting, operator switch, and safety checks control any automated remediation.
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
              Observed comparison between application aggregates and operator-supplied snapshots.
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
                  <TableHead className="text-right">Application Value</TableHead>
                  <TableHead className="text-right">Delta / Variance</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFindings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      {data?.crossSource?.verified
                        ? 'No records match this filter.'
                        : 'No comparison evidence is available for this window.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFindings.map(f => (
                      <TableRow key={f.id} className={f.slaBreached ? 'bg-rose-50/50' : ''}>
                        <TableCell className="font-mono text-xs">
                          <div>{f.date}</div>
                          <Badge variant="outline" className="text-[10px] bg-gray-100">Closed day</Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-xs uppercase text-gray-700">
                          {f.metric.replaceAll('_', ' ')}
                        </TableCell>
                        <TableCell className="text-xs text-gray-500">
                          {f.sourceOfTruth}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs font-medium">
                          {formatMoney(f.sourceValue, f.currency)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          {formatMoney(f.prebuiltValue, f.currency)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          {f.delta == null ? (
                            <span>—</span>
                          ) : Math.abs(f.delta) < 0.01 ? (
                            <span className="text-emerald-600">{formatMoney(0, f.currency)} (0%)</span>
                          ) : (
                            <span className={Math.abs(f.deltaPct || 0) > 1 ? 'text-rose-600 font-bold' : 'text-amber-600'}>
                              {f.delta > 0 ? '+' : ''}{formatMoney(f.delta, f.currency)} ({f.deltaPct == null ? 'n/a' : `${f.deltaPct.toFixed(1)}%`})
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {f.status === 'MATCH' ? (
                            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">MATCH</Badge>
                          ) : f.status === 'MISSING' ? (
                            <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100">MISSING APPLICATION VALUE</Badge>
                          ) : (
                            <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100">DISCREPANCY</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-600" />
            Recent Backend QA Runs
          </CardTitle>
          <CardDescription className="text-xs">
            Run history returned by the protected backend QA loop endpoint.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          {data?.recentRuns?.length ? (
            <div className="space-y-2">
              {data.recentRuns.map((run) => (
                <div key={run.id || run.run_id} className="flex justify-between gap-4 rounded border border-slate-100 bg-slate-50 p-2 text-xs">
                  <span>{run.started_at || run.created_at || 'Backend run'}</span>
                  <Badge variant="outline">{run.status || 'Recorded'}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-4 text-center text-xs text-gray-500">No recent QA runs were returned by the backend.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
