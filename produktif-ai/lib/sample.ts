import type { Deck } from "./schema";

// Served when DEMO_MODE=1 so the UI and tests run without an API key.
export const SAMPLE_DECK: Deck = {
  topic_check: {
    wallet: { pass: true, why: "Langsung nyelamatin duit dan nama baik rekening yang udah lo punya." },
    villain: { pass: true, why: "Ada pelaku yang jelas untung: penipu yang pakai data lo buat pinjol." },
    tomorrow: { pass: true, why: "Semua langkahnya bisa dikerjain hari ini tanpa beli apa-apa." },
    tag: { pass: true, why: "Gampang kebayang orang tua yang gampang panik kalau ditelepon." },
    verdict: "gas",
    suggestion: "Kalau lo punya kejadian nyata, masukin angkanya ke slide 1. Hook dengan angka dari kejadian beneran biasanya lebih kena.",
  },
  slides: [
    {
      kind: "hook",
      kicker: "MODUS TRANSFER NYASAR",
      title: "Ada Rp 1,5 juta nyasar ke rekening lo? Jangan transfer balik.",
      body: "Itu bisa jadi pinjaman online atas nama lo. Yang nelpon minta dibalikin cuma butuh lo panik. Ini cara ngelawannya:",
      anchor: "Jangan transfer balik",
    },
    {
      kind: "insight",
      kicker: "CARA KERJANYA",
      title: "Data lo dipakai ngajuin pinjol, duitnya cair ke rekening lo.",
      body: "Habis itu ada yang ngaku salah transfer dan minta dikembalikan ke rekening lain. Duitnya pergi, utangnya tetap atas nama lo.",
      anchor: "pinjol",
    },
    {
      kind: "step",
      kicker: "LANGKAH 1",
      title: "Jangan pakai duit itu sepeser pun.",
      body: "Biarin saldonya utuh. Begitu kepakai, lo makin susah buktiin itu bukan transaksi lo.",
      anchor: "sepeser pun",
    },
    {
      kind: "step",
      kicker: "LANGKAH 2",
      title: "Telepon bank lo lewat nomor resmi.",
      body: "Ambil nomornya dari balik kartu ATM atau aplikasi bank, jangan dari orang yang nelpon lo. Minta bank yang ngecek asal dana dan ngurus pengembaliannya.",
      anchor: "nomor resmi",
    },
    {
      kind: "warning",
      kicker: "AWAS",
      title: "Jangan kirim ke rekening yang dia sebut.",
      body: "Pelaku sering minta dikirim ke rekening yang beda dari pengirim awal. Itu tanda paling jelas lo lagi dijebak.",
      anchor: "rekening yang dia sebut",
    },
    {
      kind: "step",
      kicker: "LANGKAH 3",
      title: "Simpan bukti chat, nomor, dan mutasi.",
      body: "Screenshot chat, catat nomor penelepon, unduh mutasi rekening. Ini yang lo butuhin kalau nanti muncul tagihan atas nama lo.",
      anchor: "bukti",
    },
    {
      kind: "step",
      kicker: "LANGKAH 4",
      title: "Kalau ternyata pinjol, lapor ke OJK.",
      body: "Hubungi Kontak OJK 157 atau kanal pengaduan resminya. Bilang lo nggak pernah ngajuin pinjaman itu, lalu lampirin buktinya.",
      anchor: "OJK",
    },
    {
      kind: "closer",
      kicker: "INTINYA",
      title: "Duit nyasar bukan rezeki. Biar bank yang balikin.",
      body: "Lewat jalur resmi, lo nggak rugi sepeser pun. Kirim ini ke nyokap lo yang paling gampang panik kalau ditelepon orang ngaku petugas.",
      anchor: "bukan rezeki",
    },
  ],
  caption:
    "Duit masuk tiba-tiba, terus ada yang nelpon minta dibalikin ke rekening lain. Kedengarannya sepele, padahal bisa jadi utang pinjol atas nama lo.\n\nJangan transfer balik sendiri. Telepon bank lewat nomor resmi, simpan semua bukti, dan lapor kalau ternyata itu pinjaman yang nggak pernah lo ajuin.\n\nSimpan post ini, terus kirim ke orang rumah yang paling sering angkat telepon nomor asing.\n\n#modusPenipuan #pinjol #transferNyasar",
  fact_check: [
    "Nomor Kontak OJK 157 masih aktif dan benar.",
    "Prosedur bank lo untuk dana salah transfer (tiap bank bisa beda).",
  ],
};
