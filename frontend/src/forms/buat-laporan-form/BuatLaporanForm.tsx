import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import LoadingButton from "@/components/LoadingButton"
import TenagaKerjaSection from "./TenagaKerjaSection"
import AktivitasSection from "./AktivitasSection"
import CuacaSection, { timeSegments } from "./CuacaSection"
import { useEffect } from "react"
import { getCurrentDate, parseTimeToMinutes } from "@/lib/utils"
import { TenagaKerja } from "@/types"

const MAX_FILE_SIZE = 2 * 1024 * 1024 //2MB
const VALID_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png']

const formSchema = z.object({
  shift: z.object({
    nama: z.string().min(1, "Nama shift wajib diisi").max(2, "Nama shift terlalu panjang"),
    waktu_mulai: z.string().min(1, "Waktu mulai shift wajib diisi").max(50, "Nama pekerjaan terlalu panjang"),
    waktu_berakhir: z.string().min(1, "Waktu berakhir shift wajib diisi").max(50, "Nama pekerjaan terlalu panjang"),
  }),
  tenaga_kerja_arr: z.array(
    z.object({
      tipe: z.string().min(1, "Tipe wajib diisi").max(50, "Tipe terlalu panjang"),
      peran: z.string().min(1, "Peran wajib diisi").max(50, "Peran terlalu panjang"),
      jumlah: z.coerce.number().min(0, "Jumlah wajib diisi").max(50, "Jumlah maksimal 50"),
    })
  )
  .nonempty("Tolong masukkan minimal data tenaga kerja"),
  aktivitas_arr: z
    .array(
      z.object({
        tipe: z.string().min(1, "Tipe wajib diisi").max(50, "Tipe terlalu panjang"),
        nama: z.string().min(1, "Nama wajib diisi").max(50, "Nama terlalu panjang"),
        dokumentasi: z.array(
          z.object({
            deskripsi: z.string().min(1, "Deskripsi wajib diisi").max(50, "Deskripsi terlalu panjang"),
          })
        ),
      })
    )
    .nonempty("Tolong masukkan minimal 1 aktivitas."),
  cuaca_arr: z.array(
    z.object({
      waktu: z.string().min(1, "Waktu wajib diisi").max(50, "Waktu terlalu panjang"),
      tipe: z.string().min(1, "Tipe wajib diisi").max(50, "Tipe terlalu panjang"),
      waktu_mulai: z.string().min(1, "Waktu mulai wajib diisi").max(50, "Waktu terlalu panjang"),
      waktu_berakhir: z.string().min(1, "Waktu berakhir wajib diisi").max(50, "Waktu terlalu panjang"),
    })
  ),
  image_arr: z.array(
      z.instanceof(File)
        .refine((file) => file.size <= MAX_FILE_SIZE, "File size must be less than 2MB")
        .refine(
          (file) => VALID_IMAGE_TYPES.includes(file.type),
          "Invalid file type. Only .jpeg, .jpg, and .png are allowed."
        )
    )
    .nonempty("Tolong masukkan 2 foto per aktivitas")
})
.refine((data) => data.aktivitas_arr.length * 2 === data.image_arr.length, {
  message: "Amount of photo must be equal twice the aktivitas", 
  path: ["image_arr"]
})
.refine((data) => {
  const lapanganItems = data.tenaga_kerja_arr.filter(
    (tenaga: TenagaKerja) => tenaga.tipe.toLowerCase() === "lapangan" && tenaga.jumlah > 0
  );
  const aktivitasArr = data.aktivitas_arr;
  const setOfTipeAktivitas = new Set(aktivitasArr.map((aktivitas) => aktivitas.tipe))
  
  return Array.from(setOfTipeAktivitas).length === lapanganItems.length
}, {
    message: "Each tenaga kerja must have at least one aktivitas.",
    path: ["aktivitas_arr"]
  }
)

type buatLaporanFormData = z.infer<typeof formSchema>

type Props = {
  nama_mitra: string,
  nomor_kontrak: string,
  nama_pekerjaan: string,
  onSubmit: (formData: FormData) => void;
  isLoading: boolean;
};

export default function BuatLaporanForm({ nama_mitra, nomor_kontrak, nama_pekerjaan, onSubmit, isLoading }: Props) {
  
  // console.log("Nama mitra (blf):", nama_mitra) //Debug.
  // console.log("Nomor kontrak (blf):", nomor_kontrak) //Debug.
  // console.log("Nama pekerjaan (blf):", nama_pekerjaan) //Debug.
  
  const form = useForm<buatLaporanFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      shift: {
        nama: "",
        waktu_mulai: "",
        waktu_berakhir: "",
      },
      tenaga_kerja_arr: [
        {
          tipe: "Manajemen",
          peran: "Admin Project",
          jumlah: 0
        },
        {
          tipe: "Manajemen",
          peran: "Drafter",
          jumlah: 0
        },
        {
          tipe: "Manajemen",
          peran: "Project Manager",
          jumlah: 0
        },
        {
          tipe: "Manajemen",
          peran: "Site Engineer",
          jumlah: 0
        },
        {
          tipe: "Manajemen",
          peran: "Site Manager",
          jumlah: 0
        },
        {
          tipe: "Lapangan",
          peran: "Pekerja Arsitektur",
          jumlah: 0
        },
        {
          tipe: "Lapangan",
          peran: "Pekerja Furnitur",
          jumlah: 0
        },
        {
          tipe: "Lapangan",
          peran: "Pekerja Mekanikal Elektrik",
          jumlah: 0
        },
        {
          tipe: "Lapangan",
          peran: "Pekerja Sipil",
          jumlah: 0
        },
      ],
      aktivitas_arr: [],
      cuaca_arr: [],
      image_arr: []
    },
  })
  
  useEffect(() => {
    console.log("Validation errors:", form.formState.errors)
  }, [form.formState.errors]) //Debug.

  const handleSubmit = (formData: buatLaporanFormData) => {
    const formDataPayload = new FormData();
  
    const shiftStart = parseTimeToMinutes(formData.shift.waktu_mulai);
    const shiftEnd = parseTimeToMinutes(formData.shift.waktu_berakhir)
    const expected_cuaca_arr_length = timeSegments.reduce((count, segment) => {
      const segmentStart = parseTimeToMinutes(segment.waktu_mulai);
      const segmentEnd = parseTimeToMinutes(segment.waktu_berakhir);
    
      // Check for overlap between shift and segment
      if (shiftStart < segmentEnd && shiftEnd > segmentStart) {
        return count + 1; // Increment the count if there's an overlap
      }
    
      return count; // Otherwise, return the current count
    }, 0); // Initialize count to 0
    
    console.log("Expected cuaca arr length:", expected_cuaca_arr_length)
    
    if (formData.cuaca_arr.length !== expected_cuaca_arr_length) {
      // Iterate through each time segment to find missing ones
      timeSegments.forEach((segment) => {
        const segmentStart = parseTimeToMinutes(segment.waktu_mulai);
        const segmentEnd = parseTimeToMinutes(segment.waktu_berakhir);
    
        if (shiftStart < segmentEnd && shiftEnd > segmentStart) {
          // Check if this time segment is already in cuaca_arr
          const isSegmentFilled = formData.cuaca_arr.some((cuaca) => {
            const cuacaStart = parseTimeToMinutes(cuaca.waktu_mulai);
            const cuacaEnd = parseTimeToMinutes(cuaca.waktu_berakhir);
    
            // Determine if the cuaca entry covers the current segment
            return (
              cuacaStart >= segmentStart && cuacaEnd <= segmentEnd
            );
          });
    
          // If the segment is not filled, add a default "Cerah" entry
          if (!isSegmentFilled) {
            let waktu_mulai = Math.max(shiftStart, segmentStart) === shiftStart
              ? formData.shift.waktu_mulai
              : segment.waktu_mulai;
            let waktu_berakhir = Math.min(shiftEnd, segmentEnd) === shiftEnd
              ? formData.shift.waktu_berakhir
              : segment.waktu_berakhir;
    
            // Ensure times are in HH:mm:ss format
            waktu_mulai = waktu_mulai.length !== 8 ? `${waktu_mulai}:00` : waktu_mulai;
            waktu_berakhir = waktu_berakhir.length !== 8 ? `${waktu_berakhir}:00` : waktu_berakhir;
    
            formData.cuaca_arr.push({
              waktu: segment.waktu,
              tipe: "Cerah",
              waktu_mulai,
              waktu_berakhir,
            });
          }
        }
      });
    }
    // }
  
    // Prepare the payload
    formDataPayload.append(
      "data",
      JSON.stringify({
        nama_mitra,
        nomor_kontrak,
        nama_pekerjaan,
        tanggal: getCurrentDate(),
        shift: formData.shift,
        tenaga_kerja_arr: formData.tenaga_kerja_arr.filter(
          (data: TenagaKerja) => data.jumlah > 0
        ),
        aktivitas_arr: formData.aktivitas_arr,
        cuaca_arr: formData.cuaca_arr,
      })
    );
  
    formData.image_arr.forEach((file) => {
      formDataPayload.append(`files`, file as Blob, file.name);
    });
  
    // Submit the payload
    onSubmit(formDataPayload);
  };
  
  const handleRawSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    console.log("FORM IS ABOUT TO BE SUBMITTED......")
    event.preventDefault() // Prevent form submission
    event.stopPropagation()
    const rawData = form.getValues() // Get form data before validation
    
    const shiftStart = parseTimeToMinutes(rawData.shift.waktu_mulai);
    const shiftEnd = parseTimeToMinutes(rawData.shift.waktu_berakhir)
    const expected_cuaca_arr_length = timeSegments.reduce((count, segment) => {
      const segmentStart = parseTimeToMinutes(segment.waktu_mulai);
      const segmentEnd = parseTimeToMinutes(segment.waktu_berakhir);
    
      // Check for overlap between shift and segment
      if (shiftStart < segmentEnd && shiftEnd > segmentStart) {
        return count + 1; // Increment the count if there's an overlap
      }
    
      return count; // Otherwise, return the current count
    }, 0); // Initialize count to 0
    
    console.log("Expected cuaca arr length:", expected_cuaca_arr_length)
    
    if (rawData.cuaca_arr.length !== expected_cuaca_arr_length) {
      // Iterate through each time segment to find missing ones
      timeSegments.forEach((segment) => {
        const segmentStart = parseTimeToMinutes(segment.waktu_mulai);
        const segmentEnd = parseTimeToMinutes(segment.waktu_berakhir);
    
        if (shiftStart < segmentEnd && shiftEnd > segmentStart) {
          // Check if this time segment is already in cuaca_arr
          const isSegmentFilled = rawData.cuaca_arr.some((cuaca) => {
            const cuacaStart = parseTimeToMinutes(cuaca.waktu_mulai);
            const cuacaEnd = parseTimeToMinutes(cuaca.waktu_berakhir);
    
            // Determine if the cuaca entry covers the current segment
            return (
              cuacaStart >= segmentStart && cuacaEnd <= segmentEnd
            );
          });
    
          // If the segment is not filled, add a default "Cerah" entry
          if (!isSegmentFilled) {
            let waktu_mulai = Math.max(shiftStart, segmentStart) === shiftStart
              ? rawData.shift.waktu_mulai
              : segment.waktu_mulai;
            let waktu_berakhir = Math.min(shiftEnd, segmentEnd) === shiftEnd
              ? rawData.shift.waktu_berakhir
              : segment.waktu_berakhir;
    
            // Ensure times are in HH:mm:ss format
            waktu_mulai = waktu_mulai.length !== 8 ? `${waktu_mulai}:00` : waktu_mulai;
            waktu_berakhir = waktu_berakhir.length !== 8 ? `${waktu_berakhir}:00` : waktu_berakhir;
    
            rawData.cuaca_arr.push({
              waktu: segment.waktu,
              tipe: "cerah",
              waktu_mulai,
              waktu_berakhir,
            });
          }
        }
      });
    }
    
    const formDataPayload = {
      nama_mitra,
      nomor_kontrak,
      nama_pekerjaan,
      tanggal: getCurrentDate(),
      shift: rawData.shift,
      tenaga_kerja_arr: rawData.tenaga_kerja_arr.filter((data: TenagaKerja) => data.jumlah > 0),
      aktivitas_arr: rawData.aktivitas_arr,
      cuaca_arr: rawData.cuaca_arr,
      image_arr: rawData.image_arr
    }
    console.log("Raw Form Data (before validation):", rawData)
    console.log("Raw Form Data (after data processing):", formDataPayload)
  
    // Now trigger validation
    form.handleSubmit(handleSubmit)();
  }

  return (
    <Form {...form}>
      {/* <form onSubmit={form.handleSubmit(handleSubmit)}> */}
      <form onSubmit={handleRawSubmit}>
        <TenagaKerjaSection />
        <AktivitasSection />
        <CuacaSection />
        <div className="flex justify-end mt-6 gap-x-3">
          <Button type="reset" variant="outline">
            Reset
          </Button>
          {isLoading ? <LoadingButton /> : <Button type="submit" disabled={!form.formState.isValid}>Submit</Button>}
        </div>
      </form>
    </Form>
  );
}
