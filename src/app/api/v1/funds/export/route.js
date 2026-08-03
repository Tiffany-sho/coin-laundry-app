import { withAuth, corsPreflight } from "../../_lib/handler";
import writeXlsxFile from "write-excel-file/node";
import { getCollectFundsForExport } from "@/app/api/supabaseFunctions/supabaseDatabase/collectFunds/action";
import { getOrgPlan } from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";
import { getExpenses } from "@/app/api/supabaseFunctions/supabaseDatabase/expenses/action";
import { recordsToCsv, recordsToCsvWithExpenses } from "@/functions/csvExport";
import { buildSheets, buildSheetsWithExpenses } from "@/functions/xlsxExport";
import { formatDateSuffix } from "@/functions/exportData";

export const dynamic = "force-dynamic";

/**
 * 応答に載せてよい base64 の合計長。
 *
 * ⚠️ **Vercel のサーバーレス関数は応答が 4.5MB を超えると壊れる。**
 *    base64 は元のバイト列より約 1.33 倍に膨らむので、素の上限より手前で切る。
 *    ここで弾かないと、端末には途中で切れた JSON が届いてパースエラーになり、
 *    「通信できませんでした」としか出ない（原因がデータ量だと分からない）。
 */
const MAX_BASE64_LENGTH = 3_500_000;

/** 端末に渡してよい形式 */
const FORMATS = new Set(["csv", "xlsx"]);

/**
 * Excel のシートの分け方。
 * ⚠️ **`"none"` は「1 シートにまとめる」。** 店舗別の収益ページからの書き出しが使う。
 *    ⚠️ 1 店舗ぶんを `"store"` で代用しないこと（改名した店舗は 2 シートに割れる。
 *    理由は `groupRecords` のコメント）。
 */
const SPLITS = new Set(["period", "store", "none"]);

/**
 * 集金データのエクスポート（CSV / Excel）。
 *
 * Web は `/api/export/collect-csv`（行を JSON で返してブラウザで CSV を組む）と
 * `/api/export/collect-xlsx`（バイナリを直接返す）に分かれているが、アプリは
 * **どちらも base64 の文字列で受け取り、端末でファイルに書き出して共有シートに渡す。**
 * 形式ごとに受け取り方を変えないほうが、保存と共有の処理を 1 本にできる。
 *
 * ⚠️ **CSV の組み立てをアプリ側に持たせない。** `src/functions/csvExport.js` を
 *    そのまま呼ぶことで、Web とアプリで列の並び・エスケープ・BOM が必ず一致する。
 *    2 リポジトリに同じ整形ロジックを置くと、片方だけ直したときに
 *    型エラーも出ないまま列がずれる（商品 ID と同じ罠）。
 *
 * ⚠️ **返すファイルは必ず 1 つ。** Web の CSV は月ごと・店舗ごとに分けて
 *    連続ダウンロードするが、iOS に「まとめて保存」は無く、共有シートが
 *    ファイルの数だけ開くことになる。したがって
 *      - CSV  … 分割せず全期間を 1 ファイル（`splitMethod` は見ない）
 *      - Excel … 1 ブックの中で `splitMethod` ごとにシートを分ける
 *    とする。分割の指定が効くのは Excel だけ。
 *
 * ⚠️ **GET ではなく POST。** 読み取りだけだが storeIds が配列で、
 *    店舗数が増えるとクエリ文字列の長さ上限に当たる。副作用は無いので
 *    Idempotency-Key も要らないし、アクションログにも残さない
 *    （組織のデータを変えない操作。残すと書き出すたびに履歴が増える）。
 */
export const POST = withAuth(async (request) => {
  let body;
  try {
    body = await request.json();
  } catch {
    return { error: "リクエストの形式が不正です", status: 400 };
  }

  const format = body?.format ?? "csv";
  if (!FORMATS.has(format)) {
    return { error: "ファイル形式の指定が不正です", status: 400 };
  }
  /* ⚠️ 知らない値は "period" に倒す。エラーにすると、古いアプリが新しい値を
        送ってきたときに書き出しごと失敗する（分け方は本質ではない） */
  const splitMethod = SPLITS.has(body?.splitMethod) ? body.splitMethod : "period";

  const startEpoch = body?.startEpoch ?? null;
  const endEpoch = body?.endEpoch ?? null;
  if (startEpoch !== null && !Number.isFinite(startEpoch)) {
    return { error: "期間の指定が不正です", status: 400 };
  }
  if (endEpoch !== null && !Number.isFinite(endEpoch)) {
    return { error: "期間の指定が不正です", status: 400 };
  }
  if (startEpoch !== null && endEpoch !== null && startEpoch > endEpoch) {
    return { error: "期間の指定が不正です", status: 400 };
  }

  const storeIds = Array.isArray(body?.storeIds) && body.storeIds.length > 0
    ? body.storeIds
    : null;

  /**
   * ⚠️ **Web と同じく Pro 以上に限る。** ここを開けるとアプリだけ無料で
   *    書き出せてしまい、同じ組織なのに入り口で条件が変わる。
   *    判定はサーバ側のプランだけを見る（アプリの表示は UI の出し分け用）。
   */
  const { data: planInfo, error: planError } = await getOrgPlan();
  if (planError || !planInfo) {
    return { error: "プラン情報を取得できませんでした", status: 400 };
  }
  if (planInfo.plan === "free") {
    return { error: "データの書き出しは Pro プラン以上でご利用いただけます", status: 403 };
  }

  // ⚠️ 期間の終端は inclusive（getCollectFundsForExport が lte で引く）。
  //    「その月まで」を渡すときは翌月 1 日ではなく、その 1 ミリ秒前を送ること
  const { data, error } = await getCollectFundsForExport(startEpoch, endEpoch, storeIds);
  if (error) return { error, status: 400 };

  if (!data || data.length === 0) {
    return { error: "この条件に合う集金データがありません", status: 404 };
  }

  /*
    経費と月別利益を足すか。**既定は足さない。**
    ⚠️ CSV は 1 ファイルに 3 つの表を縦に並べる形になり、会計ソフトへ
       そのまま取り込めなくなる。だから既定を変えず、利用者に選ばせる。
  */
  const includeExpenses = body?.includeExpenses === true;
  let expenses = [];

  if (includeExpenses) {
    /*
      ⚠️ **期間は集金と同じものを渡す。** `getExpenses` の `to` は「含む」で、
         このルートの `endEpoch` も inclusive なのでそのまま合う
         （`/funds/chart` の `to` だけが排他。向きを取り違えないこと）。
      ⚠️ **期間の指定が無いときは全期間。** `getExpenses` は期間を必須にして
         いるので、無制限を表す値を自分で作る（0 〜 十分未来）。
      ⚠️ **担当店舗（011）でサーバが絞る。** 担当外の経費は返らない。
    */
    const from = startEpoch ?? 0;
    const to = endEpoch ?? Date.now() + 366 * 24 * 60 * 60 * 1000;

    const result = await getExpenses(from, to);
    if (result.error) {
      const message = typeof result.error === "string" ? result.error : result.error.msg;
      return { error: message ?? "経費を取得できませんでした", status: 400 };
    }

    expenses = result.data ?? [];

    /*
      ⚠️ **店舗で絞ったら経費も同じ店舗だけにする。**
         ⚠️ **組織全体の経費（`laundry_id` が NULL）は落とす。** 按分の規則が
            無いので勝手に割らない、という規約（店舗別の月別利益と同じ）。
            残すと「1 店舗ぶんの書き出し」に税理士費用が丸ごと乗る。
    */
    if (storeIds) {
      expenses = expenses.filter((e) => e.laundryId && storeIds.includes(e.laundryId));
    }
  }

  const suffix = formatDateSuffix();
  let file;

  if (format === "csv") {
    const csv = includeExpenses
      ? recordsToCsvWithExpenses(data, expenses)
      : recordsToCsv(data);
    file = {
      name: `collecie_${suffix}.csv`,
      // ⚠️ **utf8 を明示する。** csv は先頭に BOM が付き中身も日本語なので、
      //    既定（latin1 相当）で畳むと端末で開いたときに全部化ける
      base64: Buffer.from(csv, "utf8").toString("base64"),
    };
  } else {
    const sheets = includeExpenses
      ? buildSheetsWithExpenses(data, expenses, { splitMethod })
      : buildSheets(data, { splitMethod });
    const buffer = await writeXlsxFile(sheets).toBuffer();
    file = { name: `collecie_${suffix}.xlsx`, base64: buffer.toString("base64") };
  }

  if (file.base64.length > MAX_BASE64_LENGTH) {
    return {
      error: "データが大きすぎます。期間を短くするか店舗を絞ってお試しください",
      status: 413,
    };
  }

  return {
    data: {
      format,
      ...file,
      recordCount: data.length,
      /* ⚠️ 0 件でも返す。「経費も書き出す」を選んだのに数が出ないと、
            失敗したのか本当に 0 件なのか区別が付かない */
      expenseCount: includeExpenses ? expenses.length : null,
    },
  };
});

export const OPTIONS = corsPreflight;
