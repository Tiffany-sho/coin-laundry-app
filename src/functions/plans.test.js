import { describe, expect, it } from "vitest";
import {
  PLAN_LIMITS,
  PLAN_MEMBER_LIMITS,
  PLAN_NAMES,
  PLAN_RANK,
  planAtLeast,
  upgradeTargetsFrom,
} from "./plans";
import { APPLE_PRODUCT_IDS, PLAN_BY_PRODUCT_ID } from "./applePlans";

/**
 * プランの表が 4 つに増えた（2026-08-03 に Pro+ を追加）。
 *
 * ⚠️ ここで守りたいのは「**どれか 1 つの表にだけ足して他を忘れる**」事故。
 *    忘れても型エラーは出ず、`undefined` が既定値に落ちるので
 *    「店舗が 1 件も作れない」「プラン名が空欄」という形で静かに壊れる。
 */

const PLANS = ["free", "pro", "proplus", "max"];

describe("プランの表", () => {
  it.each(PLANS)("%s が 4 つの表すべてに載っている", (plan) => {
    expect(PLAN_LIMITS[plan]).toBeDefined();
    expect(PLAN_MEMBER_LIMITS[plan]).toBeDefined();
    expect(PLAN_NAMES[plan]).toBeDefined();
    expect(PLAN_RANK[plan]).toBeDefined();
  });

  it("表に余計なキーが無い（綴り違いの取り残し）", () => {
    for (const table of [PLAN_LIMITS, PLAN_MEMBER_LIMITS, PLAN_NAMES, PLAN_RANK]) {
      expect(Object.keys(table).sort()).toEqual([...PLANS].sort());
    }
  });

  it("店舗数の上限は序列どおりに増える", () => {
    const limits = PLANS.map((p) => PLAN_LIMITS[p]);
    for (let i = 1; i < limits.length; i += 1) {
      expect(limits[i]).toBeGreaterThan(limits[i - 1]);
    }
    expect(PLAN_LIMITS.proplus).toBe(10);
  });

  it("free だけがメンバー 1 人（招待できない）", () => {
    expect(PLAN_MEMBER_LIMITS.free).toBe(1);
    expect(PLAN_MEMBER_LIMITS.pro).toBe(Infinity);
    expect(PLAN_MEMBER_LIMITS.proplus).toBe(Infinity);
    expect(PLAN_MEMBER_LIMITS.max).toBe(Infinity);
  });
});

describe("Apple の商品 ID との対応", () => {
  /**
   * ⚠️ **綴りの規則ではなく、実際の文字列で固定する。**
   *    サーバは PLAN_BY_PRODUCT_ID の引きを organizations.plan にそのまま入れるので、
   *    App Store Connect と 1 文字でも違うと購入は成立するのにプランが上がらない。
   *
   * ⚠️ **`pro` だけ `pronormal` なのは 2026-08-04 の作り直しによる**（順位の設定を
   *    直すために ID を起こし直した）。**プランキーは `pro` のまま**なので、
   *    「キー＝商品 ID の中身」という規則はもう成り立たない。
   *    `com.collecie.app.${plan}.monthly` の形で書き直さないこと。
   */
  it.each([
    ["pro", "com.collecie.app.pronormal.monthly"],
    ["proplus", "com.collecie.app.proplus.monthly"],
    ["max", "com.collecie.app.max.monthly"],
  ])("%s の商品 ID が %s", (plan, productId) => {
    expect(APPLE_PRODUCT_IDS[plan]).toBe(productId);
  });

  /**
   * ⚠️ **旧 ID を落とさない。** 既に購入された取引と App Store Server
   *    Notification は今も古い ID を名乗ってくる。引けなくなると
   *    `toPlanPatch` が null を返し、「未知の商品です」で 400 になる。
   */
  it("販売を終えた商品 ID も引ける", () => {
    expect(PLAN_BY_PRODUCT_ID["com.collecie.app.pro.monthly"]).toBe("pro");
  });

  it("商品 ID から引いたプランが PLAN_LIMITS に載っている", () => {
    for (const productId of Object.values(APPLE_PRODUCT_IDS)) {
      const plan = PLAN_BY_PRODUCT_ID[productId];
      expect(PLAN_LIMITS[plan]).toBeDefined();
    }
  });

  it("free には商品 ID を作らない（購入できない）", () => {
    expect(APPLE_PRODUCT_IDS.free).toBeUndefined();
  });
});

describe("planAtLeast", () => {
  it("Pro 以上に Pro+ が含まれる", () => {
    // ⚠️ ここが false だと書き出しボタンが Pro+ の人にだけ出ない
    expect(planAtLeast("proplus", "pro")).toBe(true);
  });

  it.each([
    ["free", "pro", false],
    ["pro", "pro", true],
    ["proplus", "pro", true],
    ["max", "pro", true],
    ["pro", "proplus", false],
    ["proplus", "proplus", true],
  ])("%s は %s 以上か → %s", (plan, min, want) => {
    expect(planAtLeast(plan, min)).toBe(want);
  });

  it("知らないプランは free 扱いにする（有料機能を開けない）", () => {
    expect(planAtLeast("pro_plus", "pro")).toBe(false);
    expect(planAtLeast(undefined, "pro")).toBe(false);
    expect(planAtLeast(null, "pro")).toBe(false);
  });
});

describe("upgradeTargetsFrom", () => {
  it("free からは 3 つ、安い順", () => {
    expect(upgradeTargetsFrom("free")).toEqual(["pro", "proplus", "max"]);
  });

  it("pro からは Pro+ と Max", () => {
    expect(upgradeTargetsFrom("pro")).toEqual(["proplus", "max"]);
  });

  it("max からは何も出さない", () => {
    expect(upgradeTargetsFrom("max")).toEqual([]);
  });

  it("Free へ下げるボタンを出さない", () => {
    for (const plan of PLANS) {
      expect(upgradeTargetsFrom(plan)).not.toContain("free");
    }
  });

  it("知らないプランでも落ちず、全プランを提案する", () => {
    // 綴り違いが DB に入ってしまった組織でも、画面が空にならないこと
    expect(upgradeTargetsFrom("???")).toEqual(["pro", "proplus", "max"]);
  });
});
