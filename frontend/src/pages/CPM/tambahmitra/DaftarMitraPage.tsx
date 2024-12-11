import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { ChevronDown, Edit2, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useGetMitras } from '@/api/MitraApi';
import { Country, Mitra } from '@/types';
import { useNavigate } from 'react-router-dom';
import { useUpdateMitra } from '@/api/MitraApi';
import { useToast } from '@/hooks/use-toast';
import { Search } from 'lucide-react';
import LoadingScreen from '@/components/LoadingScreen';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getCountries, getCountryCallingCode } from 'libphonenumber-js';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const formSchema = z.object({
  nama_mitra : z.string().optional(),
  alamat: z.string().min(2, 'alamat Mitra terlalu kecil').max(32, 'Alamat Mitra terlalu panjang').optional(),
  nomor_telepon: z.string().min(4, 'Nomor Telephone terlalu sedikit').max(16, 'Nomor Telephone melebih batas').optional(),
});

export type EditFormSchema = z.infer<typeof formSchema>;

const DaftarMitra = () => {
  const {toast} = useToast();
  const { allMitra, isLoading , refetch } = useGetMitras({enabled: true})
  const { updateMitra, isLoading: isUpdating } = useUpdateMitra();

  // Dialog Needed
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [selectedMitra, setSelectedMitra] = useState<Mitra | null>(null);

  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);

  const [searchQuery, setSearchQuery] = useState<string>('');


  useEffect(() => {
    localStorage.setItem('itemsPerPageMitra', itemsPerPage.toString());
  }, [itemsPerPage]);

  const formEditMitra = useForm<EditFormSchema>({
    resolver: zodResolver(formSchema),
  });

  // Memoize the dataMitra initialization
  const dataMitra = useMemo(() => {
    const mitras = allMitra?.mitras || [];
    return [...mitras].sort((a, b) => {
      return a.nama.localeCompare(b.nama, undefined, { numeric: true, sensitivity: 'base' });
    });
  }, [allMitra]);

  // Memoized search filter logic
  const filteredMitra = useMemo(() => {
    return dataMitra.filter((mitra:Mitra) => {
      const query = searchQuery.toLowerCase();
      return (
        mitra.nama.toLowerCase().includes(query) 
      );
    });
  }, [dataMitra, searchQuery]);

  function showDetailMitra(namaMitra: string) {
    navigate(`/daftarmitra/detailmitra/${namaMitra}`);
  };

  // Pagination logic
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMitra.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, itemsPerPage, filteredMitra]);

  const totalPages = Math.ceil(filteredMitra.length / itemsPerPage);

  function handlePageChange(page: number) {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  function handleEditClick(e:React.MouseEvent, mitra: Mitra)  
  {
    e.stopPropagation();
    setSelectedMitra(mitra);
    setIsEditDialogOpen(true);
  }

  // function handleDelete()  {
  //   console.log('delete dilakukan');
  //   setIsDeleteDialogOpen(false);
  // };

  async function handleEditSubmit(data: EditFormSchema)  {
    if (!selectedMitra) return;

    try {
      const updatedMitra = {
        nama_mitra: selectedMitra.nama, // Nama Mitra tetap tidak berubah
        alamat: data.alamat || selectedMitra.alamat,  // Use the updated address, fallback to existing
        nomor_telepon: data.nomor_telepon || selectedMitra.nomor_telepon,
      };

      await updateMitra(updatedMitra); // Update mitra via API
      toast({
        title: "Data Mitra Berhasil Diperbarui",
        variant: "success",
      });

      // Refresh data mitra
      await refetch();

      // Close the dialog
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Update gagal', error);
      toast({
        title: "Terjadi Kesalahan",
        description: "Gagal memperbarui data mitra.",
        variant: "destructive",
      });
    }
  };
  

  if (isLoading) {
    return <LoadingScreen/>;
  }
  
  const countries: Country[] = getCountries().map(country => ({
    code: country,
    dialCode: `+${getCountryCallingCode(country)}`,
    name: new Intl.DisplayNames(['id'], { type: 'region' }).of(country) || country
  })).sort((a, b) => a.name.localeCompare(b.name)); 

  return (
    <div className="py-8 lg:p-8 flex-1 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">Manajemen Mitra</h1>

      <div className="bg-white p-6 border rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <div className='flex gap-x-3 items-center'>
          <h2 className="text-lg font-medium">Daftar Mitra</h2>
            <div className="relative">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari Mitra..."
                className="border p-2 placeholder:text-sm rounded-full pl-8"
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
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1); // Reset to first page
                }}
                className="border border-gray-300 rounded px-2 py-1 text-sm mr-6"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>

            <div className="w-full">
              <Button asChild>
                <Link to="/daftarmitra/tambahmitra">Tambah Mitra</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm border-separate border-spacing-0">
            <thead className="bg-slate-200 text-left">
              <tr>
                <th className="p-4 font-medium border-b">No</th>
                <th className="p-4 font-medium border-b">Nama Mitra</th>
                <th className="p-4 font-medium border-b">Nomor Telephone</th>
                <th className="p-4 font-medium border-b">Alamat Mitra</th>
                <th className="p-4 font-medium border-b">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((mitra: Mitra, index: number) => (
                <tr key={mitra.nama} aria-label="button detail mitra" onDoubleClick={() => showDetailMitra(mitra.nama)}  className="hover:bg-gray-50 cursor-pointer">
                  <td  className="p-4 text-sm font-normal border-b">{(index + 1) + ((currentPage-1) * itemsPerPage)}</td>
                  <td  className="p-4 text-sm font-normal border-b">{mitra.nama}</td>
                  <td className="p-4 text-sm font-normal border-b">{mitra.nomor_telepon.slice(0, 3)} {mitra.nomor_telepon.slice(3)}</td>
                  <td className="p-4 text-sm font-normal border-b">{mitra.alamat}</td>
                  <td className="p-4 text-sm font-normal border-b">
                    <div className="flex gap-x-2">
                    <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <button
                              onClick={(e) => handleEditClick(e,mitra)}
                              className="flex justify-center items-center p-1.5 cursor-pointer rounded-full hover:bg-gray-200"
                            >
                              <Edit2 color="blue" size={18} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit Mitra</p>
                          </TooltipContent>
                        </Tooltip>
                     </TooltipProvider>
          
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <button
                              onClick={() => showDetailMitra(mitra.nama)}
                              className="flex justify-center items-center p-1.5 cursor-pointer rounded-full hover:bg-gray-200"
                            >
                              <Eye color="green" size={21} />
                          </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Lihat Detail Mitra</p>
                          </TooltipContent>
                        </Tooltip>
                     </TooltipProvider>
                    </div>
                    
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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
      </div>

      {/* Edit Dialog */}
      {isEditDialogOpen && selectedMitra && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Mitra</DialogTitle>
          </DialogHeader>
          <DialogDescription >
            <div className="space-y-6">
              <Form {...formEditMitra}>
                <form onSubmit={formEditMitra.handleSubmit(handleEditSubmit)} className="space-y-3">

                <FormField 
                  control={formEditMitra.control} 
                  name="nama_mitra" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Mitra</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          defaultValue={selectedMitra?.nama}
                          {...field}
                          disabled
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} 
                />

                <FormField 
                  control={formEditMitra.control} 
                  name="alamat" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alamat Mitra</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          defaultValue={selectedMitra?.alamat}
                          {...field}
                          
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} 
                />

                <FormField
                  control={formEditMitra.control}
                  name="nomor_telepon"
                  render={({ field }) => {
                    // Extract the selectedDialCode and localPhoneNumber from the user data
                    const mitraPhoneNumber = selectedMitra?.nomor_telepon || '';
                    const initialDialCode = countries.find(country => mitraPhoneNumber.startsWith(country.dialCode))?.dialCode || '+62';
                    const initialLocalPhoneNumber = mitraPhoneNumber.replace(initialDialCode, '');

                    // States for phone number management
                    const [localPhoneNumber, setLocalPhoneNumber] = useState(initialLocalPhoneNumber);
                    const [selectedDialCode, setSelectedDialCode] = useState(initialDialCode);
                    const [searchTerm, setSearchTerm] = useState(''); // State for search term
                    const [filteredCountries, setFilteredCountries] = useState(countries); // Filtered countries list

                    useEffect(() => {
                      // Combine dial code and local phone number to set the field value
                      const correctedPhoneNumber = localPhoneNumber.startsWith('0')
                        ? localPhoneNumber.slice(1)
                        : localPhoneNumber;
                      field.onChange(`${selectedDialCode}${correctedPhoneNumber}`);
                    }, [selectedDialCode, localPhoneNumber, field]);

                    // Filter countries based on search term
                    useEffect(() => {
                      setFilteredCountries(
                        countries.filter((country) =>
                          country.name.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                      );
                    }, [searchTerm]);

                    return (
                      <FormItem>
                        <FormLabel>Nomor Telepon User</FormLabel>
                        <FormControl>
                          <div className="flex items-start gap-2">
                            {/* Dropdown for country code */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  className="w-1/9 flex items-center gap-2 border rounded-md px-3 py-2 bg-gray-100 text-black hover:bg-gray-200"
                                  variant="outline"
                                >
                                  {selectedDialCode}
                                  <ChevronDown className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                side="bottom"
                                align="start"
                                className="w-64 max-h-60 overflow-y-auto shadow-lg"
                              >
                                <div className="p-2">
                                  <Input
                                    className="w-full mb-2"
                                    placeholder="Search country..."
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                  />
                                </div>
                                {filteredCountries.length > 0 ? (
                                  filteredCountries.map((country) => (
                                    <DropdownMenuItem
                                      className="flex justify-between text-sm cursor-pointer"
                                      key={country.code}
                                      onClick={() => setSelectedDialCode(country.dialCode)}
                                    >
                                      <span>{country.name}</span>
                                      <span className="text-gray-500">{country.dialCode}</span>
                                    </DropdownMenuItem>
                                  ))
                                ) : (
                                  <div className="text-center text-sm text-gray-500 p-2">
                                    No countries found
                                  </div>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Input field for phone number */}
                            <Input
                              className="flex-1 border rounded-md p-2"
                              value={localPhoneNumber} // Show local phone number only
                              onChange={(e) => setLocalPhoneNumber(e.target.value)}
                              placeholder="Nomor Telepon"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                  <div className="flex gap-x-3">
                    <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                      Batal
                    </Button>
                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </DialogDescription>
        </DialogContent>
      </Dialog>
      )}
    </div>
  );
};

export default DaftarMitra;
