import { useState, useEffect } from 'react';

/**
 * Custom hook untuk mendeteksi apakah perangkat adalah mobile berdasarkan lebar layar
 * @param {number} maxWidth - Lebar maksimum untuk dianggap sebagai mobile, defaultnya adalah 620px
 * @returns {boolean} - true jika perangkat adalah mobile
 */
const useDetection = (maxWidth = 620) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= maxWidth);
    };

    handleResize(); // Panggilan pertama saat komponen dimuat

    window.addEventListener('resize', handleResize); // Update ukuran layar saat diubah
    return () => window.removeEventListener('resize', handleResize); // Bersihkan effect
  }, [maxWidth]);

  return isMobile;
};

export default useDetection;
