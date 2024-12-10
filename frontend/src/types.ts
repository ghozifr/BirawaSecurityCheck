import { CountryCode } from "libphonenumber-js"
export type Mitra = {
    id?: string,
    nama: string,
    nomor_telepon: string,
    alamat: string
}

export type Kontrak = {
    nama: string,
    nomor: string,
    tanggal: string,
    nilai: number,
    jangka_waktu: number
}

export type Pekerjaan = {
    nama: string,
    lokasi: string
}

export type User = {
    email: string,
    nama_lengkap: string,
    nomor_telepon: string ,
    is_verified?:number,
    is_active?:number,
}

export type Shift = {
    nama: string,
    waktu_mulai: string,
    waktu_berakhir: string
}

export type TenagaKerja = {
    tipe: string,
    peran: string,
    jumlah: number
}

export type Dokumentasi = {
    url?: string,
    deskripsi: string
}

export type Aktivitas = {
    tipe: string,
    nama: string,
    dokumentasi: Dokumentasi[]
}

export type Laporan = {
    id: string,
    tanggal: string
}

export type Cuaca = {
    tipe: string,
    waktu: string,
    waktu_mulai?: string,
    waktu_berakhir?: string
}

export type PeranTenagaKerja = {
    nama: string,
    jumlah: number,
    aktivitas_arr: Aktivitas[]
  }

export type LaporanResponse = {
    shift_nama: string,
    shift_waktu_mulai: string,
    shift_waktu_berakhir: string,
    peran_tenaga_kerja_arr: PeranTenagaKerja[]
}

export type CustomJwtPayload = {
    user_id: string,
    permissions: string[],
    nama_mitra?: string
}

export type Country = {
    code: CountryCode;
    dialCode: string;
    name: string;
}

export type Inbox = {
    id?: string
    subject: string
    last_message?: string
    content?: string
    created_at?: string
    sender_nama_mitra?: string | null
    sender_email?: string
    sender_nama_lengkap?: string
    receiver_email?: string
    receiver_nama_lengkap?: string
}