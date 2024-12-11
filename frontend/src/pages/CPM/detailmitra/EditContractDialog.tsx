// AddContractDialog.tsx
import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Kontrak } from '@/types'

interface AddContractDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: () => void
  contract: Kontrak | null;  // Accept user data as prop
}

const EditContractDialog: React.FC<AddContractDialogProps> = ({ isOpen, onClose, onSubmit,contract }) => {
  
  const {control} = useFormContext()

  console.log(contract);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Kontrak</DialogTitle>
        </DialogHeader>
        <DialogDescription>
         {contract ? (
            <form
              onSubmit={control.handleSubmit(onSubmit)}
              className="grid grid-cols-2 gap-4"
            >
              <FormField
                control={control}
                name="nama"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Kontrak</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        defaultValue={contract.nama}
                        disabled
                        />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={control}
                name="nomor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor Kontrak</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        defaultValue={contract.nomor}  
                        disabled
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="nilai"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nilai Kontrak</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number"   
                        defaultValue={contract.nilai}  
                        />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="tanggal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Kontrak</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="date" 
                        defaultValue={contract.tanggal}
                       />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="jangka_waktu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jangka Waktu (bulan)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        placeholder="Masukkan Jangka Waktu"  
                        defaultValue={contract.jangka_waktu}
                        />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="col-span-2 flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Batal
                </Button>
                <Button type="submit" className="bg-red-500 text-white">
                  Simpan
                </Button>
              </div>
            </form>
          ) : (
              <p>Data Kontrak tidak tersedia.</p>
            )
          }
        </DialogDescription>
      </DialogContent>
    </Dialog>
  )
}

export default EditContractDialog;
