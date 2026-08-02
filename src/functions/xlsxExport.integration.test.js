// buildSheets の出力が実際に write-excel-file を通り、
// 壊れていない .xlsx（シート名が一意・31文字以内）になることを検証する統合テスト。
//
// ライブラリ側は不正なシート名に対して例外を投げるが、
// 「重複」だけは例外にならず壊れたブックが出来てしまうため、生成結果まで確認する。
import { describe, it, expect } from "vitest";
import zlib from "node:zlib";
import writeXlsxFile from "write-excel-file/node";
import { buildSheets, SHEET_NAME_MAX } from "./xlsxExport";
import { getEpochTimeInSeconds } from "./makeDate/date";

const epoch = (y, m, d) => getEpochTimeInSeconds(y, m, d);

// 意図的に厄介なデータ: Excel禁止文字・31文字超・カンマ・引用符・欠損
const nastyRecords = [
  {
    date: epoch(2026, 6, 15),
    laundryName: "駅前[北口]:南/店",
    totalFunds: 12000,
    fundsArray: [{ name: '洗濯機"A",大型', funds: 30 }],
    profiles: { username: "田中, 花子" },
  },
  {
    date: epoch(2026, 7, 3),
    laundryName: "駅前*北口?南\\店",
    totalFunds: 8000,
    fundsArray: [{ name: "乾燥機B", funds: 12 }],
    profiles: null,
  },
  {
    date: epoch(2026, 7, 27),
    laundryName: "あ".repeat(50),
    totalFunds: 0,
    fundsArray: null,
    profiles: { username: "佐藤" },
  },
];

// .xlsx は zip。中央ディレクトリから xl/workbook.xml を取り出してシート名を読む。
function readSheetNames(buffer) {
  for (let off = 0; off < buffer.length - 4; off++) {
    if (buffer.readUInt32LE(off) !== 0x02014b50) continue;
    const method = buffer.readUInt16LE(off + 10);
    const compSize = buffer.readUInt32LE(off + 20);
    const nameLen = buffer.readUInt16LE(off + 28);
    const extraLen = buffer.readUInt16LE(off + 30);
    const commentLen = buffer.readUInt16LE(off + 32);
    const localOff = buffer.readUInt32LE(off + 42);
    const entry = buffer.subarray(off + 46, off + 46 + nameLen).toString("utf8");
    if (entry === "xl/workbook.xml") {
      const lNameLen = buffer.readUInt16LE(localOff + 26);
      const lExtraLen = buffer.readUInt16LE(localOff + 28);
      const start = localOff + 30 + lNameLen + lExtraLen;
      const raw = buffer.subarray(start, start + compSize);
      const xml =
        method === 8 ? zlib.inflateRawSync(raw).toString("utf8") : raw.toString("utf8");
      // 実際の出力は <sheet r:id="rId1" sheetId="1" name="..."/> の順で属性が並ぶ
      return [...xml.matchAll(/<sheet\b[^>]*\bname="([^"]*)"/g)].map((m) => m[1]);
    }
    off += 46 + nameLen + extraLen + commentLen - 1;
  }
  return [];
}

describe.each(["period", "store", "none"])("buildSheets → write-excel-file (%s)", (splitMethod) => {
  it("厄介な店舗名でも例外なく .xlsx を生成できる", async () => {
    const sheets = buildSheets(nastyRecords, { splitMethod });
    const buffer = await writeXlsxFile(sheets).toBuffer();

    expect(Buffer.isBuffer(buffer)).toBe(true);
    // zip のマジックナンバー "PK\x03\x04"
    expect(buffer.subarray(0, 4)).toEqual(Buffer.from([0x50, 0x4b, 0x03, 0x04]));
  });

  it("生成されたブックのシート名が一意かつ31文字以内", async () => {
    const sheets = buildSheets(nastyRecords, { splitMethod });
    const buffer = await writeXlsxFile(sheets).toBuffer();
    const names = readSheetNames(buffer);

    expect(names.length).toBe(sheets.length);
    expect(new Set(names).size).toBe(names.length);
    names.forEach((n) => expect(n.length).toBeLessThanOrEqual(SHEET_NAME_MAX));
  });
});

describe("buildSheets → write-excel-file (通常データ)", () => {
  const records = [
    {
      date: epoch(2026, 6, 15),
      laundryName: "駅前",
      totalFunds: 12000,
      fundsArray: [{ name: "洗濯機A", funds: 30 }],
      profiles: { username: "佐藤" },
    },
    {
      date: epoch(2026, 7, 3),
      laundryName: "本町",
      totalFunds: 8000,
      fundsArray: [{ name: "乾燥機B", funds: 12 }],
      profiles: { username: "田中" },
    },
  ];

  it("月ごとに2シートのブックになる", async () => {
    const sheets = buildSheets(records, { splitMethod: "period" });
    const buffer = await writeXlsxFile(sheets).toBuffer();
    expect(readSheetNames(buffer)).toEqual(["2026年6月", "2026年7月"]);
  });

  it("店舗ごとに2シートのブックになる", async () => {
    const sheets = buildSheets(records, { splitMethod: "store" });
    const buffer = await writeXlsxFile(sheets).toBuffer();
    expect(readSheetNames(buffer)).toEqual(["駅前店", "本町店"]);
  });

  // ---- "none"（店舗別の収益ページからの書き出し）----

  it("'none' は月も店舗もまたいで1シートのブックになる", async () => {
    const sheets = buildSheets(records, { splitMethod: "none" });
    const buffer = await writeXlsxFile(sheets).toBuffer();
    expect(readSheetNames(buffer)).toEqual(["集金データ"]);
    // ヘッダー 1 行 + データ 2 行が同じシートに並ぶ
    expect(sheets).toHaveLength(1);
    expect(sheets[0].data).toHaveLength(3);
  });

  it("'none' で 1 店舗ぶんならシート名が店舗名になる", async () => {
    const single = records.map((r) => ({ ...r, laundryName: "本町" }));
    const buffer = await writeXlsxFile(buildSheets(single, { splitMethod: "none" })).toBuffer();
    expect(readSheetNames(buffer)).toEqual(["本町店"]);
  });

  /*
    ⚠️ **1 店舗ぶんを "store" で代用しない。** 改名をまたいだ集金があると
       laundryName が 2 種類になり、1 店舗なのに 2 シートに割れる。
  */
  it("⚠️ 改名をまたいでも 'none' なら 1 シート（'store' は 2 シートに割れる）", async () => {
    const renamed = [
      { ...records[0], laundryName: "本町" },
      { ...records[1], laundryName: "本町中央" },
    ];
    const byStore = await writeXlsxFile(buildSheets(renamed, { splitMethod: "store" })).toBuffer();
    expect(readSheetNames(byStore)).toEqual(["本町店", "本町中央店"]);

    const none = await writeXlsxFile(buildSheets(renamed, { splitMethod: "none" })).toBuffer();
    expect(readSheetNames(none)).toEqual(["集金データ"]);
  });
});
