import { NextResponse } from "next/server";
import { getUser } from "@/app/api/supabaseFunctions/supabaseDatabase/user/action";

// HTTP ステータスからアプリ側が分岐するためのコードを引く
const CODE_BY_STATUS = {
  401: "UNAUTHENTICATED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  426: "UPGRADE_REQUIRED",
  500: "INTERNAL_ERROR",
};

export function errorResponse(message, status, code) {
  return NextResponse.json(
    { error: { message, code: code ?? CODE_BY_STATUS[status] ?? "BAD_REQUEST" } },
    { status }
  );
}

/**
 * Server Action の error は 2 系統ある。どちらも同じ JSON に正規化する。
 *   - { error: "メッセージ" }        … organization / profiles 系
 *   - { error: { msg, status } }     … laundryStore / collectFunds 系
 */
function normalizeError(error, status) {
  if (typeof error === "string") {
    return errorResponse(error, status ?? 400);
  }
  return errorResponse(
    error?.msg ?? error?.message ?? "エラーが発生しました",
    status ?? error?.status ?? 400,
    error?.code
  );
}

/**
 * Expo の web プレビュー（localhost:8081）から localhost:3000 を叩くと別オリジンになる。
 * 開発時だけ許可する。本番では Origin を見る前に false になるので一切付与されない。
 *
 * ⚠️ ここを本番でも有効にしないこと。実機アプリは Origin を送らないので不要。
 */
const ALLOW_CORS_IN_DEV = process.env.NODE_ENV !== "production";

function applyCors(response, request) {
  if (!ALLOW_CORS_IN_DEV) return response;

  const origin = request?.headers?.get("origin");
  if (!origin) return response;

  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Authorization, Content-Type, X-Client-Version, Idempotency-Key"
  );
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  response.headers.set("Vary", "Origin");
  return response;
}

/** 各 route から `export const OPTIONS = corsPreflight` する */
export function corsPreflight(request) {
  return applyCors(new NextResponse(null, { status: 204 }), request);
}

/**
 * モバイル向け Route Handler の共通ラッパー。
 * 認可は既存 Server Action が持っているので、ここでは JWT 検証と整形だけ行う。
 *
 * handler は Server Action と同じ { data } / { error } 形式を返すこと。
 * status を明示したい場合は { error, status } を返す。
 */
export function withAuth(handler) {
  return async (request, context) => {
    try {
      // createClient() が Authorization ヘッダを解決済みなので Web と同じ関数で足りる
      const { user } = await getUser();
      if (!user) {
        return applyCors(errorResponse("ログインしてください", 401), request);
      }

      const result = await handler(request, context, user);

      if (result?.error) {
        return applyCors(normalizeError(result.error, result.status), request);
      }

      return applyCors(NextResponse.json({ data: result?.data ?? null }), request);
    } catch (e) {
      console.error("[api/v1]", e);
      return applyCors(errorResponse("予期しないエラーが発生しました", 500), request);
    }
  };
}
