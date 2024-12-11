import { useLocation, useNavigate } from "react-router-dom";
import { useCreateLaporan } from "@/api/LaporanApi";
import BuatLaporanForm from "@/forms/buat-laporan-form/BuatLaporanForm";

export default function BuatLaporanPage() {
  const { createLaporan, isLoading } = useCreateLaporan();
  const location = useLocation();
  const navigate = useNavigate();

  const { nama_mitra, nomor_kontrak, nama_pekerjaan } = location.state || {};

  // Redirect to another page if required location state is missing
  if (!nama_mitra || !nomor_kontrak || !nama_pekerjaan) {
    return (
      <div>
        <p>Data tidak tersedia. Silakan kembali ke halaman sebelumnya.</p>
        <button
          className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
          onClick={() => navigate("/daftarpekerjaan")}
        >
          Kembali
        </button>
      </div>
    );
  }
  
  // console.log({nama_mitra, nomor_kontrak, nama_pekerjaan}) //Debug.

  const handleSubmit = async (formData: FormData) => {
    try {

      console.log("Submitting laporan:", formData); // Debug.

      // Trigger API call
      await createLaporan(formData);

      console.log("Laporan created successfully!");
      navigate("/daftarpekerjaan"); // Redirect on success
    } catch (error) {
      console.error("Error creating laporan:", error) //Debug.
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Buat Laporan</h1>
      <BuatLaporanForm 
        nama_mitra={nama_mitra} 
        nomor_kontrak={nomor_kontrak} 
        nama_pekerjaan={nama_pekerjaan}
        onSubmit={handleSubmit} 
        isLoading={isLoading} 
      />
    </div>
  );
}
