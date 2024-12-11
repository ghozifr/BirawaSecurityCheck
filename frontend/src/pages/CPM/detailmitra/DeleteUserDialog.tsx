import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { User } from '@/types';

interface DeleteUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;  // Ubah di sini
  user: User | null;
}

const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({ isOpen, onClose, user, onSubmit }) => {
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent default form submission
    if (user) {
      onSubmit();  // Now calling onSubmit without arguments
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hapus User</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          {user ? (
            <form onSubmit={handleSubmit}>
              <p className="text-center">
                Apakah Anda yakin ingin menghapus User <strong>{user.nama_lengkap}</strong>?
              </p>
              <div className="flex justify-end gap-4 mt-6">
                <Button variant="outline" type="button" onClick={onClose}>
                  Batal
                </Button>
                <Button className="bg-red-500 text-white" type="submit">
                  Hapus
                </Button>
              </div>
            </form>
          ) : (
            <p>User tidak ditemukan.</p>
          )}
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteUserDialog;