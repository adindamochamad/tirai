import { redact, restore, Vault, type Finding } from "../src/index.js";
import { fakeAiReply } from "./fakeAi.js";

const vault = new Vault();
let findings: Finding[] = [];

const inputEl = mustTextarea("input");
const redactedEl = mustTextarea("redacted");
const replyEl = mustTextarea("reply");
const resultEl = mustTextarea("result");
const beforeEl = mustDiv("before");
const afterEl = mustDiv("after");
const afterCaption = mustHeading("after-caption");
const findingsBody = mustBody("findings-body");
const copyStatus = mustParagraph("copy-status");

document.getElementById("redact-button")?.addEventListener("click", samarakan);
document.getElementById("sample-button")?.addEventListener("click", isiContoh);
document.getElementById("copy-button")?.addEventListener("click", () => {
  void salin();
});
document
  .getElementById("fake-ai-button")
  ?.addEventListener("click", kirimSimulasi);
document
  .getElementById("restore-button")
  ?.addEventListener("click", kembalikan);
document.getElementById("clear-button")?.addEventListener("click", hapusSemua);

renderFindings();

function isiContoh(): void {
  inputEl.value =
    "SINTETIS. Saya Budi, NIK 3171010101010000, HP 0800-0000-0001, motor B 4321 XYZ ditilang.";
}

function samarakan(): void {
  const result = redact(inputEl.value, { vault });
  findings = result.findings;
  redactedEl.value = result.redacted;
  renderFindings();
  showCompare(result.redacted, "Teks tersamar");
  copyStatus.textContent = "";
}

async function salin(): Promise<void> {
  const value = redactedEl.value;
  redactedEl.focus();
  redactedEl.select();
  try {
    if (navigator.clipboard !== undefined) {
      await navigator.clipboard.writeText(value);
    }
    copyStatus.textContent = "Teks tersamar disalin.";
  } catch {
    copyStatus.textContent =
      "Teks sudah dipilih. Salin secara manual jika perlu.";
  }
}

function kirimSimulasi(): void {
  replyEl.value = fakeAiReply(findings);
}

function kembalikan(): void {
  const restored = restore(replyEl.value, vault);
  resultEl.value = restored;
  showCompare(restored, "Hasil akhir");
}

function hapusSemua(): void {
  vault.clear();
  findings = [];
  inputEl.value = "";
  redactedEl.value = "";
  replyEl.value = "";
  resultEl.value = "";
  copyStatus.textContent = "";
  beforeEl.textContent = "";
  afterEl.textContent = "";
  afterCaption.textContent = "Sesudah";
  renderFindings();
}

function showCompare(after: string, caption: string): void {
  beforeEl.textContent = inputEl.value;
  afterEl.textContent = after;
  afterCaption.textContent = caption;
}

function renderFindings(): void {
  while (findingsBody.firstChild)
    findingsBody.removeChild(findingsBody.firstChild);
  if (findings.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 3;
    cell.textContent = "Belum ada.";
    row.append(cell);
    findingsBody.append(row);
    return;
  }
  for (const finding of findings) {
    const row = document.createElement("tr");
    row.append(
      cell(finding.type),
      cell(finding.token),
      cell(vault.get(finding.token)?.original ?? ""),
    );
    findingsBody.append(row);
  }
}

function cell(text: string): HTMLTableCellElement {
  const td = document.createElement("td");
  td.textContent = text;
  return td;
}

function mustTextarea(id: string): HTMLTextAreaElement {
  const el = document.getElementById(id);
  if (!(el instanceof HTMLTextAreaElement))
    throw new Error(`Missing textarea #${id}`);
  return el;
}

function mustDiv(id: string): HTMLDivElement {
  const el = document.getElementById(id);
  if (!(el instanceof HTMLDivElement)) throw new Error(`Missing div #${id}`);
  return el;
}

function mustHeading(id: string): HTMLHeadingElement {
  const el = document.getElementById(id);
  if (!(el instanceof HTMLHeadingElement))
    throw new Error(`Missing heading #${id}`);
  return el;
}

function mustBody(id: string): HTMLTableSectionElement {
  const el = document.getElementById(id);
  if (!(el instanceof HTMLTableSectionElement))
    throw new Error(`Missing tbody #${id}`);
  return el;
}

function mustParagraph(id: string): HTMLParagraphElement {
  const el = document.getElementById(id);
  if (!(el instanceof HTMLParagraphElement))
    throw new Error(`Missing paragraph #${id}`);
  return el;
}
