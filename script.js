let transactionCounter = 1001; 
let transactions = [];
let equipment = [
  { id: "FAN-01", code: "EQ-001", name: "Electric Fan", quantity: 10, status: "Available" },
  { id: "BALL-01", code: "EQ-002", name: "Ball", quantity: 10, status: "Available" },
  { id: "SPEAKER-01", code: "EQ-003", name: "Speaker", quantity: 10, status: "Available" },
  { id: "MONITOR-01", code: "EQ-004", name: "Monitor", quantity: 10, status: "Available" }
];

const students = {
  "2024-08-01079": { name: "Johnree Mathew A. GO", course: "BSIT", year: "2nd Year" },
  "2024-06-00060": { name: "Jashzel Yap", course: "BSIT", year: "2nd Year" },
  "2024-07-00533": { name: "John Patrick Samson", course: "BSIT", year: "2nd Year" },
  "2024-07-00321": { name: "Mark Joseph C. Tugade", course: "BSIT", year: "2nd Year" },
  "2024-08-02001": { name: "Alice Santos", course: "BSMM", year: "3rd Year" },
  "2024-08-03002": { name: "Bob Cruz", course: "BSEd", year: "4th Year" },
  "2024-08-04003": { name: "Charlie Reyes", course: "BSA", year: "2nd Year" },
  "2024-08-05004": { name: "Dana Lopez", course: "BSHM", year: "1st Year" }
};

const subjectsByCourse = {
  BSIT: ["Programming", "OOP", "Data Structures", "DB Management", "Web Dev", "Computer Networks"],
  BSMM: ["Marketing", "Consumer Behavior", "Sales Management", "Advertising", "Digital Marketing"],
  BSEd: ["Foundations of Education", "Curriculum Development", "Educational Psychology", "Assessment of Learning", "Teaching Strategies"],
  BSA: ["Financial Accounting", "Cost Accounting", "Auditing", "Taxation", "Business Law"],
  BSHM: ["Hospitality Management", "Food & Beverage Service", "Front Office Operations", "Housekeeping", "Tourism Management"]
};

// DOM Elements
const studentId = document.getElementById("studentId");
const studentInfo = document.getElementById("studentInfo");
const sName = document.getElementById("sName");
const sCourse = document.getElementById("sCourse");
const sYear = document.getElementById("sYear");
const borrowTime = document.getElementById("borrowTime");
const equipSelect = document.getElementById("equipSelect");
const purpose = document.getElementById("purpose");
const customPurpose = document.getElementById("customPurpose");
const subjectSelect = document.getElementById("subject");
const mainAreaSelect = document.getElementById("mainArea");
const specificRoomSelect = document.getElementById("specificRoom");
const duration = document.getElementById("duration");
const borrowBtn = document.getElementById("borrowBtn");
const borrowForm = document.getElementById("borrowForm");
const clearBtn = document.getElementById("clearBtn");
const borrowMessage = document.getElementById("borrowMessage");
const returnForm = document.getElementById("returnForm");
const returnSelect = document.getElementById("returnSelect");
const returnStudentIdInput = document.getElementById("returnStudentId");
const condition = document.getElementById("condition");
const returnBtn = document.getElementById("returnBtn");
const returnMessage = document.getElementById("returnMessage");
const transactionTable = document.getElementById("transactionTable").querySelector("tbody");
const adminPanel = document.getElementById("adminPanel");
const toggleAdminBtn = document.getElementById("toggleAdminBtn");
const adminContent = document.getElementById("adminContent");
const addEquipForm = document.getElementById("addEquipForm");
const newEquipName = document.getElementById("newEquipName");
const newEquipCode = document.getElementById("newEquipCode");
const allEquipList = document.getElementById("allEquipList");
const searchTransaction = document.getElementById("searchTransaction");
const adminTransactionTable = document.getElementById("adminTransactionTable").querySelector("tbody");
const borrowSection = document.getElementById("borrowSection");
const returnSection = document.getElementById("returnSection");
const showBorrowBtn = document.getElementById("showBorrow");
const showReturnBtn = document.getElementById("showReturn");

// Load specific rooms
const specificRooms = ["2A"];
["A","B","C","D","E","F","G","H","I"].forEach(l => specificRooms.push("3" + l));
["A","B","C","D","E","F","G","H","I"].forEach(l => specificRooms.push("4" + l));
["A","B","C","D","E","F","G"].forEach(l => specificRooms.push("5" + l));
specificRooms.forEach(r => specificRoomSelect.innerHTML += `<option value="${r}">${r}</option>`);

// Load duration options
const durations = [30, 60, 120, 180, 240, 480, 720, 1440];
duration.innerHTML = durations.map(d => `<option value="${d}">${d >= 60 ? d / 60 + " hour(s)" : d + " minutes"}</option>`).join("");

// Load localStorage
if (localStorage.getItem("transactions")) transactions = JSON.parse(localStorage.getItem("transactions"));
if (localStorage.getItem("equipment")) equipment = JSON.parse(localStorage.getItem("equipment"));

// Event Listeners
studentId.addEventListener("input", formatStudentId);
returnStudentIdInput.addEventListener("input", formatReturnStudentId);
purpose.addEventListener("change", handlePurposeChange);
customPurpose.addEventListener("input", toggleBorrowButton);
mainAreaSelect.addEventListener("change", handleAreaChange);
specificRoomSelect.addEventListener("change", handleAreaChange);
borrowForm.addEventListener("submit", handleBorrow);
clearBtn.addEventListener("click", clearBorrowForm);
returnForm.addEventListener("submit", handleReturn);
toggleAdminBtn.addEventListener("click", toggleAdminPanel);
addEquipForm.addEventListener("submit", handleAddEquipment);
searchTransaction.addEventListener("input", refreshAdminTransactions);

showBorrowBtn.addEventListener("click", () => {
  borrowSection.classList.remove("hidden");
  returnSection.classList.add("hidden");
});

showReturnBtn.addEventListener("click", () => {
  returnSection.classList.remove("hidden");
  borrowSection.classList.add("hidden");
});

// Functions
function formatStudentId() {
  let val = studentId.value.replace(/[^0-9]/g, '');
  let f = val.slice(0, 4);
  if (val.length > 4) f += '-' + val.slice(4, 6);
  if (val.length > 6) f += '-' + val.slice(6, 11);
  studentId.value = f;
  checkStudent();
  updateSubjects();
  toggleBorrowButton();
  checkAdmin();
}

function formatReturnStudentId() {
  let val = returnStudentIdInput.value.replace(/[^0-9]/g, '');
  let f = val.slice(0, 4);
  if (val.length > 4) f += '-' + val.slice(4, 6);
  if (val.length > 6) f += '-' + val.slice(6, 11);
  returnStudentIdInput.value = f;
}

function checkStudent() {
  const id = studentId.value.trim();
  if (students[id]) {
    const s = students[id];
    sName.innerText = s.name;
    sCourse.innerText = s.course;
    sYear.innerText = s.year;
    borrowTime.innerText = new Date().toLocaleString();
    studentInfo.classList.remove("hidden");
  } else {
    sName.innerText = "-";
    sCourse.innerText = "-";
    sYear.innerText = "-";
    borrowTime.innerText = "-";
    studentInfo.classList.add("hidden");
  }
}

function updateSubjects() {
  const course = students[studentId.value.trim()]?.course;
  if (course && subjectsByCourse[course]) {
    subjectSelect.innerHTML = '<option value="">--Select Subject--</option>';
    subjectsByCourse[course].forEach(s => subjectSelect.innerHTML += `<option value="${s}">${s}</option>`);
    subjectSelect.disabled = false;
  } else {
    subjectSelect.innerHTML = '<option value="">--Select Subject--</option>';
    subjectSelect.disabled = true;
  }
  toggleBorrowButton();
}

function handlePurposeChange() {
  customPurpose.style.display = purpose.value === "Others" ? "block" : "none";
  if (purpose.value !== "Others") customPurpose.value = "";
  toggleBorrowButton();
}

function handleAreaChange() {
  specificRoomSelect.disabled = !!mainAreaSelect.value;
  mainAreaSelect.disabled = !!specificRoomSelect.value;
  toggleBorrowButton();
}

function getSelectedLabRoom() {
  return mainAreaSelect.value || specificRoomSelect.value || "";
}

function toggleBorrowButton() {
  let p = purpose.value === "Others" ? customPurpose.value.trim() : purpose.value;
  const id = studentId.value.trim();
  const ready = id && p && subjectSelect.value && getSelectedLabRoom() && equipSelect.value && (students[id] || id === "3636-36-36363");
  borrowBtn.disabled = !ready;
}

function refreshEquipmentUI() {
  equipSelect.innerHTML = "";
  returnSelect.innerHTML = "";

  equipment.forEach(item => {
    item.status = item.quantity === 0 ? "Item is not available" : "Available";
    let disabled = item.quantity === 0 ? "disabled" : "";
    let color = item.quantity === 0 ? "color: gray;" : "";
    equipSelect.innerHTML += `<option value="${item.id}" ${disabled} style="${color}">${item.name} (${item.code}) - Qty: ${item.quantity}</option>`;
    
    if (item.quantity < 10) {
      returnSelect.innerHTML += `<option value="${item.id}">${item.name} (${item.code})</option>`;
    }
  });
}

function handleBorrow(e) {
  e.preventDefault();
  const id = studentId.value.trim();
  const s = students[id] || { name: "Admin", course: "Admin", year: "Admin" };
  const equipId = equipSelect.value;
  let p = purpose.value === "Others" ? customPurpose.value.trim() : purpose.value;
  const subj = subjectSelect.value;
  const lab = getSelectedLabRoom();
  const dur = parseInt(duration.value);
  if (!equipId || !p || !subj || !lab) {
    showMessage(borrowMessage, "Please complete all required fields", "error");
    return;
  }
  const item = equipment.find(e => e.id === equipId);
  if (item.quantity === 0) {
    showMessage(borrowMessage, "Item is not available!", "error");
    return;
  }
  if (!confirm(`Borrow ${item.name} (${item.code})?`)) return;
  item.quantity--;
  const now = new Date();
  const deadline = new Date(now.getTime() + dur * 60000);
  transactions.push({
    tx: transactionCounter++,
    studentID: id,
    student: s.name,
    course: s.course,
    year: s.year,
    item: item.name,
    code: item.code,
    purpose: p,
    subject: subj,
    lab: lab,
    borrowTime: now.toLocaleString(),
    duration: dur,
    returnTime: "-",
    status: "Borrowed",
    condition: "-",
    penalty: 0,
    deadline: deadline
  });
  saveData();
  refreshTables();
  showMessage(borrowMessage, `Success! ${item.name} (${item.code}) borrowed by ${s.name}`, "success");
  clearBorrowForm();
}

function clearBorrowForm() {
  borrowForm.reset();
  studentInfo.classList.add("hidden");
  toggleBorrowButton();
}

function handleReturn(e) {
  e.preventDefault();
  const equipId = returnSelect.value;
  const cond = condition.value;
  const id = returnStudentIdInput.value.trim();
  if (!id) {
    showMessage(returnMessage, "Student ID required", "error");
    return;
  }
  const item = equipment.find(e => e.id === equipId);
  const tx = [...transactions].reverse().find(t => t.item === item.name && t.returnTime === "-" && t.studentID === id);
  if (!tx) {
    showMessage(returnMessage, "Transaction not found!", "error");
    return;
  }
  if (!confirm(`Return ${item.name} (${item.code})?`)) return;
  item.quantity++;
  const now = new Date();
  let penalty = 0;
  if (now > tx.deadline) penalty += 50;
  if (cond !== "OK") penalty += 100;
  tx.returnTime = now.toLocaleString();
  tx.condition = cond;
  tx.penalty = penalty;
  tx.status = "Returned";
  saveData();
  refreshTables();
  showMessage(returnMessage, `Successfully returned ${item.name} (${item.code}) by Student ID: ${id}`, "success");
  returnForm.reset();
}

function refreshTables() {
  transactionTable.innerHTML = "";
  transactions.forEach(t => {
    transactionTable.innerHTML += `<tr>
      <td>${t.studentID}</td><td>${t.student}</td><td>${t.course}</td><td>${t.year}</td>
      <td>${t.item}</td><td>${t.code}</td><td>${t.purpose}</td><td>${t.subject}</td>
      <td>${t.lab}</td><td>${t.borrowTime}</td><td>${t.duration}</td>
      <td>${t.returnTime}</td><td class="status-${t.status.toLowerCase()}">${t.status}</td>
      <td>${t.condition}</td><td>${t.penalty}</td>
    </tr>`;
  });
  refreshEquipmentUI();
  toggleBorrowButton();
  refreshAdminTransactions();
  refreshAdminEquipList();
}

function showMessage(element, text, type) {
  element.textContent = text;
  element.className = `message ${type}`;
  setTimeout(() => element.textContent = "", 5000);
}

function saveData() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
  localStorage.setItem("equipment", JSON.stringify(equipment));
}

// Admin Functions
function checkAdmin() {
  const id = studentId.value.trim();
  if (id === "3636-36-36363") {
    adminPanel.classList.remove("hidden");
  } else {
    adminPanel.classList.add("hidden");
  }
}

function toggleAdminPanel() {
  const password = prompt("Enter admin password:");
  if (password === "admin123") {
    adminContent.classList.toggle("hidden");
    toggleAdminBtn.innerHTML = adminContent.classList.contains("hidden") ? '<i class="fas fa-lock"></i> Show Admin Panel' : '<i class="fas fa-unlock"></i> Hide Admin Panel';
  } else {
    alert("Incorrect password!");
  }
}

// Default qty 10 when adding
function handleAddEquipment(e) {
  e.preventDefault();
  const name = newEquipName.value.trim();
  const code = newEquipCode.value.trim();
  const qty = 10; // default

  if (!name || !code) {
    alert("Invalid input!");
    return;
  }

  const id = code + "-01"; 
  equipment.push({ id, code, name, quantity: qty, status: "Available" });
  saveData();
  refreshTables();
  addEquipForm.reset();
  alert(`Equipment added! Default quantity is ${qty}`);
}

// Admin equipment list
function refreshAdminEquipList() {
  allEquipList.innerHTML = "";
  equipment.forEach((item, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${item.name} (${item.code}) - Qty: 
        <input type="number" value="${item.quantity}" min="0" max="100" onchange="updateAdminQty(${index}, this.value)" style="width: 50px;">
        <span class="badge ${item.status === 'Available' ? 'available' : 'unavailable'}">${item.status}</span>
      </span>
      <div>
        <button onclick="editEquipment(${index})"><i class="fas fa-edit"></i> Edit</button>
        <button onclick="deleteEquipment(${index})"><i class="fas fa-trash"></i> Delete</button>
      </div>
    `;
    allEquipList.appendChild(li);
  });
}

// Update qty from admin
function updateAdminQty(index, value) {
  const val = parseInt(value);
  if (isNaN(val) || val < 0) return alert("Invalid quantity");
  equipment[index].quantity = val;
  equipment[index].status = val > 0 ? "Available" : "Item is not available";
  saveData();
  refreshEquipmentUI(); // sync borrow dropdown
  refreshAdminEquipList(); 
}

function editEquipment(index) {
  const item = equipment[index];
  const newName = prompt("New Name:", item.name);
  const newCode = prompt("New Code:", item.code);
  const newQty = parseInt(prompt("New Quantity (0-100):", item.quantity));
  if (newName && newCode && newQty >= 0) {
    item.name = newName;
    item.code = newCode;
    item.quantity = newQty;
    item.status = newQty > 0 ? "Available" : "Item is not available";
    saveData();
    refreshTables();
  }
}

function deleteEquipment(index) {
  if (confirm("Delete this equipment?")) {
    equipment.splice(index, 1);
    saveData();
    refreshTables();
  }
}

function refreshAdminTransactions() {
  const query = searchTransaction.value.toLowerCase();
  adminTransactionTable.innerHTML = "";
  transactions.filter(t => 
    t.studentID.toLowerCase().includes(query) ||
    t.student.toLowerCase().includes(query) ||
    t.item.toLowerCase().includes(query)
  ).forEach((t, index) => {
    let actions = `<button onclick="deleteTransaction(${index})"><i class="fas fa-trash"></i> Delete</button>`;
    if (t.status === "Borrowed") {
      actions += ` <button onclick="forceReturn(${t.tx})"><i class="fas fa-undo"></i> Force Return</button>`;
    }
    adminTransactionTable.innerHTML += `<tr>
      <td>${t.studentID}</td><td>${t.student}</td><td>${t.item}</td><td class="status-${t.status.toLowerCase()}">${t.status}</td>
      <td>${actions}</td>
    </tr>`;
  });
}

function deleteTransaction(index) {
  if (confirm("Delete this transaction?")) {
    transactions.splice(index, 1);
    saveData();
    refreshTables();
  }
}

function forceReturn(txId) {
  const tx = transactions.find(t => t.tx === txId);
  if (!tx || tx.status !== "Borrowed") return alert("Invalid transaction or already returned.");
  if (!confirm(`Force return ${tx.item} for ${tx.student}? This will mark it as returned with a penalty.`)) return;
  const item = equipment.find(e => e.name === tx.item);
  if (item) item.quantity++;
  const now = new Date();
  tx.returnTime = now.toLocaleString();
  tx.condition = "Forced Return";
  tx.penalty = 200;
  tx.status = "Returned";
  saveData();
  refreshTables();
  alert(`Forced return completed for ${tx.item}.`);
}

refreshTables();
