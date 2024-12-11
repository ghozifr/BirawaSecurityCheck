import { useState } from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFormContext } from 'react-hook-form';

interface DialogCustomProps {
  type: 'shift' | 'role' | 'weather' | 'activity';
  onSubmit: (data: any) => void;
  onWeatherChange?: (data: {
    time: string;
    startTime: string;
    endTime: string;
    weatherType: string;
  }) => void;
}

export default function DialogCustom({ type, onSubmit }: DialogCustomProps) {
  const [selectedShift, setSelectedShift] = useState("Shift 1");
  const [selectedWeather, setSelectedWeather] = useState<string>('');
  const { control,getValues } = useFormContext();

  // Fungsi untuk menangani pengiriman data berdasarkan tipe
  const handleSubmit = () => {
    if (type === "shift") {
      const shiftData = {
        nama: selectedShift,
        waktu_mulai: getValues("shift.start"),
        waktu_berakhir: getValues("shift.end"),
      };
      onSubmit(shiftData);
    } else if (type === "role") {
      const roleData = {
        nama: getValues("role.name"), // Data ini bisa berasal dari form
      };
      onSubmit(roleData);
    } else if (type === "weather") {
      const weatherData = {
        jenis: selectedWeather,
        waktu_mulai: getValues("weather.startTime"),
        waktu_berakhir: getValues("weather.endTime"),
      };
      onSubmit(weatherData);
    } else if (type === "activity") {
      const activityData = {
        kategori: getValues("activity.category"), // Data ini bisa berasal dari form
        deskripsi:  getValues("activity.description"),
      };
      onSubmit(activityData);
    }
  };


  const renderShiftContent = () => (
    <div className="flex flex-col gap-4">
      <div>
        <p className="block text-sm font-semibold mb-2">Shift</p>
        <div className="flex space-x-4 mb-4">
          <Button 
            variant={selectedShift === 'Shift 1' ? 'default' : 'outline'}
            onClick={() => setSelectedShift('Shift 1')}
          >
            Shift 1
          </Button>
          <Button 
            variant={selectedShift === 'Shift 2' ? 'default' : 'outline'}
            onClick={() => setSelectedShift('Shift 2')}
          >
            Shift 2
          </Button>
        </div>
      </div>
      
      <div>
        <p className="block text-sm font-semibold mb-2">Pukul</p>
        <div className="flex space-x-4 w-full">
          <FormField
            control={control}
            name='shift.start'
            render={({field}) => (
              <FormItem className="w-full">
                <FormLabel>Mulai</FormLabel>
                <FormControl>
                  <Input {...field} type="time"/>
                </FormControl>
                <FormMessage/>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name='shift.end'
            render={({field}) => (
              <FormItem className="w-full">
                <FormLabel>Berakhir</FormLabel>
                <FormControl>
                  <Input {...field} type="time"/>
                </FormControl>
                <FormMessage/>
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );

  const renderRoleContent = () => (
    <div>
      <FormField
        control={control}
        name='role.name'
        render={({field}) => (
          <FormItem>
            <FormLabel>Nama Pekerjaan</FormLabel>
            <FormControl>
              <Input placeholder="Masukkan nama Pekerjaan" {...field} />
            </FormControl>
            <FormMessage/>
          </FormItem>
        )}
      />
    </div>
  );

  const renderWeatherContent = () => (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <p className="block text-sm font-semibold mb-2">Pilih Cuaca</p>
        <div className="flex space-x-4">
          <Button 
            variant={selectedWeather === 'Gerimis' ? 'default' : 'outline'}
            onClick={() => setSelectedWeather('Gerimis')}
          >
            Gerimis
          </Button>
          <Button 
            variant={selectedWeather === 'Hujan' ? 'default' : 'outline'}
            onClick={() => setSelectedWeather('Hujan')}
          >
            Hujan
          </Button>
        </div>
      </div>

      <div>
        <p className="block text-sm font-semibold mb-2">Pilih Waktu</p>
        <div className="flex space-x-4">
          <FormField
            control={control}
            name='weather.startTime'
            render={({field}) => (
              <FormItem>
                <FormLabel>Mulai</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage/>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name='weather.endTime'
            render={({field}) => (
              <FormItem>
                <FormLabel>Berakhir</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage/>
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );

  const renderActivityContent = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name='activity.category'
          render={({field}) => (
            <FormItem>
              <FormLabel>Kategori Pekerjaan</FormLabel>
              <FormControl>
                <select {...field} className="border p-2 rounded w-full">
                  <option>Pilih Kategori Pekerjaan</option>
                </select>
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name='activity.description'
          render={({field}) => (
            <FormItem>
              <FormLabel>Deskripsi Pekerjaan</FormLabel>
              <FormControl>
                <Input placeholder="Masukan Detail Pekerjaan" {...field} />
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}
        />
      </div>
      <div className="flex space-x-4">
        <FormField
          control={control}
          name='activity.beforePhoto'
          render={({field}) => (
            <FormItem className="w-1/2">
              <FormLabel>Foto Sebelum</FormLabel>
              <FormControl>
                <Input type="file" {...field} />
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name='activity.afterPhoto'
          render={({field}) => (
            <FormItem className="w-1/2">
              <FormLabel>Foto Sesudah</FormLabel>
              <FormControl>
                <Input type="file" {...field} />
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}
        />
      </div>
    </div>
  );

  return (
    <div>
      {type === 'shift' && renderShiftContent()}
      {type === 'role' && renderRoleContent()}
      {type === 'weather' && renderWeatherContent()}
      {type === 'activity' && renderActivityContent()}
      
      <Button 
        onClick={handleSubmit} 
        className="w-full mt-6 bg-Merah2 text-white font-semibold py-2 rounded"
      >
        Simpan
      </Button>
    </div>
  );
}
