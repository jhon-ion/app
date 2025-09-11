project-root/
│
├── Code.gs               <-- ini file backend (copy ke Google Apps Script)
│
└── frontend/
    ├── index.html        <-- halaman login & register
    ├── beranda.html      <-- halaman dashboard
    │
    ├── css/
    │   ├── index.css     <-- style khusus login/register
    │   └── beranda.css   <-- style khusus dashboard
    │
    └── js/
        ├── db.js         <-- semua fungsi database/API (online & offline)
        ├── auth.js      UI login & register
        ├── beranda.js    navigasi
        ├── odp.js       (lihat/tambah/hapus)
        ├── olt.js       (lihat/tambah/hapus)
        └── util.js      (deleteData dll)
        
