import { CreateMitraRequest } from "@/api/MitraApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import MitraSection from "./MitraSection";
import KontrakSection from "./KontrakSection";
import AkunSection from "./AkunSection";
import { Button } from "@/components/ui/button";
import LoadingButton from "@/components/LoadingButton";
import { Form } from "@/components/ui/form";

const formSchema = z.object({
  
    mitra: z.object({
      nama: z.string().min(1, "Nama perusahaan wajib diisi").max(50, "Nama perusahaan terlalu panjang"),
      alamat: z.string().min(1, "Alamat perusahaan wajib diisi").max(50, "Alamat perusahaan terlalu panjang"),
      nomor_telepon: z.string().min(12, "Nomor telepon perusahaan wajib diisi").max(20, "Nomor telepon perusahaan terlalu panjang"),
    }),
    
    kontrak: z.object({
      nama: z.string().min(1, "Nama kontrak wajib diisi").max(40, "Nama kontrak terlalu panjang"),
      nomor: z.string().min(1, "Nomor kontrak wajib diisi").max(20, "Nomor kontrak terlalu panjang"),
      tanggal: z.string().min(1, "Tanggal kontrak wajib diisi").max(10, "Format tanggal tidak valid"), // Asumsi format YYYY-MM-DD,
      nilai: z.coerce.number().min(1, "Nilai kontrak wajib diisi").max(1000000000000, "Nilai kontrak terlalu panjang"),
      jangka_waktu: z.coerce.number().min(1, "Jangka waktu wajib diisi").max(100000, "Jangka waktu terlalu panjang")
    }),
    
    pekerjaan_arr: z.array(
      z.object({
        nama: z.string().min(1,"Nama Pekerjaan wajib diisi").max(50,"Nama pekerjaan terlalu panjang"),
        lokasi: z.string().min(1,"Lokasi Pekerjaan wajib diisi").max(50,"Lokasi pekerjaan terlalu panjang")
      })
    ).nonempty("Tolong masukkan minimal 1 pekerjaan."),
    
    user: z.object({
      email: z.string().email("Email tidak valid").max(55, "Email terlalu panjang"),
      nama_lengkap: z.string().min(1, "Nama lengkap wajib diisi").max(40, "Nama lengkap terlalu panjang"),
      nomor_telepon: z.string().min(12, "Nomor telepon wajib diisi").max(20, "Nomor telepon terlalu panjang"),
    })
})

type tambahMitraFormData = z.infer<typeof formSchema>

type Props = {
    onSubmit: (tambahMitraFormData: CreateMitraRequest) => void,
    isLoading: boolean
}

const TambahMitraForm = ({onSubmit, isLoading}: Props) => {
    const form = useForm<tambahMitraFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            mitra: {
                nama: "",
                alamat: "",
                nomor_telepon: "",
            },
            kontrak: {
                nama: "",
                nomor: "",
                tanggal: "",
                nilai: 0,
                jangka_waktu: 0,
            },
            pekerjaan_arr: [],
            user: {
                email: "",
                nama_lengkap: "",
                nomor_telepon: "",
            },
        }
    })
    
    function handleSubmit(formData: tambahMitraFormData) {
        console.log(formData) //Debug.
        onSubmit(formData)
    }
    
    return (
        <Form {...form}>
            <form 
                onSubmit={form.handleSubmit(handleSubmit)}
            >
                <MitraSection/>
                <KontrakSection/>
                <AkunSection/>
                <div className='w-full flex items-center gap-x-3 '>
                    <Button type='reset' className='w-1/3' variant="outline" asChild >
                        <Link to="/daftarmitra">Back</Link>
                    </Button>
                    {isLoading ? <div className="w-1/3"><LoadingButton/></div> : <Button type='submit' className='w-2/3'>Submit</Button>}
                </div>
            </form>
        </Form>
    )   
}

export default TambahMitraForm