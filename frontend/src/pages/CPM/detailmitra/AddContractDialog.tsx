import { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { z } from "zod";
import { DeleteIcon } from 'lucide-react'
import LoadingButton from '@/components/LoadingButton'
import CustomDatePicker from '@/components/CustomDatePicker'

// Define schema for contract form
const formAddContractSchema = z.object({
  nama: z.string().min(1, "Nama kontrak wajib diisi").max(40, "Nama kontrak terlalu panjang"),
  nomor: z.string().min(1, "Nomor kontrak wajib diisi").max(20, "Nomor kontrak terlalu panjang"),
  tanggal: z.string().min(1, "Tanggal kontrak wajib diisi").max(10, "Format tanggal tidak valid"),
  nilai: z.coerce.number().min(1, "Nilai kontrak wajib diisi").max(1000000000000, "Nilai kontrak terlalu panjang"),
  jangka_waktu: z.coerce.number().min(1, "Jangka waktu wajib diisi").max(100000, "Jangka waktu terlalu panjang"),
  pekerjaan_arr: z.array(
    z.object({
      nama: z.string().min(1, "Nama pekerjaan wajib diisi").max(100, "Nama pekerjaan terlalu panjang"),
      lokasi: z.string().min(1, "Lokasi pekerjaan wajib diisi").max(200, "Lokasi pekerjaan terlalu panjang")
  })).nonempty("Tolong masukkan minimal 1 pekerjaan."),
})

export type AddContractSchema = z.infer<typeof formAddContractSchema>;

const formAddPekerjaanSchema = z.object({
  nama: z.string().min(1, "Nama pekerjaan wajib diisi").max(100, "Nama pekerjaan terlalu panjang"),
  lokasi: z.string().min(1, "Lokasi pekerjaan wajib diisi").max(200, "Lokasi pekerjaan terlalu panjang")
})

export type AddPekerjaanSchema = z.infer<typeof formAddPekerjaanSchema>

interface Props {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: AddContractSchema) => void
  isLoading: boolean
}

const AddContractDialog = ({ isOpen, onClose, onSubmit, isLoading }: Props) => {
  
  const [showPekerjaanModal, setShowPekerjaanModal] = useState(false);
  const pekerjaanListRef = useRef<HTMLDivElement>(null)
  
  const formAddContract = useForm<AddContractSchema>({
    resolver: zodResolver(formAddContractSchema),
    defaultValues: {
      nama: "",
      nomor: "",
      nilai: 0,
      tanggal: "",
      jangka_waktu: 0,
      pekerjaan_arr: []
    }
  })
  
  const { control } = formAddContract;

  const {
    fields: pekerjaanFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: 'pekerjaan_arr',
  });
  
  const formAddPekerjaan = useForm<AddPekerjaanSchema>({
    resolver: zodResolver(formAddPekerjaanSchema),
    defaultValues: {nama: "", lokasi: ""}
  })

  const addPekerjaan = (data: AddPekerjaanSchema) => {
    console.log(formAddPekerjaan.formState.errors) //Debug.
    console.log("Before added:", formAddContract.getValues('pekerjaan_arr')) //Debug.
    append(data);
    setShowPekerjaanModal(false);
    formAddPekerjaan.reset();
    console.log("After added:", formAddContract.getValues('pekerjaan_arr')) //Debug.
  };

  // Scroll to bottom after pekerjaan is added or updated
  useEffect(() => {
    if (pekerjaanListRef.current) {
      pekerjaanListRef.current.scrollTop = pekerjaanListRef.current.scrollHeight
    }
  }, [pekerjaanFields])
  
  useEffect(() => {
    if (!isOpen) {
      formAddContract.reset()
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Kontrak</DialogTitle>
        </DialogHeader>
        <DialogDescription>Silahkan masukkan data kontrak</DialogDescription>
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
              render={() => (
                <FormItem>
                  <FormLabel>Tanggal Kontrak</FormLabel>
                  <FormControl>
                    <CustomDatePicker name="tanggal" control={formAddContract.control} placeholder="dd/mm/yyyy" />
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
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold"> Daftar Pekerjaan</h3>
              </div>
              
              <div ref={pekerjaanListRef} className=' overflow-y-auto max-h-[100px] custom-scrollbar'>
                {/* List of Added Pekerjaan */}
                {pekerjaanFields.length > 0 ? (
                  pekerjaanFields.map((item, index) => (
                    <div 
                      key={index} 
                      className="bg-white rounded-lg shadow-md border p-4 my-4 flex justify-between items-center hover:bg-gray-50 transition-all duration-300 "
                    >
                      <div className="flex items-center gap-x-4">
                        <p className="text-xl font-semibold text-gray-800 mx-3">{index + 1}</p>
                        
                        <div className="flex flex-col text-gray-700">
                          <p className="text-sm font-medium">
                            <strong>Nama</strong>&emsp; : {item.nama}
                          </p>
                          <p className="text-sm">
                            <strong>Lokasi</strong>&emsp;: {item.lokasi}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-x-2">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          className="hover:bg-transparent p-2 rounded-full text-red-600 transition-all duration-200"
                          onClick={() => remove(index)}
                        >
                          <DeleteIcon color="red" className="h-5 w-5"/>
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className='mt-4'>Silahkan masukkan data pekerjaan terlebih dahulu.</p>
                )}
              </div>
              <Button 
                type="button"
                className='mt-4'
                onClick={() => setShowPekerjaanModal(true)}
              >
                + &nbsp; Tambah Pekerjaan
              </Button>
            </div>
            {/* Pekerjaan Modal */}
            {showPekerjaanModal && (
              <Dialog open={showPekerjaanModal} onOpenChange={setShowPekerjaanModal}>
                <DialogContent aria-describedby='Dialog For Pekerjaan Modal'>
                  <DialogHeader>
                    <DialogTitle>Tambah Pekerjaan</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 p-3">
                    <Form {...formAddPekerjaan}>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          formAddPekerjaan.handleSubmit(addPekerjaan)(e)
                        }}
                      >
                        <FormField
                          control={formAddPekerjaan.control}
                          name="nama"
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <FormLabel>Nama Pekerjaan</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field}
                                  placeholder="Masukkan Nama Pekerjaan"
                                />
                              </FormControl>
                              <FormMessage>{fieldState.error?.message}</FormMessage>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={formAddPekerjaan.control}
                          name="lokasi"
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <FormLabel>Lokasi Pekerjaan</FormLabel>
                              <FormControl>
                                <Input placeholder="Masukkan Lokasi Pekerjaan" {...field} />
                              </FormControl>
                              <FormMessage>{fieldState.error?.message}</FormMessage>
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-end gap-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setShowPekerjaanModal(false)}
                          >
                            Batal
                          </Button>
                          <Button 
                            type="submit"
                            disabled={!formAddPekerjaan.formState.isValid}
                          >
                            Tambah
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            <div className="col-span-2 flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Batal
              </Button>
              {isLoading ? (
                <LoadingButton/>
              ) : (
                <Button type="submit" className="bg-red-500 text-white" disabled={!formAddContract.formState.isValid}>
                  Simpan
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default AddContractDialog
