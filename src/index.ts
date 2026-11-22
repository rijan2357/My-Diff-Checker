import { WordDiffEngine } from "./diff";
import { renderDiff } from "./renderer";

const leftInput = document.getElementById("leftInput") as HTMLTextAreaElement;
const rightInput = document.getElementById("rightInput") as HTMLTextAreaElement;
const diffDisplay = document.getElementById("diffDisplay") as HTMLElement;

const engine = new WordDiffEngine();

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

let worker: Worker | null = null;

const LARGE_DEBOUNCE_THRESHOLD = 50_000;

function getDebounceDelay(oldText: string, newText: string): number {
  return oldText.length + newText.length > LARGE_DEBOUNCE_THRESHOLD ? 300 : 50;
}

const WORKER_THRESHOLD = 150_000;

function shouldUseWorker(oldText: string, newText: string): boolean {
  return oldText.length + newText.length > WORKER_THRESHOLD;
}

function runDiffInline(oldText: string, newText: string) {
  const diffs = engine.compare(oldText, newText);
  renderDiff(diffs, diffDisplay);
}

function runDiffViaWorker(oldText: string, newText: string) {
  if (!worker) {
    worker = new Worker(
      new URL("./diff.worker.ts", import.meta.url),
      { type: "module" }
    );
    worker.onmessage = (e: MessageEvent) => {
      renderDiff(e.data, diffDisplay);
    };
  }
  worker.postMessage({ oldText, newText });
}

function updateDiff() {
  const oldText = leftInput.value;
  const newText = rightInput.value;

  if (shouldUseWorker(oldText, newText)) {
    runDiffViaWorker(oldText, newText);
  } else {
    runDiffInline(oldText, newText);
  }
}

function scheduleUpdate() {
  if (debounceTimer !== null) {
    clearTimeout(debounceTimer);
  }

  const delay = getDebounceDelay(leftInput.value, rightInput.value);
  debounceTimer = setTimeout(updateDiff, delay);
}

leftInput.addEventListener("input", scheduleUpdate);
rightInput.addEventListener("input", scheduleUpdate);

updateDiff();
