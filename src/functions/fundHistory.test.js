import { describe, expect, it } from "vitest";
import { collecterOptions, filterByCollecter } from "./fundHistory";

const row = (id, collecter, username) => ({
  id,
  collecter,
  profiles: username === null ? null : { username },
});

describe("collecterOptions", () => {
  const rows = [
    row("1", "u-a", "田中"),
    row("2", "u-b", "佐藤"),
    row("3", "u-a", "田中"),
    row("4", "u-a", "田中"),
  ];

  it("集金者ごとに件数を数える", () => {
    const options = collecterOptions(rows);
    expect(options).toHaveLength(2);
    expect(options[0]).toMatchObject({ id: "u-a", name: "田中", count: 3 });
    expect(options[1]).toMatchObject({ id: "u-b", name: "佐藤", count: 1 });
  });

  // 表示名は後から変わるし同姓同名もあるので、束ねるのは uuid でなければならない
  it("同姓同名を別人として扱う", () => {
    const options = collecterOptions([
      row("1", "u-a", "田中"),
      row("2", "u-b", "田中"),
    ]);
    expect(options).toHaveLength(2);
    expect(options.map((o) => o.id).sort()).toEqual(["u-a", "u-b"]);
  });

  // 退会したメンバーの行を落とすと履歴の合計が合わなくなる
  it("username が無い集金者も残す", () => {
    const options = collecterOptions([row("1", "u-x", null)]);
    expect(options).toEqual([{ id: "u-x", name: "（不明）", count: 1 }]);
  });

  it("collecter が無い行は選択肢に出さない", () => {
    const options = collecterOptions([{ id: "1", collecter: null }]);
    expect(options).toEqual([]);
  });

  it("空・未定義でも落ちない", () => {
    expect(collecterOptions([])).toEqual([]);
    expect(collecterOptions(undefined)).toEqual([]);
  });
});

describe("filterByCollecter", () => {
  const rows = [row("1", "u-a", "田中"), row("2", "u-b", "佐藤")];

  it("指定した集金者の行だけ返す", () => {
    expect(filterByCollecter(rows, "u-a").map((r) => r.id)).toEqual(["1"]);
  });

  // 参照が変わると下流の useEffect が無駄に走る
  it("未指定なら元の配列をそのまま返す", () => {
    expect(filterByCollecter(rows, null)).toBe(rows);
    expect(filterByCollecter(rows, undefined)).toBe(rows);
    expect(filterByCollecter(rows, "")).toBe(rows);
  });

  it("該当が無ければ空配列", () => {
    expect(filterByCollecter(rows, "u-zzz")).toEqual([]);
  });

  it("未定義でも落ちない", () => {
    expect(filterByCollecter(undefined, "u-a")).toEqual([]);
    expect(filterByCollecter(undefined, null)).toEqual([]);
  });
});
