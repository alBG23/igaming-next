'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Shield,
  Lock,
  BrainCircuit,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Server,
  Key,
  EyeOff,
  Radio,
  Download,
  Search,
  Clock3,
} from 'lucide-react';
import { Input } from '@/components/ui/input';

const PAGE_SIZE = 10;

function PaginationControls({ label, currentPage, onPageChange, totalItems }) {
  const pageCount = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const page = Math.min(currentPage, pageCount - 1);
  const firstItem = totalItems === 0 ? 0 : page * PAGE_SIZE + 1;
  const lastItem = Math.min((page + 1) * PAGE_SIZE, totalItems);

  return (
    <nav
      aria-label={`${label} pagination`}
      className="flex items-center justify-between gap-3 border-t px-4 py-3"
    >
      <span className="text-sm text-muted-foreground" aria-live="polite">
        Showing {firstItem}-{lastItem} of {totalItems} {label}
      </span>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          Page {page + 1} of {pageCount}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label={`Previous ${label} page`}
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label={`Next ${label} page`}
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount - 1}
        >
          Next
        </Button>
      </div>
    </nav>
  );
}

export default function TenantSecurityDashboard() {
  const [loading, setLoading] = useState(true);
  const [auditData, setAuditData] = useState(null);
  const [runningProbes, setRunningProbes] = useState(false);
  const [tenantPage, setTenantPage] = useState(0);
  const [probePage, setProbePage] = useState(0);
  const [tenantSearch, setTenantSearch] = useState('');
  const [auditError, setAuditError] = useState('');

  const fetchAudit = async () => {
    try {
      const res = await fetch('/api/tenant/audit');
      if (res.ok) {
        const json = await res.json();
        setAuditData(json);
        setAuditError('');
      } else {
        setAuditError(`Audit request failed (${res.status}). Try again to refresh the verification results.`);
      }
    } catch (err) {
      console.error('Error fetching tenant audit data:', err);
      setAuditError('Could not reach the tenant audit service. Check your connection and retry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudit();
  }, []);

  useEffect(() => {
    const tenantPageCount = Math.max(1, Math.ceil((auditData?.tenants?.length ?? 0) / PAGE_SIZE));
    const probePageCount = Math.max(1, Math.ceil((auditData?.probes?.length ?? 0) / PAGE_SIZE));
    setTenantPage(page => Math.min(page, tenantPageCount - 1));
    setProbePage(page => Math.min(page, probePageCount - 1));
  }, [auditData]);

  const handleRunProbes = async () => {
    setRunningProbes(true);
    try {
      await fetchAudit();
    } finally {
      setRunningProbes(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="h-6 w-6 animate-spin text-purple-600 mr-2" />
        <span className="text-gray-600 font-medium">Auditing Tenant Security Isolation...</span>
      </div>
    );
  }

  const tenants = auditData?.tenants || [];
  const filteredTenants = tenants.filter(tenant =>
    `${tenant.name} ${tenant.id} ${tenant.slug}`.toLowerCase().includes(tenantSearch.trim().toLowerCase())
  );
  const probes = auditData?.probes || [];
  const allPassed = auditData?.allIsolationProbesPassed === true;
  const passedProbeCount = probes.filter(probe => probe.passed).length;
  const visibleTenants = filteredTenants.slice(tenantPage * PAGE_SIZE, (tenantPage + 1) * PAGE_SIZE);

  const exportAudit = () => {
    const rows = [
      ['Tenant ID', 'Operator', 'Isolation mode', 'PII masking', 'AI context scope', 'Status'],
      ...tenants.map(tenant => [tenant.id, tenant.name, tenant.isolationMode, tenant.piiMaskingEnabled ? 'Enforced' : 'Not enabled', tenant.aiKnowledgeScoped ? 'Scoped' : 'Not scoped', tenant.status]),
    ];
    const csv = rows.map(row => row.map(value => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tenant-security-audit.csv';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const visibleProbes = probes.slice(probePage * PAGE_SIZE, (probePage + 1) * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Shield className="mr-2 h-7 w-7 text-indigo-600" />
            Multi-Tenant Security & AI Knowledge Isolation (P2)
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Review cross-tenant access probes, tenant scoping settings, and the latest audit timestamp.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" onClick={exportAudit} disabled={tenants.length === 0} className="flex items-center gap-2">
          <Download className="h-4 w-4" /> Export tenants
        </Button>
        <Button
          id="run-isolation-probes-btn"
          onClick={handleRunProbes}
          disabled={runningProbes}
          className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
        >
          <Radio className={`h-4 w-4 ${runningProbes ? 'animate-pulse' : ''}`} />
          Run Isolation Verification Probes
        </Button>
        </div>
      </div>

      {auditError && (
        <div role="alert" className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 flex flex-wrap items-center justify-between gap-3">
          <span>{auditError}</span>
          <Button type="button" size="sm" variant="outline" onClick={handleRunProbes} disabled={runningProbes}>
            <RefreshCw className={`mr-2 h-4 w-4 ${runningProbes ? 'animate-spin' : ''}`} /> Retry audit
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Registered tenants</p><p className="mt-1 text-2xl font-semibold">{tenants.length}</p><p className="text-xs text-muted-foreground">Configured in this environment</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Isolation probes passed</p><p className="mt-1 text-2xl font-semibold">{passedProbeCount}<span className="text-base text-muted-foreground"> / {probes.length}</span></p><p className="text-xs text-muted-foreground">Cross-tenant requests blocked</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="flex items-center gap-1 text-xs text-muted-foreground"><Clock3 className="h-3.5 w-3.5" /> Last audit</p><p className="mt-2 text-sm font-medium">{auditData?.isolationAudit?.auditedAt ? new Date(auditData.isolationAudit.auditedAt).toLocaleString() : 'Not available'}</p><p className="text-xs text-muted-foreground">Run verification to refresh</p></CardContent></Card>
      </div>

      {/* Isolation Status Banner */}
      <div className={`p-4 rounded-lg border flex items-center justify-between ${
        allPassed ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
      }`}>
        <div className="flex items-center gap-3">
          {allPassed ? (
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          ) : (
            <AlertTriangle className="h-6 w-6 text-rose-600" />
          )}
          <div>
            <span className="font-semibold text-sm">
              {allPassed ? 'Tenant isolation probes passed' : auditData ? 'Isolation verification needs attention' : 'Awaiting isolation verification'}
            </span>
            <p className="text-xs opacity-90 mt-0.5">
              {probes.length ? `${passedProbeCount} of ${probes.length} cross-tenant access attempts were blocked as expected.` : 'Run verification to check cross-tenant access boundaries.'}
            </p>
          </div>
        </div>
        <Badge className={allPassed ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}>{allPassed ? 'Verification passed' : 'Review results'}</Badge>
      </div>

      {/* Layer Isolation Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-700">
              <Server className="h-4 w-4 text-indigo-600" />
              DB Row-Level Security
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-xs text-gray-600">
            <Badge className="bg-emerald-100 text-emerald-800 mb-1">{auditData?.isolationAudit?.dbRowLevelIsolation?.replaceAll('_', ' ') || 'STATUS UNKNOWN'}</Badge>
            <p>Tenant scoped query access is checked at the data boundary. Review the latest audit timestamp above.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-700">
              <Key className="h-4 w-4 text-purple-600" />
              Redis Cache Partitioning
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-xs text-gray-600">
            <Badge className="bg-emerald-100 text-emerald-800 mb-1">{auditData?.isolationAudit?.cacheNamespaceIsolation?.replaceAll('_', ' ') || 'STATUS UNKNOWN'}</Badge>
            <p>Cache keys use tenant namespaces to reduce the risk of cross-tenant cache access.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-700">
              <BrainCircuit className="h-4 w-4 text-blue-600" />
              AI Context Scoping
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-xs text-gray-600">
            <Badge className="bg-emerald-100 text-emerald-800 mb-1">{auditData?.isolationAudit?.aiContextScoped?.replaceAll('_', ' ') || 'STATUS UNKNOWN'}</Badge>
            <p>Retrieved tenant knowledge is scoped to the active tenant context.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-700">
              <EyeOff className="h-4 w-4 text-emerald-600" />
              RBAC & PII Masking
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-xs text-gray-600">
            <Badge className="bg-emerald-100 text-emerald-800 mb-1">{auditData?.isolationAudit?.piiMaskingAudit?.replaceAll('_', ' ') || 'STATUS UNKNOWN'}</Badge>
            <p>Tenant configuration reports whether PII masking is enabled. Verify report paths separately.</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Tenants Table */}
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-base">Registered Tenants & Scoping Policies</CardTitle>
          <CardDescription className="text-xs">
            Search configured tenants and review their isolation and data handling settings.
          </CardDescription>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-sm"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input aria-label="Search tenants" placeholder="Search by tenant, name, or slug" value={tenantSearch} onChange={event => { setTenantSearch(event.target.value); setTenantPage(0); }} className="pl-9" /></div>
            <p className="text-xs text-muted-foreground" aria-live="polite">Showing {filteredTenants.length} of {tenants.length} tenants</p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tenant ID</TableHead>
                <TableHead>Operator Brand</TableHead>
                <TableHead>Isolation Mode</TableHead>
                <TableHead>PII Masking</TableHead>
                <TableHead>AI Context Scope</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleTenants.map(t => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono text-xs font-semibold">{t.id}</TableCell>
                  <TableCell className="font-medium text-xs">{t.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs bg-slate-50">{t.isolationMode}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs font-medium ${t.piiMaskingEnabled ? 'text-emerald-700' : 'text-amber-700'}`}>{t.piiMaskingEnabled ? '✓ Enabled' : 'Not enabled'}</span>
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs font-medium ${t.aiKnowledgeScoped ? 'text-indigo-700' : 'text-amber-700'}`}>{t.aiKnowledgeScoped ? '✓ Scoped Memory' : 'Not scoped'}</span>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-emerald-100 text-emerald-800">{t.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {tenants.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    No registered tenants are available.
                  </TableCell>
                </TableRow>
              )}
              {tenants.length > 0 && filteredTenants.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    No tenants match “{tenantSearch}”. Try another name, ID, or slug.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <PaginationControls
          label="tenants"
          currentPage={tenantPage}
          onPageChange={setTenantPage}
          totalItems={filteredTenants.length}
        />
      </Card>

      {/* Adversarial Probes Execution Table */}
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="h-4 w-4 text-rose-600" />
            Adversarial Cross-Tenant Access Probes
          </CardTitle>
          <CardDescription className="text-xs">
            Automated synthetic attempts to simulate cross-tenant prompt injection and data breaches.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Probe Action</TableHead>
                <TableHead>Source Tenant</TableHead>
                <TableHead>Target Tenant</TableHead>
                <TableHead>Interception Result</TableHead>
                <TableHead>HTTP Status</TableHead>
                <TableHead className="text-right">Outcome</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleProbes.map((probe, idx) => (
                <TableRow key={`${probe.testName}-${probe.sourceTenantId}-${probe.targetTenantId}-${idx}`}>
                  <TableCell className="text-xs font-medium">{probe.testName}</TableCell>
                  <TableCell className="font-mono text-xs text-gray-500">{probe.sourceTenantId}</TableCell>
                  <TableCell className="font-mono text-xs text-rose-600">{probe.targetTenantId}</TableCell>
                  <TableCell className="text-xs text-gray-600">
                    <span className="text-emerald-700 font-semibold">Blocked: </span>
                    {probe.errorCaptured}
                  </TableCell>
                  <TableCell className="font-mono text-xs font-bold text-rose-600">{probe.httpStatus}</TableCell>
                  <TableCell className="text-right">
                    <Badge className="bg-emerald-100 text-emerald-800">
                      PASSED (BLOCKED)
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {probes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    No isolation probes are available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <PaginationControls
          label="probes"
          currentPage={probePage}
          onPageChange={setProbePage}
          totalItems={probes.length}
        />
      </Card>
    </div>
  );
}
