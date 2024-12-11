import {useState,useEffect} from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getCountries, getCountryCallingCode } from "libphonenumber-js"
import { Country } from '@/types'
import { ChevronDown } from "lucide-react"
import { User } from '@/types';
import LoadingButton from '@/components/LoadingButton';


const formEditUserSchema = z.object({
  nama_lengkap: z.string().min(1, "Nama pengguna wajib diisi").max(40, "Nama pengguna terlalu panjang").optional(),
  email: z.string().email("Format email tidak valid").min(1, "Email pengguna wajib diisi").optional(),
  nomor_telepon: z.string().min(4,"Nomor Telephone terlalu sedikit").max(16, "Nomor Telephone melebih batas"),
  // is_active: z.boolean(),
});

export type EditUserSchema = z.infer<typeof formEditUserSchema>;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EditUserSchema) => void;
  user: User | null;  // Accept user data as prop
  isLoading: boolean
}

const EditUserDialog = ({ isOpen, onClose, onSubmit, user, isLoading }: Props) => {
  // Initialize the form with user data, always call useForm
  const form = useForm<EditUserSchema>({
    resolver: zodResolver(formEditUserSchema),
  });

  const countries: Country[] = getCountries().map(country => ({
    code: country,
    dialCode: `+${getCountryCallingCode(country)}`,
    name: new Intl.DisplayNames(['id'], { type: 'region' }).of(country) || country
  })).sort((a, b) => a.name.localeCompare(b.name));    


  // Render the dialog if user data is available, otherwise show a fallback message
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Pengguna</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          {user ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                <FormField 
                  control={form.control} 
                  name="nama_lengkap" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Pengguna</FormLabel>
                      <FormControl>
                        <Input 
                        {...field} 
                        placeholder="Masukkan Nama Pengguna"
                        defaultValue={user.nama_lengkap}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} 
                />
                
                <FormField 
                  control={form.control} 
                  name="email" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Pengguna</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="email" 
                          placeholder="Masukkan Email Pengguna" 
                          defaultValue={user.email}
                          disabled={true}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} 
                />

                {/* <FormField control={form.control} name="is_active" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status Pengguna</FormLabel>
                    <FormControl>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            className="w-full text-left flex  justify-start gap-2 border rounded-md px-3 py-2 bg-gray-100 text-black hover:bg-gray-200"
                            variant="outline"
                          >
                            {user?.is_active === 1 ? 'Aktif' : 'Tidak Aktif'}
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="bottom" align="start" className="w-64">
                          <DropdownMenuItem
                            onClick={() => field.onChange('Aktif')}
                            className="text-sm cursor-pointer"
                          >
                            Aktif
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => field.onChange('Tidak Aktif')}
                            className="text-sm cursor-pointer"
                          >
                            Tidak Aktif
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} /> */}

                
                <FormField
                  control={form.control}
                  name="nomor_telepon"
                  render={({ field }) => {
                    // Extract the selectedDialCode and localPhoneNumber from the user data
                    const userPhoneNumber = user?.nomor_telepon || '';
                    const initialDialCode = countries.find(country => userPhoneNumber.startsWith(country.dialCode))?.dialCode || '+62';
                    const initialLocalPhoneNumber = userPhoneNumber.replace(initialDialCode, '');

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


                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Batal
                  </Button>
                  {isLoading ? (
                    <LoadingButton/>
                  ) : (
                    <Button type="submit" className="bg-red-500 text-white">
                      Simpan
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          ) : (
            <p>Data pengguna tidak tersedia.</p> // Fallback if no user data is available
          )}
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
