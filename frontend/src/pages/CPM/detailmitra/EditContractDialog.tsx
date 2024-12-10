// AddContractDialog.tsx
import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { z } from "zod";
import { Kontrak } from '@/types'

//Tambah Kontrak
const formEditContractSchema = z.object({
    nama: z.string().min(1, "Nama kontrak wajib diisi").max(40, "Nama kontrak terlalu panjang"),
    nomor: z.string().min(1, "Nomor kontrak wajib diisi").max(20, "Nomor kontrak terlalu panjang"),
    tanggal: z.string().min(1, "Tanggal kontrak wajib diisi").max(10, "Format tanggal tidak valid"), // Asumsi format YYYY-MM-DD,
    nilai: z.coerce.number().min(1, "Nilai kontrak wajib diisi").max(1000000000000, "Nilai kontrak terlalu panjang"),
    jangka_waktu: z.coerce.number().min(1, "Jangka waktu wajib diisi").max(100000, "Jangka waktu terlalu panjang")
  })
  export type EditContractSchema = z.infer<typeof formEditContractSchema>;

interface AddContractDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: EditContractSchema) => void
  contract: Kontrak | null;  // Accept user data as prop
}

const EditContractDialog: React.FC<AddContractDialogProps> = ({ isOpen, onClose, onSubmit,contract }) => {
  const form = useForm<EditContractSchema>({
    resolver: zodResolver(formEditContractSchema),

  })

  console.log(contract);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Kontrak</DialogTitle>
        </DialogHeader>
        <DialogDescription>
         {contract ?  
            <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid grid-cols-2 gap-4"
            >
              <FormField
                control={form.control}
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
                control={form.control}
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
                control={form.control}
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
                control={form.control}
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
                control={form.control}
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
          </Form>
           : 
           <p>Data Kontrak tidak tersedia.</p>
          }
        </DialogDescription>
      </DialogContent>
    </Dialog>
  )
}

export default EditContractDialog;
