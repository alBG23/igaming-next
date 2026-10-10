'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Plus,
  MoreVertical,
  X,
  Edit2,
  Trash2,
  Eye,
  Download,
  Upload,
  Database,
  RefreshCw,
  FileText,
  Users,
  UserCheck,
  UserX,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

interface Player {
  id: number;
  name: string;
  email: string;
  status: 'Active' | 'Inactive';
  lastLogin: string;
  tier?: 'Bronze' | 'Silver' | 'Gold' | 'VIP';
  balance?: number;
  registeredAt?: string;
  country?: string;
}

const DEFAULT_PLAYERS: Player[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    status: 'Active',
    lastLogin: '2024-03-15',
    tier: 'VIP',
    balance: 1420.50,
    registeredAt: '2023-11-12',
    country: 'CA',
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    status: 'Inactive',
    lastLogin: '2024-03-10',
    tier: 'Gold',
    balance: 350.00,
    registeredAt: '2024-01-05',
    country: 'GB',
  },
  {
    id: 3,
    name: 'Michael Brown',
    email: 'michael.b@example.com',
    status: 'Active',
    lastLogin: '2024-03-16',
    tier: 'Silver',
    balance: 890.25,
    registeredAt: '2023-09-20',
    country: 'DE',
  },
  {
    id: 4,
    name: 'Sarah Wilson',
    email: 'sarah.w@example.com',
    status: 'Active',
    lastLogin: '2024-03-14',
    tier: 'Bronze',
    balance: 125.00,
    registeredAt: '2024-02-18',
    country: 'AU',
  },
  {
    id: 5,
    name: 'Alex Johnson',
    email: 'alex.j@example.com',
    status: 'Inactive',
    lastLogin: '2024-03-01',
    tier: 'Silver',
    balance: 45.00,
    registeredAt: '2023-12-01',
    country: 'US',
  },
];

const STORAGE_KEY = 'igaming_players_list';

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>(DEFAULT_PLAYERS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  // Form State for Add Player
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    status: 'Active' as 'Active' | 'Inactive',
    tier: 'Bronze' as 'Bronze' | 'Silver' | 'Gold' | 'VIP',
    balance: '100',
    country: 'US',
  });
  const [formError, setFormError] = useState('');

  // Form State for Edit Player
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    status: 'Active' as 'Active' | 'Inactive',
    tier: 'Bronze' as 'Bronze' | 'Silver' | 'Gold' | 'VIP',
    balance: '0',
    country: 'US',
  });
  const [editError, setEditError] = useState('');

  // Real Database Source & Import Modal States
  const [dataSource, setDataSource] = useState<'postgresql' | 'local'>('local');
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importContent, setImportContent] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch real players from PostgreSQL database
  const fetchPlayersFromDb = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/players');
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        const formatted: Player[] = json.data.map((item: any) => ({
          id: Number(item.id),
          name: item.name || 'Unnamed',
          email: item.email,
          status: item.status || 'Active',
          tier: (item.vipTier as any) || 'Bronze',
          balance: parseFloat(item.balance) || 0,
          country: item.country || 'EU',
          lastLogin: item.lastLogin || 'Never',
          registeredAt: item.registeredAt || '2026-01-01',
        }));
        setPlayers(formatted);
        setDataSource('postgresql');
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formatted));
        return true;
      }
    } catch (err) {
      console.warn('Failed to fetch players from PostgreSQL API:', err);
    } finally {
      setIsRefreshing(false);
    }
    return false;
  };

  // Load from database on mount, fallback to localStorage
  useEffect(() => {
    fetchPlayersFromDb().then((fetched) => {
      if (!fetched) {
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setPlayers(parsed);
            }
          }
        } catch {
          // Fallback to default players
        }
      }
      setIsLoaded(true);
    });
  }, []);

  // Save to localStorage when players list changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
      } catch {
        // Ignore storage errors
      }
    }
  }, [players, isLoaded]);

  // Flash feedback auto-clear
  useEffect(() => {
    if (feedbackMessage) {
      const timer = setTimeout(() => {
        setFeedbackMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [feedbackMessage]);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setFeedbackMessage({ type, text });
  };

  // Metrics
  const activeCount = useMemo(() => players.filter(p => p.status === 'Active').length, [players]);
  const inactiveCount = useMemo(() => players.filter(p => p.status === 'Inactive').length, [players]);
  const totalBalance = useMemo(() => players.reduce((sum, p) => sum + (p.balance || 0), 0), [players]);
  const avgBalance = useMemo(() => players.length > 0 ? totalBalance / players.length : 0, [players, totalBalance]);

  // Filtered Players
  const filteredPlayers = useMemo(() => {
    return players.filter(player => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (player.tier && player.tier.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (player.country && player.country.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === 'All' || player.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [players, searchQuery, statusFilter]);

  // Reset Add Form
  const resetAddForm = () => {
    setFormData({
      name: '',
      email: '',
      status: 'Active',
      tier: 'Bronze',
      balance: '100',
      country: 'US',
    });
    setFormError('');
  };

  // Handle Add Player
  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Player name is required.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (players.some(p => p.email.toLowerCase() === formData.email.trim().toLowerCase())) {
      setFormError('A player with this email address already exists.');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const newPlayer: Player = {
      id: Date.now(),
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      status: formData.status,
      lastLogin: today,
      registeredAt: today,
      tier: formData.tier,
      balance: parseFloat(formData.balance) || 0,
      country: formData.country.toUpperCase() || 'US',
    };

    setPlayers(prev => [newPlayer, ...prev]);
    setIsAddOpen(false);
    resetAddForm();
    showNotification('success', `Player "${newPlayer.name}" successfully created!`);

    // Sync to PostgreSQL database asynchronously
    fetch('/api/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newPlayer.name,
        email: newPlayer.email,
        status: newPlayer.status,
        vip_tier: newPlayer.tier,
        balance: newPlayer.balance,
        country: newPlayer.country
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          fetchPlayersFromDb();
        }
      })
      .catch(err => {
        console.warn('Could not sync player to PostgreSQL:', err);
      });
  };

  // Handle Real Data Import (CSV / JSON / SQL)
  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importContent.trim()) {
      setImportError('Please upload a file or paste CSV, JSON, or SQL dump data.');
      return;
    }
    setImportLoading(true);
    setImportError('');
    try {
      const res = await fetch('/api/players/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_content: importContent })
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Import failed');
      }
      await fetchPlayersFromDb();
      setIsImportOpen(false);
      setImportContent('');
      showNotification('success', data.message || `Successfully imported ${data.count || 0} real players into database!`);
    } catch (err: any) {
      setImportError(err.message || 'Failed to import player data');
    } finally {
      setImportLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setImportContent(text);
      }
    };
    reader.readAsText(file);
  };

  const loadSampleData = () => {
    const sample = `id,name,email,status,vip_tier,balance,currency,country,last_login,registered_at
1001,Alexander Novak,a.novak@brightcasino.com,Active,VIP,4850.00,EUR,DE,2026-10-09 18:32:00,2025-04-12
1002,Sophia Rossi,sophia.r@luxegaming.it,Active,Gold,1290.75,EUR,IT,2026-10-10 14:15:22,2025-06-20
1003,Liam O'Connor,liam.oc@celticbet.ie,Active,Silver,680.50,EUR,IE,2026-10-08 21:05:10,2025-08-01
1004,Elena Ivanova,elena.iv@nordicslot.se,Inactive,Bronze,95.00,EUR,SE,2026-09-15 11:20:45,2025-11-15
1005,Mateo Fernandez,m.fernandez@ibera.es,Active,Gold,2150.20,EUR,ES,2026-10-10 19:40:00,2025-05-19
1006,Chloe Dubois,chloe.d@montecarlo.fr,Active,VIP,8420.00,EUR,FR,2026-10-10 22:11:05,2025-02-10
1007,Lars Lindholm,lars.l@vikingslots.no,Inactive,Silver,310.00,EUR,NO,2026-09-28 09:14:30,2025-09-05
1008,Katarina Milic,kat.m@adriaticplay.hr,Active,Bronze,180.50,EUR,HR,2026-10-07 16:55:00,2026-01-14
1009,David Miller,d.miller@londonbets.co.uk,Active,VIP,5600.00,GBP,GB,2026-10-10 20:30:15,2025-03-25
1010,Anna Kowalska,anna.k@polandspin.pl,Active,Silver,420.00,EUR,PL,2026-10-06 13:42:10,2026-02-01`;
    setImportContent(sample);
  };

  // Open Edit Dialog
  const handleOpenEdit = (player: Player) => {
    setSelectedPlayer(player);
    setEditFormData({
      name: player.name,
      email: player.email,
      status: player.status,
      tier: player.tier || 'Bronze',
      balance: String(player.balance ?? 0),
      country: player.country || 'US',
    });
    setEditError('');
    setIsEditOpen(true);
  };

  // Handle Edit Player Save
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayer) return;

    if (!editFormData.name.trim()) {
      setEditError('Player name is required.');
      return;
    }
    if (!editFormData.email.trim() || !editFormData.email.includes('@')) {
      setEditError('Please enter a valid email address.');
      return;
    }

    const emailTaken = players.some(
      p => p.id !== selectedPlayer.id && p.email.toLowerCase() === editFormData.email.trim().toLowerCase()
    );
    if (emailTaken) {
      setEditError('Another player is already registered with this email.');
      return;
    }

    setPlayers(prev =>
      prev.map(p =>
        p.id === selectedPlayer.id
          ? {
              ...p,
              name: editFormData.name.trim(),
              email: editFormData.email.trim().toLowerCase(),
              status: editFormData.status,
              tier: editFormData.tier,
              balance: parseFloat(editFormData.balance) || 0,
              country: editFormData.country.toUpperCase() || 'US',
            }
          : p
      )
    );

    setIsEditOpen(false);
    showNotification('success', `Player "${editFormData.name}" updated successfully.`);
  };

  // Toggle Active/Inactive Status
  const handleToggleStatus = (player: Player) => {
    const nextStatus: 'Active' | 'Inactive' = player.status === 'Active' ? 'Inactive' : 'Active';
    setPlayers(prev =>
      prev.map(p => (p.id === player.id ? { ...p, status: nextStatus } : p))
    );
    showNotification(
      'success',
      `Changed status for "${player.name}" to ${nextStatus}.`
    );
  };

  // Open Delete Dialog
  const handleOpenDelete = (player: Player) => {
    setSelectedPlayer(player);
    setIsDeleteOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!selectedPlayer) return;
    setPlayers(prev => prev.filter(p => p.id !== selectedPlayer.id));
    setIsDeleteOpen(false);
    showNotification('success', `Player "${selectedPlayer.name}" was removed.`);
    setSelectedPlayer(null);
  };

  // Open Details Dialog
  const handleOpenDetails = (player: Player) => {
    setSelectedPlayer(player);
    setIsDetailsOpen(true);
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredPlayers.length === 0) {
      showNotification('error', 'No players available to export.');
      return;
    }
    const headers = ['ID', 'Name', 'Email', 'Status', 'Tier', 'Balance', 'Last Login', 'Registered', 'Country'];
    const rows = filteredPlayers.map(p => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      p.email,
      p.status,
      p.tier || 'Bronze',
      (p.balance ?? 0).toFixed(2),
      p.lastLogin,
      p.registeredAt || 'N/A',
      p.country || 'US',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `igaming-players-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('success', `Exported ${filteredPlayers.length} players to CSV.`);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Toast Feedback Notification Banner */}
      {feedbackMessage && (
        <div
          role="alert"
          className={`flex items-center justify-between p-4 rounded-lg shadow-sm transition-all duration-300 ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            )}
            <span className="text-sm font-medium">{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="p-1 hover:bg-black/5 rounded-md"
            aria-label="Dismiss message"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header and Add Player Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Players Management</h1>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
              dataSource === 'postgresql'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
            }`}>
              <Database className="h-3 w-3" />
              {dataSource === 'postgresql' ? 'Live PostgreSQL' : 'Local Storage'}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Manage player accounts, account statuses, balances, and operational profiles.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setImportError('');
              setIsImportOpen(true);
            }}
            className="gap-2"
            id="import-players-btn"
            title="Import real player data from CSV, JSON, or SQL dump"
          >
            <Upload className="h-4 w-4" />
            Import Data
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPlayersFromDb}
            disabled={isRefreshing}
            className="gap-1.5"
            title="Refresh from PostgreSQL Database"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Sync DB
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="gap-2"
            title="Export filtered players to CSV"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button
            id="add-player-btn"
            onClick={() => {
              resetAddForm();
              setIsAddOpen(true);
            }}
            className="gap-2 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Player
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover:border-primary/50 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Players</p>
              <h3 className="text-2xl font-bold mt-1">{players.length}</h3>
            </div>
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/50 rounded-lg text-blue-600">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/50 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Players</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-600">{activeCount}</h3>
            </div>
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg text-emerald-600">
              <UserCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/50 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Inactive</p>
              <h3 className="text-2xl font-bold mt-1 text-slate-500">{inactiveCount}</h3>
            </div>
            <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600">
              <UserX className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/50 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Avg Balance</p>
              <h3 className="text-2xl font-bold mt-1">
                ${avgBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/50 rounded-lg text-amber-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Players List Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CardTitle className="text-xl">Players List</CardTitle>
              <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">
                {filteredPlayers.length} {filteredPlayers.length === 1 ? 'player' : 'players'}
              </span>
            </div>

            {/* Controls: Search and Status Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Status Filter Buttons */}
              <div className="inline-flex rounded-md border bg-muted/30 p-1 text-xs">
                {(['All', 'Active', 'Inactive'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setStatusFilter(tab)}
                    className={`px-3 py-1 rounded font-medium transition-colors ${
                      statusFilter === tab
                        ? 'bg-background shadow-xs text-foreground font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab} {tab === 'All' ? `(${players.length})` : tab === 'Active' ? `(${activeCount})` : `(${inactiveCount})`}
                  </button>
                ))}
              </div>

              {/* Search Input with Clear Button */}
              <div className="relative w-full sm:w-[260px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search-players-input"
                  placeholder="Search players..."
                  className="pl-8 pr-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                    title="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>VIP Tier</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlayers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    <p className="text-base font-medium">No players found</p>
                    <p className="text-sm mt-1">
                      {searchQuery
                        ? `No matching records for "${searchQuery}". Try different keywords or reset filters.`
                        : 'No players in this category.'}
                    </p>
                    {(searchQuery || statusFilter !== 'All') && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => {
                          setSearchQuery('');
                          setStatusFilter('All');
                        }}
                      >
                        Reset Filters
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredPlayers.map((player) => (
                  <TableRow key={player.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs">
                          {player.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span>{player.name}</span>
                          {player.country && (
                            <span className="text-[10px] text-muted-foreground ml-1.5 font-normal">
                              ({player.country})
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {player.email}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleToggleStatus(player)}
                        title="Click to toggle status"
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-transform hover:scale-105 active:scale-95 ${
                          player.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${player.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {player.status}
                      </button>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                        player.tier === 'VIP' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200' :
                        player.tier === 'Gold' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200' :
                        player.tier === 'Silver' ? 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300' :
                        'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                      }`}>
                        {player.tier || 'Bronze'}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      ${(player.balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {player.lastLogin}
                    </TableCell>
                    <TableCell className="text-right">
                      {/* Action Popover Menu */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-muted"
                            title="Actions menu"
                          >
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Actions for {player.name}</span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-48 p-1.5 shadow-md">
                          <div className="flex flex-col space-y-0.5">
                            <button
                              onClick={() => handleOpenDetails(player)}
                              className="flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-sm hover:bg-accent text-left transition-colors"
                            >
                              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                              View Details
                            </button>
                            <button
                              onClick={() => handleOpenEdit(player)}
                              className="flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-sm hover:bg-accent text-left transition-colors"
                            >
                              <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                              Edit Player
                            </button>
                            <button
                              onClick={() => handleToggleStatus(player)}
                              className="flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-sm hover:bg-accent text-left transition-colors"
                            >
                              {player.status === 'Active' ? (
                                <ToggleLeft className="h-3.5 w-3.5 text-amber-500" />
                              ) : (
                                <ToggleRight className="h-3.5 w-3.5 text-emerald-500" />
                              )}
                              Set as {player.status === 'Active' ? 'Inactive' : 'Active'}
                            </button>
                            <div className="h-px bg-border my-1" />
                            <button
                              onClick={() => handleOpenDelete(player)}
                              className="flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-sm hover:bg-destructive/10 text-destructive text-left transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                              Delete Player
                            </button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ================= MODAL: ADD PLAYER ================= */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Add New Player</DialogTitle>
            <DialogDescription>
              Register a new player account with status, VIP tier, and opening balance.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddPlayer} className="space-y-4 py-2">
            {formError && (
              <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-md dark:bg-rose-950 dark:border-rose-900 dark:text-rose-300">
                {formError}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="add-player-name">Full Name *</Label>
              <Input
                id="add-player-name"
                placeholder="e.g. Robert Vance"
                value={formData.name}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, name: e.target.value }));
                  setFormError('');
                }}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="add-player-email">Email Address *</Label>
              <Input
                id="add-player-email"
                type="email"
                placeholder="robert.v@example.com"
                value={formData.email}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, email: e.target.value }));
                  setFormError('');
                }}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="add-player-status">Account Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val: 'Active' | 'Inactive') =>
                    setFormData(prev => ({ ...prev, status: val }))
                  }
                >
                  <SelectTrigger id="add-player-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="add-player-tier">VIP Tier</Label>
                <Select
                  value={formData.tier}
                  onValueChange={(val: 'Bronze' | 'Silver' | 'Gold' | 'VIP') =>
                    setFormData(prev => ({ ...prev, tier: val }))
                  }
                >
                  <SelectTrigger id="add-player-tier">
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bronze">Bronze</SelectItem>
                    <SelectItem value="Silver">Silver</SelectItem>
                    <SelectItem value="Gold">Gold</SelectItem>
                    <SelectItem value="VIP">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="add-player-balance">Opening Balance ($)</Label>
                <Input
                  id="add-player-balance"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="100.00"
                  value={formData.balance}
                  onChange={(e) => setFormData(prev => ({ ...prev, balance: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="add-player-country">Country Code</Label>
                <Input
                  id="add-player-country"
                  maxLength={2}
                  placeholder="US, CA, GB, DE"
                  value={formData.country}
                  onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value.toUpperCase() }))}
                />
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddOpen(false);
                  resetAddForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                Add Player
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ================= MODAL: EDIT PLAYER ================= */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Edit Player</DialogTitle>
            <DialogDescription>
              Update player profile, tier status, and account settings.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEdit} className="space-y-4 py-2">
            {editError && (
              <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-md dark:bg-rose-950 dark:border-rose-900 dark:text-rose-300">
                {editError}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="edit-player-name">Full Name *</Label>
              <Input
                id="edit-player-name"
                value={editFormData.name}
                onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-player-email">Email Address *</Label>
              <Input
                id="edit-player-email"
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-player-status">Status</Label>
                <Select
                  value={editFormData.status}
                  onValueChange={(val: 'Active' | 'Inactive') =>
                    setEditFormData(prev => ({ ...prev, status: val }))
                  }
                >
                  <SelectTrigger id="edit-player-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-player-tier">VIP Tier</Label>
                <Select
                  value={editFormData.tier}
                  onValueChange={(val: 'Bronze' | 'Silver' | 'Gold' | 'VIP') =>
                    setEditFormData(prev => ({ ...prev, tier: val }))
                  }
                >
                  <SelectTrigger id="edit-player-tier">
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bronze">Bronze</SelectItem>
                    <SelectItem value="Silver">Silver</SelectItem>
                    <SelectItem value="Gold">Gold</SelectItem>
                    <SelectItem value="VIP">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-player-balance">Balance ($)</Label>
                <Input
                  id="edit-player-balance"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editFormData.balance}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, balance: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-player-country">Country</Label>
                <Input
                  id="edit-player-country"
                  maxLength={2}
                  value={editFormData.country}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, country: e.target.value.toUpperCase() }))}
                />
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ================= MODAL: VIEW DETAILS ================= */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Player Profile</DialogTitle>
            <DialogDescription>
              Complete operational record and account telemetry.
            </DialogDescription>
          </DialogHeader>

          {selectedPlayer && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg">
                <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-base">
                  {selectedPlayer.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-semibold text-base">{selectedPlayer.name}</h4>
                  <p className="text-xs text-muted-foreground">{selectedPlayer.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2.5 rounded border bg-card">
                  <span className="text-xs text-muted-foreground">Account Status</span>
                  <div className="font-medium mt-0.5">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                      selectedPlayer.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {selectedPlayer.status}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded border bg-card">
                  <span className="text-xs text-muted-foreground">VIP Tier</span>
                  <div className="font-semibold mt-0.5">{selectedPlayer.tier || 'Bronze'}</div>
                </div>

                <div className="p-2.5 rounded border bg-card">
                  <span className="text-xs text-muted-foreground">Current Balance</span>
                  <div className="font-semibold text-emerald-600 mt-0.5">
                    ${(selectedPlayer.balance ?? 0).toFixed(2)}
                  </div>
                </div>

                <div className="p-2.5 rounded border bg-card">
                  <span className="text-xs text-muted-foreground">Country Code</span>
                  <div className="font-semibold mt-0.5">{selectedPlayer.country || 'US'}</div>
                </div>

                <div className="p-2.5 rounded border bg-card">
                  <span className="text-xs text-muted-foreground">Last Login</span>
                  <div className="text-xs font-mono mt-0.5">{selectedPlayer.lastLogin}</div>
                </div>

                <div className="p-2.5 rounded border bg-card">
                  <span className="text-xs text-muted-foreground">Registered</span>
                  <div className="text-xs font-mono mt-0.5">{selectedPlayer.registeredAt || '2024-01-01'}</div>
                </div>
              </div>

              <DialogFooter className="pt-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    handleToggleStatus(selectedPlayer);
                    setSelectedPlayer(prev => prev ? ({
                      ...prev,
                      status: prev.status === 'Active' ? 'Inactive' : 'Active'
                    }) : null);
                  }}
                >
                  Toggle to {selectedPlayer.status === 'Active' ? 'Inactive' : 'Active'}
                </Button>
                <Button onClick={() => setIsDetailsOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ================= MODAL: DELETE CONFIRMATION ================= */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Player</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this player? This action will remove them from the operational roster.
            </DialogDescription>
          </DialogHeader>

          {selectedPlayer && (
            <div className="py-2 text-sm">
              <p>
                Removing <strong className="font-semibold">{selectedPlayer.name}</strong> ({selectedPlayer.email}).
              </p>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              Delete Player
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================= MODAL: IMPORT REAL PLAYERS ================= */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Import Real Player Data
            </DialogTitle>
            <DialogDescription>
              Upload or paste a real player export file (CSV, JSON, or SQL dump) to sync into the PostgreSQL database.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleImportSubmit} className="space-y-4 py-2">
            {importError && (
              <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-200 rounded-md">
                {importError}
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="import-file" className="text-xs font-medium">Select File (.csv, .json, .sql)</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={loadSampleData}
                  className="text-xs text-primary hover:text-primary/80 h-7 px-2"
                >
                  <FileText className="h-3.5 w-3.5 mr-1" />
                  Load Sample Export (10 Players)
                </Button>
              </div>
              <Input
                id="import-file"
                type="file"
                accept=".csv,.json,.sql,text/csv,application/json"
                onChange={handleFileUpload}
                className="cursor-pointer file:cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="import-textarea" className="text-xs font-medium">Or Paste Data Directly</Label>
              <Textarea
                id="import-textarea"
                rows={8}
                value={importContent}
                onChange={(e) => setImportContent(e.target.value)}
                placeholder="Paste CSV, JSON array, or SQL statements here..."
                className="font-mono text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Supported columns: <code>id, name, email, status, vip_tier, balance, currency, country, last_login</code>
              </p>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsImportOpen(false)}
                disabled={importLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={importLoading || !importContent.trim()}
                className="gap-2"
              >
                {importLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Import to Database
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}