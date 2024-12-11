import React, { useState } from "react"
import { FaUserFriends, FaFileAlt, FaInbox } from "react-icons/fa"
import SummaryCard from "@/components/custom/moleculs/CustomCard"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import DetailMitraPage from "./DetailMitraPage"
import { z } from "zod"
import { SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useGetMitras } from "@/api/MitraApi"
import { CustomJwtPayload, Mitra } from "@/types"
import { EditIcon, TrashIcon } from "lucide-react"
import { getAccessToken } from "@/lib/utils"
import {jwtDecode} from "jwt-decode"

// Zod Schema
const formEditMitraSchema = z.object({
  namaPerusahaan: z.string().min(1, "Nama perusahaan wajib diisi").max(50, "Nama perusahaan terlalu panjang"),
  alamatPerusahaan: z.string().min(1, "Alamat perusahaan wajib diisi").max(100, "Alamat perusahaan terlalu panjang"),
  nomorTelpPerusahaan: z.string().min(1, "Nomor telepon perusahaan wajib diisi").max(20, "Nomor telepon perusahaan terlalu panjang"),
})

export type EditMitraSchema = z.infer<typeof formEditMitraSchema>

const DashboardPage = () => {
  const accessToken = getAccessToken()
  let metaData: CustomJwtPayload = { user_id: "", permissions: [] }
  let isAdmin = false

  // Decode Access Token
  if (typeof accessToken === "string" && accessToken.trim() !== "") {
    try {
      metaData = jwtDecode<CustomJwtPayload>(accessToken)
      isAdmin = !metaData.nama_mitra // Identify admin based on the absence of `nama_mitra`.
    } catch (error) {
      console.error("Error decoding token:", error)
    }
  } else {
    console.error("Token is undefined or invalid")
  }

  // Fetch Data
  const { allMitra, isLoading: isGettingMitras } = useGetMitras({enabled: isAdmin})
  const dataMitra = allMitra?.mitras || []

  // State
  const [selectedMitra, setSelectedMitra] = useState<Mitra | null>(null)
  const [mitraToEdit, setMitraToEdit] = useState<Mitra | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Form Hook
  const formEditMitra = useForm<EditMitraSchema>({
    resolver: zodResolver(formEditMitraSchema),
  })

  // Handlers
  const handleMitraClick = (mitra: Mitra) => setSelectedMitra(mitra)
  const handleBackToDashboard = () => setSelectedMitra(null)

  const handleEditClick = (e: React.MouseEvent, mitra: Mitra) => {
    e.stopPropagation()
    setMitraToEdit(mitra)
    setIsDialogOpen(true)
  }

  const handleEditSubmit: SubmitHandler<EditMitraSchema> = async (data) => {
    console.log("Edited Data:", data)
  }

  const handleDelete = (e: React.MouseEvent, mitra: Mitra) => {
    e.stopPropagation()
    console.log("Deleted Mitra:", mitra)
  }

  if (isGettingMitras) {
    return <div>Loading...</div>
  }

  return (
    <div className="py-8 lg:p-8">
      {!selectedMitra && <h1 className="text-2xl font-semibold text-black mb-6">Dashboard</h1>}

      {!selectedMitra ? (
        <>
          {/* Summary Cards */}
          <div className={`grid ${isAdmin ? 'grid-cols-3' : 'grid-cols-2'} gap-6 mb-6`}>
            {isAdmin && (
              <SummaryCard
                title="Total Mitra"
                value={dataMitra.length.toString()}
                icon={<FaUserFriends className="text-white text-4xl" />}
                bgColor="bg-blue-500"
              />
            )}
            <SummaryCard
              title="Total Laporan"
              value="27"
              icon={<FaFileAlt className="text-white text-4xl" />}
              bgColor="bg-red-500"
            />
            <SummaryCard
              title="Total Pesan Masuk"
              value="5"
              icon={<FaInbox className="text-white text-4xl" />}
              bgColor="bg-green-500"
            />
          </div>

          {/* Add Mitra Button */}
          {isAdmin && (
            <div className="w-full flex justify-end mb-2">
              <Button className="w-[25%]" asChild>
                <Link to="/daftarmitra/tambahmitra">Tambah Mitra</Link>
              </Button>
            </div>
          )}

          {/* Mitra Table */}
          <div className="bg-white p-6 rounded-lg border mt-4">
            <h2 className="text-xl font-semibold text-gray-700">Daftar Mitra</h2>
            <table className="w-full border-collapse mt-4">
              <thead>
                <tr className="text-left bg-slate-200">
                  <th className="p-3 font-medium border-b-2">No</th>
                  <th className="p-3 font-medium border-b-2">Nama Mitra</th>
                  <th className="p-3 font-medium border-b-2">Alamat Mitra</th>
                  <th className="p-3 font-medium border-b-2">Nomor Telepon</th>
                  <th className="p-3 font-medium border-b-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {dataMitra.map((mitra: Mitra, index: number) => (
                  <tr
                    key={mitra.id}
                    onClick={() => handleMitraClick(mitra)}
                    className="border-b hover:bg-gray-50 duration-100 ease-in-out cursor-pointer"
                  >
                    <td className="p-3 text-sm text-gray-600">{index + 1}</td>
                    <td className="p-3 text-sm text-gray-600">{mitra.nama}</td>
                    <td className="p-3 text-sm text-gray-600">{mitra.alamat}</td>
                    <td className="p-3 text-sm text-gray-600">{mitra.nomor_telepon}</td>
                    <td className="p-3 text-sm text-gray-600">
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => handleEditClick(e, mitra)}
                          className="p-1.5 rounded-full hover:bg-gray-200"
                        >
                          <EditIcon color="blue" size={18} />
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, mitra)}
                          className="p-1.5 rounded-full hover:bg-gray-200"
                        >
                          <TrashIcon color="red" size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div>hehe</div>
        // <DetailMitraPage mitra={selectedMitra} onBack={handleBackToDashboard} />
      )}

      {/* Edit Mitra Dialog */}
      {isDialogOpen && mitraToEdit && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Informasi Mitra</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              <Form {...formEditMitra}>
                <form onSubmit={formEditMitra.handleSubmit(handleEditSubmit)} className="space-y-3">
                  <FormField
                    control={formEditMitra.control}
                    name="namaPerusahaan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Perusahaan</FormLabel>
                        <FormControl>
                          <Input type="text" {...field} defaultValue={mitraToEdit?.nama} disabled />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={formEditMitra.control}
                    name="alamatPerusahaan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alamat Perusahaan</FormLabel>
                        <FormControl>
                          <Input type="text" {...field} defaultValue={mitraToEdit?.alamat} required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={formEditMitra.control}
                    name="nomorTelpPerusahaan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nomor Telepon Perusahaan</FormLabel>
                        <FormControl>
                          <Input type="text" {...field} defaultValue={mitraToEdit?.nomor_telepon} required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">Edit</Button>
                </form>
              </Form>
            </DialogDescription>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default DashboardPage
