import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Palette, Globe, Database, Save } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

export default function TenantConfig() {
  const { toast } = useToast();
  const [config, setConfig] = useState({
    tenantId: "1",
    subdomain: "tenant1",
    customDomain: "tenant1.com",
    themePrimary: "#3b82f6",
    themeDark: true,
    isolatedSchema: true
  });

  const handleChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    toast({
      title: "Tenant Configuration Saved",
      description: `Settings updated for tenant ${config.subdomain}. Restart required for schema changes.`
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="mr-2 h-5 w-5 text-indigo-600" />
            B2B & White-Label Isolation (P5)
          </CardTitle>
          <CardDescription>
            Configure dedicated subdomain, theming, and database isolation for this tenant
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tenant ID</Label>
              <Input value={config.tenantId} disabled />
            </div>
            <div className="space-y-2">
              <Label>Subdomain Routing</Label>
              <Input 
                value={config.subdomain} 
                onChange={(e) => handleChange("subdomain", e.target.value)}
                placeholder="tenant1"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Custom Domain (CNAME)</Label>
              <Input 
                value={config.customDomain} 
                onChange={(e) => handleChange("customDomain", e.target.value)}
                placeholder="www.brand.com"
              />
            </div>
          </div>

          <div className="space-y-3 py-2 border-t pt-4">
            <h3 className="text-lg font-medium flex items-center"><Palette className="mr-2 h-4 w-4" /> Theme Customization</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Primary Brand Color</Label>
                <div className="flex gap-2">
                  <Input 
                    type="color" 
                    value={config.themePrimary} 
                    onChange={(e) => handleChange("themePrimary", e.target.value)}
                    className="w-16 p-1 h-10"
                  />
                  <Input 
                    value={config.themePrimary} 
                    onChange={(e) => handleChange("themePrimary", e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between mt-6">
                <Label>Force Dark Mode</Label>
                <Switch 
                  checked={config.themeDark}
                  onCheckedChange={(c) => handleChange("themeDark", c)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 py-2 border-t pt-4">
            <h3 className="text-lg font-medium flex items-center"><Database className="mr-2 h-4 w-4" /> Data Isolation</h3>
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Schema-level Isolation</Label>
                <p className="text-sm text-gray-500">Isolate Postgres tables per Tenant ID</p>
              </div>
              <Switch 
                checked={config.isolatedSchema}
                onCheckedChange={(c) => handleChange("isolatedSchema", c)}
              />
            </div>
          </div>
          
          <Button onClick={handleSave} className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700">
            <Save className="mr-2 h-4 w-4" /> Save White-Label Config
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
