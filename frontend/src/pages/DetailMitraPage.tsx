import React, { useState } from "react";
import { MdEdit, MdDelete } from "react-icons/md";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {z} from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

interface Mitra {
  id: number;
  nama: string;
  alamat: string;
  telepon: string;
  contracts: Contract[];
  users: User[];
}

interface Contract {
  id: number;
  title: string;
  code?: string;
  nilaiKontrak?: number;
  tanggalKontrak?: string;
  jangkaWaktu?: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  nomor: string;  // Menambahkan field nomor
  status?: string;
}

//Tambah Kontrak
const formAddContractSchema = z.object({
  namaKontrak: z.string().min(1, "Nama kontrak wajib diisi").max(40, "Nama kontrak terlalu panjang"),
  nomorKontrak: z.string().min(1, "Nomor kontrak wajib diisi").max(20, "Nomor kontrak terlalu panjang"),
  nilaiKontrak: z.preprocess(
    (value) => parseFloat(value as string),
    z.number().min(1, "Nilai Kontrak harus lebih dari 1").max(1000000000000, "Nilai Kontrak Melebihi yang 1 Trilliun"),
  ),
  tanggalKontrak: z.string().min(1, "Tanggal kontrak wajib diisi").max(10, "Format tanggal tidak valid"), // Asumsi format YYYY-MM-DD
  jangkaWaktu: z.preprocess(
    (value) => parseFloat(value as string),
    z.number().min(1, "Jangka Waktu harus lebih dari 1").max(5475, "Jangka waktu terlalu panjang"),
  ),
})
export type AddContractSchema = z.infer<typeof formAddContractSchema>;

//Tambah Pengguna
const formAddUserSchema = z.object({
  namaPengguna: z.string().min(1, "Nama pengguna wajib diisi").max(40, "Nama pengguna terlalu panjang"),
  emailPengguna: z.string().email("Format email tidak valid").min(1, "Email pengguna wajib diisi"),
  nomorPengguna: z.string().min(4,"Nomor Telephone terlalu sedikit").max(16, "Nomor Telephone melebih batas"),
})
export type AddUserSchema = z.infer<typeof formAddUserSchema>;

// Edit Kontrak
const formEditContractSchema = z.object({
  namaKontrak: z.string().min(1, "Nama kontrak wajib diisi").max(40, "Nama kontrak terlalu panjang"),
  nomorKontrak: z.string().min(1, "Nomor kontrak wajib diisi").max(20, "Nomor kontrak terlalu panjang"),
  nilaiKontrak:  z.preprocess(
    (value) => parseFloat(value as string),
    z.number().min(1, "Nilai Kontrak harus lebih dari 1").max(1000000000000, "Nilai Kontrak Melebihi yang 1 Trilliun"),
  ),
  tanggalKontrak: z.string().min(1, "Tanggal kontrak wajib diisi").max(10, "Format tanggal tidak valid"), // Asumsi format YYYY-MM-DD
  jangkaWaktu: z.preprocess(
    (value) => parseFloat(value as string),
    z.number().min(1, "Jangka Waktu harus lebih dari 1").max(5475, "Jangka waktu terlalu panjang"),
  ),
})
export type EditContractSchema = z.infer<typeof formEditContractSchema>;

// Edit Pengguna
const formEditUserSchema = z.object({
  namaPengguna: z.string().min(1, "Nama pengguna wajib diisi").max(40, "Nama pengguna terlalu panjang"),
  emailPengguna: z.string().email("Format email tidak valid").min(1, "Email pengguna wajib diisi"),
  nomorPengguna: z.string().min(4,"Nomor Telephone terlalu sedikit").max(16, "Nomor Telephone melebih batas"),
  statusPengguna: z.enum(["Aktif", "Belum Aktif"] as const),
})
export type EditUserSchema = z.infer<typeof formEditUserSchema>;


const DetailMitraPage: React.FC<{ mitra: Mitra; onBack: () => void }> = ({ mitra, onBack }) => {
  const [contracts, setContracts] = useState<Contract[]>(mitra.contracts || []);
  const [users, setUsers] = useState<User[]>(mitra.users || []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isEditContractDialogOpen, setIsEditContractDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [contractToEdit, setContractToEdit] = useState<Contract | null>(null);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  const [isDeleteContractDialogOpen, setIsDeleteContractDialogOpen] = useState(false);
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<Contract | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const formAddContract = useForm<AddContractSchema>({
    resolver: zodResolver(formAddContractSchema),
    defaultValues:{
      namaKontrak:"",
      nomorKontrak:"",
      nilaiKontrak:0,
      tanggalKontrak:"",
      jangkaWaktu:0,
    }
  });

  const formEditContract = useForm<EditContractSchema>({
    resolver: zodResolver(formEditContractSchema),
    defaultValues:{
      namaKontrak:"",
      nomorKontrak:"",
      nilaiKontrak:0,
      tanggalKontrak:"",
      jangkaWaktu:0,
    }
  });

  const formAddUser = useForm<AddUserSchema>({
    resolver: zodResolver(formAddUserSchema),
    defaultValues:{
      namaPengguna:"",
      emailPengguna:"",
      nomorPengguna:"",
    }
  });

  const formEditUser = useForm<EditUserSchema>({
    resolver: zodResolver(formEditUserSchema),
    defaultValues: {
      namaPengguna: "",
      emailPengguna: "",
      nomorPengguna: "",
      statusPengguna: "Belum Aktif",
    }
  });

  // Controll all Edit Click
  const handleEditContractClick = (e: React.MouseEvent, contract: Contract) => {
    e.stopPropagation();
    setContractToEdit(contract); // Set the contract to edit
    setIsEditContractDialogOpen(true); // Open the edit contract dialog

    formEditContract.reset({
      namaKontrak: contract.title || "",
      nomorKontrak: contract.code || "",
      nilaiKontrak: contract.nilaiKontrak || 0,
      tanggalKontrak: contract.tanggalKontrak || "",
      jangkaWaktu: contract.jangkaWaktu || 0,
    });
  };  

  const handleEditUserClick = (e: React.MouseEvent, user: User) => {
    e.stopPropagation();
    setUserToEdit(user);
    setIsEditUserDialogOpen(true);

    formEditUser.reset({
      namaPengguna: user.name || "",
      emailPengguna: user.email || "",
      nomorPengguna: user.nomor || "",
      statusPengguna: user.status as "Aktif" | "Belum Aktif" || "Belum Aktif",
    });
  };

  const handleDeleteContractClick = (e: React.MouseEvent, contract: Contract) => {
    e.stopPropagation();
    setContractToDelete(contract);
    setIsDeleteContractDialogOpen(true);
  };

  const handleDeleteUserClick = (e: React.MouseEvent, user: User) => {
    e.stopPropagation();
    setUserToDelete(user);
    setIsDeleteUserDialogOpen(true);
  };


  // Controll all Submit (First)
  const handleAddUserSubmit = (data: AddUserSchema) => {
    const newUser: User = {
      id: users.length + 1,
      name: data.namaPengguna,
      email: data.emailPengguna,
      nomor: data.nomorPengguna,
      
    };
  
    setUsers([...users, newUser]);
    setIsUserDialogOpen(false);
    formAddUser.reset();
  };

  const handleAddContractSubmit = (data: AddContractSchema) => {
    const newContract: Contract = {
      id: contracts.length + 1,
      title: data.namaKontrak,
      code: data.nomorKontrak,
      nilaiKontrak: data.nilaiKontrak,
      tanggalKontrak: data.tanggalKontrak,
      jangkaWaktu: data.jangkaWaktu,
    };
  
    setContracts([...contracts, newContract]);
    setIsDialogOpen(false);
    formAddContract.reset();
  };


  // Controll all Submit (Edit Mode)
  const handleEditContractSubmit = (data: EditContractSchema) => {
    if (!contractToEdit) return; 

    const updatedContract: Contract = {
      ...contractToEdit,
      title: data.namaKontrak,
      code: data.nomorKontrak,
      nilaiKontrak: data.nilaiKontrak,
      tanggalKontrak: data.tanggalKontrak,
      jangkaWaktu: data.jangkaWaktu,
    };

    // Update the contracts list with the edited contract
    setContracts((prevContracts) =>
      prevContracts.map((contract) =>
        contract.id === updatedContract.id ? updatedContract : contract
      )
    );

    // Close the dialog and reset the form
    setIsEditContractDialogOpen(false);
    formEditContract.reset();
  };

  const handleEditUserSubmit = (data: EditUserSchema) => {
    if (!userToEdit) return;

    const updatedUser: User = {
      ...userToEdit,
      name: data.namaPengguna,
      email: data.emailPengguna,
      nomor: data.nomorPengguna,
      status: data.statusPengguna,
    };

    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === updatedUser.id ? updatedUser : user
      )
    );

    setIsEditUserDialogOpen(false);
    formEditUser.reset();
  };

  // Control All Delete

  const handleDeleteContract = () => {
    if (!contractToDelete) return;
    setContracts((prevContracts) =>
      prevContracts.filter((contract) => contract.id !== contractToDelete.id)
    );
    setIsDeleteContractDialogOpen(false);
    setContractToDelete(null);
  };

  const handleDeleteUser = () => {
    if (!userToDelete) return;
    setUsers((prevUsers) =>
      prevUsers.filter((user) => user.id !== userToDelete.id)
    );
    setIsDeleteUserDialogOpen(false);
    setUserToDelete(null);
  };

  return (
    <div className="p-6">
      
      <div className="mb-6">
        <button
          onClick={onBack}
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
          style={{ marginTop: "-12px" }} 
        >
          &larr; Back to Dashboard
        </button>
      </div>
      <h2 className="text-2xl font-semibold mb-4">Detail Mitra {mitra.nama}</h2>

      <div className="grid grid-cols-2 gap-6">
        {/* Daftar Kontrak Kerja */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-black">Daftar Kontrak Kerja</h3>
            <div className="w-fit">
              <Button
                onClick={() => setIsDialogOpen(true)}
              
              >
                <span>Tambah Kontrak</span>
              </Button>
            </div>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-left bg-gray-200">
                <th className="p-3">Kontrak Kerja</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {contracts.length ? (
                contracts.map((contract) => (
                  <tr key={contract.id} className="border-b">
                    <td className="p-3">
                      <div className="flex items-center">
                        
                        <div>
                          <p>{contract.title}</p>
                          <p className="text-sm text-gray-500">Kode: {contract.code}</p>
                          <p className="text-sm text-gray-500">
                            Nilai: Rp {contract.nilaiKontrak?.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            Tanggal: {contract.tanggalKontrak}
                          </p>
                          <p className="text-sm text-gray-500">
                            Jangka Waktu: {contract.jangkaWaktu} bulan
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          className="flex justify-center items-center p-1.5 cursor-pointer rounded-full hover:bg-gray-50"
                          onClick={(e) => handleEditContractClick(e, contract)} // Trigger edit dialog
                        >
                          <MdEdit color="blue" size={18} />
                        </button>
                        <button
                          className="flex justify-center items-center p-1.5 cursor-pointer rounded-full hover:bg-gray-50"
                          onClick={(e) => handleDeleteContractClick(e, contract)}
                        >
                          <MdDelete color="red" size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="p-3 text-center text-gray-500">
                    Tidak ada kontrak kerja.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Daftar Pengguna Mitra */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-black">Daftar Pengguna Mitra</h3>
            <div className="w-fit">
              <Button
                onClick={() => setIsUserDialogOpen(true)}
              >
                <span>Tambah Pengguna</span>
              </Button>
            </div>
          </div>

          <table className="w-full">
            <thead>
              <tr className="text-left bg-gray-200">
                <th className="p-3">Pengguna Mitra</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.length ? (
                users.map((user) => (
                  <tr key={user.id} className="border-b">
                    <td className="p-3">
                      <div>
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-sm font-semibold ${
                          user.status === "Aktif" ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {user.status === "Aktif" ? "Aktif" : "Belum Aktif"}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                      <button
                          className="flex justify-center items-center p-1.5 cursor-pointer rounded-full hover:bg-gray-50"
                          onClick={(e) => handleEditUserClick(e, user)}
                        >
                          <MdEdit color="blue" size={18} />
                        </button>
                        <button
                          className="flex justify-center items-center p-1.5 cursor-pointer rounded-full hover:bg-gray-50"
                          onClick={(e) => handleDeleteUserClick(e, user)}
                        >
                          <MdDelete color="red" size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="p-3 text-center text-gray-500">
                    Tidak ada pengguna mitra.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialog Tambah Kontrak */}
      {isDialogOpen && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Kontrak</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              <Form {...formAddContract}>
                <form
                  onSubmit={formAddContract.handleSubmit(handleAddContractSubmit)}
                  className="grid grid-cols-2 gap-4"
                >
                  <FormField
                    control={formAddContract.control}
                    name="namaKontrak"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Kontrak</FormLabel>
                        <FormControl className="relative top-[-4px]">
                          <Input type="text" placeholder="Masukkan Nama Kontrak" {...field} required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={formAddContract.control}
                    name="nomorKontrak"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nomor Kontrak</FormLabel>
                        <FormControl className="relative top-[-4px]">
                          <Input type="text" placeholder="Masukkan Nomor Kontrak" {...field} required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={formAddContract.control}
                    name="nilaiKontrak"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nilai Kontrak</FormLabel>
                        <FormControl className="relative top-[-4px]">
                          <Input type="number" placeholder="Masukkan Nilai Kontrak" {...field} required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={formAddContract.control}
                    name="tanggalKontrak"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tanggal Kontrak</FormLabel>
                        <FormControl className="relative top-[-4px]">
                          <Input
                            type="date"
                            placeholder="dd/mm/yyyy"
                            {...field}
                            required
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={formAddContract.control}
                    name="jangkaWaktu"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Jangka Waktu (bulan)</FormLabel>
                        <FormControl className="relative top-[-4px]">
                          <Input type="number" placeholder="Masukkan Jangka Waktu" {...field} required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="col-span-2 flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => console.log("Cancel")}>
                      Batal
                    </Button>
                    <Button type="submit" className="bg-red-500 text-white">
                      Simpan
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogDescription>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog Edit Kontrak */}
      {isEditContractDialogOpen && contractToEdit && (
        <Dialog open={isEditContractDialogOpen} onOpenChange={setIsEditContractDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Kontrak</DialogTitle>
            </DialogHeader>
            <DialogDescription>
            <Form {...formEditContract}>
                      <form
                        onSubmit={formEditContract.handleSubmit(handleEditContractSubmit)}
                        className="grid grid-cols-2 gap-4"
                      >
                        <FormField
                          control={formEditContract.control}
                          name="namaKontrak"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nama Kontrak</FormLabel>
                              <FormControl className="relative top-[-4px]">
                                <Input
                                  type="text"
                                  placeholder="Masukkan Nama Kontrak"
                                  {...field}// Prepopulate value
                                  required
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={formEditContract.control}
                          name="nomorKontrak"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nomor Kontrak</FormLabel>
                              <FormControl className="relative top-[-4px]">
                                <Input
                                  type="text"
                                  placeholder="Masukkan Nomor Kontrak"
                                  {...field} // Prepopulate value
                                  required
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={formEditContract.control}
                          name="nilaiKontrak"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nilai Kontrak</FormLabel>
                              <FormControl className="relative top-[-4px]">
                                <Input
                                  type="number"
                                  placeholder="Masukkan Nilai Kontrak"
                                  {...field}
                                  required
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={formEditContract.control}
                          name="tanggalKontrak"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tanggal Kontrak</FormLabel>
                              <FormControl className="relative top-[-4px]">
                                <Input
                                  type="date"
                                  placeholder="dd/mm/yyyy"
                                  {...field}
                                  required
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={formEditContract.control}
                          name="jangkaWaktu"
                          render={({ field }) => (
                            <FormItem className="col-span-2">
                              <FormLabel>Jangka Waktu (bulan)</FormLabel>
                              <FormControl className="relative top-[-4px]">
                                <Input
                                  type="number"
                                  placeholder="Masukkan Jangka Waktu"
                                  {...field}
                                  required
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="col-span-2 flex justify-end gap-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsEditContractDialogOpen(false)}
                          >
                            Batal
                          </Button>
                          <Button type="submit" className="bg-red-500 text-white">
                            Simpan
                          </Button>
                        </div>
                      </form>
                    </Form>
            </DialogDescription>
          </DialogContent>
        </Dialog>
)}

      {/* Dialog Tambah Pengguna */}
      {isUserDialogOpen && (
        <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Pengguna</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              <Form {...formAddUser}>
                <form
                  onSubmit={formAddUser.handleSubmit(handleAddUserSubmit)}
                  className="space-y-3 " // Two-column grid layout
                >
                  <FormField
                    control={formAddUser.control}
                    name="namaPengguna"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Pengguna</FormLabel>
                        <FormControl className="relative top-[-4px]">
                          <Input
                            type="text"
                            placeholder="Masukkan Nama Pengguna"
                            {...field}
                            required
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={formAddUser.control}
                    name="emailPengguna"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Pengguna</FormLabel>
                        <FormControl className="relative top-[-4px]">
                          <Input
                            type="email"
                            placeholder="Masukkan Email Pengguna"
                            {...field}
                            required
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={formAddUser.control}
                    name="nomorPengguna"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Nomor Telephone Pengguna</FormLabel>
                        <FormControl className="relative top-[-4px]">
                          <Input
                              type="text"
                              placeholder="Masukkan Nomor Telephone Pengguna"
                              {...field}
                              required
                            />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
  
                  <div className="col-span-2 flex justify-end gap-4 ">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsUserDialogOpen(false)}
                    >
                      Batal
                    </Button>
                    <Button type="submit" className="bg-red-500 text-white">
                      Simpan
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogDescription>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Edit User Dialog */}
      {isEditUserDialogOpen && userToEdit && (
        <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Pengguna</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              <Form {...formEditUser}>
                <form
                  onSubmit={formEditUser.handleSubmit(handleEditUserSubmit)}
                  className="space-y-3"
                >
                  <FormField
                    control={formEditUser.control}
                    name="emailPengguna"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Pengguna</FormLabel>
                        <FormControl className="relative top-[-4px]">
                          <Input
                            type="email"
                            placeholder="Masukkan Email Pengguna"
                            {...field}
                            disabled
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={formEditUser.control}
                    name="namaPengguna"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Pengguna</FormLabel>
                        <FormControl className="relative top-[-4px]">
                          <Input
                            type="text"
                            placeholder="Masukkan Nama Pengguna"
                            {...field}
                            required
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={formEditUser.control}
                    name="nomorPengguna"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nomor Telephone Pengguna</FormLabel>
                        <FormControl className="relative top-[-4px]">
                          <Input
                            type="text"
                            placeholder="Masukkan Nomor Telephone Pengguna"
                            {...field}
                            required
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                    <FormField
                    control={formEditUser.control}
                    name="statusPengguna"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status Pengguna</FormLabel>
                        <FormControl className="relative top-[-4px]">
                          <select
                            className="w-full px-3 py-2 border rounded-md"
                            {...field}
                            required
                          >
                            <option value="Aktif">Aktif</option>
                            <option value="Belum Aktif">Belum Aktif</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditUserDialogOpen(false)}
                    >
                      Batal
                    </Button>
                    <Button type="submit" className="bg-red-500 text-white">
                      Simpan
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogDescription>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog Delete Kontrak */}
      {isDeleteContractDialogOpen && contractToDelete && (
        <Dialog open={isDeleteContractDialogOpen} onOpenChange={setIsDeleteContractDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hapus Kontrak</DialogTitle>
            </DialogHeader>
            <DialogDescription className="py-5">
              <div className="space-y-6">
                  <p className="text-center">
                    Apakah Anda yakin ingin menghapus kontrak "{contractToDelete.title}"? 
                    Tindakan ini tidak dapat dibatalkan.
                  </p>

                  <div className="flex gap-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDeleteContractDialogOpen(false)}
                    >
                      Batal
                    </Button>
                    <Button
                      type="button"
                      className="bg-red-500 text-white hover:bg-red-600"
                      onClick={handleDeleteContract}
                    >
                      Hapus
                    </Button>
                  </div>
              </div>
            </DialogDescription>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog Delete Pengguna */}
      {isDeleteUserDialogOpen && userToDelete && (
        <Dialog open={isDeleteUserDialogOpen} onOpenChange={setIsDeleteUserDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hapus Pengguna</DialogTitle>
            </DialogHeader>
            <DialogDescription className="py-5">
              <div className="space-y-6">
                  <p className="text-center">Apakah Anda yakin ingin menghapus pengguna "{userToDelete.name}"?</p>

                <div className="flex gap-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDeleteUserDialogOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button
                    type="button"
                    className="bg-red-500 text-white hover:bg-red-600"
                    onClick={handleDeleteUser}
                  >
                    Hapus
                  </Button>
                </div>
              </div>
            </DialogDescription>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default DetailMitraPage;