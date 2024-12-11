import  { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from '@/components/ui/input';
import {z} from "zod";
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useToast } from "@/hooks/use-toast"

const formUserProfileSchema = z.object({
  fullName: z
    .string()
    .min(1, { message: "Nama lengkap tidak boleh kosong" }),
  personalEmail: z
    .string()
    .email({ message: "Email tidak valid" }),
  personalPhone: z
    .string()
    .min(10, { message: "Nomor telepon minimal 10 karakter" }),
    // .regex(/^\d+$/, { message: "Nomor telepon hanya boleh berisi angka" }),
});
export type UserProfileSchema = z.infer<typeof formUserProfileSchema>

const formCompanySchema = z.object({
  companyName: z
  .string()
  .min(1, { message: "Nama perusahaan tidak boleh kosong" }),
companyAddress: z
  .string()
  .min(5, { message: "Alamat perusahaan minimal 5 karakter" }),
companyPhone: z
  .string()
  .min(10, { message: "Nomor telepon minimal 10 karakter" })
  .regex(/^\d+$/, { message: "Nomor telepon hanya boleh berisi angka" }),
});
export type CompanyProfileSchema = z.infer<typeof formCompanySchema>


const Profile = () => {
    const [activeEditMode, setActiveEditMode] = useState<'none' | 'personal' | 'company'>('none');
    const { toast } = useToast()


    const formEditProfile = useForm<UserProfileSchema>({
      resolver: zodResolver(formUserProfileSchema),
      defaultValues:{
          fullName:"aa",
          personalEmail:"aa@gmail.com",
          personalPhone:"0785656756",
      }
    })

    const formEditCompany = useForm<CompanyProfileSchema>({
      resolver: zodResolver(formCompanySchema),
      defaultValues:{
          companyName:"aa",
          companyAddress:"aa",
          companyPhone:"ad",
      }
    })

    const handleEditCompany = () => {
        if (activeEditMode === 'company') {
            // Canceling edit mode
            formEditCompany.reset({
                companyName:"aa",
                companyAddress:"aa",
                companyPhone:"ad",
            });
            setActiveEditMode('none');
            toast({
                title: "Edit Mode Dibatalkan",
                description: "Perubahan dibatalkan",
                variant: "information"
            });
        } else if (activeEditMode === 'none') {
            // Entering company edit mode
            formEditCompany.reset();
            setActiveEditMode('company');
            toast({
                title: "Edit Mode Diaktifikan",
                description: "Anda Bisa Mengubah data di Perusahaan anda",
                variant: "warning"
            });
        }
    };

    const handleEditPersonal = () => {
        if (activeEditMode === 'personal') {
            // Canceling edit mode
            formEditProfile.reset({
                fullName:"aa",
                personalEmail:"aa@gmail.com",
                personalPhone:"0785656756",
            });
            setActiveEditMode('none');
            toast({
                title: "Edit Mode Dibatalkan",
                description: "Perubahan dibatalkan",
                variant: "information"
            });
        } else if (activeEditMode === 'none') {
            // Entering personal edit mode
            formEditProfile.reset();
            setActiveEditMode('personal');
            toast({
                title: "Edit Mode Diaktifikan",
                description: "Anda Bisa Mengubah data Pribadi anda",
                variant: "warning"
            });
        }
    };

    const handleSubmitUserPersonal = (data:UserProfileSchema ) => {
      console.log("adalah",data);
      setActiveEditMode('none');
      toast({
        title: "Data diri Anda telah diubah",
        description: "Pastikan data diri anda sudah benar",
        variant: "success",
      })
    };

    const handleSubmitCompanyProfile = (data:CompanyProfileSchema ) => {
      console.log("adalah",data);
      setActiveEditMode('none');
      toast({
        title: "Data Perusahaan Anda telah diubah",
        description: "Pastikan data diri anda sudah benar",
        variant: "success",
      })
    };

  return (
    <div className='flex flex-col gap-y-7'>
      {/* Profil Anda */}
      <div className='border-b-2 flex justify-between border-gray-200 py-3'>
        <div>
          {activeEditMode === 'personal' ? (
            <>
              <h1 className="text-2xl font-semibold mb-2">Edit Profil Anda</h1>
              <p className='text-sm font-medium text-gray-500'>Perbarui data pribadi anda disini</p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-semibold mb-2">Profil Anda</h1>
              <p className='text-sm font-medium text-gray-500'>Data pribadi anda</p>
            </>
          )}
        </div>
        <div className='w-fit flex items-center'>
          <Button 
            type='button' 
            onClick={handleEditPersonal} 
            disabled={activeEditMode === 'company'}
            >
              {activeEditMode === 'personal' ? "Batal" : "Edit"}
          </Button>
        </div>
      </div>
      <Form {...formEditProfile}>
        <form onSubmit={formEditProfile.handleSubmit(handleSubmitUserPersonal)} className='space-y-4'>

              <FormField
                control={formEditProfile.control}
                name='fullName'
                render={({field}) => (
                    <FormItem >
                        <FormLabel className='w-48'>Nama Lengkap</FormLabel>
                            <FormControl >
                                <Input
                                placeholder="Masukkan Nama Lengkap Anda"
                                className="w-full pr-10 mb-0"
                                disabled={activeEditMode !== 'personal'}
                                {...field} />
                            </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}
              />
              <FormField
                control={formEditProfile.control}
                name='personalEmail'
                render={({field}) => (
                    <FormItem >
                        <FormLabel className='w-48'>Email</FormLabel>
                            <FormControl >
                                <Input
                                placeholder="Masukkan Email Anda"
                                className="w-full pr-10 mb-0"
                                disabled={activeEditMode !== 'personal'}
                                {...field} />
                            </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}
              />  
              <FormField
                control={formEditProfile.control}
                name='personalPhone'
                render={({field}) => (
                    <FormItem >
                        <FormLabel className='w-48'>Nomor Telepon</FormLabel>
                            <FormControl >
                                <Input
                                placeholder="Masukkan Nomor Telepon Anda"
                                className="w-full pr-10 mb-0"
                                disabled={activeEditMode !== 'personal'}
                                {...field} />
                            </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}
              />  
          
          <div className='flex justify-end py-3 w-fit'>
            <Button 
              type='submit'
              disabled={activeEditMode !== 'personal'}
              >
                Simpan
            </Button>
          </div>
        </form>
      </Form>


      {/* Profil Perusahaan */}
      <div className='border-b-2 flex justify-between border-gray-200 py-3'>
        <div>
            {activeEditMode === 'company' ? (
              <>
                <h1 className="text-2xl font-semibold mb-2">Edit Profil Anda</h1>
                <p className='text-sm font-medium text-gray-500'>Perbarui data pribadi anda disini</p>
               </>
              ) : (
              <>
                <h1 className="text-2xl font-semibold mb-2">Profil Anda</h1>
                <p className='text-sm font-medium text-gray-500'>Data pribadi anda</p>
              </>
            )}
        </div>
        <div className='w-fit flex items-center'>
          <Button 
             type='button' 
             onClick={handleEditCompany} 
             disabled={activeEditMode === 'personal'}
            >
              {activeEditMode === 'company' ? "Batal" : "Edit"}
            </Button>
        </div>
      </div>
      <Form {...formEditCompany}>
        <form onSubmit={formEditCompany.handleSubmit(handleSubmitCompanyProfile)} className='space-y-4'>
          
              <FormField
                control={formEditCompany.control}
                name='companyName'
                render={({field}) => (
                    <FormItem >
                        <FormLabel className='w-48'>Nama Perusahaan</FormLabel>
                            <FormControl >
                                <Input
                                placeholder="Masukkan Nama Perusahaan Anda"
                                className="w-full pr-10 mb-0"
                                disabled={activeEditMode !== 'company'}
                                {...field} />
                            </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}
              />

              <FormField
                control={formEditCompany.control}
                name='companyAddress'
                render={({field}) => (
                    <FormItem >
                        <FormLabel className='w-48'>Alamat Perusahaan</FormLabel>
                            <FormControl >
                                <Input
                                placeholder="Masukkan Alamat Perusahaan Anda"
                                className="w-full pr-10 mb-0"
                                disabled={activeEditMode !== 'company'}
                                {...field} />
                            </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}
              />

              <FormField
                control={formEditCompany.control}
                name='companyPhone'
                render={({field}) => (
                    <FormItem >
                        <FormLabel className='w-48'>Nomor Telepon Perusahaan</FormLabel>
                            <FormControl >
                                <Input
                                placeholder="Masukkan Nomor Telepon Perusahaan Anda"
                                className="w-full pr-10 mb-0"
                                disabled={activeEditMode !== 'company'}
                                {...field} />
                            </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}
              />

          <div className='flex justify-end py-3 w-fit'>
            <Button 
              type='submit'
              disabled={activeEditMode !== 'company'}
              >
                Simpan
              </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default Profile;
