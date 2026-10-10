'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2,
  AlertCircle,
  X,
  Shield,
  Key,
  Copy,
  Check,
  Bell,
  RefreshCw,
  QrCode,
  Lock,
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // General Settings State
  const [fullName, setFullName] = useState('Admin Operator');
  const [email, setEmail] = useState('admin@example.com');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [isSavingGeneral, setIsSavingGeneral] = useState(false);

  // Security Settings State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30m');
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [ipWhitelisting, setIpWhitelisting] = useState(false);
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);

  // 2FA Setup Modal State
  const [is2FaModalOpen, setIs2FaModalOpen] = useState(false);
  const [twoFaCode, setTwoFaCode] = useState('');
  const [twoFaError, setTwoFaError] = useState('');

  // Backup Codes Modal State
  const [isBackupCodesOpen, setIsBackupCodesOpen] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedCodes, setCopiedCodes] = useState(false);

  // Notification Settings State
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [performanceDigest, setPerformanceDigest] = useState(true);
  const [systemUptimeAlerts, setSystemUptimeAlerts] = useState(true);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);

  // Load saved settings from localStorage
  useEffect(() => {
    try {
      const storedGeneral = localStorage.getItem('igaming_settings_general');
      if (storedGeneral) {
        const parsed = JSON.parse(storedGeneral);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.fullName) setFullName(parsed.fullName);
        if (parsed.timezone) setTimezone(parsed.timezone);
      }

      const storedSecurity = localStorage.getItem('igaming_settings_security');
      if (storedSecurity) {
        const parsed = JSON.parse(storedSecurity);
        if (typeof parsed.twoFactorEnabled === 'boolean') setTwoFactorEnabled(parsed.twoFactorEnabled);
        if (parsed.sessionTimeout) setSessionTimeout(parsed.sessionTimeout);
        if (typeof parsed.loginAlerts === 'boolean') setLoginAlerts(parsed.loginAlerts);
        if (typeof parsed.ipWhitelisting === 'boolean') setIpWhitelisting(parsed.ipWhitelisting);
      }

      const storedNotifications = localStorage.getItem('igaming_settings_notifications');
      if (storedNotifications) {
        const parsed = JSON.parse(storedNotifications);
        if (typeof parsed.emailNotifications === 'boolean') setEmailNotifications(parsed.emailNotifications);
        if (typeof parsed.securityAlerts === 'boolean') setSecurityAlerts(parsed.securityAlerts);
        if (typeof parsed.performanceDigest === 'boolean') setPerformanceDigest(parsed.performanceDigest);
        if (typeof parsed.systemUptimeAlerts === 'boolean') setSystemUptimeAlerts(parsed.systemUptimeAlerts);
      }
    } catch {
      // Ignore load errors
    }
  }, []);

  // Auto-dismiss feedback message
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const showNotification = (type: 'success' | 'error' | 'info', text: string) => {
    setFeedback({ type, text });
  };

  // Save General Settings
  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      showNotification('error', 'Please enter a valid email address.');
      return;
    }
    if (newPassword && newPassword.length < 6) {
      showNotification('error', 'New password must be at least 6 characters long.');
      return;
    }

    setIsSavingGeneral(true);
    setTimeout(() => {
      try {
        const data = { fullName, email, timezone };
        localStorage.setItem('igaming_settings_general', JSON.stringify(data));
        showNotification('success', 'General account settings saved successfully!');
        setCurrentPassword('');
        setNewPassword('');
      } catch {
        showNotification('error', 'Failed to save general settings.');
      } finally {
        setIsSavingGeneral(false);
      }
    }, 400);
  };

  // Toggle 2FA switch
  const handleToggle2Fa = (checked: boolean) => {
    if (checked) {
      setIs2FaModalOpen(true);
    } else {
      setTwoFactorEnabled(false);
      try {
        const existing = JSON.parse(localStorage.getItem('igaming_settings_security') || '{}');
        localStorage.setItem('igaming_settings_security', JSON.stringify({ ...existing, twoFactorEnabled: false }));
      } catch {}
      showNotification('info', 'Two-Factor Authentication has been disabled.');
    }
  };

  // Confirm 2FA setup
  const handleConfirm2Fa = () => {
    if (twoFaCode.trim().length !== 6 || !/^\d+$/.test(twoFaCode.trim())) {
      setTwoFaError('Please enter a 6-digit numeric verification code.');
      return;
    }

    setTwoFactorEnabled(true);
    setIs2FaModalOpen(false);
    setTwoFaCode('');
    setTwoFaError('');

    try {
      const existing = JSON.parse(localStorage.getItem('igaming_settings_security') || '{}');
      localStorage.setItem('igaming_settings_security', JSON.stringify({ ...existing, twoFactorEnabled: true }));
    } catch {}

    showNotification('success', 'Two-Factor Authentication activated successfully!');
  };

  // Save Security Settings
  const handleSaveSecurity = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingSecurity(true);
    setTimeout(() => {
      try {
        const data = {
          twoFactorEnabled,
          sessionTimeout,
          loginAlerts,
          ipWhitelisting,
        };
        localStorage.setItem('igaming_settings_security', JSON.stringify(data));
        showNotification(
          'success',
          `Security settings updated! 2FA is ${twoFactorEnabled ? 'Enabled' : 'Disabled'}. Session timeout set to ${sessionTimeout}.`
        );
      } catch {
        showNotification('error', 'Failed to save security settings.');
      } finally {
        setIsSavingSecurity(false);
      }
    }, 400);
  };

  // Generate Backup Codes
  const handleGenerateBackupCodes = () => {
    const codes = Array.from({ length: 8 }, () =>
      Math.random().toString(36).substring(2, 6).toUpperCase() + '-' +
      Math.random().toString(36).substring(2, 6).toUpperCase()
    );
    setBackupCodes(codes);
    setCopiedCodes(false);
    setIsBackupCodesOpen(true);
  };

  const handleCopyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 3000);
    showNotification('success', 'Backup recovery codes copied to clipboard.');
  };

  // Save Notification Settings
  const handleSaveNotifications = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingNotifications(true);
    setTimeout(() => {
      try {
        const data = {
          emailNotifications,
          securityAlerts,
          performanceDigest,
          systemUptimeAlerts,
        };
        localStorage.setItem('igaming_settings_notifications', JSON.stringify(data));
        showNotification('success', 'Notification preferences saved successfully!');
      } catch {
        showNotification('error', 'Failed to save notifications.');
      } finally {
        setIsSavingNotifications(false);
      }
    }, 400);
  };

  // Send Test Notification
  const handleSendTestNotification = () => {
    showNotification(
      'info',
      'Test notification triggered! Email and system alerts are configured and operational.'
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Toast Feedback Banner */}
      {feedback && (
        <div
          role="alert"
          className={`flex items-center justify-between p-4 rounded-lg shadow-sm transition-all duration-300 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-200'
              : feedback.type === 'error'
              ? 'bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-200'
              : 'bg-blue-50 border border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            ) : feedback.type === 'error' ? (
              <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            ) : (
              <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            )}
            <span className="text-sm font-medium">{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="p-1 hover:bg-black/5 rounded-md"
            aria-label="Dismiss feedback"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure administration preferences, security policies, and system notification rules.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* ================= GENERAL TAB ================= */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage your administrator profile and workspace parameters.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveGeneral} className="space-y-4 max-w-xl">
                <div className="space-y-2">
                  <Label htmlFor="fullname">Full Name</Label>
                  <Input
                    id="fullname"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Administrator Name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password (optional)</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone-select">Workspace Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger id="timezone-select">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC (Coordinated Universal Time)</SelectItem>
                      <SelectItem value="America/New_York">EST (Eastern Standard Time)</SelectItem>
                      <SelectItem value="America/Los_Angeles">PST (Pacific Standard Time)</SelectItem>
                      <SelectItem value="Europe/London">GMT / BST (London)</SelectItem>
                      <SelectItem value="Europe/Berlin">CET (Central European Time)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-2">
                  <Button type="submit" disabled={isSavingGeneral} className="gap-2">
                    {isSavingGeneral ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================= SECURITY TAB ================= */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your security preferences, authentication factors, and session controls.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 max-w-2xl">
              {/* 2FA Switch */}
              <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/20">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="two-factor-switch" className="font-semibold text-base cursor-pointer">
                      Two-Factor Authentication (2FA)
                    </Label>
                    {twoFactorEnabled ? (
                      <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium dark:bg-emerald-950 dark:text-emerald-300">
                        Active
                      </span>
                    ) : (
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium dark:bg-slate-800 dark:text-slate-400">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Protect your administrative account with authenticator application TOTP codes.
                  </p>
                </div>
                <Switch
                  id="two-factor-switch"
                  checked={twoFactorEnabled}
                  onCheckedChange={handleToggle2Fa}
                />
              </div>

              {/* Session Timeout */}
              <div className="space-y-2">
                <Label htmlFor="session-timeout">Administrative Session Timeout</Label>
                <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
                  <SelectTrigger id="session-timeout" className="w-full sm:w-[320px]">
                    <SelectValue placeholder="Select session timeout" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15m">15 Minutes (High Security)</SelectItem>
                    <SelectItem value="30m">30 Minutes (Recommended)</SelectItem>
                    <SelectItem value="1h">1 Hour</SelectItem>
                    <SelectItem value="4h">4 Hours</SelectItem>
                    <SelectItem value="8h">8 Hours</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Inactivity threshold before re-authenticating the operator session.
                </p>
              </div>

              {/* Suspicious Login Alerts */}
              <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/20">
                <div className="space-y-0.5">
                  <Label htmlFor="login-alerts-switch" className="font-medium cursor-pointer">
                    Suspicious Sign-in Alerts
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Send immediate notification when sign-in is detected from a new browser or location.
                  </p>
                </div>
                <Switch
                  id="login-alerts-switch"
                  checked={loginAlerts}
                  onCheckedChange={setLoginAlerts}
                />
              </div>

              {/* Backup Codes Action */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-dashed">
                <div className="space-y-0.5">
                  <Label className="font-medium">Emergency Backup Recovery Codes</Label>
                  <p className="text-sm text-muted-foreground">
                    Generate one-time recovery codes to access your account if your device is unavailable.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateBackupCodes}
                  className="gap-2"
                >
                  <Key className="h-4 w-4" />
                  Generate Codes
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <Button
                  id="update-security-btn"
                  onClick={() => handleSaveSecurity()}
                  disabled={isSavingSecurity}
                  className="gap-2"
                >
                  {isSavingSecurity ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                  Update Security Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================= NOTIFICATIONS TAB ================= */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage alert routing, system digests, and event subscriptions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 max-w-2xl">
              <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/20">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notif-switch" className="font-medium cursor-pointer">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive operational digests and critical reports via email.
                  </p>
                </div>
                <Switch
                  id="email-notif-switch"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/20">
                <div className="space-y-0.5">
                  <Label htmlFor="sec-alert-switch" className="font-medium cursor-pointer">
                    Security & Fraud Alerts
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Immediate alerts for VIP risk anomalies and large withdrawal events.
                  </p>
                </div>
                <Switch
                  id="sec-alert-switch"
                  checked={securityAlerts}
                  onCheckedChange={setSecurityAlerts}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/20">
                <div className="space-y-0.5">
                  <Label htmlFor="uptime-alert-switch" className="font-medium cursor-pointer">
                    Render Cloud Uptime Alerts
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Automated pings when keepalive heartbeat detects backend cold starts.
                  </p>
                </div>
                <Switch
                  id="uptime-alert-switch"
                  checked={systemUptimeAlerts}
                  onCheckedChange={setSystemUptimeAlerts}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/20">
                <div className="space-y-0.5">
                  <Label htmlFor="perf-digest-switch" className="font-medium cursor-pointer">
                    Weekly Performance Digest
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Executive summary of NGR, GGR, acquisition conversion, and cohort retention.
                  </p>
                </div>
                <Switch
                  id="perf-digest-switch"
                  checked={performanceDigest}
                  onCheckedChange={setPerformanceDigest}
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <Button
                  id="save-notifications-btn"
                  onClick={() => handleSaveNotifications()}
                  disabled={isSavingNotifications}
                  className="gap-2"
                >
                  {isSavingNotifications ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
                  Save Notification Settings
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSendTestNotification}
                  className="gap-2"
                >
                  <Bell className="h-4 w-4" />
                  Send Test Notification
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ================= MODAL: 2FA SETUP ================= */}
      <Dialog open={is2FaModalOpen} onOpenChange={setIs2FaModalOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              Setup Two-Factor Authentication
            </DialogTitle>
            <DialogDescription>
              Scan the QR code with Google Authenticator, Authy, or 1Password to activate 2FA.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-lg border">
              {/* QR Code Placeholder Graphic */}
              <div className="h-36 w-36 bg-white p-3 rounded-md shadow-xs flex items-center justify-center border">
                <div className="grid grid-cols-4 gap-1.5 w-full h-full">
                  <div className="bg-slate-900 rounded-xs" />
                  <div className="bg-slate-900 rounded-xs" />
                  <div className="bg-slate-200 rounded-xs" />
                  <div className="bg-slate-900 rounded-xs" />
                  <div className="bg-slate-900 rounded-xs" />
                  <div className="bg-slate-200 rounded-xs" />
                  <div className="bg-slate-900 rounded-xs" />
                  <div className="bg-slate-200 rounded-xs" />
                  <div className="bg-slate-200 rounded-xs" />
                  <div className="bg-slate-900 rounded-xs" />
                  <div className="bg-slate-900 rounded-xs" />
                  <div className="bg-slate-900 rounded-xs" />
                  <div className="bg-slate-900 rounded-xs" />
                  <div className="bg-slate-200 rounded-xs" />
                  <div className="bg-slate-900 rounded-xs" />
                  <div className="bg-slate-900 rounded-xs" />
                </div>
              </div>
              <div className="mt-3 text-center">
                <p className="text-xs text-muted-foreground">Secret Key for Manual Entry:</p>
                <code className="text-xs font-mono font-bold bg-muted px-2 py-0.5 rounded mt-0.5 inline-block">
                  JBSWY3DPEHPK3PXP
                </code>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="twofa-code-input">Enter 6-Digit Code from App</Label>
              <Input
                id="twofa-code-input"
                maxLength={6}
                placeholder="123456"
                className="font-mono tracking-widest text-center text-lg"
                value={twoFaCode}
                onChange={(e) => {
                  setTwoFaCode(e.target.value);
                  setTwoFaError('');
                }}
              />
              {twoFaError && (
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{twoFaError}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIs2FaModalOpen(false);
                setTwoFaCode('');
                setTwoFaError('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirm2Fa}>
              Verify & Enable 2FA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================= MODAL: BACKUP RECOVERY CODES ================= */}
      <Dialog open={isBackupCodesOpen} onOpenChange={setIsBackupCodesOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Emergency Recovery Codes
            </DialogTitle>
            <DialogDescription>
              Store these codes in a safe vault. Each code can be used once to access your account if your authenticator is lost.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <div className="grid grid-cols-2 gap-2 p-3 bg-muted/40 rounded-lg border font-mono text-xs">
              {backupCodes.map((code, idx) => (
                <div key={idx} className="p-2 bg-background rounded border text-center font-semibold">
                  {code}
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={handleCopyBackupCodes}
              className="gap-2"
            >
              {copiedCodes ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              {copiedCodes ? 'Copied!' : 'Copy Codes'}
            </Button>
            <Button onClick={() => setIsBackupCodesOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}