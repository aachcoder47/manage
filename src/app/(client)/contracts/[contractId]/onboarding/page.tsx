"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { ContractsService, Contract } from "@/services/contracts.service";
import { OnboardingService, OnboardingPackage, OnboardingItem } from "@/services/onboarding.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, CheckSquare, Square, Link as LinkIcon, FileText, Key, Send } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

export default function OnboardingPage({ params }: { params: { contractId: string } }) {
  const { user } = useUser();
  const [contract, setContract] = useState<Contract | null>(null);
  const [pkg, setPkg] = useState<OnboardingPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [newItemOpen, setNewItemOpen] = useState(false);
  
  // New Item State
  const [newItem, setNewItem] = useState({
      title: "",
      description: "",
      resource_url: "",
      item_type: "task"
  });

  useEffect(() => {
    const init = async () => {
      try {
        const c = await ContractsService.getContractById(params.contractId);
        setContract(c);
        
        const p = await OnboardingService.getPackageByContract(params.contractId);
        setPkg(p);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load onboarding data");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [params.contractId]);

  const handleCreatePackage = async () => {
      if (!contract || !user) return;
      try {
          const newPkg = await OnboardingService.createPackage({
              contract_id: contract.id,
              employer_id: contract.employer_id,
              candidate_id: contract.candidate_id,
              welcome_message: `Welcome to the team! We are excited to have you on board. Here are a few things to get you started.`,
              status: 'draft'
          });
          setPkg({ ...newPkg, items: [] });
          toast.success("Onboarding initialized");
      } catch (error) {
          toast.error("Failed to create package");
      }
  };

  const handleAddItem = async () => {
      if (!pkg) return;
      try {
          const item = await OnboardingService.addItem({
              package_id: pkg.id,
              ...newItem,
              // @ts-ignore
              item_type: newItem.item_type
          });
          setPkg(prev => prev ? ({ ...prev, items: [...(prev.items || []), item] }) : null);
          setNewItemOpen(false);
          setNewItem({ title: "", description: "", resource_url: "", item_type: "task" });
          toast.success("Item added");
      } catch (error) {
          toast.error("Failed to add item");
      }
  };

  const handleDeleteItem = async (itemId: string) => {
      try {
          await OnboardingService.deleteItem(itemId);
          setPkg(prev => prev ? ({ ...prev, items: prev.items?.filter(i => i.id !== itemId) }) : null);
          toast.success("Item removed");
      } catch (error) {
          toast.error("Failed to remove item");
      }
  };

  const handlePublish = async () => {
      if (!pkg) return;
      try {
          await OnboardingService.updatePackageStatus(pkg.id, 'sent');
          setPkg(prev => prev ? ({ ...prev, status: 'sent' }) : null);
          toast.success("Onboarding sent to candidate!");
      } catch (error) {
          toast.error("Failed to publish");
      }
  };

  const handleToggleComplete = async (item: OnboardingItem) => {
      try {
          const updated = await OnboardingService.toggleItemCompletion(item.id, !item.is_completed);
          setPkg(prev => prev ? ({ 
              ...prev, 
              items: prev.items?.map(i => i.id === item.id ? updated : i) 
          }) : null);
      } catch (error) {
          toast.error("Update failed");
      }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!contract) return <div>Contract not found</div>;

  const isEmployer = user?.id === contract.employer_id;
  const isCandidate = user?.id === contract.candidate_id;

  // Access Control: Only involved parties
  if (!isEmployer && !isCandidate) return <div>Unauthorized</div>;

  return (
    <main className="max-w-5xl mx-auto p-6 md:p-10">
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Onboarding & Access</h1>
                <p className="text-muted-foreground">
                    {contract.title} • {contract.status}
                </p>
            </div>
            {isEmployer && pkg?.status === 'draft' && (
                <Button onClick={handlePublish} className="bg-indigo-600">
                    <Send className="w-4 h-4 mr-2" />
                    Send to Candidate
                </Button>
            )}
        </div>

        {!pkg ? (
            <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
                {isEmployer ? (
                    <div className="space-y-4">
                        <h3 className="text-xl font-medium">Setup Onboarding</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            Create a welcome package with tasks, documents, and credentials for your new hire.
                        </p>
                        <Button onClick={handleCreatePackage}>Initialize Onboarding</Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-muted-foreground">Onboarding information has not been shared yet.</p>
                    </div>
                )}
            </div>
        ) : (
            <div className="grid gap-8">
                {/* Welcome Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Welcome Message</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="whitespace-pre-wrap leading-relaxed text-gray-700">
                            {pkg.welcome_message}
                        </p>
                    </CardContent>
                </Card>

                {/* Items List */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Checklist & Resources</h2>
                        {isEmployer && (
                             <Dialog open={newItemOpen} onOpenChange={setNewItemOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Item
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add Onboarding Item</DialogTitle>
                                        <DialogDescription>Share a task, link, or credential.</DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Title</label>
                                            <Input 
                                                value={newItem.title} 
                                                onChange={e => setNewItem({...newItem, title: e.target.value})}
                                                placeholder="e.g. Join Slack Workspace"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Type</label>
                                            <select 
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                value={newItem.item_type}
                                                onChange={e => setNewItem({...newItem, item_type: e.target.value})}
                                            >
                                                <option value="task">Task</option>
                                                <option value="document">Document</option>
                                                <option value="credential">Credential</option>
                                                <option value="link">Link</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Description / Credentials</label>
                                            <Textarea 
                                                value={newItem.description} 
                                                onChange={e => setNewItem({...newItem, description: e.target.value})}
                                                placeholder="Details..."
                                            />
                                        </div>
                                        {newItem.item_type !== 'credential' && (
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">URL (Optional)</label>
                                                <Input 
                                                    value={newItem.resource_url} 
                                                    onChange={e => setNewItem({...newItem, resource_url: e.target.value})}
                                                    placeholder="https://..."
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={handleAddItem}>Add Item</Button>
                                    </DialogFooter>
                                </DialogContent>
                             </Dialog>
                        )}
                    </div>

                    <div className="grid gap-3">
                        {pkg.items?.length === 0 && <p className="text-muted-foreground italic">No items yet.</p>}
                        {pkg.items?.map(item => (
                            <Card key={item.id} className={`transition-all ${item.is_completed ? 'bg-slate-50' : 'bg-white'}`}>
                                <CardContent className="p-4 flex gap-4 items-start">
                                    <button 
                                        onClick={() => handleToggleComplete(item)}
                                        className="mt-1 text-muted-foreground hover:text-indigo-600 transition-colors"
                                    >
                                        {item.is_completed ? <CheckSquare className="w-5 h-5 text-green-600" /> : <Square className="w-5 h-5" />}
                                    </button>
                                    
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            {item.item_type === 'credential' && <Badge variant="outline"><Key className="w-3 h-3 mr-1"/> Credential</Badge>}
                                            {item.item_type === 'document' && <Badge variant="outline"><FileText className="w-3 h-3 mr-1"/> Document</Badge>}
                                            {item.item_type === 'link' && <Badge variant="outline"><LinkIcon className="w-3 h-3 mr-1"/> Link</Badge>}
                                            <h4 className={`font-medium ${item.is_completed ? 'line-through text-muted-foreground' : ''}`}>{item.title}</h4>
                                        </div>
                                        
                                        {/* Sensitive Data Logic: Hide credentials if not employer or not involved? (Handled by page level check) */}
                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                            {item.description}
                                        </p>
                                        
                                        {item.resource_url && (
                                            <a href={item.resource_url} target="_blank" rel="noopener noreferrer" className="block mt-2 text-sm text-indigo-600 hover:underline flex items-center">
                                                <LinkIcon className="w-3 h-3 mr-1" />
                                                Open Resource
                                            </a>
                                        )}
                                    </div>

                                    {isEmployer && (
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        )}
    </main>
  );
}
