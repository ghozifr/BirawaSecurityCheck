import { useMutation, useQuery } from "react-query";
import { Kontrak, Mitra, Pekerjaan, User } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export type CreateMitraRequest = {
    mitra: Mitra,
    kontrak: Kontrak,
    pekerjaan_arr: Pekerjaan[],
    user: User
};

export function useCreateMitra () {
    async function useCreateMitraRequest (mitra: CreateMitraRequest) {
        // const csrfToken = await getCsrfToken() // Hasn't implemented csrf token yet.
        const response = await fetch(`${API_BASE_URL}/api/mitra`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "X-Client-Type": "web"
                // "X-CSRF-TOKEN": csrfToken // Hasn't implemented csrf token yet.
            },
            body: JSON.stringify(mitra),
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
        mutateAsync: createMitra,
        isLoading,
        isSuccess,
        error,
        // reset
    } = useMutation(useCreateMitraRequest)

    return {createMitra, isLoading, isSuccess, error}
}

export function useGetMitra(nama_mitra: string) {
    async function useGetMitraRequest () {
        // const csrfToken = await getCsrfToken() // Hasn't implemented csrf token yet.
        const response = await fetch(`${API_BASE_URL}/api/mitra`, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "X-Client-Type": "web"
                // "X-CSRF-TOKEN": csrfToken // Hasn't implemented csrf token yet.
            },
            body: JSON.stringify({nama_mitra}),
            credentials: 'include'
        })
        if (!response.ok) {
            throw new Error('Failed to get mitra.')
        }
        return response.json()
    }
    
    const { data: mitra, isLoading } = useQuery( "fetchMitra", useGetMitraRequest )
    
    return { mitra, isLoading }
}

export function useGetMitraUsers(nama_mitra: string | undefined, options: {enabled: boolean}) {
    async function useGetMitraUsersRequest () {
        // const csrfToken = await getCsrfToken() // Hasn't implemented csrf token yet.
        const response = await fetch(`${API_BASE_URL}/api/mitra/users`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "X-Client-Type": "web"
                // "X-CSRF-TOKEN": csrfToken // Hasn't implemented csrf token yet.
            },
            body: JSON.stringify({nama_mitra}),
            credentials: 'include'
        })
        if (!response.ok) {
            throw new Error("Failed to get mitra's users.")
        }
        return response.json()
    }
    
    const { data: mitraUsers, isLoading, refetch } = useQuery( ["fetchMitraUsers", nama_mitra], useGetMitraUsersRequest, {enabled: options.enabled && !!nama_mitra} )
    
    return { mitraUsers, isLoading, refetch }
}

export function useGetMitraKontraks(nama_mitra: string | undefined, options: {enabled: boolean}) {
    async function useGetMitraKontraksRequest () {
        // const csrfToken = await getCsrfToken() // Hasn't implemented csrf token yet.
        const response = await fetch(`${API_BASE_URL}/api/mitra/kontraks`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "X-Client-Type": "web"
                // "X-CSRF-TOKEN": csrfToken // Hasn't implemented csrf token yet.
            },
            body: JSON.stringify({nama_mitra}),
            credentials: 'include'
        })
        if (!response.ok) {
            throw new Error('Failed to get mitra.')
        }
        return response.json()
    }
    
    const { data: mitraKontraks, isLoading, refetch } = useQuery( ["fetchMitraKontraks", nama_mitra], useGetMitraKontraksRequest, {enabled: options.enabled && !!nama_mitra} )
    
    return { mitraKontraks, isLoading, refetch }
}

export function useGetMitras(options: {enabled: boolean}) {
    async function useGetMitrasRequest() {
        // const csrfToken = await getCsrfToken() // Hasn't implemented csrf token yet.
        const response = await fetch(`${API_BASE_URL}/api/mitra/all`, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "X-Client-Type": "web"
                // "X-CSRF-TOKEN": csrfToken // Hasn't implemented csrf token yet.
            },
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Failed to get all mitra.');
        }

        return response.json();
    }

    // Use useQuery hook to fetch mitra data
    const { data: allMitra, isLoading, refetch } = useQuery(['fetchMitraKontraks'], useGetMitrasRequest, {enabled: options.enabled});

    return { allMitra, isLoading, refetch };
}

type UpdateMitraRequest = {
    nama_mitra: string,
    alamat: string,
    nomor_telepon: string
}

export function useUpdateMitra() {
    async function useUpdateMitraRequest(mitra: UpdateMitraRequest) {
        // const csrfToken = await getCsrfToken() // Hasn't implemented csrf token yet.
        const response = await fetch(`${API_BASE_URL}/api/mitra`, {
            method: 'PATCH',
            headers: {
                "Content-Type": "application/json",
                "X-Client-Type": "web"
                // "X-CSRF-TOKEN": csrfToken // Hasn't implemented csrf token yet.
            },
            body: JSON.stringify(mitra),
            credentials: 'include'
        })
        if (!response.ok) {
            throw new Error('Failed to update mitra.')
        }
        return response.json()
    }
    
    const {
        mutateAsync: updateMitra,
        isLoading,
        isSuccess,
        error,
        reset
    } = useMutation(useUpdateMitraRequest)
    
    if (isSuccess) {
        // toast.success("Update Mitra Berhasil!")
    }

    if (error) {
        // toast.error(error.toString()) .debug
        reset()
    }
    
    return { updateMitra, isLoading }
}