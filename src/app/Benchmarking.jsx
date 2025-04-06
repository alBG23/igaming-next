import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  ArrowUpRight, 
  BarChart, 
  BarChart2,
  ArrowDownRight, 
  ChevronDown, 
  Lock, 
  Shield,
  Eye,
  EyeOff,
  AlertTriangle,
  TrendingUp,
  Globe,
  LineChart,
  UserCheck
} from "lucide-react";
import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { User } from '@/api/entities';

export default function Benchmarking() {
  const [activeTab, setActiveTab] = useState("gaming");
  const [sharingPreferences, setSharingPreferences] = useState({
    shareAcquisition: false,
    shareEngagement: false,
    shareRetention: false,
    shareAffiliates: false,
    shareMonetization: false,
    sharePaymentMetrics: false,
    shareGeoData: false
  });
  const [showLockFeatureAlert, setShowLockFeatureAlert] = useState(true);
  const [showPermissionsPanel, setShowPermissionsPanel] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Data sharing confirmation
  const [confirmDataSharing, setConfirmDataSharing] = useState(false);

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
        
        // Load saved sharing preferences from user data
        if (user.data_sharing_preferences) {
          setSharingPreferences(user.data_sharing_preferences);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
      setIsLoading(false);
    };
    
    loadCurrentUser();
  }, []);

  const handleSharingToggle = (key) => {
    setSharingPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const saveSharingPreferences = async () => {
    if (!confirmDataSharing) {
      alert("Please confirm that you understand how your data will be used before proceeding.");
      return;
    }
    
    setIsLoading(true);
    try {
      await User.updateMyUserData({
        data_sharing_preferences: sharingPreferences
      });
      
      alert("Your data sharing preferences have been saved successfully.");
      setShowPermissionsPanel(false);
      setConfirmDataSharing(false);
    } catch (error) {
      console.error("Error saving sharing preferences:", error);
      alert("There was an error saving your preferences. Please try again.");
    }
    setIsLoading(false);
  };

  // Calculate what metrics the user can see based on what they're willing to share
  const canSeeBenchmarks = Object.values(sharingPreferences).some(value => value === true);
  const visibleCategories = Object.keys(sharingPreferences).filter(key => sharingPreferences[key]);

  // Sample benchmark data
  const gamingBenchmarkData = [
    { metric: 'FTD Conversion', yourValue: 8.5, industryAverage: 6.2, topPerformers: 12.1, percentile: 75 },
    { metric: 'Player ARPU', yourValue: 68, industryAverage: 52, topPerformers: 91, percentile: 70 },
    { metric: 'Retention Rate', yourValue: 42, industryAverage: 38, topPerformers: 56, percentile: 65 },
    { metric: 'Deposit Success', yourValue: 92, industryAverage: 88, topPerformers: 97, percentile: 80 },
    { metric: 'Bonus Efficiency', yourValue: 74, industryAverage: 65, topPerformers: 85, percentile: 72 },
  ];
  
  const affiliateBenchmarkData = [
    { metric: 'CPA', yourValue: 65, industryAverage: 75, topPerformers: 50, percentile: 85, compareName: "Lower is better" },
    { metric: 'Revenue Share %', yourValue: 25, industryAverage: 30, topPerformers: 22, percentile: 75, compareName: "Lower is better" },
    { metric: 'Affiliate ROI', yourValue: 210, industryAverage: 180, topPerformers: 250, percentile: 70 },
    { metric: 'Activation Rate', yourValue: 88, industryAverage: 72, topPerformers: 93, percentile: 82 },
    { metric: 'FTD Quality', yourValue: 102, industryAverage: 85, topPerformers: 120, percentile: 78 },
  ];
  
  const retentionBenchmarkData = [
    { metric: 'Day 7 Retention', yourValue: 45, industryAverage: 38, topPerformers: 52, percentile: 76 },
    { metric: 'Day 30 Retention', yourValue: 28, industryAverage: 22, topPerformers: 35, percentile: 72 },
    { metric: 'Day 90 Retention', yourValue: 12, industryAverage: 9, topPerformers: 18, percentile: 65 },
    { metric: 'Churn Rate', yourValue: 5.2, industryAverage: 7.4, topPerformers: 3.8, percentile: 78, compareName: "Lower is better" },
    { metric: 'Winback Rate', yourValue: 18, industryAverage: 12, topPerformers: 25, percentile: 68 },
  ];
  
  const radarData = [
    { subject: 'FTD Conv.', A: 8.5, B: 6.2, C: 12.1, fullMark: 15 },
    { subject: 'ARPU', A: 68, B: 52, C: 91, fullMark: 100 },
    { subject: 'Retention', A: 42, B: 38, C: 56, fullMark: 60 },
    { subject: 'Deposit %', A: 92, B: 88, C: 97, fullMark: 100 },
    { subject: 'Bonus Eff.', A: 74, B: 65, C: 85, fullMark: 100 }
  ];
  
  // Get benchmark data based on active tab
  const getBenchmarkData = () => {
    switch (activeTab) {
      case "gaming":
        return gamingBenchmarkData;
      case "affiliates":
        return affiliateBenchmarkData;
      case "retention":
        return retentionBenchmarkData;
      default:
        return gamingBenchmarkData;
    }
  };
  
  const getPercentileColor = (percentile) => {
    if (percentile >= 80) return 'bg-green-100 text-green-800';
    if (percentile >= 60) return 'bg-blue-100 text-blue-800';
    if (percentile >= 40) return 'bg-amber-100 text-amber-800';
    return 'bg-red-100 text-red-800';
  };
  
  const getComparisonIcon = (value, avg, metric) => {
    // For metrics where lower is better, invert the comparison
    const lowerIsBetter = metric?.compareName === "Lower is better";
    
    if ((value > avg && !lowerIsBetter) || (value < avg && lowerIsBetter)) {
      return <ArrowUpRight className="w-4 h-4 text-green-600" />;
    } else {
      return <ArrowDownRight className="w-4 h-4 text-red-600" />;
    }
  };
  
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Industry Benchmarking</h1>
            <p className="text-gray-500">Compare your performance against industry averages</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setShowPermissionsPanel(true)}
            >
              {canSeeBenchmarks ? (
                <>
                  <UserCheck className="h-4 w-4" />
                  Manage Data Sharing
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Enable Benchmarking
                </>
              )}
            </Button>
          </div>
        </div>

        {!canSeeBenchmarks && showLockFeatureAlert && (
          <Alert className="bg-blue-50 border-blue-200">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <AlertTitle>Benchmarking requires data sharing</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>
                To access industry benchmarks, you need to share your own anonymized data. 
                This is a collaborative feature that enables all participants to benefit from industry insights.
              </p>
              <div className="flex justify-end gap-2 mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowLockFeatureAlert(false)}
                >
                  Dismiss
                </Button>
                <Button 
                  size="sm"
                  onClick={() => setShowPermissionsPanel(true)}
                >
                  Configure Data Sharing
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {canSeeBenchmarks ? (
          <>
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="gaming">Gaming Metrics</TabsTrigger>
                <TabsTrigger value="affiliates">Affiliate Performance</TabsTrigger>
                <TabsTrigger value="retention">Retention & Churn</TabsTrigger>
                <TabsTrigger value="payments">Payment Metrics</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Benchmarks</CardTitle>
                    <CardDescription>
                      How your platform compares to industry averages and top performers
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 font-medium text-sm">
                        <div>Metric</div>
                        <div>Your Value</div>
                        <div>Industry Avg</div>
                        <div>Top Performers</div>
                        <div>Percentile</div>
                      </div>
                      
                      {getBenchmarkData().map((metric) => (
                        <div 
                          key={metric.metric} 
                          className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center py-3 border-b"
                        >
                          <div className="font-medium">
                            {metric.metric}
                            {metric.compareName && (
                              <span className="ml-2 text-xs text-gray-500">({metric.compareName})</span>
                            )}
                          </div>
                          <div className="text-lg font-bold">
                            {metric.yourValue}{metric.metric.includes('Rate') || metric.metric.includes('%') ? '%' : ''}
                          </div>
                          <div className="flex items-center gap-1">
                            {getComparisonIcon(metric.yourValue, metric.industryAverage, metric)}
                            <span>
                              {metric.industryAverage}{metric.metric.includes('Rate') || metric.metric.includes('%') ? '%' : ''}
                            </span>
                          </div>
                          <div>
                            {metric.topPerformers}{metric.metric.includes('Rate') || metric.metric.includes('%') ? '%' : ''}
                          </div>
                          <div>
                            <Badge className={getPercentileColor(metric.percentile)}>
                              {metric.percentile}th percentile
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Benchmark History</CardTitle>
                    <CardDescription>
                      Track how your metrics have evolved over time compared to industry averages
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart
                          data={getBenchmarkData()}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="metric" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="yourValue" name="Your Value" fill="#4f46e5" />
                          <Bar dataKey="industryAverage" name="Industry Average" fill="#94a3b8" />
                          <Bar dataKey="topPerformers" name="Top Performers" fill="#10b981" />
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Competitive Analysis</CardTitle>
                    <CardDescription>
                      Radar chart comparison of key metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="subject" />
                          <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
                          <Radar 
                            name="Your Platform" 
                            dataKey="A" 
                            stroke="#4f46e5" 
                            fill="#4f46e5" 
                            fillOpacity={0.6} 
                          />
                          <Radar 
                            name="Industry Average" 
                            dataKey="B" 
                            stroke="#94a3b8" 
                            fill="#94a3b8" 
                            fillOpacity={0.3} 
                          />
                          <Radar 
                            name="Top Performers" 
                            dataKey="C" 
                            stroke="#10b981" 
                            fill="#10b981" 
                            fillOpacity={0.3} 
                          />
                          <Legend />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="mt-6 space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-900 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-indigo-600" />
                          Benchmark Insights
                        </h3>
                        <p className="text-sm text-gray-600 mt-2">
                          Your platform shows strong performance in Deposit Success Rate (80th percentile) but has opportunity for improvement in Retention Rate (65th percentile).
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-900 flex items-center gap-2">
                          <LineChart className="h-4 w-4 text-indigo-600" />
                          Recommendation
                        </h3>
                        <p className="text-sm text-gray-600 mt-2">
                          Focus on improving player retention strategies to match your strong acquisition metrics. Consider implementing loyalty programs and improved re-engagement campaigns.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-indigo-600" />
                      Regional Comparison
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">North America</span>
                        <Badge className="bg-green-100 text-green-800">+12% above average</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">Europe</span>
                        <Badge className="bg-blue-100 text-blue-800">+5% above average</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">Asia Pacific</span>
                        <Badge className="bg-amber-100 text-amber-800">-3% below average</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">Latin America</span>
                        <Badge className="bg-green-100 text-green-800">+8% above average</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        ) : (
          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Lock className="w-12 h-12 text-gray-300 mb-4" />
                <h2 className="text-xl font-bold">Benchmarking Data Locked</h2>
                <p className="text-gray-500 max-w-md mt-2">
                  To access industry benchmarks, you need to participate in anonymous data sharing. 
                  This allows us to provide accurate comparisons while maintaining confidentiality.
                </p>
                <Button 
                  className="mt-6" 
                  onClick={() => setShowPermissionsPanel(true)}
                >
                  Enable Data Sharing
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Data Sharing Permissions Panel */}
        {showPermissionsPanel && (
          <Card className="mt-6 border-indigo-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-indigo-600" />
                Data Sharing Preferences
              </CardTitle>
              <CardDescription>
                Choose what anonymous data you're willing to share with our benchmarking system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertTriangle className="h-4 w-4 text-blue-600" />
                  <AlertTitle>How benchmarking works</AlertTitle>
                  <AlertDescription>
                    <p className="mt-1">
                      For each category of data you share, you'll get access to the corresponding benchmarks. 
                      All shared data is anonymized and aggregated. No personally identifiable information is ever shared.
                    </p>
                  </AlertDescription>
                </Alert>
                
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="shareAcquisition">Player Acquisition Metrics</Label>
                        <p className="text-sm text-muted-foreground">
                          Registration rate, conversion rate, cost per acquisition
                        </p>
                      </div>
                      <Switch
                        id="shareAcquisition"
                        checked={sharingPreferences.shareAcquisition}
                        onCheckedChange={() => handleSharingToggle('shareAcquisition')}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="shareEngagement">Player Engagement</Label>
                        <p className="text-sm text-muted-foreground">
                          Session time, game preferences, wager patterns
                        </p>
                      </div>
                      <Switch
                        id="shareEngagement"
                        checked={sharingPreferences.shareEngagement}
                        onCheckedChange={() => handleSharingToggle('shareEngagement')}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="shareRetention">Retention Metrics</Label>
                        <p className="text-sm text-muted-foreground">
                          Churn rate, reactivation rate, retention by day/week/month
                        </p>
                      </div>
                      <Switch
                        id="shareRetention"
                        checked={sharingPreferences.shareRetention}
                        onCheckedChange={() => handleSharingToggle('shareRetention')}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="shareAffiliates">Affiliate Performance</Label>
                        <p className="text-sm text-muted-foreground">
                          Affiliate conversion rates, payouts, ROI, commission structure
                        </p>
                      </div>
                      <Switch
                        id="shareAffiliates"
                        checked={sharingPreferences.shareAffiliates}
                        onCheckedChange={() => handleSharingToggle('shareAffiliates')}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="shareMonetization">Monetization Metrics</Label>
                        <p className="text-sm text-muted-foreground">
                          ARPU, ARPPU, lifetime value, bonus efficiency
                        </p>
                      </div>
                      <Switch
                        id="shareMonetization"
                        checked={sharingPreferences.shareMonetization}
                        onCheckedChange={() => handleSharingToggle('shareMonetization')}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="sharePaymentMetrics">Payment Metrics</Label>
                        <p className="text-sm text-muted-foreground">
                          Deposit/withdrawal success rates, payment method usage
                        </p>
                      </div>
                      <Switch
                        id="sharePaymentMetrics"
                        checked={sharingPreferences.sharePaymentMetrics}
                        onCheckedChange={() => handleSharingToggle('sharePaymentMetrics')}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="shareGeoData">Geographic Distribution</Label>
                        <p className="text-sm text-muted-foreground">
                          Player distribution by country/region, performance by market
                        </p>
                      </div>
                      <Switch
                        id="shareGeoData"
                        checked={sharingPreferences.shareGeoData}
                        onCheckedChange={() => handleSharingToggle('shareGeoData')}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="terms"
                      checked={confirmDataSharing}
                      onCheckedChange={setConfirmDataSharing}
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I understand that my anonymized data will be used to power the benchmarking system
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowPermissionsPanel(false)}
              >
                Cancel
              </Button>
              <Button 
                disabled={!Object.values(sharingPreferences).some(value => value === true) || !confirmDataSharing}
                onClick={saveSharingPreferences}
                isLoading={isLoading}
              >
                Save Preferences
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}