import { useEffect, useRef, useState } from 'react';
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { FaCalendarAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { PDFViewer } from '@react-pdf/renderer';
import ReportTemplate from './ReportTemplate';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useGetMitraKontraks, useGetMitras } from '@/api/MitraApi';
import { useGetKontrakPekerjaans } from '@/api/KontrakApi';
import { useGetLaporan, useGetPekerjaanLaporans } from '@/api/LaporanApi';
import ComboboxComponent from '@/components/Combobox';
import { CustomJwtPayload, Kontrak, Laporan, Mitra, Pekerjaan } from '@/types';
import { useGetUser } from '@/api/UserApi';
import { getAccessToken } from '@/lib/utils';
import { jwtDecode } from 'jwt-decode';
import LoadingScreen from '@/components/LoadingScreen';

// Options dropdown
// const options = ['Perusahaan A', 'Perusahaan B', 'Perusahaan C', 'Perusahaan D'];

const CekLaporan = () => {
  
  const accessToken = getAccessToken()
  let metaData: CustomJwtPayload = { user_id: '', permissions: [] };

  if (typeof accessToken === 'string' && accessToken.trim() !== '') {
    try {
      metaData = jwtDecode<CustomJwtPayload>(accessToken)
      // console.log('Decoded Token:', metaData) //Debug.
    } catch (error) {
      console.error('Error decoding token:', error) //Debug.
    }
  } else {
    console.error('Token is undefined or invalid') //Debug.
  }
  
  const isAdmin = metaData.nama_mitra ? false : true
  
  const [selectedMitra, setSelectedMitra] = useState<string>('')
  const [selectedKontrak, setSelectedKontrak] = useState<string>('')
  const [selectedPekerjaan, setSelectedPekerjaan] = useState<string>('')
  const [selectedLaporan, setSelectedLaporan] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [laporanDates, setLaporanDates] = useState<Date[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showPDF, setShowPDF] = useState(false)
  const [fetchReport, setFetchReport] = useState(false)
  const [dateToLaporanIdMap, setDateToLaporanIdMap] = useState<{ [key: string]: string }>({});

  const {allMitra, isLoading: isMitraLoading} = useGetMitras({enabled: isAdmin})
  const mitra_options = allMitra?.mitras?.map((mitra: Mitra) => ({value: mitra.nama, label: mitra.nama}))
  
  const {mitraKontraks, isLoading: isMitraKontraksLoading} = useGetMitraKontraks(isAdmin ? selectedMitra : metaData.nama_mitra, {enabled: isAdmin ? !!selectedMitra : true})
  const mitra_kontraks_options = mitraKontraks?.mitra_kontraks?.map((kontrak: Kontrak) => ({value: kontrak.nomor, label: kontrak.nomor}))
  
  const {kontrakPekerjaans, isLoading: isKontrakPekerjaansLoading} = useGetKontrakPekerjaans({
    nama_mitra: isAdmin ? selectedMitra : metaData.nama_mitra, 
    nomor_kontrak: selectedKontrak
  }, {enabled: isAdmin ? !!selectedMitra && !!selectedKontrak : !!selectedKontrak})
  const kontrak_pekerjaans_options = kontrakPekerjaans?.kontrak_pekerjaans?.map((pekerjaan: Pekerjaan) => ({value: pekerjaan.nama, label: pekerjaan.nama}))
  
  const {pekerjaanLaporans} = useGetPekerjaanLaporans({
    nama_mitra: isAdmin ? selectedMitra : metaData.nama_mitra, 
    nomor_kontrak: selectedKontrak, 
    nama_pekerjaan: selectedPekerjaan
  }, {enabled: isAdmin ? !!selectedMitra && !!selectedKontrak && !!selectedPekerjaan : !!selectedKontrak && !!selectedPekerjaan})
  const pekerjaan_laporans_arr = pekerjaanLaporans?.pekerjaan_laporans
  
  const {laporan, isLoading: isLaporanLoading} = useGetLaporan(selectedLaporan, {enabled: !!selectedLaporan})

  const dateRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  
  // Generate all dates in the current month
  const getDaysInMonth = (month: Date) => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    return eachDayOfInterval({ start, end });
  };
  
  const getLatestLaporanInMonth = (month: Date, laporanDates: Date[]) => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const datesInMonth = laporanDates.filter(
      (date) => date >= start && date <= end // Filter laporan within the month
    );
    return datesInMonth.sort((a, b) => b.getTime() - a.getTime())[0] || null; // Return latest date in month
  };
  
  useEffect(() => {
    setSelectedKontrak('')
    setSelectedPekerjaan('')
    setLaporanDates([])
  }, [selectedMitra])
  
  useEffect(() => {
    setSelectedPekerjaan('');
    setLaporanDates([])
  }, [selectedKontrak])
  
  useEffect(() => {
    setLaporanDates([])
  }, [selectedPekerjaan])
  
  useEffect(() => {
    if (showPDF) {
      setShowPDF(false)
    }
  }, [selectedDate])
  
  useEffect(() => {
    if (laporanDates.length > 0) {
      const latestLaporanDate = laporanDates.sort((a, b) => b.getTime() - a.getTime())[0]
      setSelectedDate(latestLaporanDate)
      setCurrentMonth(latestLaporanDate)
      // Scroll to the latest laporan
      const dateKey = format(latestLaporanDate, 'yyyy-MM-dd');
      setTimeout(() => {
        dateRefs.current[dateKey]?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
      }, 200); // Delay to ensure the UI is rendered
    }
  }, [laporanDates])
  
  useEffect(() => {
    if (pekerjaanLaporans) {
      const map = pekerjaan_laporans_arr.reduce((acc: { [key: string]: string }, laporan: Laporan) => {
        const dateKey = format(new Date(laporan.tanggal), 'yyyy-MM-dd');
        acc[dateKey] = laporan.id; // Assuming laporan has an `id` field
        return acc;
      }, {});
      setDateToLaporanIdMap(map);
      const laporanDates = Object.keys(map).map((key) => new Date(key));
      setLaporanDates(laporanDates);
    } else {
      setDateToLaporanIdMap({})
    }
  }, [pekerjaanLaporans]);
  

  const daysInMonth = getDaysInMonth(currentMonth);

  const handleShowPDF = () => {
    const selectedDateKey = format(selectedDate || new Date(), 'yyyy-MM-dd');
    const laporanId = dateToLaporanIdMap[selectedDateKey];

        if (laporanId) {
          setSelectedLaporan(laporanId); // This will trigger the useGetLaporan API call
          setFetchReport(!fetchReport);
          setShowPDF(!showPDF);
        } else {
          alert('No laporan available for the selected date.');
        }
    }

  // Navigation for previous and next month
  const prevMonth = () => {
    const newMonth = addMonths(currentMonth, -1);
    setCurrentMonth(newMonth);
  
    // Find the latest laporan in the new month
    const latestLaporanInNewMonth = getLatestLaporanInMonth(newMonth, laporanDates);
  
    if (latestLaporanInNewMonth) {
      setSelectedDate(latestLaporanInNewMonth);
      const dateKey = format(latestLaporanInNewMonth, 'yyyy-MM-dd');
      setTimeout(() => {
        dateRefs.current[dateKey]?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      }, 200); // Delay for rendering
    }
  };
  
  const nextMonth = () => {
    const newMonth = addMonths(currentMonth, 1);
    setCurrentMonth(newMonth);
  
    // Find the latest laporan in the new month
    const latestLaporanInNewMonth = getLatestLaporanInMonth(newMonth, laporanDates);
  
    if (latestLaporanInNewMonth) {
      setSelectedDate(latestLaporanInNewMonth);
      const dateKey = format(latestLaporanInNewMonth, 'yyyy-MM-dd');
      setTimeout(() => {
        dateRefs.current[dateKey]?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      }, 200); // Delay for rendering
    }
  };
  
  const {user, isLoading: isUserLoading} = useGetUser()
  
  useEffect(() => {
    console.log('Fetched user:', user)
  }, [user])
  
  const pencetak_laporan = user?.user?.nama_lengkap || ''

  return (
    <div className="flex flex-col">
      <h1 className="text-2xl font-semibold text-black mb-6">Cek Laporan</h1>
      
      {isUserLoading ? <LoadingScreen/> : (
          <>
            <div className="bg-white p-4 mb-6 border rounded-md overflow-auto">
              <div className="flex overflow-x-auto items-center justify-between">
                {/* Pop-up Calendar */}
                <div className="flex items-center text-red-600 font-semibold mb-2">
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date: Date | null) => setSelectedDate(date)}
                    dateFormat="dd/MM/yyyy"
                    popperPlacement="bottom-start"
                    popperClassName="react-datepicker-popper"
                    customInput={
                      <button className="flex items-center space-x-2 text-red-600 font-semibold">
                        <FaCalendarAlt className="mr-2" />
                        <span>{format(currentMonth, 'MMMM yyyy')}</span>
                      </button>
                    }
                  />
                </div>
                {/* Navigation Buttons */}
                <div className="flex space-x-2">
                  <TooltipProvider>
                    {/* Button for Previous Month */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button onClick={prevMonth} className="px-2 py-2 text-xl text-red-600 hover:text-red-700">
                          <FaChevronLeft className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Bulan Sebelumnya</p>
                      </TooltipContent>
                    </Tooltip>
    
                    {/* Button for Next Month */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button onClick={nextMonth} className="px-2 py-2 text-xl text-red-600 hover:text-red-700">
                          <FaChevronRight className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Bulan Selanjutnya</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
    
              {/* Horizontal Date Navigation */}
              <div className="flex w-full overflow-x-auto gap-x-4 pt-4 custom-scrollbar pb-4">
                {daysInMonth.map((day) => {
                  const isSelected = format(day, 'yyyy-MM-dd') === format(selectedDate || new Date(), 'yyyy-MM-dd');
                  const hasLaporan = laporanDates.some((laporanDate) => isSameDay(day, laporanDate));
                  const dateKey = format(day, 'yyyy-MM-dd');
    
                  return (
                    <div
                      key={dateKey}
                      ref={(el) => (dateRefs.current[dateKey] = el)} // Attach ref to each date
                      onClick={() => setSelectedDate(day)}
                      className={`p-2 rounded-lg cursor-pointer text-center duration-200 ease-in-out mb-2 ${
                        isSelected
                          ? 'bg-red-200 text-red-600 font-semibold -translate-y-1'
                          : hasLaporan
                          ? 'bg-green-200 text-green-600 font-semibold'
                          : 'text-gray-500 hover:bg-gray-200 font-medium'
                      }`}
                      style={{ minWidth: '45px' }}
                    >
                      <div>{format(day, 'd')}</div>
                      <div
                        className={`text-xs ${
                          isSelected
                            ? 'text-red-600 font-semibold'
                            : hasLaporan
                            ? 'text-green-600 font-semibold'
                            : 'text-gray-500 font-medium'
                        }`}
                      >
                        {format(day, 'EEE').slice(0, 3)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
    
            {/* Form dengan Dropdown */}
            <div className="bg-white p-6 rounded-md border">
              <div className={`grid gap-4 mb-4 ${isAdmin ? 'grid-cols-3' : 'grid-cols-2'}`}>
                {isAdmin && (
                  <ComboboxComponent
                    label="Pilih Mitra"
                    placeholder="Nama perusahaan"
                    options={mitra_options || []}
                    selected={selectedMitra}
                    setSelected={setSelectedMitra}
                    isLoading={isMitraLoading}
                  />
                )}
                <ComboboxComponent
                  label="Pilih Kontrak"
                  placeholder="Nama kontrak"
                  options={mitra_kontraks_options || []}
                  selected={selectedKontrak}
                  setSelected={setSelectedKontrak}
                  isLoading={isMitraKontraksLoading}
                />
                <ComboboxComponent
                  label="Pilih Pekerjaan"
                  placeholder="Nama pekerjaan"
                  options={kontrak_pekerjaans_options || []}
                  selected={selectedPekerjaan}
                  setSelected={setSelectedPekerjaan}
                  isLoading={isKontrakPekerjaansLoading}
                />
              </div>
    
              <div className="text-right">
                <button
                  onClick={handleShowPDF}
                  className={`py-2 px-6 rounded-md font-semibold transition ${
                    !selectedPekerjaan || !dateToLaporanIdMap[format(selectedDate || new Date(), 'yyyy-MM-dd')]
                      ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                  disabled={
                    !selectedPekerjaan || // Ensure a pekerjaan is selected
                    !dateToLaporanIdMap[format(selectedDate || new Date(), 'yyyy-MM-dd')] // Ensure a laporan exists for the selected date
                  }
                >
                  {!selectedPekerjaan || !dateToLaporanIdMap[format(selectedDate || new Date(), 'yyyy-MM-dd')]
                    ? 'Silahkan Pilih Laporan'
                    : showPDF
                    ? 'Tutup Laporan'
                    : 'Tampilkan Laporan'}
                </button>
              </div>
            </div>
    
            {/* PDF Viewer */}
            {showPDF && !isLaporanLoading  && (
              <div className="pdf-viewer mt-6">
                <PDFViewer width="100%" height="900">
                  <ReportTemplate pencetak_laporan={pencetak_laporan} pembuat_laporan={laporan.pembuat_laporan} nama_mitra={isAdmin ? selectedMitra : metaData.nama_mitra!} nomor_kontrak={selectedKontrak} nama_pekerjaan={selectedPekerjaan} tanggal={selectedDate?.toString() ?? 'unknown '} laporan={laporan.laporan} cuaca={laporan.cuaca}/>
                </PDFViewer>
              </div>
            )}
          </>
        )
      }
    </div>
  );
};

export default CekLaporan;