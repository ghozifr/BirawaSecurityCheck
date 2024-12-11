import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetMitraUsers, useGetMitraKontraks } from "@/api/MitraApi";
import { Button } from "@/components/ui/button";
import { Kontrak, User } from "@/types";
import { Pencil, Trash2 } from 'lucide-react';
import { ChevronLeft } from 'lucide-react';
const MitraDetailPage: React.FC = () => {
  const { nama_mitra } = useParams<{ nama_mitra: string }>();
  const navigate = useNavigate();
  const { mitraUsers, isLoading: usersLoading } = useGetMitraUsers(nama_mitra || "");
  const users = mitraUsers?.mitra_users || [];

  console.log(users);

  const { mitraKontraks, isLoading: kontraksLoading } = useGetMitraKontraks(nama_mitra || "", {
    enabled: !!nama_mitra,
  });
  const contracts = mitraKontraks?.mitra_kontraks || [];

  if (usersLoading || kontraksLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getStatus = (is_verified: number, is_active: number) => {
    if (is_verified === 0 && is_active === 0) {
      return { status: 'Belum Terverifikasi', color: 'text-yellow-500' };
    } else if (is_verified === 1 && is_active === 1) {
      return { status: 'Terverifikasi', color: 'text-green-500' };
    } else if (is_verified === 1 && is_active === 0) {
      return { status: 'Terblokir', color: 'text-red-500' };
    }
    return { status: 'Unknown', color: 'text-gray-500' }; // Default case, if needed
  };

  return (
    <div className=" bg-gray-50 h-screen py-12 px-8">
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
              onClick={() => {/* Handle add contract */}}
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
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700"
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
              onClick={() => {/* Handle add user */}}
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
                      const {status, color} = getStatus(user.is_verified,user.is_active);
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
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
    </div>
  );
};

export default MitraDetailPage;

