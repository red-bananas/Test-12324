import { detectNewMilestone, milestoneMessage } from "../game/milestones";

describe("milestones", () => {
  it("detects newly reached milestone values", () => {
    expect(detectNewMilestone(256, 512)).toBe(512);
    expect(detectNewMilestone(512, 2048)).toBe(2048);
  });

  it("returns null when no milestone was crossed", () => {
    expect(detectNewMilestone(128, 256)).toBeNull();
  });

  it("provides milestone copy", () => {
    expect(milestoneMessage(2048)).toContain("2048");
  });
});
