import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetMitraUsers, useGetMitraKontraks } from "@/api/MitraApi";
import { Kontrak, Pekerjaan, User } from "@/types";
import { Pencil, Trash2 } from 'lucide-react';
import { ChevronLeft } from 'lucide-react';
import { useState } from "react";
import {z} from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button";
import AddUserDialog from "./AddUserDialog";
import AddContractDialog from "./AddContractDialog";
import EditUserDialog from "./EditUserDialog";
import EditContractDialog from "./EditContractDialog";
import DeleteContractDialog from "./DeleteContractDialog";
import DeleteUserDialog from "./DeleteUserDialog";
import { useToast } from "@/hooks/use-toast";
import { useCreateKontrak } from "@/api/KontrakApi";
import { useCreateUser } from "@/api/UserApi";
import { useUpdateUser } from "@/api/UserApi";
import { useDeleteUser } from "@/api/UserApi";

//Tambah Kontrak
const formAddContractSchema = z.object({
  nama: z.string().min(1, "Nama kontrak wajib diisi").max(40, "Nama kontrak terlalu panjang"),
  nomor: z.string().min(1, "Nomor kontrak wajib diisi").max(20, "Nomor kontrak terlalu panjang"),
  tanggal: z.string().min(1, "Tanggal kontrak wajib diisi").max(10, "Format tanggal tidak valid"), // Asumsi format YYYY-MM-DD,
  nilai: z.coerce.number().min(1, "Nilai kontrak wajib diisi").max(1000000000000, "Nilai kontrak terlalu panjang"),
  jangka_waktu: z.coerce.number().min(1, "Jangka waktu wajib diisi").max(100000, "Jangka waktu terlalu panjang")
})
export type AddContractSchema = z.infer<typeof formAddContractSchema>;

// Tambah Pengguna
const formAddUserSchema = z.object({
  nama_lengkap: z.string().min(1, "Nama pengguna wajib diisi").max(40, "Nama pengguna terlalu panjang"),
  email: z.string().email("Format email tidak valid").min(1, "Email pengguna wajib diisi"),
  nomor_telepon: z.string().min(4,"Nomor Telephone terlalu sedikit").max(16, "Nomor Telephone melebih batas"),
})
export type AddUserSchema = z.infer<typeof formAddUserSchema>;

// Edit Kontrak
const formEditContractSchema = z.object({
  nama: z.string().min(1, "Nama kontrak wajib diisi").max(40, "Nama kontrak terlalu panjang"),
  nomor: z.string().min(1, "Nomor kontrak wajib diisi").max(20, "Nomor kontrak terlalu panjang"),
  tanggal: z.string().min(1, "Tanggal kontrak wajib diisi").max(10, "Format tanggal tidak valid"), // Asumsi format YYYY-MM-DD,
  nilai: z.coerce.number().min(1, "Nilai kontrak wajib diisi").max(1000000000000, "Nilai kontrak terlalu panjang"),
  jangka_waktu: z.coerce.number().min(1, "Jangka waktu wajib diisi").max(100000, "Jangka waktu terlalu panjang")
})
export type EditContractSchema = z.infer<typeof formEditContractSchema>;

// Edit Pengguna
const formEditUserSchema = z.object({
  nama_lengkap: z.string().min(1, "Nama pengguna wajib diisi").max(40, "Nama pengguna terlalu panjang").optional(),
  email: z.string().email("Format email tidak valid").min(1, "Email pengguna wajib diisi").optional(),
  nomor_telepon: z.string().min(4,"Nomor Telephone terlalu sedikit").max(16, "Nomor Telephone melebih batas").optional(),
  // is_active: z.boolean(),
});

export type EditUserSchema = z.infer<typeof formEditUserSchema>;

const MitraDetailPage: React.FC = () => {
  // Detail Dialog Create
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isAddContractDialogOpen, setIsAddContractDialogOpen] = useState(false);

  // Detail Dialog User Edit
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  // Detail Dialog Contract Edit
  const [isEditContractDialogOpen, setIsEditContractDialogOpen] = useState(false);
  const [contractToEdit, setContractToEdit] = useState<Kontrak | null>(null);

  // Detail Dialog Delete User
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Detail Dialog Delete Contract
  const [isDeleteContractDialogOpen, setIsDeleteContractDialogOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<Kontrak | null>(null); 
  
  // Toast
  const {toast} = useToast();

  // Dapetin nama_mitra refers nya
  const { nama_mitra } = useParams<{ nama_mitra: string }>();
  const navigate = useNavigate();

  // Get Users
  const { mitraUsers, isLoading: usersLoading } = useGetMitraUsers(nama_mitra || "");
  const users = mitraUsers?.mitra_users || [];

  // Get Kontraks
  const { mitraKontraks, isLoading: kontraksLoading } = useGetMitraKontraks(nama_mitra || "", {
    enabled: !!nama_mitra,
  });
  const contracts = mitraKontraks?.mitra_kontraks || [];

  // Create Kontrak 
  const { createKontrak } = useCreateKontrak()

  // Create User 
  const { createUser } = useCreateUser();

  // Update User
  const { updateUser} = useUpdateUser();

  // Delete User
  const { deleteUser } = useDeleteUser();


  const formEditUser = useForm<EditUserSchema>({
    resolver: zodResolver(formEditUserSchema),
    defaultValues: {
      nama_lengkap: "",
      email: "",
      nomor_telepon: "",
    }
  });

  const handleAddUserSubmit = async (data: AddUserSchema) => {
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
  
      // Invalidate and refetch the users query

      // Optionally, refetch users or add the new user manually to the state
      setIsAddUserDialogOpen(false);  // Close the dialog after successful submission
  
      // Show a success toast
      toast({
        title: "User Baru berhasil ditambah",
        description: "Mohon Refresh halaman page",
        variant: "success",
      });
  
      // Optionally, fetch the updated list of users if necessary
      // Example: await refetchUsers(); (if you have a refetch method from the API)
  
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create user",
        variant: "destructive",
      });
    }
  };
  
  const handleAddContractSubmit = async (data: AddContractSchema) => {
    try {
      // Prepare the contract data
      const kontrakData = {
        nama_mitra: nama_mitra || "", 
        nama: data.nama,
        nomor: data.nomor,
        tanggal: data.tanggal,
        nilai: data.nilai,
        jangka_waktu: data.jangka_waktu,
        pekerjaan_arr: data.pekerjaan.map((pekerjaan:Pekerjaan) => ({
          nama: pekerjaan.nama,
          lokasi: pekerjaan.lokasi
        }))
      };
      
      await createKontrak(kontrakData);
      console.log(kontrakData);
  
      setIsAddContractDialogOpen(false);
  
      toast({
        title: "Kontrak Berhasil Dibuat",
        description: "Kontrak baru telah ditambahkan.",
        variant: "success",
      });
  
    } catch (error) {
      console.error("Error creating contract:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal membuat kontrak",
        variant: "destructive",
      });
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
      
      console.log(updatedUserData);
      await updateUser(updatedUserData);  // Call the API to update the user
      // console.log("Backend Response:",response);
      setIsEditUserDialogOpen(false);  // Close the dialog after submission
      toast({
        title: "User berhasil diperbarui",
        description: "Data pengguna telah berhasil diperbarui.",
        variant: "success",
      });
  
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update user",
        variant: "danger",
      });
    }
  };
  

  const handleEditContractSubmit = async () => {

  }

  // Fungsi untuk membuka dialog dan mengatur kontrak yang akan dihapus
  const handleDeleteContract = (contract: Kontrak) => {
    setContractToDelete(contract);  // Menyimpan kontrak yang dipilih untuk dihapus
    setIsDeleteContractDialogOpen(true);  // Menampilkan dialog
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

  
  if (usersLoading || kontraksLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getStatus = (is_verified: number, is_active: number) => {
    if (is_verified === 0 && is_active === 1) {
      return { status: 'Belum Terverifikasi', color: 'text-yellow-500' };
    } else if (is_verified === 1 && is_active === 1) {
      return { status: 'Terverifikasi', color: 'text-green-500' };
    } 
      return { status: 'Terblokir', color: 'text-red-500' };
  };

  return (
    <div className="  h-screen py-4 px-8">
      <div className="mb-8  flex flex-col gap-4 ">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center  gap-x-2 text-gray-700 hover:text-primary font-semibold rounded-lg"
          >
           <ChevronLeft size={18}/> <span>Kembali</span>
          </button>
        <h1 className="text-2xl font-bold">Detail Mitra {nama_mitra}</h1>
      </div>

      <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8 py-4">
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
                    {contracts.map((contract: Kontrak, index: number) => (
                      <tr key={index} className="border-b">
                        <td className="p-3">{contract.nama}</td>
                        <td className="p-3">{contract.nomor}</td>
                        <td className="p-3  text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-blue-600 hover:text-blue-700"
                            onClick={() => {
                              setContractToEdit(contract);
                              setIsEditContractDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteContract(contract)} 
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
                    {users.map((user: User) => {
                      const {status, color} = getStatus(user.is_verified, user.is_active);
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

       {/* Dialog Tambah Pengguna */}
       <AddUserDialog
        isOpen={isAddUserDialogOpen}
        onClose={() => setIsAddUserDialogOpen(false)}
        onSubmit={handleAddUserSubmit}
      />

      {/* Dialog Edit Pengguna */}
      <EditUserDialog
        isOpen={isEditUserDialogOpen}
        onClose={() => setIsEditUserDialogOpen(false)}
        onSubmit={handleEditUserSubmit}
        user={userToEdit}
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

      {/* Dialog Tambah Kontrak */}
      <AddContractDialog
        isOpen={isAddContractDialogOpen}
        onClose={() => setIsAddContractDialogOpen(false)}
        onSubmit={handleAddContractSubmit}
      />

      {/* Dialog Edit Contract */}
      <EditContractDialog
        isOpen={isEditContractDialogOpen}
        onClose={() => setIsEditContractDialogOpen(false)}
        onSubmit={handleEditContractSubmit}
        contract={contractToEdit}
      />

       {/* Dialog Delete Contract */}
       <DeleteContractDialog
        isOpen={isDeleteContractDialogOpen}
        onClose={() => setIsDeleteContractDialogOpen(false)}
        contract={contractToDelete}  // Mengoper data kontrak
      />

    </div>
  );
};

export default MitraDetailPage;

