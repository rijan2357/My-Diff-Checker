import { WordDiffEngine } from "./diff";

const engine = new WordDiffEngine();

self.onmessage = (e: MessageEvent<{ oldText: string; newText: string }>) => {
  const { oldText, newText } = e.data;
  const result = engine.compare(oldText, newText);
  self.postMessage(result);
};
