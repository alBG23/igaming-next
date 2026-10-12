import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Check, X, RefreshCw, BrainCircuit } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { fetchAuthApi } from "@/lib/api";

export default function KnowledgeCurator() {
  const [proposals, setProposals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const loadProposals = async () => {
    setIsLoading(true);
    try {
      const response = await fetchAuthApi('/api/v1/curator/proposals');
      const data = await response.json();
      setProposals(data.proposals || []);
    } catch (error) {
      toast({
        title: "Error loading proposals",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProposals();
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetchAuthApi('/api/v1/curator/generate?days=7', { method: 'POST' });
      const data = await response.json();
      toast({
        title: "Proposals Generated",
        description: `Successfully generated ${data.generated} new memory proposals.`
      });
      loadProposals();
    } catch (error) {
      toast({
        title: "Generation failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await fetchAuthApi(`/api/v1/curator/proposals/${id}/approve`, { method: 'POST' });
      toast({ title: "Approved", description: "Rule merged into shared AI memory." });
      loadProposals();
    } catch (error) {
      toast({ title: "Approval failed", description: error.message, variant: "destructive" });
    }
  };

  const handleReject = async (id) => {
    try {
      await fetchAuthApi(`/api/v1/curator/proposals/${id}/reject`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: "Rejected by human curator" })
      });
      toast({ title: "Rejected", description: "Proposal discarded." });
      loadProposals();
    } catch (error) {
      toast({ title: "Rejection failed", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Knowledge Refinement Queue</h3>
          <p className="text-sm text-gray-500">
            Tenant-scoped rules learned from operator chat feedback (P3).
          </p>
        </div>
        <Button onClick={handleGenerate} disabled={isGenerating} className="bg-purple-600 hover:bg-purple-700 text-white">
          {isGenerating ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
          Run Knowledge Curation
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Pending Proposals</CardTitle>
          <CardDescription>
            These rules were extracted from operator corrections. Approve them to immediately teach the AI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8"><RefreshCw className="h-8 w-8 animate-spin text-gray-400" /></div>
          ) : proposals.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Check className="mx-auto h-12 w-12 text-green-300 mb-3" />
              <p>Queue is empty. The AI is fully caught up.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>New Rule / Knowledge</TableHead>
                  <TableHead>Reasoning</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proposals.map(p => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <Badge className={p.proposal_type === 'replace' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}>
                        {p.proposal_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-md font-medium text-sm">
                      {p.after_content}
                      {p.proposal_type === 'replace' && (
                        <div className="mt-2 text-xs text-red-500 line-through opacity-70">
                          Was: {p.before_content}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs text-sm text-gray-600">
                      {p.rationale}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => handleReject(p.id)}>
                          <X className="h-4 w-4 mr-1" /> Reject
                        </Button>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleApprove(p.id)}>
                          <Check className="h-4 w-4 mr-1" /> Approve
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
