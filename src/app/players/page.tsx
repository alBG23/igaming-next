'use client';

import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Database,
  Download,
  Eye,
  RefreshCw,
  Search,
  Upload,
  UserCheck,
  UserX,
  Users,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type PlayerStatus = 'Active' | 'Inactive' | 'Unknown';
type StatusFilter = 'All' | PlayerStatus;

interface PlayerBalance {
  currency: string;
  amount: number;
}

interface Player {
  id: number | string;
  name: string | null;
  email: string | null;
  status: PlayerStatus;
  tier: string | null;
  balances: PlayerBalance[];
  country: string | null;
  lastLogin: string | null;
  registeredAt: string | null;
}

interface PlayerSummary {
  totalPlayers: number;
  activePlayers: number;
  inactivePlayers: number;
  unknownStatusPlayers: number;
  averageBalanceByCurrency: {
    currency: string;
    averageBalance: number;
    playerCount: number;
  }[];
}

interface PlayersResponse {
  success: boolean;
  data: Player[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  summary: PlayerSummary;
  error?: string;
}

const PAGE_SIZE = 50;
const statusFilters: StatusFilter[] = ['All', 'Active', 'Inactive', 'Unknown'];

function formatCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

function formatBalances(balances: PlayerBalance[]) {
  return balances.length
    ? balances.map(({ amount, currency }) => formatCurrency(amount, currency)).join(' · ')
    : 'Not available';
}

function formatDate(value: string | null) {
  return value || 'Not recorded';
}

function toCsvCell(value: string | number | null) {
  const text = value === null ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function downloadCsv(players: Player[]) {
  const headers = ['ID', 'Name', 'Email', 'Status', 'VIP Tier', 'Currency Balances', 'Country', 'Last Login', 'Registered'];
  const rows = players.map((player) => [
    player.id,
    player.name,
    player.email,
    player.status,
    player.tier,
    formatBalances(player.balances),
    player.country,
    player.lastLogin,
    player.registeredAt,
  ]);
  const blob = new Blob([[headers, ...rows].map((row) => row.map(toCsvCell).join(',')).join('\n')], {
    type: 'text/csv;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `players-page-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [summary, setSummary] = useState<PlayerSummary | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importContent, setImportContent] = useState('');
  const [importError, setImportError] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const loadPlayers = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setIsRefreshing(true);
    setLoadError('');

    const params = new URLSearchParams({
      page: String(page),
      limit: String(PAGE_SIZE),
      status: statusFilter,
    });
    if (debouncedSearchQuery) params.set('search', debouncedSearchQuery);

    try {
      const response = await fetch(`/api/players?${params}`, {
        signal,
        cache: 'no-store',
      });
      const result = await response.json() as PlayersResponse;
      if (!response.ok || !result.success) {
        throw new Error(result.error || `Player data request failed (${response.status}).`);
      }
      if (!Array.isArray(result.data) || !result.pagination || !result.summary) {
        throw new Error('The player data source returned an invalid response.');
      }
      setPlayers(result.data);
      setTotalCount(result.pagination.total);
      setSummary(result.summary);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      setPlayers([]);
      setTotalCount(0);
      setSummary(null);
      setLoadError(error instanceof Error ? error.message : 'Unable to load player data.');
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [debouncedSearchQuery, page, statusFilter]);
  const handleRefresh = () => loadPlayers();

  useEffect(() => {
    const controller = new AbortController();
    void loadPlayers(controller.signal);
    return () => controller.abort();
  }, [loadPlayers]);

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 4000);
    return () => clearTimeout(timer);
  }, [notification]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const balanceSummary = useMemo(
    () => summary?.averageBalanceByCurrency
      .map(({ currency, averageBalance }) => formatCurrency(averageBalance, currency))
      .join(' · ') || 'No reported balances',
    [summary],
  );

  const handleExport = () => {
    if (players.length === 0) {
      setNotification({ type: 'error', message: 'There are no player records on this page to export.' });
      return;
    }
    downloadCsv(players);
    setNotification({ type: 'success', message: `Exported ${players.length} database records from this page.` });
  };

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImportError('');
    setImportContent(await file.text());
  };

  const handleImport = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!importContent.trim()) {
      setImportError('Select a real CSV or JSON export before importing.');
      return;
    }
    setImportError('');
    setIsImporting(true);
    try {
      const response = await fetch('/api/players/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_content: importContent }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || `Import failed (${response.status}).`);
      }
      setIsImportOpen(false);
      setImportContent('');
      setNotification({ type: 'success', message: `Imported ${result.count} database records.` });
      await loadPlayers();
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Unable to import player records.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="container mx-auto space-y-6 py-6">
      {notification && (
        <div
          role="status"
          className={`flex items-center justify-between rounded-lg border p-4 ${
            notification.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-rose-200 bg-rose-50 text-rose-800'
          }`}
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            {notification.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            {notification.message}
          </span>
          <Button variant="ghost" size="icon" aria-label="Dismiss message" onClick={() => setNotification(null)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Players</h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
              <Database className="h-3 w-3" />
              Configured PostgreSQL replica
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Read-only player records and account balances from the configured database.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setImportError('');
              setIsImportOpen(true);
            }}
          >
            <Upload className="mr-2 h-4 w-4" />
            Import Real Data
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={isLoading || players.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export Page CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Players</p>
              <h2 className="mt-1 text-2xl font-bold">{summary?.totalPlayers ?? '—'}</h2>
            </div>
            <Users className="h-5 w-5 text-blue-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Active</p>
              <h2 className="mt-1 text-2xl font-bold text-emerald-600">{summary?.activePlayers ?? '—'}</h2>
            </div>
            <UserCheck className="h-5 w-5 text-emerald-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Inactive</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-500">{summary?.inactivePlayers ?? '—'}</h2>
              {summary && summary.unknownStatusPlayers > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">{summary.unknownStatusPlayers} unknown status</p>
              )}
            </div>
            <UserX className="h-5 w-5 text-slate-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Average Balance by Currency</p>
            <h2 className="mt-2 text-base font-bold">{summary ? balanceSummary : '—'}</h2>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-3">
              <CardTitle className="text-xl">Player Records</CardTitle>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {isLoading ? 'Loading…' : `${totalCount} records`}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex flex-wrap rounded-md border bg-muted/30 p-1 text-xs" aria-label="Filter players by status">
                {statusFilters.map((status) => {
                  const count = status === 'All'
                    ? summary?.totalPlayers
                    : status === 'Active'
                      ? summary?.activePlayers
                      : status === 'Inactive'
                        ? summary?.inactivePlayers
                        : summary?.unknownStatusPlayers;
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => {
                        setStatusFilter(status);
                        setPage(1);
                      }}
                      aria-pressed={statusFilter === status}
                      className={`rounded px-3 py-1 font-medium transition-colors ${
                        statusFilter === status ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {status}{count !== undefined ? ` (${count})` : ''}
                    </button>
                  );
                })}
              </div>
              <div className="relative w-full sm:w-[260px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  aria-label="Search players"
                  placeholder="Search player records…"
                  className="pl-8 pr-8"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1 h-7 w-7"
                    aria-label="Clear player search"
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loadError ? (
            <div role="alert" className="flex flex-col items-center gap-3 py-10 text-center text-rose-700">
              <AlertCircle className="h-10 w-10" />
              <p className="font-medium">Player data is unavailable.</p>
              <p className="text-sm">{loadError}</p>
              <Button variant="outline" onClick={handleRefresh}>Retry loading real player data</Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>VIP Tier</TableHead>
                    <TableHead>Account Balances</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="text-right">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                        <RefreshCw className="mr-2 inline h-4 w-4 animate-spin" />
                        Loading records from PostgreSQL…
                      </TableCell>
                    </TableRow>
                  ) : players.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                        <p className="font-medium">No matching player records in the configured database.</p>
                        <p className="mt-1 text-sm">No demo or cached records are shown.</p>
                      </TableCell>
                    </TableRow>
                  ) : players.map((player) => (
                    <TableRow key={player.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                            {(player.name || player.email || '??').slice(0, 2).toUpperCase()}
                          </div>
                          <span>{player.name || 'Name not recorded'}</span>
                          {player.country && (
                            <span className="text-[10px] text-muted-foreground">({player.country})</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{player.email || 'Not recorded'}</TableCell>
                      <TableCell>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          player.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : player.status === 'Inactive'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-700'
                        }`}>
                          {player.status}
                        </span>
                      </TableCell>
                      <TableCell>{player.tier || 'Not set'}</TableCell>
                      <TableCell className="font-mono text-sm">{formatBalances(player.balances)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(player.lastLogin)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedPlayer(player);
                            setIsDetailsOpen(true);
                          }}
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalCount > PAGE_SIZE && (
                <div className="mt-4 flex items-center justify-between border-t pt-4">
                  <p className="text-sm text-muted-foreground">Page {page} of {totalPages} ({totalCount} records)</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1 || isLoading} onClick={() => setPage((current) => current - 1)}>
                      Previous
                    </Button>
                    <Button variant="outline" size="sm" disabled={page >= totalPages || isLoading} onClick={() => setPage((current) => current + 1)}>
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Player Record</DialogTitle>
            <DialogDescription>Read-only values returned by the configured PostgreSQL replica.</DialogDescription>
          </DialogHeader>
          {selectedPlayer && (
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-muted-foreground">ID</dt><dd>{selectedPlayer.id}</dd></div>
              <div><dt className="text-muted-foreground">Status</dt><dd>{selectedPlayer.status}</dd></div>
              <div><dt className="text-muted-foreground">Name</dt><dd>{selectedPlayer.name || 'Not recorded'}</dd></div>
              <div><dt className="text-muted-foreground">Email</dt><dd>{selectedPlayer.email || 'Not recorded'}</dd></div>
              <div><dt className="text-muted-foreground">VIP Tier</dt><dd>{selectedPlayer.tier || 'Not set'}</dd></div>
              <div><dt className="text-muted-foreground">Country</dt><dd>{selectedPlayer.country || 'Not recorded'}</dd></div>
              <div><dt className="text-muted-foreground">Account Balances</dt><dd>{formatBalances(selectedPlayer.balances)}</dd></div>
              <div><dt className="text-muted-foreground">Last Login</dt><dd>{formatDate(selectedPlayer.lastLogin)}</dd></div>
              <div><dt className="text-muted-foreground">Registered</dt><dd>{formatDate(selectedPlayer.registeredAt)}</dd></div>
            </dl>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Import Real Player Data
            </DialogTitle>
            <DialogDescription>
              Import an actual player export. Every record must include its source ID, email, and status; missing values are not invented.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleImport} className="space-y-4 py-2">
            {importError && <div role="alert" className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{importError}</div>}
            <div className="space-y-2">
              <Label htmlFor="import-file">Select a CSV or JSON export</Label>
              <Input id="import-file" type="file" accept=".csv,.json,text/csv,application/json" onChange={handleFileUpload} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="import-textarea">Or paste CSV / JSON</Label>
              <Textarea
                id="import-textarea"
                rows={8}
                value={importContent}
                onChange={(event) => setImportContent(event.target.value)}
                placeholder="Paste a real CSV export or JSON array…"
                className="font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">
                Required fields: source ID, email, and status. Balance and currency must be supplied together; other unknown values remain unset.
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsImportOpen(false)} disabled={isImporting}>Cancel</Button>
              <Button type="submit" disabled={isImporting || !importContent.trim()}>
                {isImporting ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Import to Database
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
