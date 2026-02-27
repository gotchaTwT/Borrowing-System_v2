let txCounter = 1001;
let transactions = [];
let equipment = [
  { id:"FAN-01",     code:"EQ-001", name:"Electric Fan", quantity:10 },
  { id:"BALL-01",    code:"EQ-002", name:"Ball",         quantity:10 },
  { id:"SPEAKER-01", code:"EQ-003", name:"Speaker",      quantity:10 },
  { id:"MONITOR-01", code:"EQ-004", name:"Monitor",      quantity:10 }
];

const students = {
  "2024-08-01079":{ name:"Johnree Mathew A. GO",   course:"BSIT", year:"2nd Year" },
  "2024-06-00060":{ name:"Jashzel Yap",             course:"BSIT", year:"2nd Year" },
  "2024-07-00533":{ name:"John Patrick Samson",     course:"BSIT", year:"2nd Year" },
  "2024-07-00321":{ name:"Mark Joseph C. Tugade",   course:"BSIT", year:"2nd Year" },
  "2024-08-02001":{ name:"Alice Santos",            course:"BSMM", year:"3rd Year" },
  "2024-08-03002":{ name:"Bob Cruz",                course:"BSEd", year:"4th Year" },
  "2024-08-04003":{ name:"Charlie Reyes",           course:"BSA",  year:"2nd Year" },
  "2024-08-05004":{ name:"Dana Lopez",              course:"BSHM", year:"1st Year" }
};

const subjectsByCourse = {
  BSIT:["Programming","OOP","Data Structures","DB Management","Web Dev","Computer Networks"],
  BSMM:["Marketing","Consumer Behavior","Sales Management","Advertising","Digital Marketing"],
  BSEd:["Foundations of Education","Curriculum Development","Educational Psychology","Assessment of Learning","Teaching Strategies"],
  BSA: ["Financial Accounting","Cost Accounting","Auditing","Taxation","Business Law"],
  BSHM:["Hospitality Management","Food & Beverage Service","Front Office Operations","Housekeeping","Tourism Management"]
};

const ADMIN_PASS = "admin123";
const ADMIN_ID   = "3636-36-36363";
let currentQrItem = null; // currently shown in QR modal
let lastAddedId = null; // track newly added equipment for highlight


// ═══════════════════ STORAGE ═══════════════════
function loadData() {
  try {
    if (localStorage.getItem("eq_transactions")) transactions = JSON.parse(localStorage.getItem("eq_transactions"));
    if (localStorage.getItem("eq_equipment"))    equipment    = JSON.parse(localStorage.getItem("eq_equipment"));
    if (localStorage.getItem("eq_txCounter"))    txCounter    = parseInt(localStorage.getItem("eq_txCounter")) || 1001;
  } catch(e) {}
}
function saveData() {
  localStorage.setItem("eq_transactions", JSON.stringify(transactions));
  localStorage.setItem("eq_equipment",    JSON.stringify(equipment));
  localStorage.setItem("eq_txCounter",    txCounter);
}

// ═══════════════════ QR CODE HELPERS ═══════════════════
/**
 * Build the QR data string for an equipment item.
 * Contains all key fields so scanners get full info.
 */
function buildQrData(item) {
  const borrowed = transactions.filter(t => t.item === item.name && t.status === "Borrowed").length;
  return [
    "EQUIPTRACK",
    "ID: "       + item.id,
    "Code: "     + item.code,
    "Name: "     + item.name,
    "Qty: "      + item.quantity,
    "Status: "   + (item.quantity > 0 ? "Available" : "Unavailable"),
    "Borrowed: " + borrowed,
    "Scan Date: "+ new Date().toLocaleDateString()
  ].join("\n");
}

/**
 * Generate a QR code into a given container element.
 * Returns the QRCode instance.
 */
function generateQr(container, item, size) {
  container.innerHTML = "";
  return new QRCode(container, {
    text: buildQrData(item),
    width:  size,
    height: size,
    colorDark:  "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });
}

// ═══════════════════ QR PANEL ═══════════════════
function refreshQrPanel() {
  const grid = document.getElementById("qrAllGrid");
  grid.innerHTML = "";

  if (equipment.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><i class="fas fa-qrcode"></i><p>No equipment added yet.</p></div>`;
    return;
  }

  equipment.forEach(item => {
    const avail    = item.quantity > 0;
    const borrowed = transactions.filter(t => t.item === item.name && t.status === "Borrowed").length;

    const card = document.createElement("div");
    card.className = "qr-item-card" + (item.id === lastAddedId ? " new-item-flash" : "");

    // QR container
    const qrDiv = document.createElement("div");
    qrDiv.className = "qr-item-card-qr";
    const qrInner = document.createElement("div");
    qrDiv.appendChild(qrInner);

    card.appendChild(qrDiv);

    // Info section
    const info = document.createElement("div");
    info.className = "qr-item-card-info";
    info.innerHTML = `
      <div class="qr-item-card-name">${item.name}${item.id === lastAddedId ? '<span class="badge-new">NEW</span>' : ''}</div>
      <div class="qr-item-card-meta">${item.code} &bull; ${item.id}</div>
      <div class="qr-item-card-footer">
        <span class="badge ${avail ? 'badge-avail' : 'badge-unavail'}">${avail ? 'In Stock' : 'Out of Stock'}</span>
        <span style="font-family:var(--mono);font-size:0.7rem;color:var(--muted);">Qty: ${item.quantity} &bull; Borrowed: ${borrowed}</span>
      </div>
    `;
    card.appendChild(info);

    grid.appendChild(card);

    // Generate QR after appending (needs DOM)
    requestAnimationFrame(() => {
      generateQr(qrInner, item, 150);
    }, 0);

    // Click to show modal
    card.addEventListener("click", () => showQrModal(item));
  });
}

// ═══════════════════ QR MODAL ═══════════════════
function showQrModal(item) {
  currentQrItem = item;
  const avail   = item.quantity > 0;
  const borrowed = transactions.filter(t => t.item === item.name && t.status === "Borrowed").length;

  document.getElementById("qrModalTitle").textContent = item.name + " — QR Code";
  document.getElementById("qrModalName").textContent  = item.name;
  document.getElementById("qrModalSub").textContent   = item.code + " / " + item.id;

  // Generate big QR
  const canvas = document.getElementById("qrModalCanvas");
  canvas.innerHTML = "";
  generateQr(canvas, item, 220);

  // Data rows
  document.getElementById("qrDataGrid").innerHTML = `
    <div class="qr-data-row"><span class="qr-data-key">Equipment ID</span><span class="qr-data-val">${item.id}</span></div>
    <div class="qr-data-row"><span class="qr-data-key">Code</span><span class="qr-data-val">${item.code}</span></div>
    <div class="qr-data-row"><span class="qr-data-key">Name</span><span class="qr-data-val">${item.name}</span></div>
    <div class="qr-data-row"><span class="qr-data-key">Stock Qty</span><span class="qr-data-val">${item.quantity}</span></div>
    <div class="qr-data-row">
      <span class="qr-data-key">Status</span>
      <span class="badge ${avail ? 'badge-avail' : 'badge-unavail'}">${avail ? 'Available' : 'Unavailable'}</span>
    </div>
    <div class="qr-data-row"><span class="qr-data-key">Currently Borrowed</span><span class="qr-data-val">${borrowed} unit(s)</span></div>
  `;

  document.getElementById("qrOverlay").classList.add("active");
}

function closeQrModal() {
  document.getElementById("qrOverlay").classList.remove("active");
  currentQrItem = null;
}

document.getElementById("qrOverlay").addEventListener("click", function(e) {
  if (e.target === this) closeQrModal();
});

// Download QR as PNG
function downloadQr() {
  if (!currentQrItem) return;
  const canvas = document.querySelector("#qrModalCanvas canvas");
  if (!canvas) { toast("QR not ready yet.", "error"); return; }
  const link = document.createElement("a");
  link.download = "QR_" + currentQrItem.id + ".png";
  link.href = canvas.toDataURL("image/png");
  link.click();
  toast("QR code downloaded!", "success");
}

// Print single QR
function printSingleQr() {
  if (!currentQrItem) return;
  const item = currentQrItem;
  const printArea = document.getElementById("qr-print-area");
  printArea.innerHTML = "";

  const card = document.createElement("div");
  card.className = "qr-print-card";
  const qrDiv = document.createElement("div");
  card.innerHTML = `<div class="qr-print-card-name">${item.name}</div>`;
  card.appendChild(qrDiv);
  card.innerHTML += `<div>${item.code}</div><div>${item.id}</div><div>Qty: ${item.quantity}</div>`;
  printArea.appendChild(card);

  new QRCode(qrDiv, {
    text: buildQrData(item),
    width: 130, height: 130,
    colorDark: "#000", colorLight: "#fff",
    correctLevel: QRCode.CorrectLevel.H
  });

  setTimeout(() => window.print(), 300);
}

// Print ALL QR codes
document.getElementById("printAllQrBtn").addEventListener("click", function() {
  const printArea = document.getElementById("qr-print-area");
  printArea.innerHTML = "";

  equipment.forEach(item => {
    const card = document.createElement("div");
    card.className = "qr-print-card";
    const nameDiv = document.createElement("div");
    nameDiv.className = "qr-print-card-name";
    nameDiv.textContent = item.name;
    card.appendChild(nameDiv);

    const qrDiv = document.createElement("div");
    card.appendChild(qrDiv);

    const codeDiv = document.createElement("div");
    codeDiv.textContent = item.code + " / " + item.id;
    card.appendChild(codeDiv);

    const qtyDiv = document.createElement("div");
    qtyDiv.textContent = "Stock: " + item.quantity;
    card.appendChild(qtyDiv);

    printArea.appendChild(card);

    new QRCode(qrDiv, {
      text: buildQrData(item),
      width: 120, height: 120,
      colorDark: "#000", colorLight: "#fff",
      correctLevel: QRCode.CorrectLevel.H
    });
  });

  setTimeout(() => window.print(), 500);
  toast("Printing " + equipment.length + " QR codes...", "info");
});

// Small QR thumbnail in admin equip cards
function buildEquipQrThumb(item) {
  const wrap = document.createElement("div");
  wrap.className = "equip-qr-thumb";
  wrap.title = "Click to view QR code";
  wrap.addEventListener("click", (e) => {
    e.stopPropagation();
    showQrModal(item);
  });
  requestAnimationFrame(() => generateQr(wrap, item, 44));
  return wrap;
}

// ═══════════════════ CLOCK ═══════════════════
function updateClock() {
  document.getElementById("clock").textContent = new Date().toLocaleString("en-PH", {
    weekday:"short", month:"short", day:"numeric",
    hour:"2-digit", minute:"2-digit", second:"2-digit"
  });
}
setInterval(updateClock, 1000);
updateClock();

// ═══════════════════ NAV TABS ═══════════════════
document.querySelectorAll(".nav-tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-tab").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("panel-" + btn.dataset.panel).classList.add("active");
    if (btn.dataset.panel === "history")  refreshHistory();
    if (btn.dataset.panel === "student" && document.getElementById("portalStudentId").value.trim()) lookupStudent();
    if (btn.dataset.panel === "qrcodes")  refreshQrPanel();
    if (btn.dataset.panel === "admin")    { refreshAdminEquip(); refreshAdminTx(); }
  });
});

// ═══════════════════ TOAST ═══════════════════
function toast(msg, type="info") {
  const icons = { success:"fa-check-circle", error:"fa-times-circle", info:"fa-info-circle" };
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.innerHTML = `<i class="fas ${icons[type]||icons.info}"></i><span>${msg}</span>`;
  document.getElementById("toast-container").appendChild(el);
  requestAnimationFrame(() => { el.classList.add("out"); setTimeout(() => el.remove(), 350); }, 4000);
}

// ═══════════════════ CONFIRM ═══════════════════
let _resolve = null;
function confirm2(title, body, label="Confirm", cls="btn-primary") {
  return new Promise(r => {
    _resolve = r;
    document.getElementById("confirmTitle").textContent = title;
    document.getElementById("confirmBody").textContent  = body;
    const btn = document.getElementById("confirmOkBtn");
    btn.textContent = label;
    btn.className = `btn ${cls}`;
    document.getElementById("confirmModal").classList.add("active");
  });
}
function closeModal(val=false) {
  document.getElementById("confirmModal").classList.remove("active");
  if (_resolve) { _resolve(val); _resolve = null; }
}
document.getElementById("confirmOkBtn").addEventListener("click", () => closeModal(true));
document.getElementById("confirmModal").addEventListener("click", e => {
  if (e.target.id === "confirmModal") closeModal(false);
});

// ═══════════════════ MSG ═══════════════════
function showMsg(id, text, type) {
  const el = document.getElementById(id);
  el.textContent = text; el.className = `msg ${type}`; el.style.display = "block";
  setTimeout(() => el.style.display = "none", 5000);
}

// ═══════════════════ INIT DROPDOWNS ═══════════════════
function initDropdowns() {
  const rooms = ["2A"];
  ["A","B","C","D","E","F","G","H","I"].forEach(l => rooms.push("3"+l));
  ["A","B","C","D","E","F","G","H","I"].forEach(l => rooms.push("4"+l));
  ["A","B","C","D","E","F","G"].forEach(l => rooms.push("5"+l));
  const roomSel = document.getElementById("specificRoom");
  rooms.forEach(r => { const o = document.createElement("option"); o.value = o.textContent = r; roomSel.appendChild(o); });

  const durs = [30,60,120,180,240,480,720,1440];
  const durSel = document.getElementById("duration");
  durSel.innerHTML = durs.map(d => `<option value="${d}">${d>=60?(d/60)+" hour(s)":d+" minutes"}</option>`).join("");
}

// ═══════════════════ EQUIP DROPDOWNS ═══════════════════
function refreshEquipDropdowns() {
  const equip = document.getElementById("equipSelect");
  const ret   = document.getElementById("returnSelect");
  equip.innerHTML = ""; ret.innerHTML = "";

  equipment.forEach(item => {
    const avail = item.quantity > 0;
    const o1 = document.createElement("option");
    o1.value = item.id;
    o1.textContent = `${item.name} (${item.code}) — Qty: ${item.quantity}`;
    o1.disabled = !avail;
    if (!avail) o1.style.color = "#6b7a99";
    equip.appendChild(o1);

    const hasBorrowed = transactions.find(t => t.item === item.name && t.status === "Borrowed");
    if (hasBorrowed || item.quantity < 10) {
      const o2 = document.createElement("option");
      o2.value = item.id;
      o2.textContent = `${item.name} (${item.code})`;
      ret.appendChild(o2);
    }
  });

  if (ret.options.length === 0) {
    const o = document.createElement("option"); o.textContent = "— No items borrowed —"; o.disabled = true; ret.appendChild(o);
  }
}

// ═══════════════════ BORROW FORM ═══════════════════
function formatStudentId(input) {
  let v = input.value.replace(/\D/g,"");
  let f = v.slice(0,4);
  if (v.length > 4) f += "-" + v.slice(4,6);
  if (v.length > 6) f += "-" + v.slice(6,11);
  input.value = f;
}

document.getElementById("studentId").addEventListener("input", function() {
  formatStudentId(this); onStudentIdChange();
});
document.getElementById("returnStudentId").addEventListener("input", function() { formatStudentId(this); });

function onStudentIdChange() {
  const id = document.getElementById("studentId").value.trim();
  const s  = students[id];
  const card = document.getElementById("studentCard");
  if (s || id === ADMIN_ID) {
    const info = s || { name:"Administrator", course:"Admin", year:"—" };
    document.getElementById("sName").textContent       = info.name;
    document.getElementById("sCourse").textContent     = info.course;
    document.getElementById("sYear").textContent       = info.year;
    document.getElementById("sBorrowTime").textContent = new Date().toLocaleString();
    card.style.display = "block";
    if (s) {
      const subj = document.getElementById("subject");
      subj.innerHTML = '<option value="">— Select Subject —</option>';
      (subjectsByCourse[s.course]||[]).forEach(sub => { const o = document.createElement("option"); o.value = o.textContent = sub; subj.appendChild(o); });
      subj.disabled = false;
    }
    document.getElementById("studentId").classList.add("valid");
    document.getElementById("studentId").classList.remove("invalid");
  } else {
    card.style.display = "none";
    document.getElementById("subject").disabled = true;
    document.getElementById("subject").innerHTML = '<option value="">— Select Subject —</option>';
    document.getElementById("studentId").classList.remove("valid");
    document.getElementById("studentId").classList.toggle("invalid", id.length > 0);
  }
  toggleBorrowBtn();
}

document.getElementById("purpose").addEventListener("change", function() {
  const c = document.getElementById("customPurpose");
  c.style.display = this.value === "Others" ? "block" : "none";
  if (this.value !== "Others") c.value = "";
  toggleBorrowBtn();
});
document.getElementById("customPurpose").addEventListener("input", toggleBorrowBtn);
document.getElementById("equipSelect").addEventListener("change", toggleBorrowBtn);
document.getElementById("subject").addEventListener("change", toggleBorrowBtn);
document.getElementById("mainArea").addEventListener("change", function() {
  document.getElementById("specificRoom").disabled = !!this.value;
  if (this.value) document.getElementById("specificRoom").value = "";
  toggleBorrowBtn();
});
document.getElementById("specificRoom").addEventListener("change", function() {
  document.getElementById("mainArea").disabled = !!this.value;
  if (this.value) document.getElementById("mainArea").value = "";
  toggleBorrowBtn();
});

function getLabRoom() { return document.getElementById("mainArea").value || document.getElementById("specificRoom").value || ""; }
function getPurpose() { const p = document.getElementById("purpose").value; return p === "Others" ? document.getElementById("customPurpose").value.trim() : p; }

function toggleBorrowBtn() {
  const id = document.getElementById("studentId").value.trim();
  const ok = (students[id] || id === ADMIN_ID)
    && document.getElementById("equipSelect").value
    && getPurpose()
    && document.getElementById("subject").value
    && getLabRoom();
  document.getElementById("borrowBtn").disabled = !ok;
}

document.getElementById("borrowBtn").addEventListener("click", async function() {
  const id = document.getElementById("studentId").value.trim();
  const s  = students[id] || { name:"Administrator", course:"Admin", year:"Admin" };
  const equipId = document.getElementById("equipSelect").value;
  const item    = equipment.find(e => e.id === equipId);
  if (!item || item.quantity === 0) { showMsg("borrowMsg","Selected equipment is not available!","error"); return; }

  const ok = await confirm2("Confirm Borrow", `Borrow "${item.name} (${item.code})" for ${s.name}?`, "Borrow", "btn-primary");
  if (!ok) return;

  item.quantity--;
  const now = new Date();
  const dur = parseInt(document.getElementById("duration").value);
  transactions.push({
    tx: txCounter++, studentID: id, student: s.name, course: s.course, year: s.year,
    item: item.name, code: item.code, purpose: getPurpose(),
    subject: document.getElementById("subject").value,
    lab: getLabRoom(), borrowTime: now.toLocaleString(), duration: dur,
    returnTime: "—", status: "Borrowed", condition: "—", penalty: 0,
    deadline: new Date(now.getTime() + dur*60000).toISOString()
  });

  saveData(); refreshEquipDropdowns(); updateStats(); clearBorrowForm();
  toast(`${item.name} borrowed by ${s.name}`, "success");
  showMsg("borrowMsg", `Success! ${item.name} borrowed by ${s.name}`, "success");
});

document.getElementById("clearBtn").addEventListener("click", clearBorrowForm);
function clearBorrowForm() {
  document.getElementById("studentId").value = "";
  document.getElementById("customPurpose").value = "";
  document.getElementById("customPurpose").style.display = "none";
  ["purpose","subject","mainArea","specificRoom"].forEach(id => {
    const el = document.getElementById(id);
    el.selectedIndex = 0;
    if (id === "subject") el.disabled = true;
  });
  document.getElementById("mainArea").disabled = false;
  document.getElementById("specificRoom").disabled = false;
  document.getElementById("studentCard").style.display = "none";
  document.getElementById("studentId").className = "";
  toggleBorrowBtn();
}

// ═══════════════════ RETURN ═══════════════════
document.getElementById("returnBtn").addEventListener("click", async function() {
  const id      = document.getElementById("returnStudentId").value.trim();
  const equipId = document.getElementById("returnSelect").value;
  const cond    = document.getElementById("condition").value;
  if (!id) { showMsg("returnMsg","Please enter Student ID.","error"); return; }
  const item = equipment.find(e => e.id === equipId);
  if (!item) { showMsg("returnMsg","Invalid equipment selection.","error"); return; }
  const tx = [...transactions].reverse().find(t => t.item === item.name && t.status === "Borrowed" && t.studentID === id);
  if (!tx) { showMsg("returnMsg",`No active borrow for Student ID ${id} with ${item.name}.`,"error"); return; }

  const ok = await confirm2("Confirm Return", `Return "${item.name}" for ID ${id}? Condition: ${cond}.`, "Confirm Return", "btn-success");
  if (!ok) return;

  item.quantity++;
  const now = new Date();
  let penalty = 0;
  if (now > new Date(tx.deadline)) penalty += 50;
  if (cond !== "OK") penalty += 100;
  tx.returnTime = now.toLocaleString(); tx.condition = cond; tx.penalty = penalty; tx.status = "Returned";

  saveData(); refreshEquipDropdowns(); updateStats();
  toast(`${item.name} returned` + (penalty > 0 ? ` — Penalty: ₱${penalty}` : ""), penalty > 0 ? "error" : "success");
  showMsg("returnMsg", `Returned ${item.name}. ${penalty > 0 ? `Penalty: ₱${penalty}` : "No penalty."}`, penalty > 0 ? "error" : "success");
  document.getElementById("returnStudentId").value = "";
  document.getElementById("condition").selectedIndex = 0;
});

document.getElementById("clearReturnBtn").addEventListener("click", () => {
  document.getElementById("returnStudentId").value = "";
  document.getElementById("condition").selectedIndex = 0;
});

// ═══════════════════ HISTORY ═══════════════════
let historySortCol = ""; let historySortAsc = true;

function refreshHistory() {
  const q = document.getElementById("historySearch").value.toLowerCase();
  const sf = document.getElementById("statusFilter").value;

  let filtered = transactions.filter(t => {
    const mq = !q || [t.studentID,t.student,t.item,t.purpose,t.subject,t.lab].some(v => (v||"").toLowerCase().includes(q));
    return mq && (!sf || t.status === sf);
  });

  if (historySortCol) {
    filtered.sort((a,b) => {
      let va = a[historySortCol]||"", vb = b[historySortCol]||"";
      if (typeof va === "number") return historySortAsc ? va-vb : vb-va;
      return historySortAsc ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
  }

  const tbody = document.getElementById("historyBody");
  tbody.innerHTML = "";
  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="14"><div class="empty-state"><i class="fas fa-inbox"></i><p>No transactions found.</p></div></td></tr>`;
  } else {
    filtered.forEach(t => {
      const pen   = t.penalty > 0 ? `<span style="color:var(--red);font-family:var(--mono);font-weight:600;">₱${t.penalty}</span>` : `<span style="color:var(--muted);">—</span>`;
      const stat  = t.status === "Borrowed" ? `<span class="badge badge-borrowed">Borrowed</span>` : `<span class="badge badge-returned">Returned</span>`;
      const cond  = t.condition === "Damaged" ? `<span class="badge badge-damaged">${t.condition}</span>` : t.condition === "Forced Return" ? `<span class="badge badge-forced">${t.condition}</span>` : `<span style="color:var(--muted);font-size:.82rem;">${t.condition}</span>`;
      const dur   = t.duration >= 60 ? (t.duration/60)+"h" : t.duration+"m";
      const tr    = document.createElement("tr");
      tr.innerHTML = `
        <td class="mono">${t.studentID}</td><td>${t.student}</td>
        <td><span class="badge" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border)">${t.course}</span></td>
        <td style="font-weight:500;">${t.item}</td><td class="mono" style="color:var(--muted);">${t.code}</td>
        <td>${t.purpose}</td><td>${t.subject}</td><td class="mono" style="color:var(--muted);">${t.lab}</td>
        <td class="mono" style="font-size:.74rem;">${t.borrowTime}</td><td class="mono">${dur}</td>
        <td class="mono" style="font-size:.74rem;color:var(--muted);">${t.returnTime}</td>
        <td>${stat}</td><td>${cond}</td><td>${pen}</td>`;
      tbody.appendChild(tr);
    });
  }
  document.getElementById("historyCount").textContent = `${filtered.length} record${filtered.length!==1?"s":""}`;
}

document.getElementById("historySearch").addEventListener("input", refreshHistory);
document.getElementById("statusFilter").addEventListener("change", refreshHistory);
document.querySelectorAll("#historyTable th[data-col]").forEach(th => {
  th.addEventListener("click", () => {
    const col = th.dataset.col;
    historySortCol === col ? historySortAsc = !historySortAsc : (historySortCol = col, historySortAsc = true);
    document.querySelectorAll("#historyTable th").forEach(t => t.classList.remove("asc","desc"));
    th.classList.add(historySortAsc ? "asc" : "desc");
    refreshHistory();
  });
});

document.getElementById("exportBtn").addEventListener("click", () => {
  const headers = ["StudentID","Name","Course","Year","Item","Code","Purpose","Subject","Lab","BorrowTime","Duration","ReturnTime","Status","Condition","Penalty"];
  const rows = transactions.map(t => [t.studentID,t.student,t.course,t.year,t.item,t.code,t.purpose,t.subject,t.lab,t.borrowTime,t.duration,t.returnTime,t.status,t.condition,t.penalty].map(v => `"${String(v).replace(/"/g,'""')}"`).join(","));
  const a = document.createElement("a");
  a.href = "data:text/csv;charset=utf-8," + encodeURIComponent([headers.join(","),...rows].join("\n"));
  a.download = "transactions_" + new Date().toISOString().slice(0,10) + ".csv";
  a.click();
  toast("Exported " + transactions.length + " records","success");
});

// ═══════════════════ STATS ═══════════════════
function updateStats() {
  const totalQty = equipment.reduce((s,e) => s + e.quantity, 0);
  const borrowed = transactions.filter(t => t.status === "Borrowed").length;
  const totalPen = transactions.reduce((s,t) => s + (t.penalty||0), 0);
  document.getElementById("stat-total").textContent     = equipment.length;
  document.getElementById("stat-available").textContent = totalQty;
  document.getElementById("stat-borrowed").textContent  = borrowed;
  document.getElementById("stat-penalties").textContent = "₱" + totalPen;
}

// ═══════════════════ ADMIN ═══════════════════
function unlockAdmin() {
  if (document.getElementById("adminPassInput").value === ADMIN_PASS) {
    document.getElementById("adminGateCard").style.display = "none";
    document.getElementById("adminContent").style.display  = "block";
    refreshAdminEquip(); refreshAdminTx();
    toast("Admin panel unlocked","success");
  } else {
    toast("Incorrect password!","error");
    document.getElementById("adminPassInput").value = "";
  }
}

function lockAdmin() {
  document.getElementById("adminGateCard").style.display  = "block";
  document.getElementById("adminContent").style.display   = "none";
  document.getElementById("adminPassInput").value = "";
  toast("Admin panel locked","info");
}

function handleAddEquipment() {
  const name = document.getElementById("newEquipName").value.trim();
  const code = document.getElementById("newEquipCode").value.trim();
  const qty  = parseInt(document.getElementById("newEquipQty").value) || 10;
  if (!name || !code) { toast("Name and code are required.","error"); return; }
  if (equipment.find(e => e.code === code)) { toast("Code already exists.","error"); return; }
  const id = code.replace(/\s/g,"-").toUpperCase() + "-01";
  const newItem = { id, code, name, quantity: qty };
  lastAddedId = id;
  equipment.push(newItem);
  saveData(); refreshEquipDropdowns(); refreshAdminEquip(); updateStats();
  if (document.getElementById("panel-qrcodes").classList.contains("active")) refreshQrPanel();
  document.getElementById("newEquipName").value = "";
  document.getElementById("newEquipCode").value = "";
  document.getElementById("newEquipQty").value  = "10";
  toast("QR code generated for: " + name, "success");
  setTimeout(() => showQrModal(newItem), 200);
}


function refreshAdminEquip() {
  const grid = document.getElementById("equipGrid");
  grid.innerHTML = "";
  if (equipment.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><i class="fas fa-inbox"></i><p>No equipment.</p></div>`;
    return;
  }
  equipment.forEach((item, idx) => {
    const avail = item.quantity > 0;
    const card  = document.createElement("div");
    const isNew = item.id === lastAddedId;
    card.className = "equip-card" + (isNew ? " new-item-flash" : "");

    // QR thumbnail
    const thumb = buildEquipQrThumb(item);

    const info = document.createElement("div");
    info.className = "equip-info";
    info.innerHTML = `<div class="equip-name">${item.name}${isNew ? '<span class="badge-new">NEW</span>' : ''}</div><div class="equip-code">${item.code} / ${item.id}</div>`;

    const qtyWrap = document.createElement("div");
    qtyWrap.className = "equip-qty-wrap";
    qtyWrap.innerHTML = `
      <input type="number" class="qty-input" value="${item.quantity}" min="0" max="100" title="Edit quantity" onchange="updateQty(${idx},this.value)">
      <span class="badge ${avail?'badge-avail':'badge-unavail'}">${avail?'In Stock':'Out'}</span>`;

    const actions = document.createElement("div");
    actions.className = "equip-actions";
    actions.innerHTML = `
      <button class="btn btn-qr btn-sm" title="View QR Code" onclick="showQrModal(equipment[${idx}])"><i class="fas fa-qrcode"></i></button>
      <button class="btn btn-ghost btn-sm" title="Edit" onclick="editEquip(${idx})"><i class="fas fa-edit"></i></button>
      <button class="btn btn-danger btn-sm" title="Delete" onclick="deleteEquip(${idx})"><i class="fas fa-trash"></i></button>`;

    card.appendChild(thumb);
    card.appendChild(info);
    card.appendChild(qtyWrap);
    card.appendChild(actions);
    grid.appendChild(card);
  });
}

function updateQty(idx, val) {
  const v = parseInt(val);
  if (isNaN(v) || v < 0) { toast("Invalid quantity.","error"); return; }
  equipment[idx].quantity = v;
  saveData(); refreshEquipDropdowns(); updateStats(); refreshAdminEquip();
}

function editEquip(idx) {
  const item    = equipment[idx];
  const newName = prompt("Equipment Name:", item.name); if (!newName) return;
  const newCode = prompt("Equipment Code:", item.code); if (!newCode) return;
  const newQty  = parseInt(prompt("Quantity (0-100):", item.quantity));
  if (isNaN(newQty) || newQty < 0) { toast("Invalid quantity.","error"); return; }
  item.name = newName.trim(); item.code = newCode.trim(); item.quantity = newQty;
  saveData(); refreshEquipDropdowns(); refreshAdminEquip(); updateStats();
  toast(`"${item.name}" updated.`,"success");
}

async function deleteEquip(idx) {
  const item = equipment[idx];
  const ok   = await confirm2("Delete Equipment", `Delete "${item.name} (${item.code})"? This cannot be undone.`, "Delete","btn-danger");
  if (!ok) return;
  equipment.splice(idx, 1);
  saveData(); refreshEquipDropdowns(); refreshAdminEquip(); updateStats();
  toast(`"${item.name}" deleted.`,"success");
}

function refreshAdminTx() {
  const q = (document.getElementById("adminSearch").value||"").toLowerCase();
  const filtered = transactions.filter(t =>
    !q || t.studentID.toLowerCase().includes(q) || t.student.toLowerCase().includes(q) || t.item.toLowerCase().includes(q)
  );
  const tbody = document.getElementById("adminBody");
  tbody.innerHTML = "";
  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><i class="fas fa-inbox"></i><p>No records.</p></div></td></tr>`;
  } else {
    filtered.forEach(t => {
      const stat = t.status === "Borrowed" ? `<span class="badge badge-borrowed">Borrowed</span>` : `<span class="badge badge-returned">Returned</span>`;
      const force = t.status === "Borrowed" ? `<button class="btn btn-amber btn-sm" onclick="forceReturn(${t.tx})"><i class="fas fa-undo"></i> Force Return</button>` : "";
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="mono">${t.studentID}</td><td>${t.student}</td><td>${t.item}</td>
        <td class="mono" style="font-size:.74rem;color:var(--muted);">${t.borrowTime}</td><td>${stat}</td>
        <td><div style="display:flex;gap:6px;flex-wrap:wrap;">${force}<button class="btn btn-danger btn-sm" onclick="deleteTx(${t.tx})"><i class="fas fa-trash"></i></button></div></td>`;
      tbody.appendChild(tr);
    });
  }
  document.getElementById("adminCount").textContent = `${filtered.length} record${filtered.length!==1?"s":""}`;
}

document.getElementById("adminSearch").addEventListener("input", refreshAdminTx);

async function deleteTx(txId) {
  const tx = transactions.find(t => t.tx === txId); if (!tx) return;
  const ok = await confirm2("Delete Transaction", `Delete transaction for ${tx.student} — ${tx.item}?`, "Delete","btn-danger");
  if (!ok) return;
  transactions = transactions.filter(t => t.tx !== txId);
  saveData(); refreshAdminTx(); refreshHistory(); updateStats();
  toast("Transaction deleted.","success");
}

async function forceReturn(txId) {
  const tx = transactions.find(t => t.tx === txId); if (!tx || tx.status !== "Borrowed") return;
  const ok = await confirm2("Force Return", `Force return "${tx.item}" for ${tx.student}? ₱200 penalty will apply.`, "Force Return","btn-amber");
  if (!ok) return;
  const item = equipment.find(e => e.name === tx.item); if (item) item.quantity++;
  tx.returnTime = new Date().toLocaleString(); tx.condition = "Forced Return"; tx.penalty = 200; tx.status = "Returned";
  saveData(); refreshEquipDropdowns(); refreshAdminTx(); updateStats();
  toast(`Force return applied. Penalty: ₱200`,"error");
}


// ═══════════════════ STUDENT PORTAL ═══════════════════
document.getElementById("portalStudentId").addEventListener("input", function() {
  let v = this.value.replace(/\D/g,"");
  let f = v.slice(0,4);
  if (v.length > 4) f += "-" + v.slice(4,6);
  if (v.length > 6) f += "-" + v.slice(6,11);
  this.value = f;
});

document.getElementById("portalStudentId").addEventListener("keydown", function(e) {
  if (e.key === "Enter") lookupStudent();
});

function lookupStudent() {
  const id = document.getElementById("portalStudentId").value.trim();
  if (!id) { showMsg("portalMsg","Please enter your Student ID.","error"); return; }
  const s = students[id];
  if (!s) { showMsg("portalMsg","Student ID not found. Please check and try again.","error"); document.getElementById("studentProfile").style.display = "none"; return; }

  const myTx        = transactions.filter(t => t.studentID === id);
  const activeTx    = myTx.filter(t => t.status === "Borrowed");
  const returnedTx  = myTx.filter(t => t.status !== "Borrowed");
  const totalPenalty= myTx.reduce((sum,t) => sum + (t.penalty || 0), 0);
  const unpaidPenalty = transactions.filter(t => t.studentID === id && t.status === "Returned" && (t.penalty || 0) > 0).reduce((sum,t) => sum + t.penalty, 0);

  // Fill profile
  document.getElementById("profileName").textContent    = s.name;
  document.getElementById("profileId").textContent      = id;
  document.getElementById("profileCourse").textContent  = s.course;
  document.getElementById("profileYear").textContent    = s.year;
  document.getElementById("profileTotal").textContent   = myTx.length;
  document.getElementById("profileActiveBorrows").textContent = activeTx.length;
  document.getElementById("profileReturned").textContent      = returnedTx.length;

  // Penalty banner
  const banner = document.getElementById("penaltyBanner");
  if (totalPenalty > 0) {
    banner.className = "penalty-banner has-penalty";
    document.getElementById("penaltyIcon").textContent    = "⚠️";
    document.getElementById("penaltyTitle").textContent   = "You have outstanding penalties";
    document.getElementById("penaltySub").textContent     = "Please settle your penalty at the borrowing desk.";
    document.getElementById("penaltyAmount").textContent  = "₱" + totalPenalty;
  } else {
    banner.className = "penalty-banner no-penalty";
    document.getElementById("penaltyIcon").textContent    = "✅";
    document.getElementById("penaltyTitle").textContent   = "No penalties — great job!";
    document.getElementById("penaltySub").textContent     = "You have returned all items in good condition and on time.";
    document.getElementById("penaltyAmount").textContent  = "₱0";
  }

  // Active borrows list
  const activeList = document.getElementById("activeBorrowsList");
  if (activeTx.length === 0) {
    activeList.innerHTML = "<div style=\"color:var(--muted);font-size:0.82rem;padding:10px 0;\">No active borrows.</div>";
  } else {
    activeList.innerHTML = activeTx.map(t => {
      const now      = new Date();
      const deadline = new Date(t.deadline);
      const overdue  = now > deadline;
      const diffMs   = deadline - now;
      const diffH    = Math.floor(Math.abs(diffMs) / 3600000);
      const diffM    = Math.floor((Math.abs(diffMs) % 3600000) / 60000);
      const timeStr  = overdue
        ? "Overdue by " + diffH + "h " + diffM + "m"
        : "Due in " + diffH + "h " + diffM + "m";
      return "<div class=\"active-borrow-card\">"
        + "<div class=\"active-borrow-icon\"><i class=\"fas fa-hand-holding\"></i></div>"
        + "<div class=\"active-borrow-info\">"
          + "<div class=\"active-borrow-name\">" + t.item + " <span style=\"font-family:var(--mono);font-size:0.7rem;color:var(--muted);\">" + t.code + "</span></div>"
          + "<div class=\"active-borrow-meta\">" + t.borrowTime + " &bull; " + (t.duration >= 60 ? t.duration/60 + "h" : t.duration + "m") + " &bull; " + t.lab + "</div>"
        + "</div>"
        + "<div class=\"active-borrow-deadline\">"
          + "<div class=\"deadline-label\">Deadline</div>"
          + "<div class=\"deadline-value " + (overdue ? "overdue" : "ok") + "\">" + timeStr + "</div>"
        + "</div>"
      + "</div>";
    }).join("");
  }

  // Tx history
  const txList = document.getElementById("portalTxList");
  if (myTx.length === 0) {
    txList.innerHTML = "<div style=\"color:var(--muted);font-size:0.82rem;padding:10px 0;\">No transaction records found.</div>";
  } else {
    txList.innerHTML = [...myTx].reverse().map(t => {
      const isBorrowed = t.status === "Borrowed";
      const penHtml = t.penalty > 0
        ? "<span class=\"tx-penalty\">Penalty: ₱" + t.penalty + "</span>"
        : (t.status !== "Borrowed" ? "<span style=\"color:var(--green);font-family:var(--mono);font-size:0.7rem;\">No penalty</span>" : "");
      return "<div class=\"tx-history-card\">"
        + "<div class=\"tx-history-dot " + (isBorrowed ? "borrowed" : "returned") + "\"></div>"
        + "<div class=\"tx-history-main\">"
          + "<div class=\"tx-history-item\">" + t.item + " <span style=\"font-family:var(--mono);font-size:0.68rem;color:var(--muted);\">" + t.code + "</span></div>"
          + "<div class=\"tx-history-meta\">"
            + t.borrowTime + " &bull; " + t.purpose + " &bull; " + t.lab
          + "</div>"
        + "</div>"
        + "<div class=\"tx-history-right\">"
          + "<span class=\"badge " + (isBorrowed ? "badge-borrowed" : "badge-returned") + "\">" + t.status + "</span>"
          + "<div style=\"margin-top:5px;\">" + penHtml + "</div>"
        + "</div>"
      + "</div>";
    }).join("");
  }

  document.getElementById("studentProfile").style.display = "block";
  document.getElementById("portalMsg").style.display = "none";
}

// ═══════════════════ BOOT ═══════════════════
loadData();
initDropdowns();
refreshEquipDropdowns();
updateStats();
