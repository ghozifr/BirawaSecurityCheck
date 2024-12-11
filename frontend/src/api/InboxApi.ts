import { useMutation, useQuery } from "react-query"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

type CreateInboxRequest = {
    nama_mitra?: string,
    email_receiver?: string,
    subject: string,
    content: string
}

export function useCreateInbox() {
    async function useCreateInboxRequest(inbox: CreateInboxRequest) {
        console.log(JSON.stringify(inbox)) //Debug.
        // const csrfToken = await getCsrfToken() // Hasn't implemented csrf token yet.
        const response = await fetch(`${API_BASE_URL}/api/inbox`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "X-Client-Type": "web"
                // "X-CSRF-TOKEN": csrfToken // Hasn't implemented csrf token yet.
            },
            body: JSON.stringify(inbox),
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
        mutateAsync: createInbox,
        isLoading,
        isSuccess,
        error,
        // reset
    } = useMutation(useCreateInboxRequest)
    
    return {createInbox, isLoading, isSuccess, error}
}

export function useGetInboxes(nama_mitra: string | undefined, options: {enabled?: boolean} = {enabled: true}) {
    const {enabled} = options
    async function useGetInboxesRequest () {
        // const csrfToken = await getCsrfToken() // Hasn't implemented csrf token yet.
        const response = await fetch(`${API_BASE_URL}/api/inbox/es`, {
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
            throw new Error("Failed to get inbox(es).")
        }
        return response.json()
    }
    
    const { data: inboxes, isLoading, refetch } = useQuery( ["fetchInboxes", nama_mitra], useGetInboxesRequest, { enabled: enabled && !!nama_mitra } )
    
    return { inboxes, isLoading, refetch }
}

type GetInboxRequest = {
    nama_mitra?: string,
    subject: string
}

export function useGetInbox(inbox: GetInboxRequest | undefined, options: {enabled?: boolean} = {enabled: true}) {
    const {enabled} = options
    async function useGetInboxRequest () {
        // const csrfToken = await getCsrfToken() // Hasn't implemented csrf token yet.
        const response = await fetch(`${API_BASE_URL}/api/inbox/e`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "X-Client-Type": "web"
                // "X-CSRF-TOKEN": csrfToken // Hasn't implemented csrf token yet.
            },
            body: JSON.stringify(inbox),
            credentials: 'include'
        })
        if (!response.ok) {
            throw new Error("Failed to get inbox's message(s).")
        }
        return response.json()
    }
    
    const { data: inboxMessages, isLoading, refetch } = useQuery( ["fetchInbox", inbox], useGetInboxRequest, { enabled: enabled && !!inbox } )
    
    return { inboxMessages, isLoading, refetch }
}