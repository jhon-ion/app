// === script.js ===
document.addEventListener("DOMContentLoaded", ()=>{
  const isBeranda = location.pathname.includes("beranda.html");
  if (!isBeranda) setupAuth();
  else setupBeranda();
});

function setupAuth(){
  document.getElementById("showRegister").onclick = e=>{e.preventDefault();toggleForms(true)};
  document.getElementById("showLogin").onclick = e=>{e.preventDefault();toggleForms(false)};
  
  document.getElementById("btnLogin").onclick = async ()=>{
    const id=document.getElementById("loginId").value.trim();
    const pw=document.getElementById("loginPw").value.trim();
    if(!id||!pw)return alert("Lengkapi data");
    const res=await window.appApi.auth(id,pw);
    if(!res.ok)return alert(res.message);
    sessionStorage.setItem("app_user",JSON.stringify(res.user));
    location.href="beranda.html";
  };
  
  document.getElementById("btnRegister").onclick=async()=>{
    const id=document.getElementById("regId").value.trim();
    const email=document.getElementById("regEmail").value.trim();
    const phone=document.getElementById("regPhone").value.trim();
    const pw=document.getElementById("regPw").value.trim();
    if(!id||!email||!phone||!pw)return alert("Lengkapi data");
    const res=await window.appApi.register({id,email,phone,pw});
    if(!res.ok)return alert(res.message);
    alert("Berhasil daftar, silakan login.");toggleForms(false);
  };
}

function toggleForms(showReg){
  document.getElementById("loginBox").style.display=showReg?"none":"block";
  document.getElementById("registerBox").style.display=showReg?"block":"none";
}

async function setupBeranda(){
  const user=JSON.parse(sessionStorage.getItem("app_user")||"null");
  if(!user)return location.href="index.html";
  document.getElementById("userInfo").innerText=`Login sebagai: ${user.id} (${user.role})`;
  
  document.getElementById("btnLogout").onclick=()=>{sessionStorage.clear();location.href="index.html"};
  
  document.getElementById("btnODP").onclick=()=>showODP(user);
  document.getElementById("btnOLT").onclick=()=>showOLT(user);
  document.getElementById("btnJalur").onclick=()=>showJalur(user);
  
  if(user.role==="admin")
    document.getElementById("btnAbsen").onclick=()=>showAbsen(user);
  else
    document.getElementById("btnAbsen").style.display="none";
}

// ==== ODP ====
async function showODP(user){
  const c=document.getElementById("content");
  const res=await window.appApi.getList("odp");
  let html='<h3>Daftar ODP</h3><button id="addOdpBtn">Tambah ODP</button><table><tr><th>Nama</th><th>Lokasi</th><th>Jalur</th><th>Deskripsi</th><th>Foto</th></tr>';
  res.data.forEach(r=>html+=`<tr>
  <td>${r.nama}</td>
  <td>${r.lokasi}</td>
  <td>${r.jalur}</td>
  <td>${r.desc}</td>
  <td>${r.foto?'<img src="'+r.foto+'" style="max-width:80px">':''}</td>
  ${user.role==="admin" ? `<td><button onclick="deleteData('odp','${r.nama}')">Hapus</button></td>` : ""}
</tr>`);
  html+='</table>';c.innerHTML=html;
  if(user.role==="admin")document.getElementById("addOdpBtn").onclick=openAddOdp;else document.getElementById("addOdpBtn").style.display="none";
}

function openAddOdp(){
  const c=document.getElementById("content");
  c.innerHTML=`<h3>Tambah ODP</h3>
  <input id="o_nama" placeholder="Nama ODP">
  <input id="o_lokasi" placeholder="Lokasi">
  <input id="o_jalur" placeholder="Jalur">
  <textarea id="o_desc" placeholder="Deskripsi"></textarea>
  <input type="file" id="o_file">
  <button id="saveOdp">Simpan</button>`;
  
  document.getElementById("saveOdp").onclick=async()=>{
    const file=document.getElementById("o_file").files[0];
    let fotoURL="";
    if(file)fotoURL=await window.appApi.uploadFile(file,"ODP-Uploads");
    const payload={nama:o_nama.value,lokasi:o_lokasi.value,jalur:o_jalur.value,desc:o_desc.value,foto:fotoURL,ts:new Date().toISOString()};
    await window.appApi.save("odp",payload);
    alert("Tersimpan");
    showODP(JSON.parse(sessionStorage.getItem("app_user")));
  };
}

// ==== OLT ====
async function showOLT(user){
  const c=document.getElementById("content");
  const res=await window.appApi.getList("olt");
  let html='<h3>Daftar OLT</h3><button id="addOltBtn">Tambah OLT</button><table><tr><th>Nama</th><th>Lokasi</th><th>Deskripsi</th><th>Foto</th></tr>';
  res.data.forEach(r=>html+=`<tr><td>${r.nama}</td><td>${r.lokasi}</td><td>${r.desc}</td><td>${r.foto?'<img src="'+r.foto+'" style="max-width:80px">':''}</td></tr>`);
  html+='</table>';c.innerHTML=html;
  if(user.role==="admin")document.getElementById("addOltBtn").onclick=openAddOlt;else document.getElementById("addOltBtn").style.display="none";
}

function openAddOlt(){
  const c=document.getElementById("content");
  c.innerHTML=`<h3>Tambah OLT</h3>
  <input id="l_nama" placeholder="Nama OLT">
  <input id="l_lokasi" placeholder="Lokasi">
  <textarea id="l_desc" placeholder="Deskripsi"></textarea>
  <input type="file" id="l_file">
  <button id="saveOlt">Simpan</button>`;
  
  document.getElementById("saveOlt").onclick=async()=>{
    const file=document.getElementById("l_file").files[0];
    let fotoURL="";
    if(file)fotoURL=await window.appApi.uploadFile(file,"OLT-Uploads");
    const payload={nama:l_nama.value,lokasi:l_lokasi.value,desc:l_desc.value,foto:fotoURL,ts:new Date().toISOString()};
    await window.appApi.save("olt",payload);
    alert("Tersimpan");
    showOLT(JSON.parse(sessionStorage.getItem("app_user")));
  };
}

// ==== JALUR & ABSEN (placeholder) ====
function showJalur(){document.getElementById("content").innerHTML="<p>Fitur Jalur akan ditambahkan</p>";}
function showAbsen(){document.getElementById("content").innerHTML="<p>Fitur Absen akan ditambahkan</p>";}
                   
