
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Github, AlertTriangle, Copy, ExternalLink, CheckCircle, ChevronRight, FileCode, GitBranch, Code, Users, Server } from 'lucide-react';

export default function GitHubSetupGuide() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">GitHub Repository Setup Guide</h1>
            <p className="text-gray-500">
              Instructions for deploying your iGaming Analytics application to GitHub
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Github className="h-4 w-4" />
            <span>View Example Repository</span>
          </Button>
        </div>

        <Alert className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Security Warning</AlertTitle>
          <AlertDescription className="text-amber-700">
            Never share your GitHub personal access tokens in chat interfaces or unsecured locations. Tokens provide access to your repositories and should be kept secure.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="export" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="export">1. Export Code</TabsTrigger>
            <TabsTrigger value="create">2. Create Repository</TabsTrigger>
            <TabsTrigger value="push">3. Push to GitHub</TabsTrigger>
            <TabsTrigger value="invite">4. Invite Team</TabsTrigger>
          </TabsList>

          <TabsContent value="export">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Step 1: Export Your Code</CardTitle>
                <CardDescription>First, you need to export the complete code from base44</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-indigo-100 rounded-full p-2 text-indigo-700 mt-1">
                      <FileCode className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">Request a Full Export</h3>
                      <p className="text-gray-600 mt-1">
                        Contact base44 support through the feedback button on the sidebar to request a full code export. They will provide you with a ZIP file containing all your application code.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-indigo-100 rounded-full p-2 text-indigo-700 mt-1">
                      <Code className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">Export Structure</h3>
                      <p className="text-gray-600 mt-1">
                        Your export will include all the components, pages, entities, and assets exactly as they appear in your application, organized in the same directory structure.
                      </p>
                      <div className="mt-3 p-4 bg-gray-50 rounded border text-sm font-mono">
                        <div>📁 components/</div>
                        <div className="pl-4">📁 dashboard/</div>
                        <div className="pl-4">📁 analytics/</div>
                        <div className="pl-4">📁 executive/</div>
                        <div className="pl-4">📁 ui/</div>
                        <div>📁 entities/</div>
                        <div>📁 pages/</div>
                        <div>📁 integrations/</div>
                        <div>📄 Layout.js</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Step 2: Create a GitHub Repository</CardTitle>
                <CardDescription>Set up a repository to host your application code</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-indigo-100 rounded-full p-2 text-indigo-700 mt-1">
                      <Github className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">Create a New Repository</h3>
                      <p className="text-gray-600 mt-1">
                        Go to <a href="https://github.com/new" className="text-indigo-600 hover:underline" target="_blank" rel="noreferrer">github.com/new</a> and create a new repository.
                      </p>
                      <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-600">
                        <li>Name it "igaming-analytics" or another descriptive name</li>
                        <li>Choose "Private" if you want to keep your code private</li>
                        <li>Don't initialize with README, license, or .gitignore files</li>
                      </ul>
                      <div className="mt-3">
                        <Button variant="outline" className="flex items-center gap-2">
                          <ExternalLink className="h-4 w-4" />
                          <span>Create New Repository</span>
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-indigo-100 rounded-full p-2 text-indigo-700 mt-1">
                      <Code className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">Generate a Personal Access Token</h3>
                      <p className="text-gray-600 mt-1">
                        Go to GitHub Settings → Developer Settings → Personal Access Tokens → Fine-grained tokens, and generate a new token with repository access.
                      </p>
                      <div className="mt-3">
                        <Button variant="outline" className="flex items-center gap-2">
                          <ExternalLink className="h-4 w-4" />
                          <span>Create New Token</span>
                        </Button>
                      </div>
                      <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-md text-red-800 text-sm">
                        <strong>Security Note:</strong> Store this token securely. It grants access to your repositories and should never be shared publicly.
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="push">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Step 3: Push Your Code to GitHub</CardTitle>
                <CardDescription>Upload your application to your new repository</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-indigo-100 rounded-full p-2 text-indigo-700 mt-1">
                      <GitBranch className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">Initialize Local Repository</h3>
                      <p className="text-gray-600 mt-1">
                        Extract your project files, open a terminal in that directory, and run these commands:
                      </p>
                      <div className="mt-3 p-4 bg-gray-800 text-white rounded-md font-mono text-sm">
                        <div className="flex items-center justify-between">
                          <span>git init</span>
                          <Button variant="ghost" size="sm" className="h-6 text-white/70 hover:text-white hover:bg-white/10">
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span>git add .</span>
                          <Button variant="ghost" size="sm" className="h-6 text-white/70 hover:text-white hover:bg-white/10">
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span>git commit -m "Initial commit"</span>
                          <Button variant="ghost" size="sm" className="h-6 text-white/70 hover:text-white hover:bg-white/10">
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-indigo-100 rounded-full p-2 text-indigo-700 mt-1">
                      <Github className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">Connect to GitHub Repository</h3>
                      <p className="text-gray-600 mt-1">
                        Link your local repository to GitHub and push your code:
                      </p>
                      <div className="mt-3 p-4 bg-gray-800 text-white rounded-md font-mono text-sm">
                        <div className="flex items-center justify-between">
                          <span>git remote add origin https://github.com/YOUR-USERNAME/igaming-analytics.git</span>
                          <Button variant="ghost" size="sm" className="h-6 text-white/70 hover:text-white hover:bg-white/10">
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span>git branch -M main</span>
                          <Button variant="ghost" size="sm" className="h-6 text-white/70 hover:text-white hover:bg-white/10">
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span>git push -u origin main</span>
                          <Button variant="ghost" size="sm" className="h-6 text-white/70 hover:text-white hover:bg-white/10">
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-gray-600 mt-3">
                        When prompted for credentials, use your GitHub username and the personal access token you created.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invite">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Step 4: Invite Team Members</CardTitle>
                <CardDescription>Give your team access to the repository</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-indigo-100 rounded-full p-2 text-indigo-700 mt-1">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">Invite Collaborators</h3>
                      <p className="text-gray-600 mt-1">
                        Add team members to your repository:
                      </p>
                      <ol className="list-decimal pl-5 mt-2 space-y-2 text-gray-600">
                        <li>Go to your repository on GitHub</li>
                        <li>Click on "Settings" tab</li>
                        <li>Select "Collaborators" from the left sidebar</li>
                        <li>Click "Add people" and enter your team members' GitHub usernames or email addresses</li>
                        <li>Choose appropriate permission levels</li>
                      </ol>
                      <div className="mt-3">
                        <Button variant="outline" className="flex items-center gap-2">
                          <ExternalLink className="h-4 w-4" />
                          <span>Manage Repository Access</span>
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-green-100 rounded-full p-2 text-green-700 mt-1">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">Collaborate and Version Control</h3>
                      <p className="text-gray-600 mt-1">
                        Now your team can clone the repository, make changes, and contribute to the codebase using standard Git workflows:
                      </p>
                      <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-600">
                        <li>Create branches for new features</li>
                        <li>Submit pull requests for code reviews</li>
                        <li>Track changes and manage versions</li>
                        <li>Use issues to track bugs and feature requests</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle>Next Steps: Deployment Options</CardTitle>
            <CardDescription>Ways to deploy your application for production use</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                Once your code is in GitHub, you have several options for deploying it:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border border-gray-200">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Server className="h-5 w-5 text-indigo-600" />
                      <span>Self-Hosted Deployment</span>
                    </h3>
                    <p className="text-sm text-gray-600 mt-2">
                      Deploy on your own servers or cloud infrastructure. This gives you complete control but requires more management.
                    </p>
                    <Button variant="link" className="mt-2 p-0 text-indigo-600 h-auto flex items-center">
                      Learn more <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold flex items-center gap-2">
                      <GitBranch className="h-5 w-5 text-indigo-600" />
                      <span>CI/CD Pipelines</span>
                    </h3>
                    <p className="text-sm text-gray-600 mt-2">
                      Set up automatic deployments using GitHub Actions or other CI/CD tools when changes are pushed to your repository.
                    </p>
                    <Button variant="link" className="mt-2 p-0 text-indigo-600 h-auto flex items-center">
                      Learn more <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
