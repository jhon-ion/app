// UI logic for login/register and beranda
document.addEventListener("DOMContentLoaded", ()=>{
  const isBeranda = location.pathname.endsWith("beranda.html");
  if (!isBeranda) setupAuth();
  else setupBeranda();
});

function setupAuth(){
  const showRegister = document.getElementById("showRegister");
  const showLogin = document.getElementById("showLogin");
  showRegister.onclick = (e)=>{e.preventDefault(); toggleForms(true);};
  showLogin.onclick = (e)=>{e.preventDefault(); toggleForms(false);};
  document.getElementById("btnLogin").onclick = async ()=>{
    const id = document.getElementById("loginId").value.trim();
    const pw = document.getElementById("loginPw").value.trim();
    if (!id||!pw) return alert("Isi id & pw");
    const res = await window.appApi.auth(id,pw);
    if (!res.ok) return alert(res.message||"Gagal login");
    sessionStorage.setItem("app_user", JSON.stringify(res.user));
    location.href = "beranda.html";
  };
  document.getElementById("btnRegister").onclick = async ()=>{
    const id = document.getElementById("regId").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const phone = document.getElementById("regPhone").value.trim();
    const pw = document.getElementById("regPw").value.trim();
    if (!id||!email||!phone||!pw) return alert("Lengkapi data");
    // basic email validation
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return alert("Email tidak valid");
    const res = await window.appApi.register({id,email,phone,pw});
    if (!res.ok) return alert(res.message||"Gagal daftar");
    alert("Berhasil daftar. Silakan login.");
    toggleForms(false);
  };
}

function toggleForms(showRegister){
  document.getElementById("loginForm").style.display = showRegister ? "none":"block";
  document.getElementById("registerForm").style.display = showRegister ? "block":"none";
}

async function setupBeranda(){
  const userRaw = sessionStorage.getItem("app_user");
  if (!userRaw) { location.href = "index.html"; return; }
  const user = JSON.parse(userRaw);
  document.getElementById("userInfo").innerText = "Login sebagai: " + user.id + " ("+user.role+")";
  // hide Absen for non-admin users (as requested)
  if (user.role !== "admin") document.getElementById("btnAbsen").style.display = "none";

  document.getElementById("btnLogout").onclick = ()=>{
    sessionStorage.removeItem("app_user");
    location.href = "index.html";
  };

  document.getElementById("btnODP").onclick = ()=>showODP(user);
  document.getElementById("btnAbsen").onclick = ()=>showAbsen(user);
  document.getElementById("btnJalur").onclick = ()=>showJalur(user);
  document.getElementById("btnOLT").onclick = ()=>showOLT(user);
}

async function showODP(user){
  const content = document.getElementById("content");
  content.innerHTML = "<h3>Daftar ODP</h3><p>Memuat...</p>";
  const res = await window.appApi.getList("odp");
  if (!res.ok) return content.innerHTML = "<p>Gagal memuat</p>";
  const rows = res.data;
  let html = '<button id="addOdpBtn">Tambah ODP</button>';
  html += "<table><tr><th>Nama</th><th>Lokasi</th><th>Jalur</th><th>Deskripsi</th><th>Foto</th></tr>";
  rows.forEach(r=>{
    html += `<tr><td>${r.nama||""}</td><td>${r.lokasi||""}</td><td>${r.jalur||""}</td><td>${r.desc||""}</td><td>${r.foto?'<img src="'+r.foto+'" style="max-width:120px">':''}</td></tr>`;
  });
  html += "</table>";
  content.innerHTML = html;
  if (user.role==="admin"){
    document.getElementById("addOdpBtn").onclick = ()=>openAddOdp();
  } else {
    document.getElementById("addOdpBtn").style.display = "none";
  }
}

function openAddOdp(){
  const content = document.getElementById("content");
  content.innerHTML = `
    <h3>Tambah ODP</h3>
    <input id="o_nama" placeholder="Nama ODP">
    <input id="o_lokasi" placeholder="Lokasi (titik koordinat)">
    <input id="o_jalur" placeholder="Jalur">
    <textarea id="o_desc" placeholder="Deskripsi"></textarea>
    <input id="o_foto" placeholder="URL Foto (atau data:image...)">
    <button id="saveOdp">Simpan</button>
  `;
  document.getElementById("saveOdp").onclick = async ()=>{
    const payload = {
      nama: document.getElementById("o_nama").value,
      lokasi: document.getElementById("o_lokasi").value,
      jalur: document.getElementById("o_jalur").value,
      desc: document.getElementById("o_desc").value,
      foto: document.getElementById("o_foto").value,
      ts: new Date().toISOString()
    };
    const res = await window.appApi.save("odp", payload);
    if (!res.ok) return alert("Gagal simpan");
    alert("Tersimpan");
    showODP(JSON.parse(sessionStorage.getItem("app_user")));
  };
}

async function showAbsen(user){
  const content = document.getElementById("content");
  content.innerHTML = "<h3>Data Absen</h3><p>Memuat...</p>";
  const res = await window.appApi.getList("absen");
  if (!res.ok) return content.innerHTML = "<p>Gagal memuat</p>";
  const rows = res.data;
  let html = '';
  if (user.role==="admin"){
    html += '<button id="addAbsenBtn">Tambah Absen</button>';
  }
  html += "<table><tr><th>ID</th><th>Tanggal</th><th>Keterangan</th></tr>";
  rows.forEach(r=>{
    html += `<tr><td>${r.id||""}</td><td>${r.tanggal||""}</td><td>${r.ket||""}</td></tr>`;
  });
  html += "</table>";
  content.innerHTML = html;
  if (user.role==="admin"){
    document.getElementById("addAbsenBtn").onclick = ()=>openAddAbsen();
  }
}

function openAddAbsen(){
  const content = document.getElementById("content");
  content.innerHTML = `
    <h3>Tambah Absen</h3>
    <input id="a_id" placeholder="ID Pegawai">
    <input id="a_tanggal" placeholder="Tanggal">
    <input id="a_ket" placeholder="Keterangan">
    <button id="saveAbsen">Simpan</button>
  `;
  document.getElementById("saveAbsen").onclick = async ()=>{
    const payload = {
      id: document.getElementById("a_id").value,
      tanggal: document.getElementById("a_tanggal").value,
      ket: document.getElementById("a_ket").value,
      ts: new Date().toISOString()
    };
    const res = await window.appApi.save("absen", payload);
    if (!res.ok) return alert("Gagal simpan");
    alert("Tersimpan");
    showAbsen(JSON.parse(sessionStorage.getItem("app_user")));
  };
}

async function showJalur(user){
  const content = document.getElementById("content");
  content.innerHTML = "<h3>Data Jalur</h3><p>Memuat...</p>";
  const res = await window.appApi.getList("jalur");
  if (!res.ok) return content.innerHTML = "<p>Gagal memuat</p>";
  const rows = res.data;
  let html = '<button id="addJalurBtn">Tambah Jalur</button>';
  html += "<table><tr><th>Nama</th><th>Keterangan</th></tr>";
  rows.forEach(r=>{
    html += `<tr><td>${r.nama||""}</td><td>${r.ket||""}</td></tr>`;
  });
  html += "</table>";
  content.innerHTML = html;
  document.getElementById("addJalurBtn").onclick = ()=>openAddJalur();
}

function openAddJalur(){
  const content = document.getElementById("content");
  content.innerHTML = `
    <h3>Tambah Jalur</h3>
    <input id="j_nama" placeholder="Nama Jalur">
    <input id="j_ket" placeholder="Keterangan">
    <button id="saveJalur">Simpan</button>
  `;
  document.getElementById("saveJalur").onclick = async ()=>{
    const payload = {
      nama: document.getElementById("j_nama").value,
      ket: document.getElementById("j_ket").value,
      ts: new Date().toISOString()
    };
    const res = await window.appApi.save("jalur", payload);
    if (!res.ok) return alert("Gagal simpan");
    alert("Tersimpan");
    showJalur(JSON.parse(sessionStorage.getItem("app_user")));
  };
}

async function showOLT(user){
  const content = document.getElementById("content");
  content.innerHTML = "<h3>Data OLT</h3><p>Memuat...</p>";
  const res = await window.appApi.getList("olt");
  if (!res.ok) return content.innerHTML = "<p>Gagal memuat</p>";
  const rows = res.data;
  let html = '<button id="addOLTBtn">Tambah OLT</button>';
  html += "<table><tr><th>Nama</th><th>Keterangan</th></tr>";
  rows.forEach(r=>{
    html += `<tr><td>${r.nama||""}</td><td>${r.ket||""}</td></tr>`;
  });
  html += "</table>";
  content.innerHTML = html;
  document.getElementById("addOLTBtn").onclick = ()=>openAddOLT();
}

function openAddOLT(){
  const content = document.getElementById("content");
  content.innerHTML = `
    <h3>Tambah OLT</h3>
    <input id="o_nama" placeholder="Nama OLT">
    <input id="o_ket" placeholder="Keterangan">
    <button id="saveOLT">Simpan</button>
  `;
  document.getElementById("saveOLT").onclick = async ()=>{
    const payload = {
      nama: document.getElementById("o_nama").value,
      ket: document.getElementById("o_ket").value,
      ts: new Date().toISOString()
    };
    const res = await window.appApi.save("olt", payload);
    if (!res.ok) return alert("Gagal simpan");
    alert("Tersimpan");
    showOLT(JSON.parse(sessionStorage.getItem("app_user")));
  };
    }
