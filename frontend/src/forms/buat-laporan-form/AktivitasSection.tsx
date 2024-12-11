import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { useFieldArray, useFormContext } from "react-hook-form";
import Accordion from "@/components/custom/atom/Accordion";
import { DeleteIcon } from "lucide-react";
import ShadowContainer from "@/components/custom/atom/ShadowContainer";
import { useEffect, useMemo, useState } from "react";
import { Aktivitas, TenagaKerja } from "@/types";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Combobox from "@/components/Combobox";
import { Button } from "@/components/ui/button";
import { capitalizeWords } from "@/lib/utils";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const VALID_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

const aktivitasSchema = z.object({
  tipe: z.string().min(1, "* Silahkan masukkan kategori pekerjaan").max(50, "* Kategori pekerjaan terlalu panjang"),
  nama: z
    .string()
    .min(1, "* Silahkan masukkan deskripsi pekerjaan")
    .max(50, "* Deskripsi terlalu panjang"),
  dokumentasi: z.array(
      z.object({
        image: z
          .union([
            z.instanceof(File, { message: "Masukkan dokumentasi aktivitas." }),
            z.undefined(),
          ])
          .refine((file) => !!file, "* File harus diunggah")
          .refine((file) => file && VALID_IMAGE_TYPES.includes(file.type),
            "Format file tidak valid. Hanya .jpeg, .jpg, dan .png yang diperbolehkan."
          )
          .refine((file) => file && file.size <= MAX_FILE_SIZE, "Ukuran file harus kurang dari 2MB."),
        deskripsi: z.string().min(1, "Deskripsi wajib diisi").max(50, "Deskripsi terlalu panjang"),
      })
    )
    .nonempty(),
});

type AktivitasFormData = z.infer<typeof aktivitasSchema>;

export default function AktivitasSection() {
  const { control, getValues, setValue } = useFormContext();
  const { fields } = useFieldArray({
    control,
    name: "aktivitas_arr",
  });

  const tenagaKerjaArr = useWatch({
    control,
    name: "tenaga_kerja_arr",
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentAktivitasIndex, setCurrentAktivitasIndex] = useState<number | null>(null)
  const [selectedKategoriPekerjaan, setSelectedKategoriPekerjaan] = useState<string>("")
  const [validationError, setValidationError] = useState<string | null>(null);

  const aktivitasForm = useForm<AktivitasFormData>({
    resolver: zodResolver(aktivitasSchema),
    defaultValues: {
      tipe: "",
      nama: "",
      dokumentasi: [
        { deskripsi: "foto sebelum", image: undefined },
        { deskripsi: "foto sesudah", image: undefined },
      ],
    },
  });

  useEffect(() => {
    aktivitasForm.setValue("tipe", selectedKategoriPekerjaan)
    aktivitasForm.clearErrors("tipe")
  }, [selectedKategoriPekerjaan, aktivitasForm]);
  
  useEffect(() => {
    console.log(getValues('tenaga_kerja_arr'))
    console.log(getValues('aktivitas_arr'))
    console.log(getValues('image_arr'))
  }, [getValues('aktivitas_arr'), getValues('image_arr')]) //Debug.
  
  // useEffect(() => {
  //   validateLapanganActivities();
  // }, [getValues("aktivitas_arr"), getValues("tenaga_kerja_arr")])

  const handleTambahAktivitas = async (data: AktivitasFormData) => {
    const { dokumentasi, ...aktivitasData } = data;
    const currentAktivitasArr = getValues("aktivitas_arr") || [];
    const currentImageArr = getValues("image_arr") || [];

    // Check for duplicate 'nama'
    const isDuplicate = currentAktivitasArr.some(
      (aktivitas: Aktivitas, idx: number) =>
        aktivitas.nama === data.nama && idx !== currentAktivitasIndex
    );
    if (isDuplicate) {
      aktivitasForm.setError("nama", {
        message: "Nama aktivitas sudah ada. Harap masukkan nama yang berbeda.",
      });
      return;
    }

    const newImages = dokumentasi?.map((doc) => doc.image).filter(Boolean) || [];
    const newDescriptions = [
      { deskripsi: "foto sebelum" },
      { deskripsi: "foto sesudah" },
    ];

    if (currentAktivitasIndex === null) {
      // Add new activity
      const newAktivitas = { ...aktivitasData, dokumentasi: newDescriptions };
      setValue("aktivitas_arr", [...currentAktivitasArr, newAktivitas]);
      setValue("image_arr", [...currentImageArr, ...newImages]); // Append new images
    } else {
      // Edit existing activity
      const updatedAktivitasArr = [...currentAktivitasArr];
      updatedAktivitasArr[currentAktivitasIndex] = {
        ...updatedAktivitasArr[currentAktivitasIndex],
        ...aktivitasData,
        dokumentasi: newDescriptions,
      };
      setValue("aktivitas_arr", updatedAktivitasArr);
      setValue("image_arr", [...currentImageArr, ...newImages]); // Append new images
    }

    // Reset form state
    aktivitasForm.reset({
      tipe: "",
      nama: "",
      dokumentasi: [
        { deskripsi: "foto sebelum", image: undefined },
        { deskripsi: "foto sesudah", image: undefined },
      ],
    });

    setSelectedKategoriPekerjaan(""); // Reset selected category
    setIsDialogOpen(false);
    setCurrentAktivitasIndex(null);
  }
  
  const handleHapusAktivitas = (index: number) => {
    const currentAktivitasArr = getValues("aktivitas_arr") || [];
    const currentImageArr = getValues("image_arr") || [];
  
    // Each activity has two associated images; calculate their indices
    const imageStartIndex = index * 2;
    const imageEndIndex = imageStartIndex + 2;
  
    // Remove the activity from aktivitas_arr
    const updatedAktivitasArr = [...currentAktivitasArr];
    updatedAktivitasArr.splice(index, 1);
    setValue("aktivitas_arr", updatedAktivitasArr);
  
    // Remove the corresponding images from image_arr
    const updatedImageArr = [
      ...currentImageArr.slice(0, imageStartIndex),
      ...currentImageArr.slice(imageEndIndex),
    ];
    setValue("image_arr", updatedImageArr);
  }

  // const validateLapanganActivities = () => {
  //   const tenagaKerjaArr = getValues("tenaga_kerja_arr") || [];
  //   const aktivitasArr = getValues("aktivitas_arr") || [];
  
  //   const lapanganItems = tenagaKerjaArr.filter(
  //     (tenaga: TenagaKerja) => tenaga.tipe.toLowerCase() === "lapangan"
  //   );
  
  //   const missingActivities = lapanganItems.filter((lapangan: TenagaKerja) =>
  //     !aktivitasArr.some((aktivitas: Aktivitas) =>
  //       aktivitas.tipe.toLowerCase() === lapangan.peran.toLowerCase()
  //     )
  //   );
  
  //   if (missingActivities.length > 0) {
  //     setValidationError(
  //       "Setiap tenaga kerja dengan tipe 'Lapangan' harus memiliki setidaknya satu aktivitas."
  //     );
  //   } else {
  //     setValidationError(null);
  //   }
  // };
  
  
  const KategoriPekerjaanOptions = useMemo(() => {
    if (!tenagaKerjaArr) return [];
    
    const lapanganItems = tenagaKerjaArr.filter(
      (tenaga: TenagaKerja) => tenaga.tipe.toLowerCase() === "lapangan" && tenaga.jumlah > 0
    );
    
    const aktivitasArr = getValues("aktivitas_arr") || [];
    
    const setOfTipeAktivitas = new Set(aktivitasArr.map((aktivitas: Aktivitas) => aktivitas.tipe))
    
    if (Array.from(setOfTipeAktivitas).length !== lapanganItems.length) {
      console.log("Set of tipe aktivitas:", setOfTipeAktivitas) //Debug.
      console.log("Tenaga kerja lapangan:", lapanganItems) //Debug.
      console.log("AKtivitas array:", aktivitasArr) //Debug.
      setValidationError(
        "Setiap aktivitas harus memiliki koresponden tenaga kerja lapangan."
      );
    } else {
      setValidationError(null);
    }
    
    return tenagaKerjaArr
      .filter((data: TenagaKerja) => data.tipe === "Lapangan" && data.jumlah > 0)
      .map((data: TenagaKerja) => {
        const option = data.peran.split(" ");
        option[0] += "an";
        return { value: option.join(" ").toLowerCase(), label: option.join(" ") };
      });
  }, [tenagaKerjaArr, getValues('aktivitas_arr')]);

  const AktivitasDialog = (
    <form onSubmit={(e) => {
      e.preventDefault()
      e.stopPropagation()
      aktivitasForm.handleSubmit(handleTambahAktivitas)(e)
    }}>
      <div className="space-y-2">
        <div className="flex-col space-y-4">
          <div>
            <Combobox
              label="Pilih Kategori Pekerjaan"
              placeholder="Kategori Pekerjaan"
              options={KategoriPekerjaanOptions}
              selected={selectedKategoriPekerjaan}
              setSelected={setSelectedKategoriPekerjaan}
              emptyMessage="Silahkan masukkan tenaga kerja terlebih dahulu."
            />
            {aktivitasForm.formState.errors.tipe && (
              <p className="text-red-500 text-[13px] font-[500] mt-[10px]">
                {aktivitasForm.formState.errors.tipe.message}
              </p>
            )}
          </div>
          <FormField
            control={aktivitasForm.control}
            name="nama"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Deskripsi Pekerjaan</FormLabel>
                <FormControl>
                  <textarea
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 min-h-20 max-h-40"
                    placeholder="Masukan Detail Pekerjaan"
                    {...field}
                  />
                </FormControl>
                <FormMessage>{fieldState.error?.message}</FormMessage>
              </FormItem>
            )}
          />
        </div>
        <div className="flex space-x-4">
          {[0, 1].map((index) => (
            <div key={index} className="w-1/2">
              <FormField
                control={aktivitasForm.control}
                name={`dokumentasi.${index}.image`}
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>
                      {index === 0 ? "Foto Sebelum" : "Foto Sesudah"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="bg-white"
                        type="file"
                        accept=".jpg, .jpeg, .png"
                        onChange={(event) =>
                          field.onChange(
                            event.target.files ? event.target.files[0] : undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                  </FormItem>
                )}
              />
            </div>
          ))}
        </div>
        <Button type="submit">Simpan</Button>
      </div>
    </form>
  );

  return (
    <Accordion title="Tahap 2 : Aktivitas">
      <ShadowContainer
        title="Aktivitas"
        buttonName="Tambah Aktivitas Baru"
        dialogTitle="Tambah Aktivitas Baru"
        dialogDescription="Silahkan masukkan data aktivitas"
        dialogContent={AktivitasDialog}
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
      >
        <div className="w-full">
          <table className="w-full text-center text-sm border border-gray-300">
            <thead className="bg-gray-200 border-b border-gray-300">
              <tr>
                <th className="p-4 font-semibold text-gray-600 w-[25%]">Tipe Pekerjaan</th>
                <th className="p-4 font-semibold text-gray-600 w-[40%]">Nama Aktivitas</th>
                <th className="p-4 font-semibold text-gray-600 w-[10%]">Dokumentasi</th>
                <th className="p-4 font-semibold text-gray-600 w-[25%]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {fields.length === 0 ? (
                <tr>
                  <td className="p-4 text-gray-500" colSpan={4}>
                    Belum ada aktivitas yang ditambah
                  </td>
                </tr>
              ) : (
                fields.map((field, index) => (
                  <tr
                    key={field.id}
                    className={`${
                      index % 2 === 0 ? "bg-gray-100" : "bg-white"
                    } hover:bg-gray-100`}
                  >
                    <td className="p-4 text-gray-700">
                      {capitalizeWords(getValues(`aktivitas_arr.${index}.tipe`))}
                    </td>
                    <td className="p-4 text-gray-700">
                      {capitalizeWords(getValues(`aktivitas_arr.${index}.nama`))}
                    </td>
                    <td className="p-4 text-gray-700">2 Foto</td>
                    <td className="p-4 text-gray-700">
                      <div className="flex justify-center items-center">
                        <DeleteIcon
                          className="cursor-pointer hover:text-red-500"
                          onClick={() => handleHapusAktivitas(index)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {validationError && (
            <div className="mt-2 text-red-500 text-sm font-regular mt-2">* {validationError}</div>
          )}
        </div>
      </ShadowContainer>
    </Accordion>
  );
}
