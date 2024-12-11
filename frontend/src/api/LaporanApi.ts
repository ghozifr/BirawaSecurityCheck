import { toast, useToast } from "@/hooks/use-toast";
import { Aktivitas, Cuaca, Shift, TenagaKerja } from "@/types";
import { useMutation, useQuery } from "react-query";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export type CreateLaporanRequest = {
    nama_mitra: string,
    nomor_kontrak: string,
    nama_pekerjaan: string,
    tanggal: string,
    shift: Shift,
    tenaga_kerja_arr: TenagaKerja[],
    aktivitas_arr: Aktivitas[],
    cuaca_arr: Cuaca[]
};

export function useCreateLaporan() {
    const {toast} = useToast()
    async function useCreateLaporanRequest (formData: FormData) {        
        // const csrfToken = await getCsrfToken() // Hasn't implemented csrf token yet.
        const response = await fetch(`${API_BASE_URL}/api/laporan`, {
            method: 'POST',
            headers: {
                "X-Client-Type": "web"
                // "X-CSRF-TOKEN": csrfToken // Hasn't implemented csrf token yet.
            },
            body: formData,
            credentials: 'include'
        })
        if (!response.ok) {
            const data = await response.json()
            // toast.error(data.message)
            throw new Error(data.message)
        }
        return response.json()
    }
    const {
        mutateAsync: createLaporan,
        isLoading,
        isSuccess,
        error,
        // reset
    } = useMutation(useCreateLaporanRequest)

    if (isSuccess) {
        toast({
            title: "Laporan berhasil dibuat!",
            variant: "success"
        })
    }

    if (error) {
        toast({
            title: error.toString(),
            variant: 'danger'
        }) //Debug.
        // reset()
    }

    return {createLaporan, isLoading}
}

export function useGetLaporan(id: string | undefined, options: {enabled: boolean}) {
    async function useGetLaporanRequest () {
        // const csrfToken = await getCsrfToken() // Hasn't implemented csrf token yet.
        const response = await fetch(`${API_BASE_URL}/api/laporan/${id}`, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "X-Client-Type": "web"
                // "X-CSRF-TOKEN": csrfToken // Hasn't implemented csrf token yet.
            },
            credentials: 'include'
        })
        if (!response.ok) {
            throw new Error('Failed to get laporan.')
        }
        return response.json()
    }
    
    const { data: laporan, isLoading, refetch } = useQuery( ["fetchLaporan", id], useGetLaporanRequest, { enabled: options.enabled && !!id, retry: false })
    
    return { laporan, isLoading, refetch }
}

type GetPekerjaanLaporansRequest = {
    nama_mitra: string | undefined ,
    nomor_kontrak: string | undefined,
    nama_pekerjaan: string | undefined
}

export function useGetPekerjaanLaporans(pekerjaan: GetPekerjaanLaporansRequest | null, options: {enabled: boolean}) {
    async function useGetPekerjaanLaporansRequest () {
        // const csrfToken = await getCsrfToken() // Hasn't implemented csrf token yet.
        const response = await fetch(`${API_BASE_URL}/api/laporan/laporan-pekerjaan`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "X-Client-Type": "web"
                // "X-CSRF-TOKEN": csrfToken // Hasn't implemented csrf token yet.
            },
            body: JSON.stringify(pekerjaan),
            credentials: 'include'
        })
        if (!response.ok) {
            toast({
                title: "There's no laporan found.",
                variant: 'danger'
            })
            throw new Error("Failed to get pekerjaan's laporan(s).")
        }
        return response.json()
    }
    
    const { data: pekerjaanLaporans, isLoading, refetch } = useQuery( ["fetchPekerjaanLaporans", pekerjaan], useGetPekerjaanLaporansRequest, { enabled: options.enabled && !!pekerjaan, retry: false } )
    
    return { pekerjaanLaporans, isLoading, refetch }
}

export function useGetLaporans() {
    async function useGetLaporansRequest () {
        // const csrfToken = await getCsrfToken() // Hasn't implemented csrf token yet.
        const response = await fetch(`${API_BASE_URL}/api/laporan/all`, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "X-Client-Type": "web"
                // "X-CSRF-TOKEN": csrfToken // Hasn't implemented csrf token yet.
            },
            credentials: 'include'
        })
        if (!response.ok) {
            throw new Error('Failed to get all laporan.')
        }
        return response.json()
    }
    
    const { data: allLaporan, isLoading } = useQuery( "fetchLaporans",  useGetLaporansRequest)
    
    return { allLaporan, isLoading }
}