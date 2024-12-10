import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { getCountries, getCountryCallingCode } from "libphonenumber-js"
import { ChevronDown } from "lucide-react"
import { useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"
import { Country } from "./MitraSection"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import Accordion from "@/components/custom/atom/Accordion"
import ShadowContainer from "@/components/custom/atom/ShadowContainer"

const AkunSection = () => {
    
    const {control} = useFormContext()
    
    const countries: Country[] = getCountries().map(country => ({
        code: country,
        dialCode: `+${getCountryCallingCode(country)}`,
        name: new Intl.DisplayNames(['id'], { type: 'region' }).of(country) || country
      })).sort((a, b) => a.name.localeCompare(b.name));    
    
  return (
    <Accordion title="Akun Mitra">
      <ShadowContainer buttonNeeded={false} titleNeeded={false}>
            <div className="mb-6">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={control}
                        name='user.nama_lengkap'
                        render={({field}) => (
                        <FormItem>
                            <FormLabel>Nama Lengkap</FormLabel>
                            <FormControl className="relative top-[-4px] mb-7">
                                <Input placeholder="Masukan Nama User" type="text"  {...field}/>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name='user.email'
                        render={({field}) => (
                        <FormItem>
                            <FormLabel>Email User</FormLabel>
                            <FormControl className="relative top-[-4px] mb-7">
                            <Input placeholder="Masukan Email User" type="email"  {...field}/>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name="user.nomor_telepon"
                        render={({ field }) => {
                            const [localPhoneNumber, setLocalPhoneNumber] = useState("");
                            const [selectedDialCode, setSelectedDialCode] = useState("+62"); // Default to Indonesia
                            const [searchTerm, setSearchTerm] = useState(""); // State for search term
                            const [filteredCountries, setFilteredCountries] = useState(countries); // Filtered countries list
                            
                            useEffect(() => {
                                const correctedPhoneNumber = localPhoneNumber.startsWith('0') ? localPhoneNumber.slice(1) : localPhoneNumber
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
                                                <DropdownMenuContent side='bottom' align='start' className="w-64 max-h-60 overflow-y-auto shadow-lg">
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
                                                value={localPhoneNumber}
                                                onChange={(e) => setLocalPhoneNumber(e.target.value)}
                                                placeholder="Nomor Telepon"
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )
                        }}
                    /> 
                </div>
            </div>
        </ShadowContainer>
    </Accordion>
            
  )
}

export default AkunSection