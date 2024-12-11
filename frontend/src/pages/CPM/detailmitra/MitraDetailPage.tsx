import { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetMitraUsers, useGetMitraKontraks } from "@/api/MitraApi";
import { Kontrak, Pekerjaan, User } from "@/types";
import { Pencil, Trash2 } from 'lucide-react';
import { ChevronLeft } from 'lucide-react';
import { useState } from "react";
import {z} from "zod";
import { Button } from "@/components/ui/button";
import AddUserDialog from "./AddUserDialog";
import AddContractDialog from "./AddContractDialog";
import EditUserDialog from "./EditUserDialog";
import DeleteUserDialog from "./DeleteUserDialog";
import { useToast } from "@/hooks/use-toast";
import { useCreateKontrak } from "@/api/KontrakApi";
import { useCreateUser } from "@/api/UserApi";
import { useUpdateUser } from "@/api/UserApi";
import { useDeleteUser } from "@/api/UserApi";
import LoadingScreen from "@/components/LoadingScreen";

//Tambah Kontrak
const formAddContractSchema = z.object({
  nama: z.string().min(1, "Nama kontrak wajib diisi").max(40, "Nama kontrak terlalu panjang"),
  nomor: z.string().min(1, "Nomor kontrak wajib diisi").max(20, "Nomor kontrak terlalu panjang"),
  tanggal: z.string().min(1, "Tanggal kontrak wajib diisi").max(10, "Format tanggal tidak valid"), // Asumsi format YYYY-MM-DD,
  nilai: z.coerce.number().min(1, "Nilai kontrak wajib diisi").max(1000000000000, "Nilai kontrak terlalu panjang"),
  jangka_waktu: z.coerce.number().min(1, "Jangka waktu wajib diisi").max(100000, "Jangka waktu terlalu panjang"),
  pekerjaan_arr : z.array(z.object({
    nama: z.string().min(6,"Nama Pekerjaan terlalu Sedikit"),
    lokasi: z.string().min(2,"Lokasi Pekerjaan Wajib diisi"),
  }))
})

export type AddContractSchema = z.infer<typeof formAddContractSchema>;

// Edit Kontrak
const formEditContractSchema = z.object({
  nama: z.string().min(1, "Nama kontrak wajib diisi").max(40, "Nama kontrak terlalu panjang"),
  nomor: z.string().min(1, "Nomor kontrak wajib diisi").max(20, "Nomor kontrak terlalu panjang"),
  tanggal: z.string().min(1, "Tanggal kontrak wajib diisi").max(10, "Format tanggal tidak valid"), // Asumsi format YYYY-MM-DD,
  nilai: z.coerce.number().min(1, "Nilai kontrak wajib diisi").max(1000000000000, "Nilai kontrak terlalu panjang"),
  jangka_waktu: z.coerce.number().min(1, "Jangka waktu wajib diisi").max(100000, "Jangka waktu terlalu panjang")
})
export type EditContractSchema = z.infer<typeof formEditContractSchema>;

// Tambah Pengguna
const formAddUserSchema = z.object({
  nama_lengkap: z.string().min(1, "Nama pengguna wajib diisi").max(40, "Nama pengguna terlalu panjang"),
  email: z.string().email("Format email tidak valid").min(1, "Email pengguna wajib diisi"),
  nomor_telepon: z.string().min(4,"Nomor Telephone terlalu sedikit").max(16, "Nomor Telephone melebih batas"),
})
export type AddUserSchema = z.infer<typeof formAddUserSchema>;

// Edit Pengguna
const formEditUserSchema = z.object({
  nama_lengkap: z.string().min(1, "Nama pengguna wajib diisi").max(40, "Nama pengguna terlalu panjang").optional(),
  email: z.string().email("Format email tidak valid").min(1, "Email pengguna wajib diisi").optional(),
  nomor_telepon: z.string().min(4,"Nomor Telephone terlalu sedikit").max(16, "Nomor Telephone melebih batas").optional(),
});

export type EditUserSchema = z.infer<typeof formEditUserSchema>;

const MitraDetailPage = () => {
  // Toast
  const {toast} = useToast();
  
  // Detail Dialog Create User
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  
  // Detail Dialog User Edit
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  
  // Detail Dialog Delete User
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  
  // Detail Dialog Create Contract
  const [isAddContractDialogOpen, setIsAddContractDialogOpen] = useState(false);

  // Dapetin nama_mitra refers nya
  const { nama_mitra } = useParams<{ nama_mitra: string }>();
  const navigate = useNavigate();
  
  // Create Kontrak 
  const { createKontrak, isLoading: isCreatingKontrakLoading, isSuccess: isSuccessCreatingKontrak, error: isErrorCreatingKontrak } = useCreateKontrak()

  // Create User 
  const { createUser, isLoading: isCreatingUserLoading, isSuccess: isSuccessCreatingUser, error: isErrorCreatingUser } = useCreateUser();

  // Update User
  const { updateUser, isLoading: isUpdatingUserLoading, isSuccess: isSuccessUpdatingUser, error: isErrorUpdatingUser} = useUpdateUser();

  // Delete User
  const { deleteUser, isLoading: isDeletingUserLoading, isSuccess: isSuccessDeletingUser, error: isErrorDeletingUser } = useDeleteUser();

  // Get Users
  const { mitraUsers, isLoading: isUsersLoading, refetch: refetchMitraUsers } = useGetMitraUsers(nama_mitra, {enabled: !!nama_mitra});
  const users = mitraUsers?.mitra_users || [];
  
  const getStatus = (is_verified: number, is_active: number) => {
    if (is_verified === 0 && is_active === 1) {
      return { status: 'Belum Terverifikasi', color: 'text-yellow-500' , sortOrder:0};
    } else if (is_verified === 1 && is_active === 1)  {
      return { status: 'Terverifikasi', color: 'text-green-500'  , sortOrder:1};
    } 
      return { status: 'Terblokir', color: 'text-red-500'  , sortOrder:2};
  };
  
  const sortedUsers = useMemo(() => {
    return [...users].sort((a,b) => {
    const statusA = getStatus(a.is_verified || 0,a.is_active || 0).sortOrder;
    const statusB = getStatus(b.is_verified || 0,b.is_active || 0).sortOrder;
    return statusA - statusB;
  })}, [users])

  // Get Kontraks
  const { mitraKontraks, isLoading: isKontraksLoading, refetch: refetchMitraKontraks } = useGetMitraKontraks(nama_mitra, {
    enabled: !!nama_mitra,
  });
  const contracts = mitraKontraks?.mitra_kontraks || [];
  
  const sortedContracts = useMemo(() => {
    return [...contracts].sort((a, b) => {
      return a.nama.localeCompare(b.nama, undefined, { numeric: true, sensitivity: 'base' });
    });
  }, [contracts]);

  async function handleAddContractSubmit (data: AddContractSchema) {
    try {
      // Prepare the contract data
      const kontrakData = {
        nama_mitra: nama_mitra || "", 
        nama: data.nama,
        nomor: data.nomor,
        tanggal: data.tanggal,
        nilai: data.nilai,
        jangka_waktu: data.jangka_waktu,
        pekerjaan_arr: data.pekerjaan_arr.map((pekerjaan:Pekerjaan) => ({
          nama: pekerjaan.nama,
          lokasi: pekerjaan.lokasi
        }))
      };
      
      await createKontrak(kontrakData);
      console.log(kontrakData) //Debug.
  
      setIsAddContractDialogOpen(false);
  
    } catch (error) {
      console.error("Error creating contract:", error);
    }
  };

  async function handleAddUserSubmit (data: AddUserSchema) {
    try {
      const userData = {
        nama_mitra: nama_mitra || "",  // Ensure the correct field name
        nama_lengkap: data.nama_lengkap,
        email: data.email,
        nomor_telepon: data.nomor_telepon,
      };
      
  
      //Logging
      // console.log('User data yang akan dikirim:', userData);

      await createUser(userData);  // Create user
      console.log("User successfully created:", userData) //Debug.
  
      // Invalidate and refetch the users query

      // Optionally, refetch users or add the new user manually to the state
      setIsAddUserDialogOpen(false);  // Close the dialog after successful submission
  
      // Show a success toast
      // toast({
      //   title: "User Baru berhasil ditambah",
      //   description: "Mohon Refresh halaman page",
      //   variant: "success",
      // });
  
      // Optionally, fetch the updated list of users if necessary
      // Example: await refetchUsers(); (if you have a refetch method from the API)
  
    } catch (error) {
      console.error("Error creating user:", error) //Debug.
    }
  };
  
  const handleEditUserSubmit = async (data: EditUserSchema) => {
    if (!userToEdit) return;
  
    try {
      // Make sure undefined values are handled
      const updatedUserData = {
        ...userToEdit,
        nama_lengkap: data.nama_lengkap || userToEdit.nama_lengkap, // Fallback to the current value if undefined
        email: data.email || userToEdit.email, // Fallback to current email
        nomor_telepon: data.nomor_telepon || userToEdit.nomor_telepon, // Fallback to current phone number
        // is_active: data.is_active || userToEdit.is_active, // Fallback to current status
      };
      
      await updateUser(updatedUserData);  // Call the API to update the user
      console.log("User successfully updated:", updatedUserData) //Debug.

      setIsEditUserDialogOpen(false);  // Close the dialog after submission
  
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };
  
  const handleDeleteUser = async (user: User) => {
    try{
      await deleteUser({ email: user.email });
      toast({
        title: "Success",
        description: "User Berhasil Terblokir",
        variant: "success",
      });
      setIsDeleteUserDialogOpen(false);  // Menampilkan dialog
    } catch(error){
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete user",
        variant: "danger",
      });
    }
    
  };
  
  useEffect(() => {
    if (isSuccessCreatingKontrak) {
      toast({
        title: "Berhasil menambahkan kontrak!",
        variant: 'success'
      })
      refetchMitraKontraks()
    }
  }, [isSuccessCreatingKontrak])
  
  useEffect(() => {
    if (isErrorCreatingKontrak) {
      toast({
        title: isErrorCreatingKontrak.toString(),
        variant: 'danger'
    })
    }
  }, [isErrorCreatingKontrak])
  
  useEffect(() => {
    if (isSuccessCreatingUser) {
      toast({
        title: "Berhasil menambahkan user!",
        variant: 'success'
      })
      refetchMitraUsers()
    }
  }, [isSuccessCreatingUser])
  
  useEffect(() => {
    if (isErrorCreatingUser) {
      toast({
        title: isErrorCreatingUser.toString(),
        variant: 'danger'
    })
    }
  }, [isErrorCreatingUser])
  
  useEffect(() => {
    if (isSuccessUpdatingUser) {
      toast({
        title: "Berhasil update user!",
        variant: 'success'
      })
      refetchMitraUsers()
    }
  }, [isSuccessUpdatingUser])
  
  useEffect(() => {
    if (isErrorUpdatingUser) {
      toast({
        title: isErrorUpdatingUser.toString(),
        variant: 'danger'
    })
    }
  }, [isErrorUpdatingUser])
  
  useEffect(() => {
    if (isSuccessDeletingUser) {
      toast({
        title: "Berhasil delete user!",
        variant: 'success'
      })
      refetchMitraUsers()
    }
  }, [isSuccessDeletingUser])
  
  useEffect(() => {
    if (isErrorDeletingUser) {
      toast({
        title: isErrorDeletingUser.toString(),
        variant: 'danger'
    })
    }
  }, [isErrorDeletingUser])

  
  if (isUsersLoading || isKontraksLoading) {
    return (
      <LoadingScreen/>
    );
  }

  return (
    <div className="  h-screen py-4 px-8">
      <div className="mb-8  flex flex-col gap-4 ">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center  gap-x-2 text-gray-700 hover:text-primary font-semibold rounded-lg"
          >
           <ChevronLeft size={18}/> <span>Kembali</span>
          </button>
        <h1 className="text-2xl font-bold">{nama_mitra}</h1>
      </div>

      <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8 pb-4">
        {/* Mitra Contracts Section */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 flex justify-between items-center h-20">
            <h2 className="lg:text-xl font-semibold ">Daftar Kontrak Kerja</h2>
            <Button 
              className="w-fit"
              onClick={() => setIsAddContractDialogOpen(true)}
            >
              Tambah Kontrak
            </Button>
          </div>
          <div className="p-4">
            {contracts.length === 0 ? (
              <p className="text-sm text-gray-600">No contracts found for this mitra.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3 text-left">Nama Kontrak</th>
                      <th className="p-3 text-left">Nomor Kontrak</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedContracts.map((contract: Kontrak, index: number) => (
                      <tr key={index} className="border-b">
                        <td className="p-3">{contract.nama}</td>
                        <td className="p-3">{contract.nomor}</td>
                        <td className="p-3  text-right">
                          Action
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Mitra Users Section */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 flex justify-between items-center h-20">
            <h2 className="lg:text-xl font-semibold">Daftar Pengguna Mitra</h2>
            <Button 
              className="w-fit"
              onClick={() => setIsAddUserDialogOpen(true)}
            >
              Tambah Pengguna
            </Button>
          </div>
          <div className="p-4">
            {users.length === 0 ? (
              <p className="text-sm text-gray-600">No users found for this mitra.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3 text-left">Pengguna Mitra</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedUsers.map((user: User) => {
                      const {status, color} = getStatus(user.is_verified || 0, user.is_active || 0);
                      return(
                        <tr key={user.email} className="border-b">
                          <td className="p-3">
                            <div>
                              <p className="font-medium">{user.nama_lengkap}</p>
                              <p className="text-gray-600">{user.email}</p>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                          <span className={color}>{status}</span>
                          </td>
                          <td className="p-3 text-right">
                            {user.is_active === 0 ? 
                              <>
                              <p> </p>
                              </>
                            : 
                              <>
                               <Button
                                variant="ghost"
                                size="icon"
                                className={`text-red-600 hover:text-red-700 `}
                                onClick={() => {
                                  setUserToDelete(user); 
                                  setIsDeleteUserDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-blue-600 hover:text-blue-700"
                                  onClick={() => {
                                    setUserToEdit(user);
                                    setIsEditUserDialogOpen(true)
                                  }}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </>
                            }

                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Dialogs */}
      {/* Dialog Tambah Kontrak */}
      <AddContractDialog
        isOpen={isAddContractDialogOpen}
        onClose={() => setIsAddContractDialogOpen(false)}
        onSubmit={handleAddContractSubmit}
        isLoading={isCreatingKontrakLoading}
      />

      {/* Dialog Tambah Pengguna */}
      <AddUserDialog
        isOpen={isAddUserDialogOpen}
        onClose={() => setIsAddUserDialogOpen(false)}
        onSubmit={handleAddUserSubmit}
        isCreatingUserLoading={isCreatingUserLoading}
      />

      {/* Dialog Edit Pengguna */}
      <EditUserDialog
        isOpen={isEditUserDialogOpen}
        onClose={() => setIsEditUserDialogOpen(false)}
        onSubmit={handleEditUserSubmit}
        user={userToEdit}
        isLoading={isUpdatingUserLoading}
      />

      {/* Dialog Delete Pengguna */}
      <DeleteUserDialog
        isOpen={isDeleteUserDialogOpen}
        onClose={() => setIsDeleteUserDialogOpen(false)}
        onSubmit={() => {
          if (userToDelete) {
            handleDeleteUser(userToDelete); 
          }
        }}
        user={userToDelete}  // Mengoper data user
      />
      
    </div>
  );
};

export default MitraDetailPage;

