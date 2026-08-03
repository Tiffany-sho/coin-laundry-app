import { describe, expect, it } from "vitest";
import {
  canEditExpense,
  expenseScopeFilter,
  inExpenseStoreScope,
  isCurrentJstMonth,
  jstMonthKey,
} from "./expenseScope";

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

/* ------------------------------------------------------------------ */
/* 誰がどれを直せるか                                                   */
/* ------------------------------------------------------------------ */

/** JST 深夜 0 時の epoch（`expenses.date` と同じ規約） */
const jstMidnight = (y, m, d) => Date.UTC(y, m - 1, d) - 32_400_000;

const ME = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const OTHER = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

describe("jstMonthKey", () => {
  it("JST 深夜 0 時の epoch をその月として読む", () => {
    expect(jstMonthKey(jstMidnight(2026, 8, 1))).toBe("2026-08");
    expect(jstMonthKey(jstMidnight(2026, 8, 31))).toBe("2026-08");
  });

  it("⚠️ 月初は UTC で読むと前月になる。JST で読めているか", () => {
    // 2026-08-01 00:00 JST = 2026-07-31 15:00Z
    expect(new Date(jstMidnight(2026, 8, 1)).getUTCMonth() + 1).toBe(7);
    expect(jstMonthKey(jstMidnight(2026, 8, 1))).toBe("2026-08");
  });

  it("実時刻（Date.now 相当）にも同じ式が使える", () => {
    // 2026-08-01 00:30 JST = 2026-07-31 15:30Z
    expect(jstMonthKey(Date.UTC(2026, 6, 31, 15, 30))).toBe("2026-08");
    // 2026-07-31 23:30 JST = 2026-07-31 14:30Z
    expect(jstMonthKey(Date.UTC(2026, 6, 31, 14, 30))).toBe("2026-07");
  });
});

describe("isCurrentJstMonth", () => {
  const now = Date.UTC(2026, 7, 3, 6, 0); // 2026-08-03 15:00 JST

  it("当月なら true", () => {
    expect(isCurrentJstMonth(jstMidnight(2026, 8, 1), now)).toBe(true);
    expect(isCurrentJstMonth(jstMidnight(2026, 8, 31), now)).toBe(true);
  });

  it("前月・翌月は false", () => {
    expect(isCurrentJstMonth(jstMidnight(2026, 7, 31), now)).toBe(false);
    expect(isCurrentJstMonth(jstMidnight(2026, 9, 1), now)).toBe(false);
  });

  it("⚠️ 数値でない日付を通さない（永続キャッシュ・壊れた行）", () => {
    expect(isCurrentJstMonth(undefined, now)).toBe(false);
    expect(isCurrentJstMonth(null, now)).toBe(false);
  });
});

describe("canEditExpense", () => {
  const now = Date.UTC(2026, 7, 3, 6, 0); // 2026-08-03 JST
  const thisMonth = { created_by: ME, date: jstMidnight(2026, 8, 2) };
  const lastMonth = { created_by: ME, date: jstMidnight(2026, 7, 20) };

  it("admin は他人の・過去の月の分も直せる", () => {
    expect(canEditExpense("admin", ME, { created_by: OTHER, ...lastMonth }, now)).toBe(true);
  });

  it("集金担当者は自分が登録した当月の分を直せる", () => {
    expect(canEditExpense("collecter", ME, thisMonth, now)).toBe(true);
  });

  it("⚠️ 他人が登録した分は当月でも直せない", () => {
    expect(canEditExpense("collecter", ME, { ...thisMonth, created_by: OTHER }, now)).toBe(false);
  });

  it("⚠️ 自分の分でも先月は直せない（締めた月を動かさない）", () => {
    expect(canEditExpense("collecter", ME, lastMonth, now)).toBe(false);
  });

  it("⚠️ created_by が null の行は直せない（退会で SET NULL になる）", () => {
    expect(canEditExpense("collecter", ME, { created_by: null, date: thisMonth.date }, now)).toBe(
      false
    );
  });

  it("閲覧者は直せない", () => {
    expect(canEditExpense("viewer", ME, thisMonth, now)).toBe(false);
  });

  it("⚠️ 役割・利用者が分からないときは閉じるほうへ倒す", () => {
    expect(canEditExpense(undefined, undefined, thisMonth, now)).toBe(false);
    expect(canEditExpense("collecter", undefined, thisMonth, now)).toBe(false);
    expect(canEditExpense("collecter", ME, undefined, now)).toBe(false);
  });

  it("⚠️ collector（綴り違い）を通さない", () => {
    expect(canEditExpense("collector", ME, thisMonth, now)).toBe(false);
  });
});
