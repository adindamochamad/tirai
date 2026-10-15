const NOTE_ID = "tirai-redaction-note";

export function showRedactionNote(doc: Document, count: number): void {
  let note = doc.getElementById(NOTE_ID);
  if (!note) {
    note = doc.createElement("div");
    note.id = NOTE_ID;
    note.setAttribute("role", "status");
    note.style.position = "fixed";
    note.style.right = "16px";
    note.style.bottom = "16px";
    note.style.zIndex = "2147483647";
    note.style.padding = "8px 12px";
    note.style.borderRadius = "8px";
    note.style.background = "#1c1917";
    note.style.color = "#fafaf9";
    note.style.font = "13px/1.4 system-ui, sans-serif";
    note.style.pointerEvents = "none";
    doc.documentElement.append(note);
  }
  note.textContent = `${count} data disamarkan`;
}
