import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { useGetMitraKontraks } from '@/api/MitraApi'
import { capitalizeWords, getAccessToken } from '@/lib/utils'
import { jwtDecode } from 'jwt-decode'
import { Kontrak, Laporan } from '@/types'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import LoadingScreen from '@/components/LoadingScreen'
type TableFormattedPekerjaan = {
  nama_kontrak: string
  nomor_kontrak: string
  nama_pekerjaan: string
  lokasi_pekerjaan: string
  latest_tanggal_laporan: string | null
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const DaftarPekerjaan = () => {
  const accessToken = getAccessToken()
  let metaData: { nama_mitra?: string } = {}
  if (typeof accessToken === 'string' && accessToken.trim() !== '') {
    try {
      metaData = jwtDecode(accessToken)
    } catch (error) {
      console.error('Error decoding token:', error)
    }
  }

  const navigate = useNavigate()
  const [selectedRow, setSelectedRow] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState<number>(5)
  const [tableData, setTableData] = useState<TableFormattedPekerjaan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const { mitraKontraks, isLoading: isMitraKontraksLoading } = useGetMitraKontraks(metaData.nama_mitra, {
    enabled: !!metaData.nama_mitra,
  })

  const fetchKontrakPekerjaans = async (namaMitra: string, nomorKontrak: string) => {
    const response = await fetch(`${API_BASE_URL}/api/kontrak/pekerjaans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Type': 'web',
      },
      body: JSON.stringify({ nama_mitra: namaMitra, nomor_kontrak: nomorKontrak }),
      credentials: 'include',
    })
    if (!response.ok) {
      throw new Error('Failed to fetch pekerjaan for kontrak.')
    }
    return response.json()
  }

  useEffect(() => {
    const fetchData = async () => {
      if (mitraKontraks?.mitra_kontraks?.length) {
        setIsLoading(true);
        const allData: TableFormattedPekerjaan[] = [];
  
        await Promise.all(
          mitraKontraks.mitra_kontraks.map(async (kontrak: Kontrak) => {
            try {
              const { kontrak_pekerjaans } = await fetchKontrakPekerjaans(metaData.nama_mitra!, kontrak.nomor);
  
              await Promise.all(
                kontrak_pekerjaans.map(async (pekerjaan: any) => {
                  try {
                    const { pekerjaan_laporans } = await fetch(`${API_BASE_URL}/api/laporan/laporan-pekerjaan`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'X-Client-Type': 'web',
                      },
                      body: JSON.stringify({
                        nama_mitra: metaData.nama_mitra!,
                        nomor_kontrak: kontrak.nomor,
                        nama_pekerjaan: pekerjaan.nama,
                      }),
                      credentials: 'include',
                    }).then((res) => res.json());
  
                    const latestLaporan = pekerjaan_laporans?.reduce(
                      (latest: Laporan, current: Laporan) =>
                        new Date(current.tanggal) > new Date(latest.tanggal) ? current : latest,
                      pekerjaan_laporans[0]
                    );
  
                    allData.push({
                      nama_kontrak: kontrak.nama,
                      nomor_kontrak: kontrak.nomor,
                      nama_pekerjaan: pekerjaan.nama,
                      lokasi_pekerjaan: pekerjaan.lokasi,
                      latest_tanggal_laporan: latestLaporan?.tanggal || null,
                    });
                  } catch (error) {
                    console.error(`Error fetching laporan for pekerjaan ${pekerjaan.nama}:`, error);
                  }
                })
              );
            } catch (error) {
              console.error(`Error fetching pekerjaan for kontrak ${kontrak.nomor}:`, error);
            }
          })
        );
  
        setTableData(allData);
        setIsLoading(false);
      }
    };
  
    fetchData();
  }, [mitraKontraks, metaData.nama_mitra]);
  
  

  // Use useMemo to filter table data based on searchQuery
  const filteredData = useMemo(() => {
    return tableData.filter((pekerjaan) => {
      const query = searchQuery.toLowerCase()
      return (
        pekerjaan.nama_kontrak.toLowerCase().includes(query) || 
        pekerjaan.nama_pekerjaan.toLowerCase().includes(query) ||
        pekerjaan.lokasi_pekerjaan.toLowerCase().includes(query) 
      )
    })
  }, [searchQuery, tableData])

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredData.slice(startIndex, startIndex + itemsPerPage)
  }, [currentPage, itemsPerPage, filteredData])

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      setSelectedRow(null) // Reset selection when changing pages
    }
  }

  const handleCheckboxChange = (index: number) => {
    setSelectedRow(index === selectedRow ? null : index)
  }

  const handleBuatLaporanClick = () => {
    if (selectedRow !== null) {
      const selectedJob = paginatedData[selectedRow]
      navigate('/daftarpekerjaan/buatlaporan-test', {
        state: {
          nama_mitra: metaData.nama_mitra,
          nomor_kontrak: selectedJob.nomor_kontrak,
          nama_pekerjaan: selectedJob.nama_pekerjaan,
        },
      })
    }
  }

  return (
    <div className="py-8 lg:p-8 flex-1 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">Buat Laporan</h1>

      <div className="bg-white p-6 border rounded-lg">
        {isLoading || isMitraKontraksLoading ? (
          <LoadingScreen/>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className='flex gap-x-3 items-center'>
                <h2 className="text-lg font-medium min-w-32 max-w-40">Pilih Pekerjaan</h2>
                <div className="relative w-full">
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari pekerjaan atau kontrak..."
                    className="border p-2 placeholder:text-sm rounded-full pl-8 w-full"
                  />
                  <Search size={18} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <label className="text-sm mr-2">Tampilkan</label>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value))
                      setCurrentPage(1) // Reset to first page
                    }}
                    className="border border-gray-300 rounded px-2 py-1 text-sm mr-6"
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                  </select>
                </div>

                <button
                  onClick={handleBuatLaporanClick}
                  disabled={selectedRow === null}
                  className={`px-12 py-1 rounded font-semibold ${
                    selectedRow !== null ? 'bg-primary text-white' : 'bg-gray-300 text-black cursor-not-allowed'
                  }`}
                >
                  Buat Laporan
                </button>
              </div>
            </div>

            <div className="w-full h-auto mt-4  ">
              <table className="w-full text-center text-sm border border-gray-300">
                <thead className="bg-gray-200 border-b border-gray-300">
                  <tr>
                    <th className="p-4 border-r font-semibold text-gray-600 w-[2%]"></th>
                    <th className="p-4 font-semibold text-gray-600 w-[19.5%]">Nama Kontrak</th>
                    <th className="p-4 font-semibold text-gray-600 w-[19.5%]">Nomor Kontrak</th>
                    <th className="p-4 font-semibold text-gray-600 w-[19.5%]">Nama Pekerjaan</th>
                    <th className="p-4 font-semibold text-gray-600 w-[19.5%]">Lokasi Pekerjaan</th>
                    <th className="p-4 font-semibold text-gray-600 w-[19.5%]">Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((pekerjaan, index) => (
                    <tr key={index} className={`${index % 2 === 0 ? "bg-gray-100" : "bg-white"} hover:bg-gray-100`}>
                      <td className="p-4 border-b border-r">
                        <input
                          type="checkbox"
                          checked={selectedRow === index}
                          onChange={() => handleCheckboxChange(index)}
                        />
                      </td>
                      <td className="p-4 text-sm font-normal border-b">{capitalizeWords(pekerjaan.nama_kontrak)}</td>
                      <td className="p-4 text-sm font-normal border-b">{capitalizeWords(pekerjaan.nomor_kontrak)}</td>
                      <td className="p-4 text-sm font-normal border-b">{capitalizeWords(pekerjaan.nama_pekerjaan)}</td>
                      <td className="p-4 text-sm font-normal border-b">{capitalizeWords(pekerjaan.lokasi_pekerjaan)}</td>
                      <td className="p-4 text-sm font-normal border-b">
                      {pekerjaan.latest_tanggal_laporan ? 
                        new Date(pekerjaan.latest_tanggal_laporan).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })
                        : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-gray-600 w-52">
                Halaman {currentPage} dari {totalPages}
              </span>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  {[...Array(totalPages)].map((_, index) => (
                    <PaginationItem key={index}>
                      <PaginationLink
                        isActive={currentPage === index + 1}
                        className="cursor-pointer"
                        onClick={() => handlePageChange(index + 1)}
                      >
                        {index + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default DaftarPekerjaan
