const DIALOG_ID = "tirai-send-dialog";

export type SendDialogActions = {
  onRedact: () => void;
  onSendAnyway: () => void;
};

export function showSendDialog(
  doc: Document,
  actions: SendDialogActions,
): void {
  doc.getElementById(DIALOG_ID)?.remove();

  const backdrop = doc.createElement("div");
  backdrop.id = DIALOG_ID;
  backdrop.setAttribute("role", "dialog");
  backdrop.setAttribute("aria-modal", "true");
  backdrop.style.position = "fixed";
  backdrop.style.inset = "0";
  backdrop.style.zIndex = "2147483647";
  backdrop.style.display = "flex";
  backdrop.style.alignItems = "center";
  backdrop.style.justifyContent = "center";
  backdrop.style.background = "rgba(28, 25, 23, 0.45)";
  backdrop.style.font = "14px/1.45 system-ui, sans-serif";

  const panel = doc.createElement("div");
  panel.style.maxWidth = "360px";
  panel.style.margin = "16px";
  panel.style.padding = "16px";
  panel.style.borderRadius = "12px";
  panel.style.background = "#fafaf9";
  panel.style.color = "#1c1917";
  panel.style.boxShadow = "0 12px 40px rgba(0, 0, 0, 0.2)";

  const message = doc.createElement("p");
  message.style.margin = "0 0 16px";
  message.textContent =
    "Ada data yang belum disamarkan — Samarakan / Kirim apa adanya";

  const row = doc.createElement("div");
  row.style.display = "flex";
  row.style.gap = "8px";
  row.style.justifyContent = "flex-end";

  const redactBtn = doc.createElement("button");
  redactBtn.type = "button";
  redactBtn.textContent = "Samarakan";
  styleButton(redactBtn, true);

  const anywayBtn = doc.createElement("button");
  anywayBtn.type = "button";
  anywayBtn.textContent = "Kirim apa adanya";
  styleButton(anywayBtn, false);

  redactBtn.addEventListener("click", () => {
    backdrop.remove();
    actions.onRedact();
  });
  anywayBtn.addEventListener("click", () => {
    backdrop.remove();
    actions.onSendAnyway();
  });

  row.append(redactBtn, anywayBtn);
  panel.append(message, row);
  backdrop.append(panel);
  doc.documentElement.append(backdrop);
}

function styleButton(button: HTMLButtonElement, primary: boolean): void {
  button.style.border = primary ? "none" : "1px solid #d6d3d1";
  button.style.borderRadius = "8px";
  button.style.padding = "8px 12px";
  button.style.cursor = "pointer";
  button.style.background = primary ? "#1c4d3e" : "#fafaf9";
  button.style.color = primary ? "#fafaf9" : "#1c1917";
  button.style.font = "inherit";
}

export function hideSendDialog(doc: Document): void {
  doc.getElementById(DIALOG_ID)?.remove();
}
