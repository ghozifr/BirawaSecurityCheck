import { useCreateMitra } from '@/api/MitraApi'
import TambahMitraForm from '@/forms/tambah-mitra-form/TambahMitraForm'
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

export default function TambahMitraPage() {
  const {toast} = useToast()
  
  const {createMitra, isLoading, isSuccess, error} = useCreateMitra()
  
  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Successfully added mitra!",
        variant: 'success'
      })
      window.location.href = '/daftarmitra'
    }
  }, [isSuccess])
  
  useEffect(() => {
    if (error) {
      toast({
        title: error.toString(),
        variant: 'danger'
      })
    }
  }, [error])

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Tambah Mitra</h1>
      <TambahMitraForm
        onSubmit={createMitra}
        isLoading={isLoading}
      />
    </div>
  );
}