import { describe, it, expect } from "vitest";
import { originFromHeaders } from "./requestOrigin";

const H = (obj) => new Headers(obj);

describe("originFromHeaders", () => {
  it("手元では host をそのまま使い、http にする", () => {
    expect(originFromHeaders(H({ host: "localhost:3000" }))).toBe("http://localhost:3000");
  });

  it("LAN の IP でも http（スマホ実機で開くとき）", () => {
    expect(originFromHeaders(H({ host: "192.168.0.21:3000" }))).toBe("http://192.168.0.21:3000");
  });

  it("プロキシ越しは x-forwarded-* を優先する", () => {
    const h = H({
      host: "internal-vercel.local",
      "x-forwarded-host": "www.collecie.com",
      "x-forwarded-proto": "https",
    });
    expect(originFromHeaders(h)).toBe("https://www.collecie.com");
  });

  it("外部ホストで forwarded-proto が無ければ https に倒す", () => {
    expect(originFromHeaders(H({ host: "www.collecie.com" }))).toBe("https://www.collecie.com");
  });

  /* ⚠️ これが 2026-08-18 の不具合。0.0.0.0 は絶対に返さない */
  it("host が 0.0.0.0 のときは fallback を返す", () => {
    expect(originFromHeaders(H({ host: "0.0.0.0:3000" }), "http://localhost:3000")).toBe(
      "http://localhost:3000"
    );
  });

  it("host が無ければ fallback", () => {
    expect(originFromHeaders(H({}), "http://localhost:3000")).toBe("http://localhost:3000");
  });

  it("素のオブジェクトでも読める", () => {
    expect(originFromHeaders({ host: "localhost:3000" })).toBe("http://localhost:3000");
  });
});
