import { describe, expect, it } from "vitest";
import { compareMembers, memberRoleRank, sortMembers } from "./memberOrder";

const member = (role, username, joined_at) => ({
  role,
  joined_at,
  profiles: { username },
});

const names = (list) => sortMembers(list).map((m) => m.profiles.username);

describe("memberRoleRank", () => {
  it("管理者 → 集金担当者 → 閲覧者", () => {
    expect(memberRoleRank("admin")).toBeLessThan(memberRoleRank("collecter"));
    expect(memberRoleRank("collecter")).toBeLessThan(memberRoleRank("viewer"));
  });

  it("⚠️ 綴りは collecter。collector は知らないロール扱い", () => {
    expect(memberRoleRank("collecter")).toBe(1);
    expect(memberRoleRank("collector")).toBeGreaterThan(memberRoleRank("viewer"));
  });

  it("⚠️ 知らないロールは末尾（管理者より上へ割り込ませない）", () => {
    expect(memberRoleRank("owner")).toBeGreaterThan(memberRoleRank("viewer"));
    expect(memberRoleRank(undefined)).toBeGreaterThan(memberRoleRank("viewer"));
  });
});

describe("sortMembers", () => {
  it("ロールの順に並べ替える", () => {
    expect(
      names([
        member("viewer", "ゆかり", "2026-01-01T00:00:00Z"),
        member("admin", "あきら", "2026-01-02T00:00:00Z"),
        member("collecter", "こうじ", "2026-01-03T00:00:00Z"),
      ])
    ).toEqual(["あきら", "こうじ", "ゆかり"]);
  });

  it("同じロールの中は参加が早い順", () => {
    expect(
      names([
        member("collecter", "あと", "2026-05-01T00:00:00Z"),
        member("collecter", "さき", "2026-01-01T00:00:00Z"),
      ])
    ).toEqual(["さき", "あと"]);
  });

  it("⚠️ joined_at が同じ・無いときは表示名で決めきる（並びがちらつかない）", () => {
    expect(names([member("viewer", "いとう"), member("viewer", "あさの")])).toEqual([
      "あさの",
      "いとう",
    ]);
    // 片方だけ日付が無くても落ちない
    expect(
      names([member("admin", "いとう"), member("admin", "あさの", "2026-01-01T00:00:00Z")])
    ).toHaveLength(2);
  });

  it("⚠️ 知らないロールは末尾に落ちる", () => {
    expect(
      names([
        member("owner", "なぞ", "2026-01-01T00:00:00Z"),
        member("viewer", "ゆかり", "2026-01-02T00:00:00Z"),
        member("admin", "あきら", "2026-01-03T00:00:00Z"),
      ])
    ).toEqual(["あきら", "ゆかり", "なぞ"]);
  });

  it("⚠️ 元の配列を壊さない", () => {
    const list = [member("viewer", "ゆかり"), member("admin", "あきら")];
    sortMembers(list);
    expect(list[0].profiles.username).toBe("ゆかり");
  });

  it("空・未取得でも落ちない", () => {
    expect(sortMembers([])).toEqual([]);
    expect(sortMembers(undefined)).toEqual([]);
  });

  it("compareMembers は壊れた行でも例外を投げない", () => {
    expect(() => [{}, null, undefined].sort(compareMembers)).not.toThrow();
  });
});
