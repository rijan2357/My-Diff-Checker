export type OpType = "INSERT" | "DELETE" | "EQUAL";

export interface DiffResult {
  type: OpType;
  value: string;
}

export class WordDiffEngine {

  private tokenize(text: string): string[] {
    const regex = /[a-zA-Z0-9_]+|[^\s\w]+|\s+/g;
    return text.match(regex) || [];
  }

  public compare(oldText: string, newText: string): DiffResult[] {
    const s1 = this.tokenize(oldText);
    const s2 = this.tokenize(newText);

    const memo: number[][] = Array.from({ length: s1.length + 1 }, () =>
      Array(s2.length + 1).fill(0)
    );

    for (let i = 1; i <= s1.length; i++) {
      for (let j = 1; j <= s2.length; j++) {
        if (s1[i - 1] === s2[j - 1]) {
          memo[i][j] = memo[i - 1][j - 1] + 1;
        } else {
          memo[i][j] = Math.max(memo[i - 1][j], memo[i][j - 1]);
        }
      }
    }

    const result: DiffResult[] = [];
    let i = s1.length;
    let j = s2.length;

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && s1[i - 1] === s2[j - 1]) {
        result.unshift({ type: "EQUAL", value: s1[i - 1] });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || memo[i][j - 1] >= memo[i - 1][j])) {
        result.unshift({ type: "INSERT", value: s2[j - 1] });
        j--;
      } else {
        result.unshift({ type: "DELETE", value: s1[i - 1] });
        i--;
      }
    }

    return this.consolidate(result);
  }

  private consolidate(diffs: DiffResult[]): DiffResult[] {
    if (diffs.length === 0) return [];

    const consolidated: DiffResult[] = [diffs[0]];

    for (let i = 1; i < diffs.length; i++) {
      const last = consolidated[consolidated.length - 1];
      const current = diffs[i];

      if (last.type === current.type) {
        last.value += current.value;
      } else {
        consolidated.push(current);
      }
    }

    return consolidated;
  }
}
