# 🚀 Panduan Hosting BisikLagu ke Vercel & Supabase (Free Tier)

Panduan ini berisi langkah-langkah mudah untuk melakukan deployment aplikasi **BisikLagu** ke **Vercel** dengan database gratis dari **Supabase** serta menghubungkan domain **bisiklagu.com**.

---

## 📌 Langkah 1: Buat Database Gratis di Supabase

1. Buka [https://supabase.com](https://supabase.com) dan login/daftar (Gratis).
2. Klik **New Project**, beri nama project `bisiklagu`, pilih region terdekat (misal: *Singapore*), dan tentukan Database Password.
3. Setelah project dibuat, buka menu **SQL Editor** di sidebar kiri.
4. Buka file `supabase_schema.sql` pada repository project ini, **Copy seluruh kodenya**, lalu **Paste** di Supabase SQL Editor dan klik **Run**.
5. Buka menu **Project Settings -> API** di Supabase. Catat 3 variabel penting berikut:
   - `Project URL` -> `NEXT_PUBLIC_SUPABASE_URL`
   - `anon / public key` -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` -> `SUPABASE_SERVICE_ROLE_KEY`

---

## 📌 Langkah 2: Deploy ke Vercel

1. Push kodingan repository ini ke akun **GitHub / GitLab / Bitbucket** Anda.
2. Buka [https://vercel.com](https://vercel.com) dan login dengan akun GitHub Anda.
3. Klik **Add New -> Project**, lalu **Import** repository `secret-vibe` (atau nama repo yang Anda gunakan).
4. Di bagian **Environment Variables**, tambahkan 3 kunci dari Supabase tadi:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://xxx.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbG...`
   - `SUPABASE_SERVICE_ROLE_KEY` = `eyJhbG...`
5. Klik **Deploy**. Vercel akan otomatis melakukan proses build & deploy dalam waktu 1-2 menit.

---

## 📌 Langkah 3: Menghubungkan Domain Custom `bisiklagu.com`

1. Setelah deployment berhasil di Vercel, buka dashboard project Anda di Vercel.
2. Masuk ke **Settings -> Domains**.
3. Ketik domain Anda `bisiklagu.com` (dan `www.bisiklagu.com`), lalu klik **Add**.
4. Buka penyedia DNS domain Anda (seperti Cloudflare, Namecheap, Niagahoster, Rumahweb, dsb).
5. Tambahkan record DNS berikut sesuai petunjuk dari Vercel:
   - **Type A**: `@` -> `76.76.21.21`
   - **CNAME**: `www` -> `cname.vercel-dns.com`
6. Tunggu proses propagasi DNS (biasanya 5–15 menit). SSL/HTTPS akan dipasang secara otomatis gratis oleh Vercel.

---

## ✨ Selesai!
Aplikasi **BisikLagu** kini sudah aktif secara publik di domain `https://bisiklagu.com` dengan database cloud real-time gratis dari Supabase!
