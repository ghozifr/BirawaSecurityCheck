import { useState } from 'react';
import { Button } from '@/components/ui/button';

const Logging = () => {
  const logs = [
    {
      role: 'Admin',
      time: '2024-11-12T14:30',
      action: 'Delete',
      impactTo: 'User 123',
      description: 'Menghapus akun user dengan ID 123'
    },
    {
      role: 'User',
      time: '2024-11-11T10:15',
      action: 'Create',
      impactTo: 'Order #456',
      description: 'Membuat pesanan baru dengan ID 456'
    },
    {
      role: 'Manager',
      time: '2024-11-10T09:00',
      action: 'Edit',
      impactTo: 'Product #789',
      description: 'Mengedit detail produk dengan ID 789'
    },
  ];

  const [selectedDate, setSelectedDate] = useState('');
  const [filteredLogs, setFilteredLogs] = useState(logs);

  const handleFilterLogs = () => {
    const newFilteredLogs = logs.filter(log => {
      if (!selectedDate) return true;
      const logDate = log.time.split('T')[0];
      return logDate === selectedDate;
    });
    setFilteredLogs(newFilteredLogs);
  };

  return (
    <div className='flex flex-col gap-y-7'>
      <div className='p-3'>
        <h1 className="text-2xl font-semibold mb-2">Logging Viewer</h1>
        <div className="flex gap-x-2 mb-4">
          <div className='space-x-2'>
            <label htmlFor="caritanggal" className="text-sm font-medium text-gray-500">Cari Berdasarkan Tanggal</label>
              <input
                type="date"
                id="caritanggal"
                name="caritanggal"
                className="appearance-none border rounded-md w-fit py-2 px-3 text-gray-700 leading-tight"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
          </div>
          <div className='w-fit'>
            <Button onClick={handleFilterLogs} type='button' >Cari</Button>
          </div>
        </div>

        <div className="overflow-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className='bg-gray-200'>
              <tr>
                <th className="py-2 px-4 border-b text-left text-black font-semibold">Role</th>
                <th className="py-2 px-4 border-b text-left text-black font-semibold">Time</th>
                <th className="py-2 px-4 border-b text-left text-black font-semibold">Action</th>
                <th className="py-2 px-4 border-b text-left text-black font-semibold">Impact To Who</th>
                <th className="py-2 px-4 border-b text-left text-black font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log, index) => (
                  <tr key={index} className="hover:bg-gray-100">
                    <td className="py-2 text-sm px-4 border-b text-gray-700">{log.role}</td>
                    <td className="py-2 text-sm px-4 border-b text-gray-700">{new Date(log.time).toLocaleString()}</td>
                    <td className="py-2 text-sm px-4 border-b text-gray-700">{log.action}</td>
                    <td className="py-2 text-sm px-4 border-b text-gray-700">{log.impactTo}</td>
                    <td className="py-2 text-sm px-4 border-b text-gray-700">{log.description}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500">No logs found for the selected date.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Logging;
