import { NavLink } from "react-router-dom"
import LogoTelkom from "../assets/logotelkom.png"
import { RxDashboard } from "react-icons/rx"
import { TbReportMedical, TbReportSearch } from "react-icons/tb"
import { HiOutlineInbox } from "react-icons/hi"
import { FiLogOut } from "react-icons/fi"
import { RiMenuUnfold4Line, RiMenuUnfold3Line } from "react-icons/ri"
import { PiUsersThreeBold } from "react-icons/pi"
import { IoSettingsOutline } from "react-icons/io5"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { formatMitraInitials, getAccessToken } from "@/lib/utils"
import { CustomJwtPayload } from "@/types"
import { jwtDecode } from "jwt-decode"
import { useSignOutUser } from "@/api/AuthApi"
import { useGetUser } from "@/api/UserApi"

type SidebarProps = {
  isOpen: boolean
  onToggle: () => void
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const {user} = useGetUser();
  
  const { signOutUser, isLoading: isLogoutLoading } = useSignOutUser()
  
  const accessToken = getAccessToken()
  let metaData: CustomJwtPayload = { user_id: '', permissions: [] }
  let isAdmin = false
  if (typeof accessToken === 'string' && accessToken.trim() !== '') {
    try {
      metaData = jwtDecode<CustomJwtPayload>(accessToken)
      // console.log('Decoded Token:', metaData) //Debug.
      isAdmin = !!!metaData.nama_mitra
    } catch (error) {
      console.error('Error decoding token:', error) //Debug.
    }
  } else {
    console.error('Token is undefined or invalid') //Debug.
  }
  
  const allMenuItems = [
    { label: "Dashboard", icon: <RxDashboard className="min-w-[24px] min-h-[24px]" />, path: "/dashboard" },
    { label: "Manajemen Mitra", icon: <PiUsersThreeBold className="min-w-[24px] min-h-[24px]" />, path: "/daftarmitra" },
    { label: "Buat Laporan", icon: <TbReportMedical className="min-w-[24px] min-h-[24px]" />, path: "/daftarpekerjaan"  },
    { label: "Cetak Laporan", icon: <TbReportSearch className="min-w-[24px] min-h-[24px]" />, path: "/ceklaporan" },
    { label: "Kotak Masuk", icon: <HiOutlineInbox className="min-w-[24px] min-h-[24px]" />, path: "/inbox" }
  ]
  
  const menuItems = allMenuItems.filter((item) => {
    if (isAdmin) {
      // Admin can access all except "Buat Laporan"
      return item.path !== "/daftarpekerjaan"
    } else {
      // Mitra can access all except "Manajemen Mitra"
      return item.path !== "/daftarmitra"
    }
  })
  
  async function handleLogOut() {
    try {
      await signOutUser()
    } catch (error) {
      console.error("Failed to log out:", error) //Debug.
    }
  }
  
  return (
    <div 
      className={`h-screen fixed border-r z-50 ${
        isOpen ? 'w-[300px]' : 'w-[80px]'
      } py-8 left-0 bg-white flex flex-col justify-between transition-all duration-300`}
    >
        {/* Toggle Button */}
      <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
            <button 
              onClick={onToggle} // Menggunakan onToggle dari props
              aria-label="button Toggle sidebar"
              className={`w-10 h-10 bg-white flex items-center justify-center transition duration-300 ease-in-out backdrop-blur-md rounded-md  ${isOpen ? "absolute top-12 -right-5 border border-r hover:bg-slate-50 " : "absolute top-5 right-[17px]"}`}
            >
              {isOpen ? 
                <RiMenuUnfold4Line className="w-6 h-6" /> : 
                <RiMenuUnfold3Line className="w-6 h-6" />
              }
            </button> 
        </TooltipTrigger>
        <TooltipContent>
         {isOpen ?  <p>Tutup Menu</p> :  <p>Buka Menu </p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
    
      {/* Logo dan Menu Atas */}
      <div className="flex-grow flex flex-col">
        {/* Logo */}
        <div className={`pr-6 mb-8 transition-all duration-300 ${!isOpen ? 'scale-0 h-0' : 'scale-100 h-auto'}`}>
          <div className="text-2xl flex items-center justify-center">
            <img src={LogoTelkom} alt="Logo Telkom Property" />
          </div>
        </div>

        {/* Navigation menu */}
        <nav className="flex-grow px-4">
          <ul className={`flex flex-col gap-3 ${!isOpen && "mt-2"}`}>
            {menuItems.map((item, index) => (
              <li key={index}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center ${isOpen ? 'gap-4' : 'justify-center'} rounded-md p-3 font-medium cursor-pointer  ${
                      isActive ? 'bg-primary text-white' : 'text-primary bg-transparent hover:bg-opacitynav/85'
                    }`
                  }
                >
                  <span className="flex items-center justify-center">
                    {item.icon}
                  </span>
                  <span className={`transition-all duration-300 whitespace-nowrap ${!isOpen ? 'hidden' : 'block'}`}>
                    {item.label}
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Bottom Items */}
      <div className="px-4">
        <ul className="flex flex-col gap-2 border-t pt-4">
          <NavLink
            to={"/settings/profile"}
            className={({ isActive }) =>
              `flex items-center ${isOpen ? 'gap-4' : 'justify-center'} rounded-md p-3 font-medium cursor-pointer hover:bg-slate-200/60 ${
                isActive ? 'bg-' : 'text-gray-800 bg-transparent'
              }`
            }
          >
            <span className="flex items-center justify-center">
              <IoSettingsOutline className="min-w-[24px] min-h-[24px]" />
            </span>
            <span className={`transition-all duration-300 whitespace-nowrap ${!isOpen ? 'hidden' : 'block'}`}>
              Settings
            </span>
          </NavLink>
          <button
            className={`flex items-center ${isOpen ? 'gap-4' : 'justify-center'} rounded-md p-3 font-medium cursor-pointer hover:bg-slate-200/60 text-gray-800 bg-transparent`}
            disabled={isLogoutLoading}
            onClick={handleLogOut}
          >
            <span className="flex items-center justify-center">
              <FiLogOut className="min-w-[24px] min-h-[24px]" />
            </span>
            <span className={`transition-all duration-300 whitespace-nowrap ${!isOpen ? 'hidden' : 'block'}`}>
              Logout
            </span>
          </button>
        </ul>
        <div className={`flex items-center ${isOpen ? 'gap-3' : 'justify-center'} mt-4 p-3`}>
          
          <div className="min-w-[40px] h-10 rounded-full bg-slate-400/40 flex items-center justify-center text-xs font-semibold">
          {isAdmin ? "ADM" : formatMitraInitials(user?.user?.nama_lengkap || "???")} 
          </div>
          <div className={`transition-all duration-300 ${!isOpen ? 'hidden' : 'block'}`}>
            <p className={`font-semibold text-base truncate max-w-[200px] ease-linear  ${isOpen ? "visible duration-400 translate-x-0" : "invisible -translate-x-20"}`}>{user?.user?.nama_lengkap || "User"}</p>
            <p className="font-normal text-xs text-gray-500">{metaData.nama_mitra || "Admin CPM"}</p>
          </div>

        </div>
      </div>
    </div>
  )
}
