// LETHEX Admin Holders Management Page
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Copy, Check, Key, RefreshCw } from 'lucide-react';
import { getAllHolders, createHolder, updateHolder, deleteHolder, updateHolderAccessCode, generateAccessCode } from '@/db/api';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import type { Holder, HolderFormData } from '@/types/types';

export default function AdminHoldersPage() {
  const [loading, setLoading] = useState(true);
  const [holders, setHolders] = useState<Holder[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showChangeCodeDialog, setShowChangeCodeDialog] = useState(false);
  const [selectedHolder, setSelectedHolder] = useState<Holder | null>(null);
  const [formData, setFormData] = useState<HolderFormData>({
    name: '',
    email: '',
    phone: '',
  });
  const [newAccessCode, setNewAccessCode] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    loadHolders();
  }, []);

  const loadHolders = async () => {
    setLoading(true);
    const data = await getAllHolders();
    setHolders(data);
    setLoading(false);
  };

  const handleAddHolder = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter holder name');
      return;
    }

    const newHolder = await createHolder(formData);
    if (newHolder) {
      toast.success(`Holder created! Access code: ${newHolder.access_code}`);
      setShowAddDialog(false);
      setFormData({ name: '', email: '', phone: '' });
      loadHolders();
    } else {
      toast.error('Failed to create holder');
    }
  };

  const handleEditHolder = async () => {
    if (!selectedHolder || !formData.name.trim()) {
      toast.error('Please enter holder name');
      return;
    }

    const success = await updateHolder(selectedHolder.id, formData);
    if (success) {
      toast.success('Holder updated successfully');
      setShowEditDialog(false);
      setSelectedHolder(null);
      setFormData({ name: '', email: '', phone: '' });
      loadHolders();
    } else {
      toast.error('Failed to update holder');
    }
  };

  const handleDeleteHolder = async () => {
    if (!selectedHolder) return;

    const success = await deleteHolder(selectedHolder.id);
    if (success) {
      toast.success('Holder deleted successfully');
      setShowDeleteDialog(false);
      setSelectedHolder(null);
      loadHolders();
    } else {
      toast.error('Failed to delete holder');
    }
  };

  const openEditDialog = (holder: Holder) => {
    setSelectedHolder(holder);
    setFormData({
      name: holder.name,
      email: holder.email || '',
      phone: holder.phone || '',
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (holder: Holder) => {
    setSelectedHolder(holder);
    setShowDeleteDialog(true);
  };

  const openChangeCodeDialog = (holder: Holder) => {
    setSelectedHolder(holder);
    setNewAccessCode(generateAccessCode());
    setShowChangeCodeDialog(true);
  };

  const handleChangeAccessCode = async () => {
    if (!selectedHolder || !newAccessCode.trim()) {
      toast.error('Please enter a valid access code');
      return;
    }

    if (newAccessCode.length < 6) {
      toast.error('Access code must be at least 6 characters');
      return;
    }

    const success = await updateHolderAccessCode(selectedHolder.id, newAccessCode);
    if (success) {
      toast.success('Access code updated successfully');
      setShowChangeCodeDialog(false);
      setSelectedHolder(null);
      setNewAccessCode('');
      loadHolders();
    } else {
      toast.error('Failed to update access code');
    }
  };

  const handleGenerateNewCode = () => {
    setNewAccessCode(generateAccessCode());
  };

  const copyAccessCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Access code copied to clipboard');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen pb-24 space-y-8">
      {/* Header */}
      <div className="flex flex-col @md:flex-row @md:items-center @md:justify-between gap-4">
        <div>
          <h1 className="text-3xl xl:text-4xl font-bold text-foreground">Holders</h1>
          <p className="text-muted-foreground mt-2">
            Manage fund holders and their access codes
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="w-full @md:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Holder
        </Button>
      </div>

      {/* Holders List */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-xl font-bold">All Holders</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full bg-muted" />
              ))}
            </div>
          ) : holders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No holders yet</p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Holder
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {holders.map((holder) => (
                <div
                  key={holder.id}
                  className="flex flex-col @md:flex-row @md:items-center justify-between gap-4 p-4 rounded-lg bg-secondary/50 border border-border"
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground text-lg">{holder.name}</h3>
                    <div className="mt-2 space-y-1">
                      {holder.email && (
                        <p className="text-sm text-muted-foreground">
                          Email: {holder.email}
                        </p>
                      )}
                      {holder.phone && (
                        <p className="text-sm text-muted-foreground">
                          Phone: {holder.phone}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <code className="px-3 py-1 bg-primary/10 text-primary rounded font-mono text-sm">
                          {holder.access_code}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => copyAccessCode(holder.access_code)}
                        >
                          {copiedCode === holder.access_code ? (
                            <Check className="h-4 w-4 text-success" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openChangeCodeDialog(holder)}
                    >
                      <Key className="h-4 w-4 @md:mr-2" />
                      <span className="hidden @md:inline">Change Code</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(holder)}
                    >
                      <Edit className="h-4 w-4 @md:mr-2" />
                      <span className="hidden @md:inline">Edit</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDeleteDialog(holder)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 @md:mr-2" />
                      <span className="hidden @md:inline">Delete</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Holder Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Holder</DialogTitle>
            <DialogDescription>
              Create a new holder account. An access code will be generated automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Enter holder name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email (optional)"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter phone (optional)"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleAddHolder} className="flex-1">
                Create Holder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Holder Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Holder</DialogTitle>
            <DialogDescription>
              Update holder information. Access code cannot be changed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                placeholder="Enter holder name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="Enter email (optional)"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                type="tel"
                placeholder="Enter phone (optional)"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowEditDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleEditHolder} className="flex-1">
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Access Code Dialog */}
      <Dialog open={showChangeCodeDialog} onOpenChange={setShowChangeCodeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Access Code</DialogTitle>
            <DialogDescription>
              Update the access code for {selectedHolder?.name}. The old code will become invalid immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="new-access-code">New Access Code</Label>
              <div className="flex gap-2">
                <Input
                  id="new-access-code"
                  placeholder="Enter new access code"
                  value={newAccessCode}
                  onChange={(e) => setNewAccessCode(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleGenerateNewCode}
                  title="Generate new code"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Minimum 6 characters. Click the refresh button to generate a random code.
              </p>
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowChangeCodeDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleChangeAccessCode} className="flex-1">
                Update Code
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Holder"
        description={`Are you sure you want to delete ${selectedHolder?.name}? This will also delete all their assets and transaction history. This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteHolder}
        variant="destructive"
      />
    </div>
  );
}
