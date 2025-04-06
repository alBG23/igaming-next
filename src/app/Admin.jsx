import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import {
  Users,
  Shield,
  Settings,
  Key,
  Database,
  Globe,
  Bell,
  Lock,
  FileText,
  Mail,
  UserPlus,
  AlertTriangle,
  CheckCircle2,
  PlusCircle,
  RefreshCw,
  XCircle
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import AuthGuard from '../components/auth/AuthGuard';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('users');
  const [isLoading, setIsLoading] = useState(false);
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  
  // Mock user data
  const [users, setUsers] = useState([
    { id: 1, name: 'John Smith', email: 'john@example.com', role: 'admin', status: 'active', lastLogin: '2023-07-20T10:30:00Z' },
    { id: 2, name: 'Emma Davis', email: 'emma@partner.com', role: 'client', status: 'active', lastLogin: '2023-07-19T14:45:00Z' },
    { id: 3, name: 'Michael Brown', email: 'michael@example.com', role: 'client', status: 'active', lastLogin: '2023-07-18T09:15:00Z' },
    { id: 4, name: 'Sarah Wilson', email: 'sarah@partner.com', role: 'client', status: 'inactive', lastLogin: '2023-06-30T16:20:00Z' },
    { id: 5, name: 'David Lee', email: 'david@example.com', role: 'admin', status: 'active', lastLogin: '2023-07-21T11:05:00Z' }
  ]);
  
  // System settings
  const [settings, setSettings] = useState({
    security: {
      requireMfa: true,
      sessionTimeout: 30,
      passwordPolicy: 'strong',
      ipRestriction: false,
      allowedIps: ''
    },
    integrations: {
      databaseConnected: true,
      gitHubConnected: false,
      apiKeysEnabled: true
    },
    notifications: {
      emailAlerts: true,
      slackIntegration: false,
      slackWebhook: '',
      alertOnLoginAttempts: true,
      alertOnDataChanges: true
    },
    dataRetention: {
      analyticsDataRetention: 90,
      userLogsRetention: 30,
      automaticBackups: true,
      backupFrequency: 'daily'
    }
  });
  
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'client'
  });
  
  useEffect(() => {
    // Filter users based on search term
    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  const handleAddUser = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const newId = users.length > 0 ? Math.max(...users.map(user => user.id)) + 1 : 1;
      
      const userToAdd = {
        ...newUser,
        id: newId,
        status: 'active',
        lastLogin: null
      };
      
      setUsers([...users, userToAdd]);
      setNewUser({ name: '', email: '', role: 'client' });
      setShowAddUserDialog(false);
      setIsLoading(false);
    }, 1000);
  };
  
  const handleDeleteUser = () => {
    if (!userToDelete) return;
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const updatedUsers = users.filter(user => user.id !== userToDelete.id);
      setUsers(updatedUsers);
      setShowConfirmDeleteDialog(false);
      setUserToDelete(null);
      setIsLoading(false);
    }, 1000);
  };
  
  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  return (
    <AuthGuard allowedRoles={['admin']} redirectTo="ClientLogin">
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Shield className="mr-2 h-6 w-6 text-red-600" /> 
              Admin Settings
            </h1>
            <p className="text-gray-500 mt-1">
              Manage users, security settings, and system configuration
            </p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" /> Users
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Lock className="h-4 w-4" /> Security
              </TabsTrigger>
              <TabsTrigger value="integrations" className="flex items-center gap-2">
                <Database className="h-4 w-4" /> Integrations
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" /> Notifications
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="users" className="space-y-4 mt-6">
              <div className="flex justify-between items-center">
                <div className="relative w-full max-w-sm">
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                </div>
                
                <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-red-600 hover:bg-red-700">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New User</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input 
                          id="name" 
                          placeholder="John Smith"
                          value={newUser.name}
                          onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input 
                          id="email" 
                          type="email"
                          placeholder="john@example.com"
                          value={newUser.email}
                          onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select 
                          value={newUser.role} 
                          onValueChange={(value) => setNewUser({...newUser, role: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Administrator</SelectItem>
                            <SelectItem value="client">Client</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Alert className="bg-blue-50 border-blue-200">
                        <AlertDescription className="text-blue-800">
                          An invitation email will be sent to this user with instructions to set their password.
                        </AlertDescription>
                      </Alert>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowAddUserDialog(false)}>
                        Cancel
                      </Button>
                      <Button 
                        className="bg-red-600 hover:bg-red-700"
                        onClick={handleAddUser}
                        disabled={!newUser.name || !newUser.email || isLoading}
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add User
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                <Dialog open={showConfirmDeleteDialog} onOpenChange={setShowConfirmDeleteDialog}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm User Deletion</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <p className="text-gray-500">
                        Are you sure you want to delete the user <span className="font-semibold">{userToDelete?.name}</span>? 
                        This action cannot be undone.
                      </p>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowConfirmDeleteDialog(false)}>
                        Cancel
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={handleDeleteUser}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 mr-2" />
                            Delete User
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    Manage user accounts and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge className={user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}>
                              {user.role === 'admin' ? 'Administrator' : 'Client'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {user.status === 'active' ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => {
                                  setUserToDelete(user);
                                  setShowConfirmDeleteDialog(true);
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="security" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lock className="mr-2 h-5 w-5 text-red-600" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>
                    Configure security policies and access controls
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium">Authentication</h3>
                    <Separator />
                    
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <Label htmlFor="requireMfa" className="font-medium">Require Two-Factor Authentication</Label>
                        <p className="text-sm text-gray-500">Enforce MFA for all admin accounts</p>
                      </div>
                      <Switch 
                        id="requireMfa" 
                        checked={settings.security.requireMfa}
                        onCheckedChange={(checked) => handleSettingChange('security', 'requireMfa', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between py-2">
                      <div className="mr-4">
                        <Label htmlFor="sessionTimeout" className="font-medium">Session Timeout (minutes)</Label>
                        <p className="text-sm text-gray-500">Automatically log out inactive users</p>
                      </div>
                      <Select 
                        id="sessionTimeout" 
                        value={settings.security.sessionTimeout.toString()} 
                        onValueChange={(value) => handleSettingChange('security', 'sessionTimeout', parseInt(value))}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between py-2">
                      <div className="mr-4">
                        <Label htmlFor="passwordPolicy" className="font-medium">Password Policy</Label>
                        <p className="text-sm text-gray-500">Set minimum password complexity requirements</p>
                      </div>
                      <Select 
                        id="passwordPolicy" 
                        value={settings.security.passwordPolicy} 
                        onValueChange={(value) => handleSettingChange('security', 'passwordPolicy', value)}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Basic</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="strong">Strong</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-3 py-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="ipRestriction" className="font-medium">IP Address Restriction</Label>
                          <p className="text-sm text-gray-500">Limit access to specific IP addresses</p>
                        </div>
                        <Switch 
                          id="ipRestriction" 
                          checked={settings.security.ipRestriction}
                          onCheckedChange={(checked) => handleSettingChange('security', 'ipRestriction', checked)}
                        />
                      </div>
                      
                      {settings.security.ipRestriction && (
                        <div className="mt-2">
                          <Label htmlFor="allowedIps" className="text-sm">Allowed IP Addresses</Label>
                          <p className="text-xs text-gray-500 mb-1">Enter comma-separated IP addresses or CIDR ranges</p>
                          <Input 
                            id="allowedIps" 
                            placeholder="192.168.1.1, 10.0.0.0/24" 
                            value={settings.security.allowedIps}
                            onChange={(e) => handleSettingChange('security', 'allowedIps', e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <Button className="bg-red-600 hover:bg-red-700">
                      Save Security Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="integrations" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="mr-2 h-5 w-5 text-red-600" />
                    System Integrations
                  </CardTitle>
                  <CardDescription>
                    Configure connections to external systems
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <h3 className="font-medium">Database Connection</h3>
                        <p className="text-sm text-gray-500">Connection to SoftSwiss replica database</p>
                      </div>
                      <Badge className={
                        settings.integrations.databaseConnected 
                          ? "bg-green-100 text-green-800 flex items-center gap-1" 
                          : "bg-amber-100 text-amber-800 flex items-center gap-1"
                      }>
                        {settings.integrations.databaseConnected ? (
                          <>
                            <span className="h-2 w-2 rounded-full bg-green-500"></span>
                            Connected
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="h-3 w-3" />
                            Not Connected
                          </>
                        )}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <h3 className="font-medium">GitHub Integration</h3>
                        <p className="text-sm text-gray-500">Connect to GitHub for version control</p>
                      </div>
                      <Badge className={
                        settings.integrations.gitHubConnected 
                          ? "bg-green-100 text-green-800 flex items-center gap-1" 
                          : "bg-amber-100 text-amber-800 flex items-center gap-1"
                      }>
                        {settings.integrations.gitHubConnected ? (
                          <>
                            <span className="h-2 w-2 rounded-full bg-green-500"></span>
                            Connected
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="h-3 w-3" />
                            Not Connected
                          </>
                        )}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <h3 className="font-medium">API Access Keys</h3>
                        <p className="text-sm text-gray-500">Enable external API access</p>
                      </div>
                      <Switch 
                        checked={settings.integrations.apiKeysEnabled}
                        onCheckedChange={(checked) => handleSettingChange('integrations', 'apiKeysEnabled', checked)}
                      />
                    </div>
                    
                    {settings.integrations.apiKeysEnabled && (
                      <div className="bg-gray-50 p-4 rounded-md mt-2">
                        <h4 className="font-medium mb-2">API Keys</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Key Name</TableHead>
                              <TableHead>Created</TableHead>
                              <TableHead>Expires</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell>Production Key</TableCell>
                              <TableCell>Jul 15, 2023</TableCell>
                              <TableCell>Never</TableCell>
                              <TableCell>
                                <Button variant="outline" size="sm">Revoke</Button>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Development Key</TableCell>
                              <TableCell>Jul 20, 2023</TableCell>
                              <TableCell>Aug 20, 2023</TableCell>
                              <TableCell>
                                <Button variant="outline" size="sm">Revoke</Button>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                        <Button className="mt-4" variant="outline" size="sm">
                          <Key className="h-4 w-4 mr-2" />
                          Generate New API Key
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-2">
                    <Button className="bg-red-600 hover:bg-red-700">
                      Save Integration Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="mr-2 h-5 w-5 text-red-600" />
                    Notification Settings
                  </CardTitle>
                  <CardDescription>
                    Configure notifications and alerts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium">Notification Channels</h3>
                    <Separator />
                    
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <Label className="font-medium">Email Notifications</Label>
                        <p className="text-sm text-gray-500">Send alerts and reports via email</p>
                      </div>
                      <Switch 
                        checked={settings.notifications.emailAlerts}
                        onCheckedChange={(checked) => handleSettingChange('notifications', 'emailAlerts', checked)}
                      />
                    </div>
                    
                    <div className="space-y-3 py-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Slack Integration</Label>
                          <p className="text-sm text-gray-500">Send alerts to Slack channel</p>
                        </div>
                        <Switch 
                          checked={settings.notifications.slackIntegration}
                          onCheckedChange={(checked) => handleSettingChange('notifications', 'slackIntegration', checked)}
                        />
                      </div>
                      
                      {settings.notifications.slackIntegration && (
                        <div className="mt-2">
                          <Label htmlFor="slackWebhook" className="text-sm">Slack Webhook URL</Label>
                          <p className="text-xs text-gray-500 mb-1">Enter your Slack incoming webhook URL</p>
                          <Input 
                            id="slackWebhook" 
                            placeholder="https://hooks.slack.com/services/..." 
                            value={settings.notifications.slackWebhook}
                            onChange={(e) => handleSettingChange('notifications', 'slackWebhook', e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium">Notification Events</h3>
                    <Separator />
                    
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <Label className="font-medium">Failed Login Attempts</Label>
                        <p className="text-sm text-gray-500">Notify when multiple login failures are detected</p>
                      </div>
                      <Switch 
                        checked={settings.notifications.alertOnLoginAttempts}
                        onCheckedChange={(checked) => handleSettingChange('notifications', 'alertOnLoginAttempts', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <Label className="font-medium">Data Change Alerts</Label>
                        <p className="text-sm text-gray-500">Notify when critical data is modified</p>
                      </div>
                      <Switch 
                        checked={settings.notifications.alertOnDataChanges}
                        onCheckedChange={(checked) => handleSettingChange('notifications', 'alertOnDataChanges', checked)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium">Scheduled Reports</h3>
                    <Separator />
                    
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Report Name</TableHead>
                          <TableHead>Frequency</TableHead>
                          <TableHead>Recipients</TableHead>
                          <TableHead>Last Sent</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>Weekly Analytics Summary</TableCell>
                          <TableCell>Every Monday</TableCell>
                          <TableCell>admin@example.com</TableCell>
                          <TableCell>Jul 17, 2023</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">Edit</Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Monthly Revenue Report</TableCell>
                          <TableCell>1st of month</TableCell>
                          <TableCell>admin@example.com, finance@example.com</TableCell>
                          <TableCell>Jul 1, 2023</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">Edit</Button>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                    
                    <Button variant="outline" size="sm">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Scheduled Report
                    </Button>
                  </div>
                  
                  <div className="pt-2">
                    <Button className="bg-red-600 hover:bg-red-700">
                      Save Notification Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  );
}