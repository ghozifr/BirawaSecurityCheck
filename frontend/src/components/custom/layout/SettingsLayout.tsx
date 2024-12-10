import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { RiArrowLeftSLine } from "react-icons/ri";

interface SettingsProp {
    children: React.ReactNode;
}

const SettingsLayout: React.FC<SettingsProp> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md pt-8">
        <div className="py-4 lg:px-8 px-6 ">
          {/* Tombol Kembali */}
          <button
            onClick={() => navigate("/dashboard")}
            className="mb-4 ml-4 flex items-center  gap-x-2 text-gray-700 hover:text-primary font-semibold rounded-lg"
          >
           <RiArrowLeftSLine size={18}/> <span>Kembali</span>
          </button>

          <div className='mt-14 ml-6'>
            <h2 className="text-2xl font-semibold mb-6">Pengaturan</h2>
            <nav>
              <ul className="space-y-4">
                <li>
                  <Link
                    to="/settings/profile"
                    className={`w-full block text-left rounded-md py-2 px-4 font-medium ${
                      location.pathname === '/settings/profile' ? 'bg-primary text-white' : 'text-primary hover:bg-opacitynav'
                    }`}
                  >
                    Profil
                  </Link>
                </li>
                <li>
                  <Link
                    to="/settings/logging"
                    className={`w-full block text-left rounded-md py-2 px-4 font-medium ${
                      location.pathname === '/settings/logging' ? 'bg-primary text-white' : 'text-primary hover:bg-opacitynav'
                    }`}
                  >
                    Logging
                  </Link>
                </li>
                <li>
                  <Link
                    to="/settings/resetpassword"
                    className={`w-full block text-left rounded-md py-2 px-4 font-medium ${
                      location.pathname === '/settings/resetpassword' ? 'bg-primary text-white' : 'text-primary hover:bg-opacitynav'
                    }`}
                  >
                    Ganti Sandi
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow lg:px-12 px-6 bg-white pt-8 ">
        {children}
      </main>
    </div>
  );
};

export default SettingsLayout;
