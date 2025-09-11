// === scriptData.js ===
const BACKEND_URL = "https://script.google.com/macros/s/AKfycbxzqgaZV2J0Q3r3T5Zbuo-xofm1oHmxhG6a-xrREXaWY-YP0SJT7cigYpl7_m-cdo_9/exec"; // <-- Masukkan URL Web App di sini

const LS_USERS_KEY="app_users_v6",LS_ABSEN_KEY="app_absen_v6",LS_ODP_KEY="app_odp_v6",LS_JALUR_KEY="app_jalur_v6",LS_OLT_KEY="app_olt_v6";

async function apiRequest(path,data){
  if(!BACKEND_URL) return localFallback(path,data);
  const res = await fetch(BACKEND_URL+"?path="+path,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(data||{})
  });
  return await res.json();
}

function ensureLS(key,val){if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(val));}
(function init(){
  ensureLS(LS_USERS_KEY,[{id:"admin",email:"admin@example.com",phone:"081000",pw:"admin",role:"admin"},
                         {id:"Ramdan",email:"ramdan@example.com",phone:"0811222333",pw:"122",role:"user"}]);
  ensureLS(LS_ABSEN_KEY,[]);
  ensureLS(LS_ODP_KEY,[]);
  ensureLS(LS_JALUR_KEY,[]);
  ensureLS(LS_OLT_KEY,[]);
})();

// === Upload File dengan Folder Dinamis ===
async function uploadFile(file, folder="Uploads-Umum"){
  if(!BACKEND_URL){alert("Upload hanya bisa online");return"";}
  const base64=await fileToBase64(file);
  const payload={fileName:file.name,mimeType:file.type,fileData:base64.split(",")[1],folder};
  const res=await apiRequest("upload",payload);
  return res.ok?res.url:"";
}

function fileToBase64(file){
  return new Promise((resolve,reject)=>{
    const r=new FileReader();
    r.onload=()=>resolve(r.result);
    r.onerror=reject;
    r.readAsDataURL(file);
  });
}

function localFallback(path,data){
  const map={users:LS_USERS_KEY,absen:LS_ABSEN_KEY,odp:LS_ODP_KEY,jalur:LS_JALUR_KEY,olt:LS_OLT_KEY};
  if(path==="/auth"){const u=JSON.parse(localStorage.getItem(map.users)||"[]").find(x=>x.id===data.id&&x.pw===data.pw);return u?{ok:true,user:u}:{ok:false,message:"Gagal login"};}
  if(path==="/register"){const arr=JSON.parse(localStorage.getItem(map.users)||"[]");if(arr.some(x=>x.id===data.id))return{ok:false,message:"ID sudah ada"};arr.push({...data,role:"user"});localStorage.setItem(map.users,JSON.stringify(arr));return{ok:true};}
  if(path==="/getList")return{ok:true,data:JSON.parse(localStorage.getItem(map[data.which])||"[]")};
  if(path==="/save"){const arr=JSON.parse(localStorage.getItem(map[data.which])||"[]");arr.push(data.payload);localStorage.setItem(map[data.which],JSON.stringify(arr));return{ok:true};}
  return{ok:false};
}

window.appApi={
  auth:(id,pw)=>apiRequest("/auth",{id,pw}),
  register:(p)=>apiRequest("/register",p),
  getList:(w)=>apiRequest("/getList",{which:w}),
  save:(w,p)=>apiRequest("/save",{which:w,payload:p}),
  uploadFile
};

window.appApi = {
  auth:(id,pw)=>apiRequest("/auth",{id,pw}),
  register:(p)=>apiRequest("/register",p),
  getList:(w)=>apiRequest("/getList",{which:w}),
  save:(w,p)=>apiRequest("/save",{which:w,payload:p}),
  deleteRow:(w,match)=>apiRequest("/deleteRow",{which:w,match}),
  uploadFile
};
                          
