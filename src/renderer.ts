import type { DiffResult } from "./diff";

export function renderDiff(diffs: DiffResult[], displayElement: HTMLElement) {
  const fragment = document.createDocumentFragment();

  for (const change of diffs) {
    const span = document.createElement("span");
    span.textContent = change.value;

    if (change.type === "INSERT") {
      span.style.backgroundColor = "#d4edda";
      span.style.color = "#155724";
      span.style.textDecoration = "underline";
    } else if (change.type === "DELETE") {
      span.style.backgroundColor = "#f8d7da";
      span.style.color = "#721c24";
      span.style.textDecoration = "line-through";
    }

    fragment.appendChild(span);
  }

  displayElement.innerHTML = "";
  displayElement.appendChild(fragment);
}
