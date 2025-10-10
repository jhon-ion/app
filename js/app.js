// ===================================================
// 🚀 ION APP - APP.JS FINAL (SYNC + LOGIN + DROPDOWN + CRUD)
// ===================================================
const SHEET_URL = "https://script.google.com/macros/s/AKfycbxZjiAPpfIaIZpk5w0gABk9Fu1ibQbCI5LO4YoLLETCO00Hzlw46JwXG75QOvaTssu9-Q/exec";

// ===================================================
// ⚙️ LOADER GLOBAL
// ===================================================
function createLoader() {
  if (document.getElementById("globalLoader")) return;
  const loader = document.createElement("div");
  loader.id = "globalLoader";
  loader.innerHTML = `
    <div class="loader-overlay">
      <div class="loader">
        <div class="spinner"></div>
        <span>Memproses...</span>
      </div>
    </div>`;
  document.body.appendChild(loader);

  const style = document.createElement("style");
  style.textContent = `
    .loader-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.55); display: flex; justify-content: center; align-items: center; z-index: 9999; backdrop-filter: blur(3px); }
    .loader { text-align:center; color:white; font-size:16px; }
    .spinner { width:60px;height:60px;border:6px solid #fff;border-top:6px solid #4f46e5;border-radius:50%;animation:spin 1s linear infinite;margin:auto;margin-bottom:12px; }
    @keyframes spin { 100%{ transform: rotate(360deg); } }
    #globalLoader{ display:none; }
  `;
  document.head.appendChild(style);
}
createLoader();
function showLoading(text="Memproses..."){ const loader=document.getElementById("globalLoader"); if(!loader) return; loader.querySelector("span").textContent=text; loader.style.display="block"; }
function hideLoading(){ const loader=document.getElementById("globalLoader"); if(loader) loader.style.display="none"; }

// ===================================================
// 🌐 KOMUNIKASI GOOGLE SHEETS
// ===================================================
async function callSheet(action,payload={}) {
  if(!SHEET_URL) throw new Error("SHEET_URL belum diisi.");
  showLoading();
  try{
    const res = await fetch(SHEET_URL,{
      method:"POST",
      headers:{"Content-Type":"text/plain;charset=utf-8"},
      body:JSON.stringify({action,...payload})
    });
    const text = await res.text();
    let json;
    try{ json = JSON.parse(text); } catch{ throw new Error("Respons server tidak valid: "+text); }
    if(!json.ok) throw new Error(json.message || "Kesalahan server Apps Script.");
    return json.data;
  } finally{ hideLoading(); }
}

// ===================================================
// 🧩 LOGIN PROTECTION
// ===================================================
function requireLogin(){
  const user = JSON.parse(localStorage.getItem("user")||"null");
  const currentPage = location.pathname.split("/").pop();
  if(!user && currentPage !== "index.html"){
    Swal.fire("Akses Ditolak","Silakan login terlebih dahulu.","warning").then(()=> window.location.href="index.html");
    return false;
  }
  return true;
}
document.addEventListener("DOMContentLoaded",requireLogin);

// ===================================================
// 👥 MEMBER API
// ===================================================
window.MemberAPI = {
  fetchMembers: ()=>callSheet("member_fetch"),
  addMember: (entry)=>callSheet("member_add",{entry}),
  updateMember: (entry)=>callSheet("member_update",{entry}),
  deleteMember: (nip)=>callSheet("member_delete",{nip})
};

// ===================================================
// 🗂️ ODP API
// ===================================================
window.OdpAPI = {
  fetchOdp: ()=>callSheet("odp_fetch"),
  addOdp: (entry)=>{ entry.user = localStorage.getItem("CURRENT_USER_ALIAS") || "admin_inti"; return callSheet("odp_add",{entry}); },
  updateOdp: (entry)=>callSheet("odp_update",{entry}),
  deleteOdp: (namaOdp)=>callSheet("odp_delete",{namaOdp})
};

// ===================================================
// 📋 LAPORAN API
// ===================================================
window.LaporanAPI = {
  addInstalasi: (entry)=>callSheet("laporan_instalasi_add",{entry}),
  fetchInstalasi: ()=>callSheet("laporan_instalasi_fetch"),
  updateInstalasi: (entry)=>callSheet("laporan_instalasi_update",{entry}),
  deleteInstalasi: (rowIndex)=>callSheet("laporan_instalasi_delete",{rowIndex}),

  addMaintenance: (entry)=>callSheet("laporan_maintenance_add",{entry}),
  fetchMaintenance: ()=>callSheet("laporan_maintenance_fetch"),
  updateMaintenance: (entry)=>callSheet("laporan_maintenance_update",{entry}),
  deleteMaintenance: (rowIndex)=>callSheet("laporan_maintenance_delete",{rowIndex})
};

// ===================================================
// 🔐 LOGIN USER
// ===================================================
async function loginUser(nip){
  showLoading("Memeriksa data pengguna...");
  try{
    const members = await MemberAPI.fetchMembers();
    return members.find(u=>String(u.nip).trim()===String(nip).trim()) || null;
  } catch(err){ Swal.fire("Gagal",err.message,"error"); return null; } 
  finally{ hideLoading(); }
}
document.addEventListener("DOMContentLoaded",()=>{
  const loginForm = document.getElementById("loginForm");
  if(loginForm){
    loginForm.addEventListener("submit",async(e)=>{
      e.preventDefault();
      const nip = document.getElementById("nip").value.trim();
      if(!nip) return Swal.fire("Perhatian","Masukkan NIP Anda","warning");
      const user = await loginUser(nip);
      if(!user) return Swal.fire("Gagal","NIP tidak ditemukan","error");
      localStorage.setItem("user",JSON.stringify(user));
      localStorage.setItem("CURRENT_USER_ALIAS",user.alias||user.nama);
      localStorage.setItem("CURRENT_USER_NAME",user.nama);
      Swal.fire("Sukses",`${user.nama} berhasil login!`,"success").then(()=>window.location.href="beranda.html");
    });
  }

  // BERANDA
  const user = JSON.parse(localStorage.getItem("user")||"null");
  if(user){
    const userNameEl = document.getElementById("userName");
    const userRoleEl = document.getElementById("userRole");
    const menuGrid = document.getElementById("menuGrid");
    if(userNameEl) userNameEl.textContent=user.nama||"-";
    if(userRoleEl) userRoleEl.textContent=(user.role||"-").toUpperCase();
    if(menuGrid){
      const allMenus=[
        {name:"Member",link:"isi/menej-member/index.html",icon:"users"},
        {name:"ODP",link:"isi/menej-odp/index.html",icon:"database"},
        {name:"Laporan",link:"isi/laporan/index.html",icon:"file-plus"},
        {name:"View Laporan",link:"isi/view-laporan/index.html",icon:"file-text"},
        {name:"View ODP",link:"isi/view-odp/index.html",icon:"layers"}
      ];
      let menus=[];
      switch(user.role){
        case "admin_inti": menus=allMenus; break;
        case "admin": menus=allMenus.filter(m=>m.name!=="Absen"); break;
        case "team jl": menus=allMenus.filter(m=>!["Member"].includes(m.name)); break;
        case "member": menus=allMenus.filter(m=>!["Member","ODP"].includes(m.name)); break;
        default: menus=[];
      }
      menuGrid.innerHTML=menus.map(m=>`<a class="menu-item" href="${m.link}"><i data-lucide="${m.icon}"></i><span>${m.name}</span></a>`).join("");
      if(typeof lucide!=="undefined") lucide.createIcons();
    }

    const btnLogout = document.getElementById("btnLogout");
    if(btnLogout) btnLogout.addEventListener("click",()=>{ localStorage.clear(); Swal.fire("Logout","Berhasil keluar akun.","success").then(()=>window.location.href="index.html"); });
  }
});

// ===================================================
// 🧭 OLT & ODP DINAMIS
// ===================================================
window.OLTManager = {
  allOdpData: [],
  async init(){
    try{
      this.allOdpData = await OdpAPI.fetchOdp();
      this.populateOLTDropdown();
    }catch(err){ console.error("Gagal memuat ODP:",err); }
  },
  populateOLTDropdown(){
    const oltSelect=document.getElementById("oltSelect");
    if(!oltSelect) return;
    const uniqueOLTs=[...new Set(this.allOdpData.map(o=>o.olt))].sort();
    oltSelect.innerHTML=`<option value="">-- Pilih OLT --</option>`+uniqueOLTs.map(o=>`<option value="${o}">${o}</option>`).join("");
    oltSelect.addEventListener("change",()=>this.populateOdpDropdown(oltSelect.value));
  },
  populateOdpDropdown(selectedOLT){
    const odpSelect=document.getElementById("odpSelect");
    if(!odpSelect) return;
    const odpFiltered=this.allOdpData.filter(o=>o.olt===selectedOLT);
    odpSelect.innerHTML=odpFiltered.length?`<option value="">-- Pilih ODP --</option>`+odpFiltered.map(o=>`<option value="${o.namaOdp}">${o.namaOdp}</option>`).join(""):`<option value="">Tidak ada ODP di OLT ini</option>`;
  },
  filterViewByOLT(oltValue){
    const rows=document.querySelectorAll(".odp-row");
    rows.forEach(row=>{ const rowOLT=row.getAttribute("data-olt"); row.style.display = (!oltValue||rowOLT===oltValue)?"":"none"; });
  }
};

document.addEventListener("DOMContentLoaded",()=>{
  if(document.getElementById("oltSelect")){ OLTManager.init(); }
  const viewOltFilter=document.getElementById("filterOLT");
  if(viewOltFilter) viewOltFilter.addEventListener("change",e=>OLTManager.filterViewByOLT(e.target.value));
});

// ===================================================
// 🗼 DEFAULT OLT LIST
// ===================================================
window.OLT_LIST=[
  "OLT MESS SUBANG",
  "OLT MESS SUBANG 2",
  "OLT GUNUNG TUA",
  "OLT DAWUAN",
  "OLT PAGADEN SUBANG",
  "OLT TAMBAK DAHAN SUBANG",
  "OLT OFFICE SELES SUBANG"
];
