import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HeadphonesIcon, Plus, CheckCircle, Clock } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

export default function SupportTickets() {
  const { toast } = useToast();
  
  // Mock data for B2B Support Tickets
  const [tickets, setTickets] = useState([
    { id: "TKT-100", tenantId: 1, title: "API Rate Limit Exceeded", status: "Open", priority: "High", createdAt: "2026-10-08T10:00:00Z" },
    { id: "TKT-101", tenantId: 1, title: "New operator onboarding", status: "Closed", priority: "Medium", createdAt: "2026-10-07T14:30:00Z" },
    { id: "TKT-200", tenantId: 2, title: "White-label theme missing logo", status: "In Progress", priority: "High", createdAt: "2026-10-08T09:15:00Z" },
  ]);

  const handleCreateTicket = () => {
    toast({
      title: "Create Ticket",
      description: "Opening ticket creation modal..."
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Open': return <Clock className="h-4 w-4 text-amber-500 mr-2" />;
      case 'In Progress': return <Clock className="h-4 w-4 text-blue-500 mr-2" />;
      case 'Closed': return <CheckCircle className="h-4 w-4 text-green-500 mr-2" />;
      default: return null;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High': return <Badge className="bg-red-100 text-red-800">High</Badge>;
      case 'Medium': return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'Low': return <Badge className="bg-blue-100 text-blue-800">Low</Badge>;
      default: return <Badge>{priority}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <HeadphonesIcon className="mr-2 h-5 w-5 text-indigo-600" />
              B2B Support Ticketing (P6)
            </CardTitle>
            <CardDescription>
              Manage cross-tenant support requests and operator issues
            </CardDescription>
          </div>
          <Button onClick={handleCreateTicket} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-2" /> New Ticket
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket ID</TableHead>
                <TableHead>Tenant ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map(ticket => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">{ticket.id}</TableCell>
                  <TableCell>Tenant {ticket.tenantId}</TableCell>
                  <TableCell>{ticket.title}</TableCell>
                  <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {getStatusIcon(ticket.status)}
                      {ticket.status}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">View</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
