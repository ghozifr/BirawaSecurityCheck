import { useFieldArray, useForm, useFormContext } from "react-hook-form";
import { useState } from "react";
import { MdDelete } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Accordion from "@/components/custom/atom/Accordion";
import ShadowContainer from "@/components/custom/atom/ShadowContainer";
import { Shift, TenagaKerja } from "@/types";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import CustomTimePicker from "@/components/CustomTimePicker";

const shiftSchema = z.object({
  nama: z.string().min(1, "Nama shift wajib diisi").max(2, "Nama shift terlalu panjang"),
  waktu_mulai: z.string().min(1, "Waktu mulai shift wajib diisi").max(50, "Nama pekerjaan terlalu panjang"),
  waktu_berakhir: z.string().min(1, "Waktu berakhir shift wajib diisi").max(50, "Nama pekerjaan terlalu panjang"),
}).refine(
  (data) => {
    const [startHour, startMinute] = data.waktu_mulai.split(":").map(Number);
    const [endHour, endMinute] = data.waktu_berakhir.split(":").map(Number);

    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;

    return endTime > startTime; // Ensure end time is greater than start time
  },
  {
    message: "Waktu berakhir harus lebih lama dari waktu mulai",
    path: ["waktu_berakhir"], // Attach error to waktu_berakhir field
  }
);

const tenagaKerjaSchema = z.object({
    nama: z.string().min(1, "Peran tenaga kerja wajib diisi"),
    jumlah: z.coerce.number().min(1, "Jumlah tenaga kerja wajib berisi minimal 1 individu")
  })

export default function TenagaKerjaSection() {
  const { control, getValues, setValue, watch } = useFormContext<{ tenaga_kerja_arr: TenagaKerja[], shift: Shift}>()
  
  const { fields: tenagaKerjaFields, append: appendTenagaKerja, remove: removeTenagaKerja } = useFieldArray({
    control,
    name: "tenaga_kerja_arr",
  })
  
  const shiftForm = useForm({
    resolver: zodResolver(shiftSchema),
    defaultValues: {nama: "", waktu_mulai: "", waktu_berakhir: ""}
  })
  
  const tenagaKerjaForm = useForm({
    resolver: zodResolver(tenagaKerjaSchema),
    defaultValues: {nama: "", jumlah: 1}
  })
  
  const shift = watch("shift");
  const isShiftSelected = shift?.waktu_mulai && shift?.waktu_berakhir;

  const [isShiftDialogOpen, setIsShiftDialogOpen] = useState(false)
  const [isTenagaKerjaDialogOpen, setIsTenagaKerjaDialogOpen] = useState(false)
  const [selectedShift, setSelectedShift] = useState("")

  const defaultTenagaKerja = ["pekerja arsitektur", "pekerja furnitur", "pekerja mekanikal elektrik", "pekerja sipil"];
  const manajemenFieldLength = tenagaKerjaFields.filter((field) => field.tipe === 'Manajemen').length
  
  const handleTentukanShift = (data: Shift) => {
    
    data.waktu_mulai += ":00"
    data.waktu_berakhir += ":00"
    
    setValue('shift', data)
    
    // console.log(isShiftDialogOpen) //Debug.
    setIsShiftDialogOpen(false)
  }
  
  const handleTambahTenagaKerja = (data: {nama: string, jumlah: number}) => {
    
    const existingTenagaKerja = getValues("tenaga_kerja_arr").map((item) => item.peran.toLowerCase());
    if (existingTenagaKerja.includes(data.nama.toLowerCase())) {
      alert("Tenaga Kerja ini sudah tersedia.")
      return;
    }

    appendTenagaKerja({ tipe: "Lapangan", peran: "pekerja " + data.nama, jumlah: data.jumlah });
    tenagaKerjaForm.reset(); // Reset the dialog form
    setIsTenagaKerjaDialogOpen(false);
  };

  const handleHapusTenagaKerja = (index: number) => {
    removeTenagaKerja(index + manajemenFieldLength)
  }
  
  // useEffect (() => {
  //   const tenagaKerjaArr = getValues('tenaga_kerja_arr')
  //   const shift = getValues('shift')
  //   console.log(tenagaKerjaArr) 
  //   console.log(defaultTenagaKerja) 
  //   console.log(shift)
  // }, [tenagaKerjaFields, defaultTenagaKerja, selectedShift]) //Debug.
  
  const ShiftDialog = (
    <form 
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();  // Prevent parent form submission
        e.stopPropagation(); // Stop event from bubbling up to parent form
        shiftForm.handleSubmit(handleTentukanShift)(e);  // Handle shift submission
      }}
    >
      {/* Shift Selection */}
      <div>
        <p className="block text-sm font-semibold mb-2">Shift</p>
        <div className="flex space-x-4 mb-4">
          <Button
            type="button"
            variant={selectedShift === '1' ? 'default' : 'outline'}
            onClick={() => {
              setSelectedShift('1')
              shiftForm.setValue('nama', '1')
            }}
          >
            Shift 1
          </Button>
          <Button
            type="button"
            variant={selectedShift === '2' ? 'default' : 'outline'}
            onClick={() => {
              setSelectedShift('2')
              shiftForm.setValue('nama', '2')
            }}
          >
            Shift 2
          </Button>
        </div>
        {shiftForm.formState.errors.nama && (
          <p className="text-red-500 text-[14px] font-[500]">
            {shiftForm.formState.errors.nama.message}
          </p>
        )}
      </div>

      {/* Time Selection */}
      <div>
        <p className="block text-sm font-semibold mb-2">Pukul</p>
        <div className="flex space-x-4 w-full">
          <FormField
            control={shiftForm.control}
            name="waktu_mulai"
            render={({ field, fieldState }) => (
              <FormItem className="w-full">
                <FormLabel>Waktu Mulai</FormLabel>
                <FormControl>
                  <CustomTimePicker
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage>{fieldState.error?.message}</FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={shiftForm.control}
            name="waktu_berakhir"
            render={({ field, fieldState }) => (
              <FormItem className="w-full">
                <FormLabel>Waktu Berakhir</FormLabel>
                <FormControl>
                <CustomTimePicker
                  value={field.value}
                  onChange={field.onChange}
                />
                </FormControl>
                <FormMessage>{fieldState.error?.message}</FormMessage>
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-4">
        <Button type="submit">Simpan</Button>
      </div>
    </form>
  )
  
  const TambahPekerjaDialog = (
    <form 
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        tenagaKerjaForm.handleSubmit(handleTambahTenagaKerja)(e)
      }}
    >
      <FormField
        control={tenagaKerjaForm.control}
        name="nama"
        render={({field, fieldState}) => (
          <FormItem>
            <FormLabel>Tipe Pekerjaan</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Tipe Pekerjaan (e.g. Arsitektur, Sipil, etc.)" />
            </FormControl>
            <FormMessage>{fieldState.error?.message}</FormMessage>
          </FormItem>
        )}
      />
      <FormField
        control={tenagaKerjaForm.control}
        name="jumlah"
        render={({field, fieldState}) => (
          <FormItem>
            <FormLabel>Jumlah</FormLabel>
            <FormControl>
              <Input {...field} type='number' placeholder="Nama Pekerjaan" />
            </FormControl>
            <FormMessage>{fieldState.error?.message}</FormMessage>
          </FormItem>
        )}
      />
      <div className="mt-4 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => setIsTenagaKerjaDialogOpen(false)}>
          Batal
        </Button>
        <Button type="submit">Simpan</Button>
      </div>
    </form>
  )
  
  return (
    <Accordion title="Tahap 1: Tenaga Kerja">
      
      <ShadowContainer 
        title="Tenaga Kerja"  
        buttonName="Tentukan Shift"
        dialogTitle="Tentukan Shift"
        dialogDescription="Masukkan waktu mulai & berakhir shift"
        dialogContent={ShiftDialog}
        isDialogOpen={isShiftDialogOpen} 
        setIsDialogOpen={setIsShiftDialogOpen}
      >
        {/* Manajemen Section */}
        <div className="mb-6">
          {isShiftSelected ? (
            <>
              <h4 className="font-semibold text-md mb-2">Manajemen</h4>
              <div className="grid grid-cols-2 gap-4">
                {isShiftSelected ? (tenagaKerjaFields
                  .filter((field) => field.tipe === 'Manajemen')
                  .map((field, index) => (
                    <FormField
                      key={field.peran}
                      control={control}
                      name={`tenaga_kerja_arr.${index}.jumlah`}
                      render={({ field: jumlahField }) => (
                        <FormItem>
                          <FormLabel>{field.peran}</FormLabel>
                          <FormControl>
                            <Input {...jumlahField} type="number" min={0} className="w-full border rounded p-2 text-center" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))) : (
                    <div className="flex-col space-y-2 mt-[-12px]">
                      <div className="text-gray-500 mt-4">Silahkan tentukan shift terlebih dahulu.</div>
                    </div>
                  ) 
                }
              </div>
            </>
          ) : (
            <div className="flex items-center">
              <div className="text-gray-500">Silahkan tentukan shift terlebih dahulu.</div>
            </div>
          )}
        </div>
      </ShadowContainer>
      
      {isShiftSelected && (  
        <ShadowContainer 
          className="mt-4"
          title="Lapangan" 
          buttonName="Tambah Pekerjaan Baru" 
          dialogTitle="Tambah Tenaga Kerja Baru"
          dialogDescription="Masukkan tipe pekerjaan dan jumlah tenaga kerja untuk pekerjaan baru."
          dialogContent={TambahPekerjaDialog}
          isDialogOpen={isTenagaKerjaDialogOpen} 
          setIsDialogOpen={setIsTenagaKerjaDialogOpen}
        >
          <div className="grid grid-cols-2 gap-4">
            {tenagaKerjaFields
              .filter((field) => field.tipe === "Lapangan")
              .map((field, index) => (
                <div key={field.peran} className="flex items-center justify-center gap-2">
                  <FormField
                    control={control}
                    name={`tenaga_kerja_arr.${index + manajemenFieldLength}.jumlah`}
                    render={({field: jumlahField}) => (
                      <FormItem className="w-full">
                        <FormLabel>
                          {field.peran
                            .toLowerCase()
                            .replace(/\b\w/g, (char) => char.toUpperCase())}
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...jumlahField}
                            className="w-full border rounded p-2 text-center"
                            type="number" 
                            min={0}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {!defaultTenagaKerja.includes(field.peran.toLowerCase()) && (
                    <button
                      onClick={() => handleHapusTenagaKerja(index)}
                      className="ml-1 mt-[12px] text-red-600 hover:text-red-800"
                    >
                      <MdDelete size={20} />
                    </button>
                  )}
                </div>
              ))}
          </div>
        </ShadowContainer>
      )}
    </Accordion>
  );
}
