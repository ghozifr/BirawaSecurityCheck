import { useMutation, useQuery } from "react-query";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export async function getCsrfToken() {
    const response = await fetch(`${API_BASE_URL}/api/auth/csrf-token`, {
        method: "GET",
        credentials: "include"
    });
    if (response.ok) {
        const data = await response.json();
        return data.csrfToken;
    } else {
        throw new Error("Failed to retrieve CSRF token");
    }
}

type SignInUserRequest = {
    email: string,
    password: string
}

export function useSignInUser() {
    const {toast} = useToast()
    async function useSignInUserRequest (user: SignInUserRequest) {
        // const csrfToken = await getCsrfToken() // Hasn't implemented csrf token yet.
        const response = await fetch(`${API_BASE_URL}/api/auth/signin`, {
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
            toast({
                title: data.message,
                variant: "danger"
            })
            throw new Error(data.message)
        }
        return response.json()
    }
    const {
        mutateAsync: signInUser,
        isLoading,
        isSuccess,
        error,
        reset
    } = useMutation(useSignInUserRequest)
    
    if (isSuccess) {
        window.location.href = '/dashboard'
    }
    
    if (error) {
        toast({
            title: error.toString().split(' ').slice(1).join(' '),
            variant: "danger"
        }) //Debug.
        reset()
    }
    
    return {signInUser, isLoading}
}

export function useSignOutUser() {
  const { toast } = useToast()
  const navigate = useNavigate()

  async function useSignOutUserRequest() {
    // const csrfToken = await getCsrfToken() // Hasn't implemented csrf token yet.
    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "X-Client-Type": "web"
        // "X-CSRF-TOKEN": csrfToken // Hasn't implemented csrf token yet.
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message); // Throw the error to be caught by `onError`
    }

    return response.json();
  }

  const { mutateAsync: signOutUser, isLoading } = useMutation(useSignOutUserRequest, {
    onSuccess: () => {
      toast({
        title: "Successfully logged out",
        variant: "success",
      });
      navigate("/") // Redirect after logout
    },
    onError: (err: Error) => {
      toast({
        title: "Failed to log out",
        description: err.message,
        variant: "danger",
      });
    },
  });

  return { signOutUser, isLoading };
}


export function useAuth() {
  const { toast } = useToast();

  async function useAuthRequest() {
    const response = await fetch(`${API_BASE_URL}/api/auth`, {
      method: "POST",
      headers: {
        "X-Client-Type": "web",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorDetails = await response.text();
      console.error("Authentication failed:", response.status, errorDetails);
      throw new Error("Authentication failed!");
    }

    return response.ok;
  }

  const {
    data: isAuthenticated,
    isLoading,
    isSuccess,
    error,
  } = useQuery("authenticateUser", useAuthRequest, {
    retry: false,
  });

  // Trigger the toast in a side effect
  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "User authenticated",
        variant: "success",
      });
    }

    if (error) {
      toast({
      title: "Please re-login!",
        description: error.toString(),
        variant: "danger",
      });
    }
  }, [isSuccess, error, toast]);

  return { isAuthenticated, isLoading };
}
