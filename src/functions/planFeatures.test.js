import { describe, expect, it } from "vitest";
import {
  PAID_PLANS,
  PLAN_ORDER,
  PLAN_ORDER_BY_RANK,
  PLAN_PRICES,
  TRIAL_PLAN,
  canInviteMembers,
  memberLimitLabel,
  paidPlanNames,
  paidPriceLines,
  planFeatureList,
  planRows,
  planSummary,
  priceLabel,
  storeLimitLabel,
  trialLabel,
} from "./planFeatures";
import { PLAN_LIMITS, PLAN_MEMBER_LIMITS, PLAN_NAMES } from "./plans";

/**
 * ここで守りたいのは「**プラン表に嘘を書く**」事故。
 *
 * 画面のテキストは型で守れないので、実際に制限している表
 * （PLAN_LIMITS / PLAN_MEMBER_LIMITS）から導けていることを固定する。
 */

describe("プランの並びと価格", () => {
  it("PLAN_ORDER は PLAN_RANK の順と一致する", () => {
    // ずれると料金表の並びだけが安い順でなくなる（見た目では気づきにくい）
    expect(PLAN_ORDER).toEqual(PLAN_ORDER_BY_RANK);
  });

  it("すべてのプランに価格がある", () => {
    expect(Object.keys(PLAN_PRICES).sort()).toEqual([...PLAN_ORDER].sort());
  });

  it("価格は序列どおりに上がる", () => {
    const prices = PLAN_ORDER.map((plan) => PLAN_PRICES[plan]);
    for (let i = 1; i < prices.length; i += 1) {
      expect(prices[i]).toBeGreaterThan(prices[i - 1]);
    }
  });

  it("有料プランは free 以外のすべて", () => {
    expect(PAID_PLANS).toEqual(["pro", "proplus", "max"]);
  });

  it("価格の表記に桁区切りが入る", () => {
    expect(priceLabel("pro")).toBe("¥800");
    expect(priceLabel("proplus")).toBe("¥1,500");
    expect(priceLabel("max")).toBe("¥3,000");
  });

  it("掲示用の価格一覧に有料プランが漏れなく出る", () => {
    const lines = paidPriceLines();
    expect(lines).toHaveLength(PAID_PLANS.length);
    expect(lines[0]).toBe("Proプラン：¥800/月（税込）");
    expect(lines[1]).toBe("Pro+プラン：¥1,500/月（税込）");
    expect(lines[2]).toBe("Maxプラン：¥3,000/月（税込）");
  });

  it("規約の本文に有料プランが漏れなく出る", () => {
    // ⚠️ 2026-08-03 まで「Pro・Max」と書いてあり Pro+ が抜けていた
    expect(paidPlanNames()).toBe("Pro・Pro+・Max");
    for (const plan of PAID_PLANS) {
      expect(paidPlanNames()).toContain(PLAN_NAMES[plan]);
    }
  });
});

describe("店舗数の表記", () => {
  it.each([
    ["free", "3店舗まで"],
    ["pro", "5店舗まで"],
    ["proplus", "10店舗まで"],
    ["max", "無制限"],
  ])("%s → %s", (plan, want) => {
    expect(storeLimitLabel(plan)).toBe(want);
  });

  it("PLAN_LIMITS と食い違わない", () => {
    for (const plan of PLAN_ORDER) {
      const limit = PLAN_LIMITS[plan];
      if (Number.isFinite(limit)) {
        expect(storeLimitLabel(plan)).toContain(String(limit));
      } else {
        expect(storeLimitLabel(plan)).toBe("無制限");
      }
    }
  });

  it("知らないプランは free 扱い（多く見せない）", () => {
    expect(storeLimitLabel("pro_plus")).toBe("3店舗まで");
    expect(storeLimitLabel(undefined)).toBe("3店舗まで");
  });
});

describe("メンバー招待", () => {
  it("free だけ招待できない", () => {
    expect(canInviteMembers("free")).toBe(false);
    expect(canInviteMembers("pro")).toBe(true);
    expect(canInviteMembers("proplus")).toBe(true);
    expect(canInviteMembers("max")).toBe(true);
  });

  it("有料プランはすべて同じ表記になる", () => {
    /*
      ⚠️ 2026-08-03 まで LP の表で Pro にだけ「無制限」が付いておらず、
         Pro だけ人数制限があるように読めた。実際は PLAN_MEMBER_LIMITS が
         3 つとも Infinity。
    */
    const labels = PAID_PLANS.map(memberLimitLabel);
    expect(new Set(labels).size).toBe(1);
    expect(labels[0]).toBe("無制限");
  });

  it("招待できないプランは人数を出さない", () => {
    expect(memberLimitLabel("free")).toBeNull();
  });

  it("PLAN_MEMBER_LIMITS と食い違わない", () => {
    for (const plan of PLAN_ORDER) {
      expect(canInviteMembers(plan)).toBe(PLAN_MEMBER_LIMITS[plan] > 1);
    }
  });
});

describe("比較表の行", () => {
  it("どのプランでも同じ行が同じ順で並ぶ", () => {
    const keys = PLAN_ORDER.map((plan) => planRows(plan).map((row) => row.key));
    for (const k of keys) expect(k).toEqual(keys[0]);
  });

  it("エクスポートは Pro 以上", () => {
    const exportOk = (plan) =>
      planRows(plan).find((row) => row.key === "export").ok;
    // サーバは `plan === "free"` で弾いている。表示と judgement を揃える
    expect(exportOk("free")).toBe(false);
    expect(exportOk("pro")).toBe(true);
    expect(exportOk("proplus")).toBe(true);
    expect(exportOk("max")).toBe(true);
  });

  it("上位プランは下位プランの機能を必ず含む", () => {
    /*
      ⚠️ これが崩れると「Pro+ にだけ機能が無い」表になる。実際 2026-08-03 まで
         Max にだけ「優先サポート」があり、提供の裏付けも無いまま
         Pro+ より上に見せていた。
    */
    for (let i = 1; i < PLAN_ORDER.length; i += 1) {
      const lower = planRows(PLAN_ORDER[i - 1]);
      const upper = planRows(PLAN_ORDER[i]);
      lower.forEach((row, idx) => {
        if (row.ok) expect(upper[idx].ok).toBe(true);
      });
    }
  });

  it("使えない行に値を出さない", () => {
    for (const row of planRows("free")) {
      if (!row.ok) expect(row.value).toBe("");
    }
  });

  it("知らないプランは free と同じ内容になる", () => {
    // 綴り違いが DB に入った組織にも、実際より多い内容を見せない
    expect(planRows("pro_plus")).toEqual(planRows("free"));
  });
});

describe("機能一覧・要約", () => {
  it("店舗数は一覧に含めない（カードで別に出すため）", () => {
    expect(planFeatureList("pro")).not.toContain("店舗数");
  });

  it("Free と Pro の差がエクスポートと招待だけになる", () => {
    const free = planFeatureList("free");
    const pro = planFeatureList("pro");
    expect(pro.filter((f) => !free.includes(f))).toEqual([
      "CSV/Excelエクスポート",
      "チームメンバー招待（無制限）",
    ]);
  });

  it("Pro / Pro+ / Max の機能は同じ（差は店舗数だけ）", () => {
    // 差が店舗数だけなのが実態。表でだけ差を作らない
    expect(planFeatureList("proplus")).toEqual(planFeatureList("pro"));
    expect(planFeatureList("max")).toEqual(planFeatureList("pro"));
  });

  it("要約は店舗数から始まる", () => {
    // 地の文なので「無制限」だけにしない（何が無制限か分からなくなる）
    expect(planSummary("max")).toMatch(/^店舗数無制限・/);
    expect(planSummary("proplus")).toMatch(/^10店舗まで・/);
  });
});

describe("トライアル", () => {
  it("Pro だけに付く", () => {
    /*
      ⚠️ Apple の導入オファーは購読グループ単位で 1 回。Pro+ にも付けると
         Pro で試した人には出ず、表示と実際が食い違う。
    */
    expect(TRIAL_PLAN).toBe("pro");
    expect(trialLabel("pro")).toBe("6か月無料トライアル");
    for (const plan of ["free", "proplus", "max"]) {
      expect(trialLabel(plan)).toBeNull();
    }
  });
});
