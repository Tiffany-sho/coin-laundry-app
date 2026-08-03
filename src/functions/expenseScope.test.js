import { describe, expect, it } from "vitest";
import { expenseScopeFilter, inExpenseStoreScope } from "./expenseScope";

const A = "11111111-1111-4111-8111-111111111111";
const B = "22222222-2222-4222-8222-222222222222";

describe("expenseScopeFilter", () => {
  it("admin（null）は絞らない", () => {
    expect(expenseScopeFilter(null)).toEqual({ kind: "all" });
  });

  it("⚠️ undefined も絞らない（取得前に呼ばれても閉じすぎない）", () => {
    expect(expenseScopeFilter(undefined)).toEqual({ kind: "all" });
  });

  it("⚠️ 空配列は「全店舗」ではない。組織全体だけになる", () => {
    expect(expenseScopeFilter([])).toEqual({ kind: "orgOnly" });
  });

  it("担当店舗があれば「組織全体 OR その店舗」", () => {
    expect(expenseScopeFilter([A, B])).toEqual({
      kind: "or",
      filter: `laundry_id.is.null,laundry_id.in.(${A},${B})`,
    });
  });

  it("⚠️ uuid でない値は落とす（`.or()` は文字列に埋め込むため）", () => {
    expect(expenseScopeFilter([A, "1,2)) or true --"])).toEqual({
      kind: "or",
      filter: `laundry_id.is.null,laundry_id.in.(${A})`,
    });
  });

  it("⚠️ 不正な値しか無いときは in.() を作らない（構文エラーになる）", () => {
    expect(expenseScopeFilter(["", null, "abc"])).toEqual({ kind: "orgOnly" });
  });

  it("配列でない値が来ても開かない", () => {
    expect(expenseScopeFilter("all")).toEqual({ kind: "orgOnly" });
  });
});

describe("inExpenseStoreScope", () => {
  it("admin はどの店舗も扱える", () => {
    expect(inExpenseStoreScope(null, A)).toBe(true);
  });

  it("担当している店舗は扱える", () => {
    expect(inExpenseStoreScope([A], A)).toBe(true);
  });

  it("⚠️ 担当していない店舗は扱えない", () => {
    expect(inExpenseStoreScope([A], B)).toBe(false);
  });

  it("⚠️ 組織全体（null）は担当が 0 件でも扱える。店舗ではないため", () => {
    expect(inExpenseStoreScope([], null)).toBe(true);
    expect(inExpenseStoreScope([], undefined)).toBe(true);
  });

  it("担当 0 件はどの店舗も扱えない", () => {
    expect(inExpenseStoreScope([], A)).toBe(false);
  });
});
