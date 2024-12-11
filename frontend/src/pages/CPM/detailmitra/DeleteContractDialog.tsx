import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Kontrak } from '@/types';

interface DeleteContractDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Kontrak | null;  // Menyimpan kontrak yang akan dihapus
}

const DeleteContractDialog: React.FC<DeleteContractDialogProps> = ({ isOpen, onClose, contract }) => {
  const handleDelete = async () => {
    if (contract) {
      // Logika untuk menghapus kontrak (misalnya panggil API delete)
      console.log('Deleting contract:', contract);
      // Setelah berhasil, tutup dialog
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hapus Kontrak</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          {contract ? (
            <p className='text-center'>
              Apakah Anda yakin ingin menghapus kontrak <strong>{contract.nama}</strong>?
            </p>
          ) : (
            <p>Kontrak tidak ditemukan.</p>
          )}
            <div className="flex justify-end gap-4 mt-6">
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button className="bg-red-500 text-white" onClick={handleDelete}>
            Hapus
          </Button>
        </div>
        </DialogDescription>
      
      </DialogContent>
    </Dialog>
  );
};

export default DeleteContractDialog;
