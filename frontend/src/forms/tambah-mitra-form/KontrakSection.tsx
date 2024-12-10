import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DeleteIcon, EditIcon } from "lucide-react";
import { useState } from "react";
import { useForm, useFormContext, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomDatePicker from "@/components/CustomDatePicker";
import Accordion from "@/components/custom/atom/Accordion";
import ShadowContainer from "@/components/custom/atom/ShadowContainer";


const pekerjaanSchema = z.object({
  nama: z.string().min(1, "Nama pekerjaan wajib diisi"),
  lokasi: z.string().min(1, "Lokasi pekerjaan wajib diisi"),
});

const KontrakSection = () => {
  const { control, getValues } = useFormContext();
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "pekerjaan_arr",
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPekerjaanIndex, setCurrentPekerjaanIndex] = useState<number | null>(null);

  // Temporary form for the dialog
  const pekerjaanForm = useForm({
    resolver: zodResolver(pekerjaanSchema),
    defaultValues: { nama: "", lokasi: "" },
  });

  const openDialogForNew = () => {
    pekerjaanForm.reset({ nama: "", lokasi: "" }) // Clear the dialog form
    setCurrentPekerjaanIndex(null)
    setIsDialogOpen(true)
  };

  const openDialogForEdit = (index: number) => {
    const pekerjaan = getValues(`pekerjaan_arr.${index}`)
    pekerjaanForm.reset(pekerjaan) // Populate dialog form with the selected pekerjaan
    setCurrentPekerjaanIndex(index)
    setIsDialogOpen(true)
  };

  const handleSavePekerjaan = pekerjaanForm.handleSubmit((data) => {
    if (currentPekerjaanIndex === null) {
      // Add new pekerjaan
      append(data)
    } else {
      // Update existing pekerjaan
      update(currentPekerjaanIndex, data)
    }
    setIsDialogOpen(false)
    setCurrentPekerjaanIndex(null)
  })

  return (
    <Accordion title="Detail Kontrak">
      <ShadowContainer buttonNeeded={false} titleNeeded={false}>
        <div className="mb-1">
          <div className="grid grid-cols-2 gap-4">
            {/* Other form fields */}
            <FormField
              control={control}
              name="kontrak.nama"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Kontrak</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan Nama Kontrak" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="kontrak.nomor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Kontrak</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan Nomor Kontrak" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="kontrak.nilai"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nilai Kontrak</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukan Nilai Kontrak" type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="kontrak.tanggal"
              render={() => (
                <FormItem>
                  <FormLabel>Tanggal Kontrak</FormLabel>
                  <FormControl>
                    <CustomDatePicker name="kontrak.tanggal" control={control} placeholder="dd/mm/yyyy" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="kontrak.jangka_waktu"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jangka Waktu</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukan Jangka Waktu Kontrak" type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Add pekerjaan button */}
          <div className="w-full flex justify-end mt-4">
            <Button className="bg-red-600 text-white p-2 rounded w-40" type="button" onClick={openDialogForNew}>
              Tambah Pekerjaan
            </Button>
          </div>

          {/* Dialog for adding/editing pekerjaan */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{currentPekerjaanIndex !== null ? "Edit Pekerjaan" : "Tambah Pekerjaan"}</DialogTitle>
              </DialogHeader>
              <DialogDescription>
                <form onSubmit={handleSavePekerjaan}>
                  <FormField
                    control={pekerjaanForm.control}
                    name="nama"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>Nama Pekerjaan</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nama Pekerjaan" />
                        </FormControl>
                        <FormMessage>{fieldState.error?.message}</FormMessage>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={pekerjaanForm.control}
                    name="lokasi"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel className="mt-4">Lokasi Pekerjaan</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Lokasi Pekerjaan" />
                        </FormControl>
                        <FormMessage>{fieldState.error?.message}</FormMessage>
                      </FormItem>
                    )}
                  />
                  <div className="mt-4 flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Save</Button>
                  </div>
                </form>
              </DialogDescription>
            </DialogContent>
          </Dialog>

          {/* Table to display pekerjaan */}
          <div className="w-full h-auto mt-4">
          <table className="w-full text-center text-sm border border-gray-300">
            <thead className="bg-gray-200 border-b border-gray-300">
              <tr>
                <th className="p-4 font-semibold text-gray-600 w-[44%]">Pekerjaan</th>
                <th className="p-4 font-semibold text-gray-600 w-[44%]">Lokasi</th>
                <th className="p-4 font-semibold text-gray-600 w-[12%]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {fields.length === 0 ? (
                <tr>
                  <td className="p-4 text-gray-500" colSpan={3}>
                    Belum ada pekerjaan yang ditambah
                  </td>
                </tr>
              ) : (
                fields.map((field, index) => (
                  <tr
                    key={field.id}
                    className={`${index % 2 === 0 ? "bg-gray-100" : "bg-white"} hover:bg-gray-100`}
                  >
                    <td className="p-4 text-gray-700">
                      {getValues(`pekerjaan_arr.${index}.nama`)
                        .charAt(0)
                        .toUpperCase() +
                        getValues(`pekerjaan_arr.${index}.nama`).slice(1)}
                    </td>
                    <td className="p-4 text-gray-700">
                      {getValues(`pekerjaan_arr.${index}.lokasi`)
                        .charAt(0)
                        .toUpperCase() +
                        getValues(`pekerjaan_arr.${index}.lokasi`).slice(1)}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button variant="outline" className="border-gray-400 text-gray-600" onClick={() => openDialogForEdit(index)}>
                          <EditIcon/>
                        </Button>
                        <Button
                          className="border-red-500 text-red-500 hover:bg-red-100"
                          variant="outline"
                          onClick={() => remove(index)}
                        >
                          <DeleteIcon />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
      </ShadowContainer>
    </Accordion>
          
  );
};

export default KontrakSection;
