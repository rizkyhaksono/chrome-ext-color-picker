# Natee Color Picker

Chrome extension (Manifest V3) untuk memilih warna dengan input color, eyedropper, dan copy nilai (HEX / RGB / HSL).

## Cara install di Chrome

1. **Build dulu** (wajib, karena file JS dipakai dari folder `dist/`):
   ```bash
   npm install
   npm run build
   ```

2. Buka Chrome dan masuk ke **Extensions**:
   - Ketik di address bar: `chrome://extensions`
   - Atau menu Chrome → **Extensions** → **Manage Extensions**

3. **Aktifkan Developer mode** (toggle di pojok kanan atas).

4. Klik **Load unpacked** („Muat yang tidak dikemas“).

5. Pilih **folder project ini** (yang berisi `manifest.json`), lalu **Select Folder**.

6. Extension akan muncul di daftar. Klik ikon puzzle di toolbar Chrome dan pin **Natee Color Picker** jika mau.

Setelah itu, klik ikon extension untuk membuka popup: pilih warna, pakai Eyedropper, ganti format (HEX/RGB/HSL), lalu **Copy**.

## Development

```bash
npm install
npm run build        # build sekali
npm run build:watch  # build otomatis saat file diubah
```

Setelah mengubah kode, jalankan `npm run build` lagi, lalu di `chrome://extensions` klik tombol **reload** pada kartu extension ini.
