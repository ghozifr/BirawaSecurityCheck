import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { z } from "zod";
import { useState ,useRef,useEffect} from 'react'
import { Label } from '@/components/ui/label'
import { DeleteIcon } from 'lucide-react'
//Tambah Kontrak
const formAddContractSchema = z.object({
  nama: z.string().min(1, "Nama kontrak wajib diisi").max(40, "Nama kontrak terlalu panjang"),
  nomor: z.string().min(1, "Nomor kontrak wajib diisi").max(20, "Nomor kontrak terlalu panjang"),
  tanggal: z.string().min(1, "Tanggal kontrak wajib diisi").max(10, "Format tanggal tidak valid"),
  nilai: z.coerce.number().min(1, "Nilai kontrak wajib diisi").max(1000000000000, "Nilai kontrak terlalu panjang"),
  jangka_waktu: z.coerce.number().min(1, "Jangka waktu wajib diisi").max(100000, "Jangka waktu terlalu panjang"),
  pekerjaan: z.array(z.object({
      nama: z.string().min(1, "Nama pekerjaan wajib diisi").max(100, "Nama pekerjaan terlalu panjang"),
      lokasi: z.string().min(1, "Lokasi pekerjaan wajib diisi").max(200, "Lokasi pekerjaan terlalu panjang")
  })).nonempty("Tolong masukkan minimal 1 pekerjaan."),
})
  export type AddContractSchema = z.infer<typeof formAddContractSchema>;

interface AddContractDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: AddContractSchema) => void
}

const AddContractDialog: React.FC<AddContractDialogProps> = ({ isOpen, onClose, onSubmit }) => {
  const [pekerjaan, setPekerjaan] = useState<{nama: string, lokasi: string}[]>([]);
  const [showPekerjaanModal, setShowPekerjaanModal] = useState(false);
  const [currentPekerjaan, setCurrentPekerjaan] = useState({ nama: '', lokasi: '' });
  const pekerjaanListRef = useRef<HTMLDivElement>(null) 
  const formAddContract = useForm<AddContractSchema>({
    resolver: zodResolver(formAddContractSchema),
    defaultValues: {
      nama: "",
      nomor: "",
      nilai: 0,
      tanggal: "",
      jangka_waktu: 0,
    }
  })

  const addPekerjaan = () => {
    if (currentPekerjaan.nama && currentPekerjaan.lokasi) {
      setPekerjaan([...pekerjaan, currentPekerjaan]);
      setCurrentPekerjaan({ nama: '', lokasi: '' });
      setShowPekerjaanModal(false);
    }
  };

  // Scroll to bottom after pekerjaan is added or updated
  useEffect(() => {
    if (pekerjaanListRef.current) {
      pekerjaanListRef.current.scrollTop = pekerjaanListRef.current.scrollHeight
    }
  }, [pekerjaan])


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Kontrak</DialogTitle>
        </DialogHeader>
        <DialogDescription >
          <Form {...formAddContract}>

            <form
              onSubmit={formAddContract.handleSubmit(onSubmit)}
              className="grid grid-cols-2 gap-4"
            >
              <FormField
                control={formAddContract.control}
                name="nama"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Kontrak</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Masukkan Nama Kontrak"  />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={formAddContract.control}
                name="nomor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor Kontrak</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Masukkan Nomor Kontrak"  />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formAddContract.control}
                name="nilai"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nilai Kontrak</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" placeholder="Masukkan Nilai Kontrak"  />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formAddContract.control}
                name="tanggal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Kontrak</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" placeholder="dd/mm/yyyy"  />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formAddContract.control}
                name="jangka_waktu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jangka Waktu (Hari)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" placeholder="Masukkan Jangka Waktu"  />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

               {/* Pekerjaan Section */}
               <div className="col-span-2  ">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">Pekerjaan</h3>
                  <div>
                    <Button 
                      type="button" 
                      onClick={() => setShowPekerjaanModal(true)}
                    >
                      Tambah Pekerjaan
                    </Button>
                  </div>
                </div>
                
                <div ref={pekerjaanListRef} className=' overflow-y-auto max-h-40 custom-scrollbar'>
                    {/* List of Added Pekerjaan */}
                      {pekerjaan.map((item, index) => (
                        <div 
                          key={index} 
                          className="bg-white rounded-lg shadow-md border p-4 my-4 flex justify-between items-center hover:bg-gray-50 transition-all duration-300 "
                        >
                          <div className="flex items-center gap-x-4">
                            <p className="text-xl font-semibold text-gray-800">{index + 1}</p>
                            
                            <div className="flex flex-col text-gray-700">
                              <p className="text-sm font-medium">
                                <strong>Nama:</strong> {item.nama}
                              </p>
                              <p className="text-sm">
                                <strong>Lokasi:</strong> {item.lokasi}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-x-2">
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm"
                              className="hover:bg-transparent p-2 rounded-full text-red-600 transition-all duration-200"
                              onClick={() => setPekerjaan(pekerjaan.filter((_, i) => i !== index))}
                            >
                              <DeleteIcon color="red" className="h-5 w-5"/>
                            </Button>
                          </div>
                        </div>
                      ))}
                </div>
              </div>
               {/* Pekerjaan Modal */}
                {showPekerjaanModal && (
                  <Dialog open={showPekerjaanModal} onOpenChange={setShowPekerjaanModal}>
                    <DialogContent aria-describedby='Dialog For Pekerjaan Modal'>
                      <DialogHeader>
                        <DialogTitle>Tambah Pekerjaan</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 p-3">
                        <div>
                          <Label>Nama Pekerjaan</Label>
                          <Input 
                            value={currentPekerjaan.nama}
                            onChange={(e) => setCurrentPekerjaan({
                              ...currentPekerjaan, 
                              nama: e.target.value
                            })}
                            placeholder="Masukkan Nama Pekerjaan"
                          />
                        </div>
                        <div>
                          <Label>Lokasi Pekerjaan</Label>
                          <Input 
                            value={currentPekerjaan.lokasi}
                            onChange={(e) => setCurrentPekerjaan({
                              ...currentPekerjaan, 
                              lokasi: e.target.value
                            })}
                            placeholder="Masukkan Lokasi Pekerjaan"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setShowPekerjaanModal(false)}
                          >
                            Batal
                          </Button>
                          <Button 
                            type="button" 
                            onClick={addPekerjaan}
                            disabled={!currentPekerjaan.nama || !currentPekerjaan.lokasi}
                          >
                            Tambah
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}

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
        </DialogDescription>
      </DialogContent>
      
    </Dialog>
  )
}

export default AddContractDialog
