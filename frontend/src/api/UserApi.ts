import { useMutation, useQuery } from "react-query"
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

type CreateUserRequest = {
    nama_lengkap: string,
    email: string,
    nomor_telepon: string,
    nama_mitra: string
}

export function useCreateUser() {
    async function useCreateUserRequest(user: CreateUserRequest) {
        // const csrfToken = await getCsrfToken() // Hasn't implemented csrf token yet.
        const response = await fetch(`${API_BASE_URL}/api/user`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "X-Client-Type": "web"
                // "X-CSRF-TOKEN": csrfToken // Hasn't implemented csrf token yet.
            },
            body: JSON.stringify(user),
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
        mutateAsync: createUser,
        isLoading,
        isSuccess,
        error
    } = useMutation(useCreateUserRequest)

    return {createUser, isLoading, isSuccess, error}
}

export function useGetUser() {
    async function useGetUserRequest () {
        // const csrfToken = await getCsrfToken() // Hasn't implemented csrf token yet.
        const response = await fetch(`${API_BASE_URL}/api/user`, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "X-Client-Type": "web"
                // "X-CSRF-TOKEN": csrfToken // Hasn't implemented csrf token yet.
            },
            credentials: 'include'
        })
        if (!response.ok) {
            throw new Error('Failed to get user.')
        }
        return response.json()
    }
    
    const { data: user, isLoading } = useQuery( "fetchMitra", useGetUserRequest )
    
    return { user, isLoading }
}

export function useGetUsers() {
    async function useGetUsersRequest () {
        // const csrfToken = await getCsrfToken() // Hasn't implemented csrf token yet.
        const response = await fetch(`${API_BASE_URL}/api/user/all`, {
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
    
    const { data: allUser, isLoading, refetch } = useQuery( "fetchMitra", useGetUsersRequest )
    
    return { allUser, isLoading , refetch}
}

type UpdateUserRequest = {
    nama_lengkap: string,
    nomor_telepon: string
}

export function useUpdateUser() {
    async function useUpdateUserRequest(user: UpdateUserRequest) {
        // const csrfToken = await getCsrfToken() // Hasn't implemented csrf token yet.
        const response = await fetch(`${API_BASE_URL}/api/user`, {
            method: 'PATCH',
            headers: {
                "Content-Type": "application/json",
                "X-Client-Type": "web"
                // "X-CSRF-TOKEN": csrfToken // Hasn't implemented csrf token yet.
            },
            body: JSON.stringify(user),
            credentials: 'include'
        })
        if (!response.ok) {
            throw new Error('Failed to update user.')
        }
        return response.json()
    }
    
    const {
        mutateAsync: updateUser,
        isLoading,
        isSuccess,
        error,
        // reset
    } = useMutation(useUpdateUserRequest)
    
    return { updateUser, isLoading, isSuccess, error }
}

type DeleteUserRequest = {
    email: string
}

export function useDeleteUser() {
    async function useDeleteUserRequest(request: DeleteUserRequest) {
        const response = await fetch(`${API_BASE_URL}/api/user/soft-delete`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "X-Client-Type": "web"
            },
            body: JSON.stringify(request),
            credentials: 'include'
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Failed to delete user')
        }
        
        return response.json()
    }
    
    const {
        mutateAsync: deleteUser,
        isLoading,
        isSuccess,
        error
    } = useMutation(useDeleteUserRequest)

    return { deleteUser, isLoading, isSuccess, error }
}