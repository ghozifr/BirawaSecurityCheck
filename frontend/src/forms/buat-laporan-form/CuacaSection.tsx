import { useFormContext, useFieldArray, useForm } from "react-hook-form";
import Accordion from "@/components/custom/atom/Accordion";
import ShadowContainer from "@/components/custom/atom/ShadowContainer";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { capitalizeWords, parseTimeToMinutes } from "@/lib/utils";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import CustomTimePicker from "@/components/CustomTimePicker";
import { MdDelete } from "react-icons/md";

export const timeSegments = [
  { waktu: "pagi", tipe: "cerah", waktu_mulai: "06:00", waktu_berakhir: "11:59" },
  { waktu: "siang", tipe: "cerah", waktu_mulai: "12:00", waktu_berakhir: "14:59" },
  { waktu: "sore", tipe: "cerah", waktu_mulai: "15:00", waktu_berakhir: "17:59" },
  { waktu: "malam", tipe: "cerah", waktu_mulai: "18:00", waktu_berakhir: "22:00" },
];

const cuacaSchema = z.object({
  tipe: z.string().min(1, "Tipe wajib diisi").max(50, "Tipe terlalu panjang"),
  waktu_mulai: z.string().min(1, "Waktu mulai wajib diisi").max(50, "Waktu terlalu panjang"),
  waktu_berakhir: z.string().min(1, "Waktu berakhir wajib diisi").max(50, "Waktu terlalu panjang"),
});

export default function CuacaSection() {
  const { control, getValues, setValue, watch } = useFormContext<{
    cuaca_arr: { waktu: string; tipe: string; waktu_mulai: string; waktu_berakhir: string }[];
    shift: { waktu_mulai: string; waktu_berakhir: string };
  }>();

  const { fields, remove } = useFieldArray({
    control,
    name: "cuaca_arr",
  });

  const shift = watch("shift");
  const shiftStart = parseTimeToMinutes(shift?.waktu_mulai || "");
  const shiftEnd = parseTimeToMinutes(shift?.waktu_berakhir || "");
  const isShiftSelected = shift?.waktu_mulai && shift?.waktu_berakhir;

  const cuacaForm = useForm({
    resolver: zodResolver(cuacaSchema),
    defaultValues: { tipe: "", waktu: "", waktu_mulai: shift?.waktu_mulai || "", waktu_berakhir: shift?.waktu_berakhir || "" },
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCuaca, setSelectedCuaca] = useState("");

  const handleTambahCuaca = (data: { tipe: string; waktu_mulai: string; waktu_berakhir: string }) => {
    const startMinutes = parseTimeToMinutes(data.waktu_mulai);
    const endMinutes = parseTimeToMinutes(data.waktu_berakhir);
  
    let hasError = false;
  
    if (startMinutes < shiftStart || endMinutes > shiftEnd) {
      cuacaForm.setError("waktu_mulai", { message: "Waktu harus berada dalam rentang shift." });
      cuacaForm.setError("waktu_berakhir", { message: "Waktu harus berada dalam rentang shift." });
      hasError = true;
    }
  
    if (startMinutes >= endMinutes) {
      cuacaForm.setError("waktu_mulai", { message: "Waktu mulai harus lebih kecil dari waktu berakhir." });
      cuacaForm.setError("waktu_berakhir", { message: "Waktu berakhir harus lebih besar dari waktu mulai." });
      hasError = true;
    }
  
    if (hasError) return;
  
    const newRows = []
    for (const segment of timeSegments) {
      const waktuMulaiCuaca = parseTimeToMinutes(data.waktu_mulai);
      const waktuBerakhirCuaca = parseTimeToMinutes(data.waktu_berakhir);
      const segmentStart = parseTimeToMinutes(segment.waktu_mulai);
      const segmentEnd = parseTimeToMinutes(segment.waktu_berakhir);

      if (waktuMulaiCuaca < segmentEnd && waktuBerakhirCuaca > segmentStart) {
        let waktu_mulai = Math.max(waktuMulaiCuaca, segmentStart) === waktuMulaiCuaca ? data.waktu_mulai : segment.waktu_mulai
        let waktu_berakhir = Math.min(waktuBerakhirCuaca, segmentEnd) === waktuBerakhirCuaca ? data.waktu_berakhir : segment.waktu_berakhir
        
        waktu_mulai = waktu_mulai.length != 8 ? waktu_mulai + ":00" : waktu_mulai
        waktu_berakhir = waktu_berakhir.length != 8 ? waktu_berakhir + ":00" : waktu_berakhir
        
        const currentCuacaArr = getValues("cuaca_arr") || [];
        const existingSegment = currentCuacaArr.find(
          (cuaca) => cuaca.waktu === segment.waktu
        );

        if (existingSegment) {
          // If the segment exists, compare the waktu_mulai and add the later one
          if (parseTimeToMinutes(existingSegment.waktu_mulai) < parseTimeToMinutes(waktu_mulai)) {
            // Replace the existing segment with the new one (with the latest waktu_mulai)
            const updatedCuacaArr = currentCuacaArr.map((cuaca) =>
              cuaca.waktu === segment.waktu ? { ...cuaca, tipe: data.tipe, waktu_mulai, waktu_berakhir } : cuaca
            );
            setValue("cuaca_arr", updatedCuacaArr);
          }
        } else {
          // If the segment doesn't exist, just add the new one
          newRows.push({
            waktu: segment.waktu,
            tipe: data.tipe,
            waktu_mulai,
            waktu_berakhir,
          });
        }
      }
    }
  
    const currentCuacaArr = getValues("cuaca_arr") || [];
    setValue("cuaca_arr", [...currentCuacaArr, ...newRows]);
  
    cuacaForm.reset({
      tipe: "",
      waktu_mulai: "",
      waktu_berakhir: "",
    });
    
    setSelectedCuaca('')
    setIsDialogOpen(false);
  };

  const CuacaDialog = (
    <>
      {isShiftSelected ? (
        <form 
          className="flex flex-col gap-4" 
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            cuacaForm.handleSubmit(handleTambahCuaca)(e)
          }}>
          <div>
            <p className="block text-sm font-semibold mb-2">Cuaca</p>
            <div className="flex space-x-4 mb-4">
              <Button
                type="button"
                variant={selectedCuaca === "Hujan" ? "default" : "outline"}
                onClick={() => {
                  setSelectedCuaca("Hujan");
                  cuacaForm.setValue("tipe", "hujan");
                }}
              >
                Hujan
              </Button>
              <Button
                type="button"
                variant={selectedCuaca === "Gerimis" ? "default" : "outline"}
                onClick={() => {
                  setSelectedCuaca("Gerimis");
                  cuacaForm.setValue("tipe", "gerimis");
                }}
              >
                Gerimis
              </Button>
            </div>
            {cuacaForm.formState.errors.tipe && (
              <p className="text-red-500 text-[14px] font-[500]">
                {cuacaForm.formState.errors.tipe.message}
              </p>
            )}
          </div>

          <div>
            <p className="block text-sm font-semibold mb-2">Pukul</p>
            <div className="flex space-x-4 w-full">
              <FormField
                control={cuacaForm.control}
                name="waktu_mulai"
                render={({ field, fieldState }) => (
                  <FormItem className="w-full">
                    <FormLabel>Waktu Mulai</FormLabel>
                    <FormControl>
                      <CustomTimePicker
                        value={field.value}
                        onChange={(value) => {field.onChange(value)}}
                      />
                    </FormControl>
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={cuacaForm.control}
                name="waktu_berakhir"
                render={({ field, fieldState }) => (
                  <FormItem className="w-full">
                    <FormLabel>Waktu Berakhir</FormLabel>
                    <FormControl>
                      <CustomTimePicker
                        value={field.value}
                        onChange={(value) => {field.onChange(value)}}
                      />
                    </FormControl>
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="mt-4">
            <Button type="submit">Simpan</Button>
          </div>
        </form>
      ) : (
        <div className="flex-col space-y-2 mt-[-12px]">
          <div className="text-gray-500">Silahkan tentukan shift terlebih dahulu.</div>
          <Button onClick={() => setIsDialogOpen(false)}>Kembali</Button>
        </div>
      )}
    </>
  );

  return (
    <Accordion title="Tahap 3: Cuaca">
      <ShadowContainer
        title="Cuaca"
        buttonName="Tambah Cuaca Baru"
        dialogTitle="Tambah Cuaca Baru"
        dialogDescription="Silahkan masukkan data cuaca"
        dialogContent={CuacaDialog}
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
      >
        <div className="flex-col">
          <h3 className="text-red-500 underline font-bold text-sm my-2">Tolong tambahkan data cuaca jika dan hanya jika terjadi hujan atau gerimis. Selain daripada itu, cuaca akan dianggap cerah dari pada saat mulai hingga berakhirnya shift.</h3>
          <div className="flex gap-4 my-3 text-sm"  >
              <span> <strong>Pagi:</strong> 06:00 - 11:59</span>
              <span> <strong>Siang:</strong> 12:00 - 14:59</span>
              <span> <strong>Sore:</strong> 15:00 - 17:59</span>
              <span> <strong>Malam:</strong> 18:00 - 22:00</span>
          </div>
          <div className="w-full">
            {isShiftSelected ? (
              <table className="w-full text-center text-sm border border-gray-300">
                <thead className="bg-gray-200 border-b border-gray-300">
                  <tr>
                    <th className="p-4 font-semibold text-gray-600 w-[20%]">Waktu</th>
                    <th className="p-4 font-semibold text-gray-600 w-[20%]">Tipe</th>
                    <th className="p-4 font-semibold text-gray-600 w-[20%]">Waktu Mulai</th>
                    <th className="p-4 font-semibold text-gray-600 w-[20%]">Waktu Berakhir</th>
                    <th className="p-4 font-semibold text-gray-600 w-[20%]">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {fields.length === 0 ? (
                    <tr>
                      <td className="p-4 text-gray-500" colSpan={5}>
                        Belum ada data cuaca yang ditambahkan
                      </td>
                    </tr>
                  ) : (
                    fields.map((field, index) => (
                      <tr key={field.waktu}>
                        <td className="p-4 text-gray-700">{capitalizeWords(field.waktu)}</td>
                        <td className="p-4 text-gray-700">{capitalizeWords(field.tipe)}</td>
                        <td className="p-4 text-gray-700">{field.waktu_mulai.substring(0, 5)}</td>
                        <td className="p-4 text-gray-700">{field.waktu_berakhir.substring(0, 5)}</td>
                        <td className="p-4 text-gray-700">
                          <button
                            onClick={() => remove(index)}
                            className="ml-1 mt-[12px] text-red-600 hover:text-red-800"
                          >
                            <MdDelete size={20} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <div className="text-center text-gray-500 p-4">
                Silakan tentukan shift terlebih dahulu.
              </div>
            )}
          </div>
        </div>
      </ShadowContainer>
    </Accordion>
  );
}
