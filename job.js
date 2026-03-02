// job.js - 90s office desktop with password, apps, and file workflow

// ---------------- PASSWORD SYSTEM ----------------

const loginScreen = document.getElementById("loginScreen");
const desktop = document.getElementById("desktop");
const loginMessage = document.getElementById("loginMessage");
const passwordInput = document.getElementById("passwordInput");
const loginBtn = document.getElementById("loginBtn");

let savedPassword = localStorage.getItem("acme_password");

if (!savedPassword) {
  loginMessage.textContent = "Create a new password:";
}

loginBtn.addEventListener("click", () => {
  const entered = passwordInput.value.trim();

  if (!savedPassword) {
    if (entered.length < 3) {
      loginMessage.textContent = "Password must be at least 3 characters.";
      return;
    }
    localStorage.setItem("acme_password", entered);
    savedPassword = entered;
    loginMessage.textContent = "Password created! Enter it to continue:";
    passwordInput.value = "";
    return;
  }

  if (entered === savedPassword) {
    loginScreen.style.display = "none";
    desktop.style.display = "block";
  } else {
    loginMessage.textContent = "Incorrect password. Try again:";
  }
});

// ---------------- GLOBAL STATE ----------------

const REALISTIC_DELAY = 900; // always realistic

let savedFiles = []; // { name, type }

// ---------------- DOM REFERENCES ----------------

const winDocs = document.getElementById("win-docs");
const winExcel = document.getElementById("win-excel");
const winMail = document.getElementById("win-mail");
const winExplorer = document.getElementById("win-explorer");
const winTerminal = document.getElementById("win-terminal");

const docsStatus = document.getElementById("docsStatus");
const excelStatus = document.getElementById("excelStatus");
const explorerStatus = document.getElementById("explorerStatus");
const mailStatus = document.getElementById("mailStatus");
const mailStatusText = document.getElementById("mailStatusText");
const terminalLog = document.getElementById("terminalLog");
const terminalStatus = document.getElementById("terminalStatus");
const fileList = document.getElementById("fileList");
const mailAttachmentSelect = document.getElementById("mailAttachmentSelect");

const docsSaveBtn = document.getElementById("docsSaveBtn");
const excelSaveBtn = document.getElementById("excelSaveBtn");
const mailSendBtn = document.getElementById("mailSendBtn");

// ---------------- WINDOW MANAGEMENT ----------------

const windows = {
  docs: winDocs,
  excel: winExcel,
  mail: winMail,
  explorer: winExplorer,
  terminal: winTerminal
};

function bringToFront(win) {
  const maxZ = Array.from(document.querySelectorAll(".window"))
    .reduce((max, w) => Math.max(max, parseInt(w.style.zIndex || "1", 10)), 1);
  win.style.zIndex = maxZ + 1;
}

function openApp(app) {
  const win = windows[app];
  if (!win) return;
  win.classList.remove("hidden");
  bringToFront(win);
}

function closeApp(win) {
  win.classList.add("hidden");
}

function minimizeApp(win) {
  // simple: hide window; reopen via desktop icon
  win.classList.add("hidden");
}

// drag logic
let dragInfo = null;

function onMouseDownTitle(e) {
  const bar = e.currentTarget;
  const win = bar.parentElement;
  bringToFront(win);

  dragInfo = {
    win,
    offsetX: e.clientX - win.offsetLeft,
    offsetY: e.clientY - win.offsetTop
  };

  document.addEventListener("mousemove", onMouseMoveDrag);
  document.addEventListener("mouseup", onMouseUpDrag);
}

function onMouseMoveDrag(e) {
  if (!dragInfo) return;
  const { win, offsetX, offsetY } = dragInfo;
  win.style.left = (e.clientX - offsetX) + "px";
  win.style.top = (e.clientY - offsetY) + "px";
}

function onMouseUpDrag() {
  dragInfo = null;
  document.removeEventListener("mousemove", onMouseMoveDrag);
  document.removeEventListener("mouseup", onMouseUpDrag);
}

// attach title-bar handlers
document.querySelectorAll(".title-bar").forEach(bar => {
  bar.addEventListener("mousedown", onMouseDownTitle);
  const buttons = bar.querySelectorAll(".title-buttons span");
  buttons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const action = btn.getAttribute("data-action");
      const win = bar.parentElement;
      if (action === "close") closeApp(win);
      if (action === "minimize") minimizeApp(win);
    });
  });
});

// desktop icons
document.querySelectorAll(".icon").forEach(icon => {
  icon.addEventListener("dblclick", () => {
    const app = icon.getAttribute("data-app");
    openApp(app);
  });
});

// ---------------- TERMINAL LOG ----------------

function appendTerminalLine(text) {
  terminalLog.textContent += "\n" + text;
  terminalLog.scrollTop = terminalLog.scrollHeight;
}

// ---------------- FILE HANDLING ----------------

function refreshFileList() {
  if (savedFiles.length === 0) {
    fileList.textContent = "(No files saved yet.)";
  } else {
    fileList.textContent = savedFiles
      .map((f, i) => `${i + 1}. ${f.name} [${f.type}]`)
      .join("\n");
  }

  // refresh mail attachment dropdown
  mailAttachmentSelect.innerHTML = '<option value="">-- Select saved file --</option>';
  savedFiles.forEach((f, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = f.name + " (" + f.type + ")";
    mailAttachmentSelect.appendChild(opt);
  });
}

function simulateSaveFile(name, type, statusElement) {
  statusElement.textContent = "Saving to disk...";
  openApp("terminal");
  appendTerminalLine(`Starting download of ${name} to C:\\ACME\\`);

  setTimeout(() => {
    savedFiles.push({ name, type });
    appendTerminalLine(`Completed download of ${name}.`);
    statusElement.textContent = "Saved.";
    explorerStatus.textContent = "File list updated.";
    refreshFileList();
  }, REALISTIC_DELAY);
}

// Docs save
docsSaveBtn.addEventListener("click", () => {
  simulateSaveFile("Report.doc", "DOC", docsStatus);
});

// Excel save
excelSaveBtn.addEventListener("click", () => {
  simulateSaveFile("Numbers.xls", "XLS", excelStatus);
});

// ---------------- MAIL SENDING ----------------

mailSendBtn.addEventListener("click", () => {
  const idx = mailAttachmentSelect.value;
  if (idx === "") {
    mailStatusText.textContent = "You must select a saved file first.";
    mailStatus.textContent = "No attachment.";
    return;
  }

  const file = savedFiles[parseInt(idx, 10)];
  mailStatus.textContent = "Sending...";
  mailStatusText.textContent = "";

  openApp("terminal");
  appendTerminalLine(`Preparing to send ${file.name} to Manager@acme.corp...`);

  setTimeout(() => {
    appendTerminalLine(`File ${file.name} transmitted successfully.`);
    mailStatus.textContent = "Sent.";
    mailStatusText.textContent = "Manager has received your file. They may or may not read it.";
    terminalStatus.textContent = "Transfer complete.";
  }, REALISTIC_DELAY);
});
