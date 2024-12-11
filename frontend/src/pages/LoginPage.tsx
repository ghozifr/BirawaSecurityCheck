import { useAuth, useSignInUser } from "@/api/AuthApi"
import LoadingButton from "@/components/LoadingButton"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import { z } from "zod"
import { Eye, EyeOff } from 'lucide-react';
// import LoginForm from "@/components/custom/organism/LoginForm"
import LogoTelkom from "@/assets/BirawaLogo.png"
import { useState } from "react"

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required")
});

export type SignInSchema = z.infer<typeof formSchema>

const Login = () => {
  const navigate = useNavigate()
  
  const {isAuthenticated} = useAuth()
  
  if (isAuthenticated) (
    navigate('/dashboard')
  )
  
  const {signInUser, isLoading } = useSignInUser()
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<SignInSchema>({
    resolver: zodResolver(formSchema),
    defaultValues:{
      email:"",
      password:""
    }
  })

  async function onSubmit (data: SignInSchema) {
    try {
      await signInUser(data)
    } catch (error) {
      console.error(error)
    }
  }
  
  return (
    <>
    {/* <div className="flex justify-center items-center h-screen bg-gray-100">
        <LoginForm />
    </div> */}
    <div className="flex flex-col w-max-[1280px] h-[100vh] items-center justify-center bg-gray-100">
      <div className="w-full flex flex-col items-center max-w-md shadow-custom-login bg-white rounded-md px-8 pt-6 pb-8 ">
        <img src={LogoTelkom} alt="Logo Telkom Property" />
        <div className="my-6">
          <h2 className="text-2xl font-medium">Login</h2>
        </div>
        <Form {...form}>
          <form
            className="flex flex-col w-full items-center gap-y-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name='email'
              render={({field}) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl className="relative top-[-4px] mb-2">
                    <Input placeholder="Masukan  Email Anda" type="email"  {...field}/>
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='password'
              render={({field}) => (
                <FormItem className="mt-[-16px]">
                  <FormLabel className="text-gray-700">Password</FormLabel>
                  <div className="relative">
                    <FormControl className="font-sans">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="w-full pr-10"
                        {...field}
                      />
                    </FormControl>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <EyeOff size={21}/>
                      ) : (
                        <Eye size={21} />
                      )}
                    </button>
                  </div>
                  <FormMessage/>
                </FormItem>
              )}
            />

            {isLoading ? (
                <div className="w-full">
                  <LoadingButton/>
                </div>
            ) :
             <div className=" w-full">
                <Button type='submit' className="w-full">
                    Login
                </Button>
             </div>
            }

            <div className="">
              <Link to='/forgotpassword' className="text-center text-primary mt-4 hover:underline" reloadDocument>Forgot Password?</Link>
            </div>

          </form>
        </Form>
      </div>
    </div>
    </>
  );
};

export default Login;
