import { getAccessToken } from '@/lib/utils';
import { CustomJwtPayload } from '@/types';
import { Document, Page, Text, View, StyleSheet, Image, Link } from '@react-pdf/renderer';
import { Font } from '@react-pdf/renderer'
import {jwtDecode} from 'jwt-decode'

Font.register({
  family: 'Century',
  src: '/fonts/Century.otf',
})

Font.register({
  family: 'Century',
  src: '/fonts/Century-Bold.ttf',
  fontWeight: 'bold',
});

// Register a font that supports the checkmark
Font.register({
  family: 'Arial',
  src: '/fonts/Arial.ttf',
});

// Use the font in your styles
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 10,
    fontFamily: 'Century'
  },
  text: {
    fontFamily: 'Century'
  },
  checkmark: {
    fontSize: 14,
    fontFamily: 'Arial',// Fallback for the checkmark
  },
  header: {
    border: '1px solid black',
    marginBottom: 10,
    flexDirection: 'row',
  },
  leftSection: {
    width: '30%',
    padding: 5,
    borderRight: '1px solid black',
  },
  middleSection: {
    width: '40%',
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderRight: '1px solid black',
  },
  rightSection: {
    width: '30%',
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateRow: {
    flexDirection: 'row',
    border: '1px solid black',
  },
  dateCell: {
    padding: 5,
    flex: 1,
  },

  // Workforce Table Styles
  workforceTable: {
    marginTop: 10,
    border: '1px solid black',
  },
  shiftRow: {
    flexDirection: 'row',
    borderBottom: '1px solid black',
  },
  shiftCell: {
    flex: 1,
    padding: 5,
    borderRight: '1px solid black',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  workforceHeaderRow: {
    flexDirection: 'row',
    borderBottom: '1px solid black',
  },
  workforceHeaderCell: {
    flex: 3,
    padding: 5,
    borderRight: '1px solid black',
    fontWeight: 'bold',
  },
  workforceCountCell: {
    flex: 1,
    padding: 5,
    borderRight: '1px solid black',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  workforceRow: {
    flexDirection: 'row',
    minHeight: 20,
    borderBottom: '1px solid black', // Consistent row border
  },
  workforceCell: {
    flex: 3,
    padding: 5,
    borderRight: '1px solid black',
  },
  workforceNumberCell: {
    flex: 1,
    padding: 5,
    borderRight: '1px solid black',
    textAlign: 'center',
  },
  categoryCell: {
    flex: 3,
    padding: 5,
    borderRight: '1px solid black',
    fontWeight: 'bold',
    justifyContent: 'center', // Align vertically
  },
  categoryNumberCell: {
    flex: 1,
    padding: 5,
    borderRight: '1px solid black',
    textAlign: 'center',
    justifyContent: 'center', // Align vertically
  },
  subtotalRow: {
    flexDirection: 'row',
    borderTop: '1px solid black',
  },
  totalRow: {
    flexDirection: 'row',
    borderTop: '1px solid black',
  },

  // Activities Table Styles
  activitiesTable: {
    marginTop: 20,
    border: '1px solid black',
  },
  activityHeaderRow: {
    flexDirection: 'row',
    borderBottom: '1px solid black',
    backgroundColor: '#f0f0f0',
  },
  activityRow: {
    flexDirection: 'row',
    borderBottom: '1px solid black',
    minHeight: 25,
  },
  numberCell: {
    width: '10%',
    padding: 5,
    borderRight: '1px solid black',
    textAlign: 'center',
  },
  activityCell: {
    flex: 1,
    padding: 5,
    borderRight: '1px solid black',
  },
  boldText: {
    fontWeight: 'bold',
  },
  indentedCell: {
    flex: 3,
    paddingLeft: 10,
    justifyContent: 'center', // Vertically align text
    alignItems: 'flex-start', // Align text to the left
    borderRight: '1px solid black',
  },

  // Table Wrapper
  table: {
    marginTop: 10,
    border: '1px solid black',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid black',
    minHeight: 20,
  },
  tableCell: {
    flex: 1,
    padding: 5,
    borderRight: '1px solid black',
    textAlign: 'center',
  },
  tableCellNoBorder: {
    padding: 5,
    flex: 1,
    textAlign: 'center',
  },
  workItemCell: {
    padding: 5,
    flex: 2,
    borderRight: '1px solid black',
  },
  weatherTable: {
    marginTop: 20,
    border: '1px solid black',
  },
  materialSection: {
    marginTop: 20,
    border: '1px solid black',
    break: 'before',
  },
  issuesSection: {
    marginTop: 30,
    border: '1px solid black',
  },
  footer: {
    width: '100%',
    marginTop: 20,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  footerRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: '60px'
  },
  footerCell: {
    padding: '12px',
    alignItems: 'center'
  },

  // Image Styles
  imagePage: {
    padding: 20,
    fontSize: 10,
  },
  imageRow: {
    flexDirection: 'row', // Images will be displayed in a row
    flexWrap: 'wrap', // Allows wrapping to the next line if there are too many images
    justifyContent: 'flex-start', // Align images to the left
    marginBottom: 10, // Add spacing between rows
  },
  imageCell: {
    width: '45%', // Adjust width to fit 2 images per row with some spacing
    marginRight: '5%', // Add spacing between images
    alignItems: 'center', // Center-align the text under the image
  },
  image: {
    width: '100%', // Image will fill the cell width
    height: 'auto', // Maintain the aspect ratio
    aspectRatio: 1.5, // Adjust the aspect ratio as needed
  },
  imageText: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 10
  },
  pageWithBorder: {
    padding: 20,
    fontSize: 10,
    border: '1px solid black',
  },
  contentWithBorder: {
    border: '1px solid black',
    padding: 10,
  },
})

type Dokumentasi = {
  deskripsi: string,
  url: string
}

type Aktivitas = {
  nama: string,
  dokumentasi_arr: Dokumentasi[]
}

type PeranTenagaKerja = {
  nama: string,
  jumlah: number,
  aktivitas_arr: Aktivitas[]
}

type Props = {
  pencetak_laporan: string,
  pembuat_laporan: string,
  nama_mitra: string,
  nomor_kontrak: string,
  nama_pekerjaan: string,
  tanggal: string,
  laporan: {
    shift_nama: string,
    shift_waktu_mulai: string,
    shift_waktu_berakhir: string,
    peran_tenaga_kerja_arr: PeranTenagaKerja[]
  }[]
  cuaca: {
    tipe: string,
    waktu: string,
    waktu_mulai: string,
    waktu_berakhir: string
  }[]
}

const shiftList = ['1', '2']

const ReportTemplate = ({pencetak_laporan, pembuat_laporan, nama_mitra, nomor_kontrak, nama_pekerjaan, tanggal, laporan, cuaca}: Props) => {
  
  console.log("Pencetak laporan:", pencetak_laporan) //Debug.
  console.log("Pembuat laporan:", pembuat_laporan) //Debug.
  console.log("Laporan:", laporan) //Debug.
  
  const accessToken = getAccessToken();
  // console.log("Access token:", accessToken) //Debug.

  // const metaData = jwtDecode<CustomJwtPayload>(accessToken!);
  let metaData: CustomJwtPayload = { user_id: '', permissions: [] };

  if (typeof accessToken === 'string' && accessToken.trim() !== '') {
    try {
      metaData = jwtDecode<CustomJwtPayload>(accessToken)
      // console.log('Decoded Token:', metaData) //Debug.
    } catch (error) {
      // console.error('Error decoding token:', error) //Debug.
    }
  } else {
    console.error('Token is undefined or invalid') //Debug.
  }
  
  console.log("LAPORAN:", laporan) //Debug.
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.leftSection, {fontWeight: 'bold'}]}>
            <Text>Nomor Kontrak: {nomor_kontrak}</Text>
            <Text>Kontraktor: {nama_mitra}</Text>
          </View>
          <View style={styles.middleSection}>
            <Text style={styles.boldText}>LAPORAN HARIAN {nama_pekerjaan.toUpperCase()}</Text>
          </View>
          <View style={styles.rightSection}>
            <Text style={{fontWeight: 'bold'}}>PT. Graha Sarana Duta</Text>
          </View>
        </View>

        {/* Date Row */}
        <View style={styles.dateRow}>
          <View style={[styles.dateCell, { borderRight: '1px solid black' }]}>
          <Text>
            Hari / Tanggal: {new Intl.DateTimeFormat('id-ID', {
              weekday: 'long', // Full weekday name (e.g., Monday)
              day: '2-digit',  // Day of the month (e.g., 25)
              month: 'long',   // Full month name (e.g., November)
              year: 'numeric', // Full year (e.g., 2024)
            }).format(new Date(tanggal))}
          </Text>
          </View>
          <View style={styles.dateCell}>
            <Text>Lampiran: Dokumentasi</Text>
          </View>
        </View>

      
        {/* Tenaga Kerja Table */}
        <View style={styles.workforceTable}>
          <View style={styles.shiftRow}>
            <View style={styles.shiftCell}>
              <Text>SHIFT {shiftList[0]}</Text>
            </View>
            <View style={styles.shiftCell}>
              <Text>SHIFT {shiftList[1]}</Text>
            </View>
          </View>
          
          {/* Column Headers */}
          <View style={styles.workforceHeaderRow}>
            <View style={styles.workforceHeaderCell}>
              <Text>Jenis Tenaga Kerja</Text>
            </View>
            <View style={styles.workforceCountCell}>
              <Text>Jumlah</Text>
            </View>
            <View style={styles.workforceHeaderCell}>
              <Text>Jenis Tenaga Kerja</Text>
            </View>
            <View style={styles.workforceCountCell}>
              <Text>Jumlah</Text>
            </View>
          </View>

          {/* Tenaga_Kerja Rows - Management */}
          <View style={styles.workforceRow}>
            <View style={[styles.categoryCell, {borderRight: '0px'}]}>
              <Text>I. Manajemen</Text>
            </View>
            <View style={styles.categoryNumberCell}>
              <Text></Text>
            </View>
            <View style={[styles.categoryCell, {borderRight: '0px'}]}>
              <Text>I. Manajemen</Text>
            </View>
            <View style={styles.categoryNumberCell}>
              <Text></Text>
            </View>
          </View>
          
          {/* Map Tenaga Kerja Manajemen */}
          {(() => {
            // Find data for both shifts
            const shift1Data = laporan.find((item) => item.shift_nama === "1")
            const shift2Data = laporan.find((item) => item.shift_nama === "2")

            // Filter non-"pekerja" rows for both shifts
            const shift1TenagaKerja = shift1Data
              ? shift1Data.peran_tenaga_kerja_arr.filter(
                  (tenagaKerja) => !tenagaKerja.nama.toLowerCase().startsWith("pekerja")
                )
              : []

            const shift2TenagaKerja = shift2Data
              ? shift2Data.peran_tenaga_kerja_arr.filter(
                  (tenagaKerja) => !tenagaKerja.nama.toLowerCase().startsWith("pekerja")
                )
              : []
              
            // Determine the maximum number of rows to display
            const maxLength = Math.max(shift1TenagaKerja.length, shift2TenagaKerja.length)

            // Iterate through the rows for both shifts
            return [...Array(maxLength)].map((_, rowIndex) => {
              const tenagaKerjaShift1 = shift1TenagaKerja[rowIndex] || null
              const tenagaKerjaShift2 = shift2TenagaKerja[rowIndex] || null

              return (
                <View key={`row-${rowIndex}`} style={styles.workforceRow}>
                  {/* Left Side (Shift 1) */}
                  {tenagaKerjaShift1 ? (
                    <>
                      <View style={styles.indentedCell}>
                        <Text>
                          {rowIndex + 1}. {tenagaKerjaShift1.nama}
                        </Text>
                      </View>
                      <View style={styles.workforceNumberCell}>
                        <Text>{tenagaKerjaShift1.jumlah}</Text>
                      </View>
                    </>
                  ) : (
                    <>
                      <View style={styles.indentedCell}>
                        <Text></Text>
                      </View>
                      <View style={styles.workforceNumberCell}>
                        <Text></Text>
                      </View>
                    </>
                  )}

                  {/* Right Side (Shift 2) */}
                  {tenagaKerjaShift2 ? (
                    <>
                      <View style={styles.indentedCell}>
                        <Text>
                          {rowIndex + 1}. {tenagaKerjaShift2.nama}
                        </Text>
                      </View>
                      <View style={styles.workforceNumberCell}>
                        <Text>{tenagaKerjaShift2.jumlah}</Text>
                      </View>
                    </>
                  ) : (
                    <>
                      <View style={styles.indentedCell}>
                        <Text></Text>
                      </View>
                      <View style={styles.workforceNumberCell}>
                        <Text></Text>
                      </View>
                    </>
                  )}
                </View>
              )
            })
          })()}

          <View style={[styles.workforceRow, {borderTop: "1px solid black", borderBottom: "1px solid black", }]}>
            <View style={[styles.categoryCell, {borderRight: '0px'}]}>
              <Text>II. Lapangan</Text>
            </View>
            <View style={styles.categoryNumberCell}>
              <Text></Text>
            </View>
            <View style={[styles.categoryCell, {borderRight: '0px'}]}>
              <Text>II. Lapangan</Text>
            </View>
            <View style={styles.categoryNumberCell}>
              <Text></Text>
            </View>
          </View>
            
          {/* Map Tenaga Kerja Lapangan */}
          {(() => {
            // Find data for both shifts
            const shift1Data = laporan.find((item) => item.shift_nama === "1")
            const shift2Data = laporan.find((item) => item.shift_nama === "2")
            
            // Filter non-"pekerja" rows for both shifts
            const shift1TenagaKerja = shift1Data
              ? shift1Data.peran_tenaga_kerja_arr.filter(
                  (tenagaKerja) => tenagaKerja.nama.toLowerCase().startsWith("pekerja")
                )
                : []

            const shift2TenagaKerja = shift2Data
            ? shift2Data.peran_tenaga_kerja_arr.filter(
              (tenagaKerja) => tenagaKerja.nama.toLowerCase().startsWith("pekerja"))
              : []
                  
                  // Determine the maximum number of rows to display
            const maxLength = Math.max(shift1TenagaKerja.length, shift2TenagaKerja.length)
            
            // Iterate through the rows for both shifts
            return [...Array(maxLength)].map((_, rowIndex) => {
              const tenagaKerjaShift1 = shift1TenagaKerja[rowIndex] || null
              const tenagaKerjaShift2 = shift2TenagaKerja[rowIndex] || null
              
              return (
                <View key={`row-${rowIndex}`} style={styles.workforceRow}>
                  {/* Left Side (Shift 1) */}
                  {tenagaKerjaShift1 ? (
                    <>
                      <View style={styles.indentedCell}>
                        <Text style={{textAlign: 'left', alignContent: 'center'}}>
                          {rowIndex + 1}. {tenagaKerjaShift1.nama}
                        </Text>
                      </View>
                      <View style={styles.workforceNumberCell}>
                        <Text style={{textAlign: 'center'}}>{tenagaKerjaShift1.jumlah}</Text>
                      </View>
                    </>
                  ) : (
                    <>
                      <View style={styles.indentedCell}>
                        <Text></Text>
                      </View>
                      <View style={styles.workforceNumberCell}>
                        <Text></Text>
                      </View>
                    </>
                  )}

                  {/* Right Side (Shift 2) */}
                  {tenagaKerjaShift2 ? (
                    <>
                      <View style={styles.indentedCell}>
                        <Text>
                          {rowIndex + 1}. {tenagaKerjaShift2.nama}
                        </Text>
                      </View>
                      <View style={styles.workforceNumberCell}>
                        <Text>{tenagaKerjaShift2.jumlah}</Text>
                      </View>
                    </>
                  ) : (
                    <>
                      <View style={styles.indentedCell}>
                        <Text></Text>
                      </View>
                      <View style={styles.workforceNumberCell}>
                        <Text></Text>
                      </View>
                    </>
                  )}
                </View>
              )
            })
          })()}

          {/* Subtotals */}
          {/* laporan.find((item) => item.shift_nama === "1")
          const shift2Data = laporan.find((item) => item.shift_nama === "2") */}
          <View style={styles.subtotalRow}>
            <View style={styles.workforceCell}>
              <Text style={styles.boldText}>Sub Total 1</Text>
            </View>
            <View style={styles.workforceNumberCell}>
              <Text>{
                laporan
                  .filter((item) => item.shift_nama === "1")
                  .reduce((sum, shift) =>
                    shift.peran_tenaga_kerja_arr.reduce(
                      (innerSum, tenagaKerja) => innerSum + tenagaKerja.jumlah,
                      sum
                    ), 0)  
              }</Text>
            </View>
            <View style={styles.workforceCell}>
              <Text style={styles.boldText}>Sub Total 2</Text>
            </View>
            <View style={styles.workforceNumberCell}>
              <Text>{
                laporan
                .filter((item) => item.shift_nama === "2")
                .reduce((sum, shift) =>
                  shift.peran_tenaga_kerja_arr.reduce(
                    (innerSum, tenagaKerja) => innerSum + tenagaKerja.jumlah,
                    sum
                  ), 0) 
              }</Text>
            </View>
          </View>

          {/* Total */}
          <View style={styles.totalRow}>
            <View style={[styles.workforceCell, { flex: 14.7 }]}>
              <Text style={styles.boldText}>Total Pekerja Hari ini</Text>
            </View>
            <View style={[styles.workforceNumberCell, { flex: 2 }]}>
              <Text>{
                laporan.reduce(
                  (total, shift) =>
                    shift.peran_tenaga_kerja_arr.reduce(
                      (innerTotal, tenagaKerja) => innerTotal + tenagaKerja.jumlah,
                      total
                    ),
                  0
                )}
              </Text>
            </View>
          </View>
        </View>

        {/* Daily Activities Table */}
        <View style={styles.activitiesTable}>
          {/* Header Row */}
          <View style={[styles.activityHeaderRow, {fontWeight: 'bold'}]}>
            <View style={styles.numberCell}>
              <Text style={styles.boldText}>No.</Text>
            </View>
            <View style={styles.activityCell}>
              <Text style={styles.boldText}>Tipe Pekerjaan</Text>
            </View>
            <View style={styles.activityCell}>
              <Text style={styles.boldText}>Detail Aktivitas Pekerjaan</Text>
            </View>
          </View>

          {/* Map Data */}
          {(() => {
            const allActivities: { type: string, activities: string[] }[] = [];
            const typeTracker = new Set();
            let globalIndex = 0; // Counter for global numbering

            // Iterate over shifts
            laporan.forEach((shift) => {
              console.log(shift.peran_tenaga_kerja_arr) //Debug.
              shift.peran_tenaga_kerja_arr.forEach((tenagaKerja) => {
                const typeWord =
                  tenagaKerja.nama.toLowerCase().startsWith("pekerja") &&
                  tenagaKerja.nama.split(" ").slice(1).join(" ");
                if (!typeWord || typeTracker.has(typeWord)) return;

                // Collect all activities for this type
                const activities = tenagaKerja.aktivitas_arr.map(
                  (activity) => activity.nama
                );

                // Add to allActivities
                allActivities.push({
                  type: typeWord,
                  activities: activities,
                });

                // Mark this type as processed
                typeTracker.add(typeWord);
              });
            });
            console.log("All activities:", allActivities) //Debug.

            // Map activities to rows
            return allActivities.flatMap((item) =>
              item.activities.map((activity) => {
                globalIndex++; // Increment global index
                return (
                  <View key={globalIndex} style={styles.activityRow}>
                    {/* Number Column */}
                    <View style={styles.numberCell}>
                      <Text>{globalIndex}.</Text>
                    </View>

                    {/* Tipe Pekerjaan Column */}
                    <View style={styles.activityCell}>
                      <Text>{item.type}</Text>
                    </View>

                    {/* Detail Aktivitas Pekerjaan Column */}
                    <View style={styles.activityCell}>
                      <Text>{activity}</Text>
                    </View>
                  </View>
                );
              })
            );
          })()}
        </View>



        {/* Weather Table */}
        <View style={styles.weatherTable}>
          {/* Header Row */}
          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text style={styles.boldText}>Cuaca</Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={styles.boldText}>Cerah</Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={styles.boldText}>Gerimis (Waktu)</Text>
            </View>
            <View style={styles.tableCellNoBorder}>
              <Text style={styles.boldText}>Hujan (Waktu)</Text>
            </View>
          </View>

          {/* Weather Rows */}
          {['pagi', 'siang', 'sore', 'malam'].map((time: string) => {
            const cerahData = cuaca.find(item => item.waktu === time && item.tipe === 'cerah');
            const gerimisData = cuaca.find(item => item.waktu === time && item.tipe === 'gerimis');
            const hujanData = cuaca.find(item => item.waktu === time && item.tipe === 'hujan');

            return (
              <View key={time} style={styles.tableRow}>
                {/* Time Row */}
                <View style={styles.tableCell}>
                  <Text>{time.charAt(0).toUpperCase() + time.slice(1)}</Text>
                </View>
                
                {/* Cerah Column */}
                <View style={styles.tableCell}>
                  <Text style={styles.checkmark}>{cerahData ? '\u221A\u221A\u221A' : ''}</Text>
                </View>
                
                {/* Gerimis Column */}
                <View style={styles.tableCell}>
                  <Text>
                    {gerimisData ? `${gerimisData.waktu_mulai} s/d ${gerimisData.waktu_berakhir}` : ''}
                  </Text>
                </View>
                
                {/* Hujan Column */}
                <View style={styles.tableCellNoBorder}>
                  <Text>
                    {hujanData ? `${hujanData.waktu_mulai} s/d ${hujanData.waktu_berakhir}` : ''}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Issues Section */}
        <View wrap={false} style={styles.issuesSection}>
          <View style={styles.tableRow}>
            <View style={[styles.tableCell, { flex: 1 }]}>
              <Text>Permasalahan yang timbul</Text>
            </View>
            <View style={[styles.tableCell, { flex: 1 }]}>
              <Text>Penyelesaian</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={[styles.tableCell, {minHeight : 124}]}/>
            <View style={[styles.tableCell, {minHeight : 1}]}/>
          </View>
        </View>

        {/* Footer */}
        <View wrap={false} style={styles.footer}>
          <View style={styles.footerRow}>
            <View style={styles.footerCell}>
              <Text>Kontraktor Pelaksana</Text>
              <Text>PT Graha Sarana Duta</Text>
            </View>
            <View style={[styles.footerCell, {paddingLeft: '17px'}]}>
              <Text>Dilaporkan Oleh,</Text>
              <Text>Konsultan Pengawas</Text>
              <Text>{nama_mitra}</Text>
            </View>
          </View>
          <View style={styles.footerRow}>
            <View style={[styles.footerCell, {paddingRight: '17px'}]}>
              <Text style={{ marginTop: 40, textAlign: 'center' }}>___________________</Text>
              <Text style={{ marginTop: 5, textAlign: 'center' }}>Site Manager</Text>
            </View>
            <View style={styles.footerCell}>
              <Text style={{ marginTop: 40 }}>___________________</Text>
              <Text style={{ marginTop: 5 }}>{metaData.nama_mitra ? pencetak_laporan : pembuat_laporan}</Text>
            </View>
          </View>
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        <View style={styles.contentWithBorder}>
          <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 20 }}>
            Lampiran: Dokumentasi Lapangan
          </Text>
          {/* Dynamically render images based on the response */}
          {laporan.map((shift, shiftIndex) =>
            shift.peran_tenaga_kerja_arr.map((tenagaKerja, tenagaIndex) =>
              tenagaKerja.aktivitas_arr.map((aktivitas, aktivitasIndex) => (
                <View wrap={false} key={`shift-${shiftIndex}-tenaga-${tenagaIndex}-aktivitas-${aktivitasIndex}`}>
                  <Text style={{ fontSize: 10, marginBottom: 10 }}>
                    Aktivitas: {aktivitas.nama}
                  </Text>

                  {/* Image Row for the Aktivitas */}
                  <View style={styles.imageRow}>
                    {aktivitas.dokumentasi_arr.map((doc, docIndex) => (
                      <View style={styles.imageCell} key={`doc-${docIndex}`}>
                        {doc.url ? (
                          <Image style={styles.image} src={doc.url.replace('.webp', '.jpg')} />
                        ) : (
                          <Text style={styles.imageText}>Image not available</Text>
                        )}
                        <Link style={[styles.imageText, {textAlign: 'left'}]} src={doc.url}>
                          Klik di sini untuk beralih ke gambar pada tab ini
                        </Link>
                        <Text style={[styles.imageText, {marginTop: 8, fontWeight: 'bold'}]}>{doc.deskripsi}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))
            )
          )}
        </View>
      </Page>

    </Document>
  )
}

export default ReportTemplate;