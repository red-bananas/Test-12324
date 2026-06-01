export const MILESTONE_VALUES = [512, 1024, 2048, 4096, 8192] as const;

export function detectNewMilestone(
  previousMax: number,
  nextMax: number,
): number | null {
  let milestone: number | null = null;
  for (const value of MILESTONE_VALUES) {
    if (previousMax < value && nextMax >= value) {
      milestone = value;
    }
  }
  return milestone;
}

export function milestoneMessage(value: number): string {
  switch (value) {
    case 512:
      return "512 — heating up!";
    case 1024:
      return "1024 — great run!";
    case 2048:
      return "2048 — you did it!";
    case 4096:
      return "4096 — legendary!";
    case 8192:
      return "8192 — unstoppable!";
    default:
      return `${value} tile!`;
  }
}
