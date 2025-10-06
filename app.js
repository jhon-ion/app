// ===================================================
// 🚀 ION APP - APP.JS (NO DUMMY, FULL ONLINE MODE)
// ===================================================
// Kompatibel: localhost, Trabedit live server, file://, online
// Pastikan ganti SHEET_URL dengan link Web App kamu (akhiran /exec)

const SHEET_URL = "https://script.google.com/macros/s/AKfycbzXW-zSyO8eDHbodYR3NbtVdVlRn4seqGdfrbg4At76oaL-LjhIoWL4ATuUsDWVDp81-Q/exec";

console.log("%cMode: ONLINE (SHEET)", "color:#fff; background:#2563eb; padding:4px 8px; border-radius:4px");

// ===================================================
// 🌐 KOMUNIKASI KE GOOGLE APPS SCRIPT
// ===================================================
async function callSheet(action, payload = {}) {
  if (!SHEET_URL || !SHEET_URL.startsWith("https://")) {
    throw new Error("SHEET_URL belum diisi atau tidak valid di app.js");
  }

  const res = await fetch(SHEET_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action, ...payload }),
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    console.error("Respon bukan JSON valid:", text);
    throw new Error("Respons dari Apps Script tidak valid.");
  }

  if (!json.ok) throw new Error(json.message || "Kesalahan di sisi server Apps Script.");
  return json.data;
}

// ===================================================
// 👥 MEMBER API
// ===================================================
window.MemberAPI = {
  fetchMembers: () => callSheet("member_fetch"),
  addMember: (entry) => callSheet("member_add", { entry }),
  updateMember: (entry) => callSheet("member_update", { entry }),
  deleteMember: (nip) => callSheet("member_delete", { nip }),
};

// ===================================================
// 🗂️ ODP API
// ===================================================
window.OdpAPI = {
  fetchOdp: () => callSheet("odp_fetch"),
  addOdp: (entry) => callSheet("odp_add", { entry }),
  updateOdp: (entry) => callSheet("odp_update", { entry }),
  deleteOdp: (namaOdp) => callSheet("odp_delete", { namaOdp }),
};

// ===================================================
// 📋 LAPORAN API
// ===================================================
window.LaporanAPI = {
  addInstalasiReport: (entry) => callSheet("laporan_instalasi_add", { entry }),
  addMaintenanceReport: (entry) => callSheet("laporan_maintenance_add", { entry }),
};

// ===================================================
// 🔐 LOGIN USER
// ===================================================
async function loginUser(nip) {
  try {
    const members = await MemberAPI.fetchMembers();
    if (!Array.isArray(members)) throw new Error("Data member tidak valid dari server.");

    const user = members.find(u => String(u.nip).trim() === String(nip).trim());
    return user || null;
  } catch (error) {
    console.error("Login error:", error);
    if (typeof Swal !== "undefined")
      Swal.fire("Error", `Gagal mengambil data: ${error.message}`, "error");
    return null;
  }
}

// ===================================================
// 🧰 UTIL
// ===================================================
function safeParseJson(str) {
  try { return JSON.parse(str); } catch { return null; }
}

// ===================================================
// 🚀 INIT PAGE HANDLER
// ===================================================
document.addEventListener("DOMContentLoaded", () => {

  // ---------- LOGIN PAGE ----------
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nipInput = document.getElementById("nip");
      const nip = nipInput?.value?.trim();
      if (!nip) return;

      const loginButton = loginForm.querySelector("button");
      const prevText = loginButton.textContent;
      loginButton.disabled = true;
      loginButton.textContent = "Loading...";

      try {
        const user = await loginUser(nip);
        if (!user) {
          Swal.fire("Gagal", "NIP tidak ditemukan atau jaringan bermasalah.", "error");
          return;
        }

        localStorage.setItem("user", JSON.stringify(user));
        await Swal.fire("Sukses", `${user.nama} berhasil login sebagai ${user.role}`, "success");

        window.location.href = "beranda.html";
      } catch (err) {
        console.error("Unhandled login error:", err);
        Swal.fire("Error", err.message || "Kesalahan login.", "error");
      } finally {
        loginButton.disabled = false;
        loginButton.textContent = prevText;
      }
    });
  }

  // ---------- BERANDA ----------
  const user = safeParseJson(localStorage.getItem("user"));
  const userNameEl = document.getElementById("userName");
  const userRoleEl = document.getElementById("userRole");
  const menuGrid = document.getElementById("menuGrid");

  if (user && menuGrid) {
    userNameEl.textContent = user.nama || "-";
    userRoleEl.textContent = (user.role || "-").toUpperCase();

    const menuAll = [
      { name: "Member", link: "isi/menej-member/index.html", icon: "users" },
      { name: "ODP", link: "isi/menej-odp/index.html", icon: "database" },
      { name: "Absen", link: "isi/absen/index.html", icon: "calendar-check" },
      { name: "Laporan", link: "isi/laporan/index.html", icon: "file-plus" },
      { name: "View Laporan", link: "isi/view-laporan/index.html", icon: "file-text" },
      { name: "View ODP", link: "isi/view-odp/index.html", icon: "layers" },
    ];

    const menuTeamJl = menuAll.filter(m => m.name !== "Member" && m.name !== "ODP");
    const menuMember = menuAll.filter(m => ["Laporan", "View Laporan", "View ODP", "Instalasi", "Absen"].includes(m.name));

    let menus = [];
    if (user.role === "admin" || user.role === "admin_inti") menus = menuAll;
    else if (user.role === "team jl") menus = menuTeamJl;
    else menus = menuMember;

    menuGrid.innerHTML = menus.map(m => `
      <a class="menu-item" href="${m.link}">
        <i data-lucide="${m.icon}"></i><span>${m.name}</span>
      </a>`).join("");

    if (typeof lucide !== "undefined") lucide.createIcons();
  } else if (!user && loginForm == null) {
    window.location.href = "index.html";
  }

  // ---------- LOGOUT ----------
  const btnLogout = document.getElementById("btnLogout");
  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      localStorage.removeItem("user");
      window.location.href = "index.html";
    });
  }
});
        
