// This component is not used anymore as functionality is merged into the Dashboard component
import React from 'react';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from 'lucide-react';

export default function ExecutiveDashboard() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6 text-center">
        <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
        <h1 className="text-3xl font-bold text-gray-900">Executive Dashboard Moved</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          The Executive Dashboard has been integrated into the main Dashboard. 
          You can access all executive views from there using the view selector.
        </p>
        <Button asChild>
          <Link to={createPageUrl('Dashboard')}>
            Go to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}