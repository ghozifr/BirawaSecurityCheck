import { Pekerjaan } from "@/types"
import { useMutation, useQuery } from "react-query"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

type CreateKontrakRequest = {
    nama_mitra: string,
    nama: string,
    nomor: string,
    tanggal: string,
    nilai: number,
    jangka_waktu: number,
    pekerjaan_arr: Pekerjaan[]
}

export function useCreateKontrak() {
    async function useCreateKontrakRequest(kontrak: CreateKontrakRequest) {
        // const csrfToken = await getCsrfToken() // Hasn't implemented csrf token yet.
        const response = await fetch(`${API_BASE_URL}/api/kontrak`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "X-Client-Type": "web"
                // "X-CSRF-TOKEN": csrfToken // Hasn't implemented csrf token yet.
            },
            body: JSON.stringify(kontrak),
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
        mutateAsync: createKontrak,
        isLoading,
        isSuccess,
        error
    } = useMutation(useCreateKontrakRequest)

    return {createKontrak, isLoading, isSuccess, error}
}

type GetKontrakPekerjaansRequest = {
    nama_mitra: string | undefined,
    nomor_kontrak: string | undefined
}

export function useGetKontrakPekerjaans(detailKontrak: GetKontrakPekerjaansRequest | null, options: {enabled?: boolean} = {enabled: true}) {
    const {enabled} = options
    async function useGetKontrakPekerjaansRequest () {
        // const csrfToken = await getCsrfToken() // Hasn't implemented csrf token yet.
        const response = await fetch(`${API_BASE_URL}/api/kontrak/pekerjaans`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "X-Client-Type": "web"
                // "X-CSRF-TOKEN": csrfToken // Hasn't implemented csrf token yet.
            },
            body: JSON.stringify(detailKontrak),
            credentials: 'include'
        })
        if (!response.ok) {
            throw new Error("Failed to get kontrak's pekerjaan(s).")
        }
        return response.json()
    }
    
    const { data: kontrakPekerjaans, isLoading, refetch } = useQuery( ["fetchKontrakPekerjaans", detailKontrak], useGetKontrakPekerjaansRequest, { enabled: enabled && !!detailKontrak } )
    
    return { kontrakPekerjaans, isLoading, refetch }
}

export function getKontraks() {
    async function useGetKontraksRequest () {
        // const csrfToken = await getCsrfToken() // Hasn't implemented csrf token yet.
        const response = await fetch(`${API_BASE_URL}/api/kontrak/all`, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "X-Client-Type": "web"
                // "X-CSRF-TOKEN": csrfToken // Hasn't implemented csrf token yet.
            },
            credentials: 'include'
        })
        if (!response.ok) {
            throw new Error('Failed to get all user.')
        }
        return response.json()
    }
    
    const { data: allKontrak, isLoading } = useQuery( "fetchMitra", useGetKontraksRequest )
    
    return { allKontrak, isLoading }
}