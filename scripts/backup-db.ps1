<#
.SYNOPSIS
  Supabase の本番 DB をダンプする。

.DESCRIPTION
  このプロジェクトの Supabase は Free プランで自動バックアップが1つも無い
  （docs/security.md §4-1）。失ったら戻らないので、定期的にこれを実行する。

  ⚠️ **ダンプはリポジトリの外に書く。** このリポジトリは public なので、
     中に置いて誤ってコミットすると利用者の売上データがそのまま公開される。
     既定の保存先は %USERPROFILE%\backups\collecie。

  ⚠️ **パスワードは引数で渡さない。** 実行時に聞く。
     コマンド履歴にもスクリプトにも残らないようにしてある。

.PARAMETER OutDir
  保存先。既定は %USERPROFILE%\backups\collecie

.PARAMETER ProjectRef
  Supabase のプロジェクト ref。既定はこのプロジェクトのもの。

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts\backup-db.ps1
#>

param(
    [string]$OutDir = (Join-Path $env:USERPROFILE "backups\collecie"),
    [string]$ProjectRef = "hhdipgftsrsmmuqyifgt",
    # 直接接続（db.<ref>.supabase.co）を使う。既定は Session pooler。下の注意を読むこと。
    [switch]$Direct
)

$ErrorActionPreference = "Stop"

# --- pg_dump を探す -------------------------------------------------------
# Supabase は PostgreSQL 17。pg_dump はサーバと同じかそれ以上のメジャーが要る。
$pgDump = $null
$cmd = Get-Command pg_dump -ErrorAction SilentlyContinue
if ($cmd) {
    $pgDump = $cmd.Source
} else {
    $candidates = Get-ChildItem "C:\Program Files\PostgreSQL" -Directory -ErrorAction SilentlyContinue |
        Sort-Object { [int]($_.Name -replace '\D', '0') } -Descending
    foreach ($c in $candidates) {
        $p = Join-Path $c.FullName "bin\pg_dump.exe"
        if (Test-Path $p) { $pgDump = $p; break }
    }
}

if (-not $pgDump) {
    Write-Output "pg_dump が見つかりません。先に PostgreSQL 17 を入れてください:"
    Write-Output "    winget install -e --id PostgreSQL.PostgreSQL.17"
    exit 1
}

$verLine = & $pgDump --version
Write-Output ("使う pg_dump: " + $pgDump)
Write-Output ("  " + $verLine)

$major = 0
if ($verLine -match 'pg_dump \(PostgreSQL\) (\d+)') { $major = [int]$Matches[1] }
if ($major -lt 17) {
    Write-Output "pg_dump が 17 より古いため、Supabase (PostgreSQL 17) をダンプできません。"
    exit 1
}

# --- 保存先 ---------------------------------------------------------------
if (-not (Test-Path $OutDir)) { New-Item -ItemType Directory -Force -Path $OutDir | Out-Null }

$stamp = Get-Date -Format "yyyyMMdd-HHmm"
$dataFile = Join-Path $OutDir ("collecie-public-$stamp.dump")
$authFile = Join-Path $OutDir ("collecie-auth-users-$stamp.sql")

# --- 接続先 ---------------------------------------------------------------
<#
  ⚠️ **既定は Session pooler。直接接続は使えないことがある。**

  db.<ref>.supabase.co は IPv6 しか持たない（A レコードが無い）。
  2026-10-23 にこの環境から pg_dump が Connection timed out で失敗した。
  Test-NetConnection は一度 True を返したが当てにならず、生ソケットでも
  10 秒でつながらなかった。IPv4 で届く Session pooler を既定にする。

  ⚠️ **ポートは 5432（Session pooler）。6543（Transaction pooler）は使わない。**
     pg_dump はセッションを張り続けるため、transaction モードでは動かない。

  pooler のユーザ名は postgres ではなく postgres.<ref> の形式。
  aws-0 と aws-1 のどちらに居るかはプロジェクトごとに違う。
  間違えると「tenant/user ... not found」になる（このプロジェクトは aws-1）。
  移設された場合は Dashboard -> Settings -> Database -> Connection string ->
  Session pooler で確認して、下の既定値を直すこと。
#>
if ($Direct) {
    $dbHost = "db.$ProjectRef.supabase.co"
    $dbUser = "postgres"
} else {
    $dbHost = "aws-1-ap-northeast-1.pooler.supabase.com"
    $dbUser = "postgres.$ProjectRef"
}

Write-Output ""
Write-Output ("接続先: " + $dbHost + ":5432")
Write-Output ("ユーザ: " + $dbUser + " / db=postgres")
Write-Output ("保存先: " + $OutDir)
Write-Output ""

# --- パスワード -----------------------------------------------------------
# Supabase Dashboard -> Settings -> Database -> Database password
# 控えが無ければ同じ画面でリセットしてよい。
# このアプリは Supabase の API 経由で動いていて、DB へ直接つなぐ箇所は無いため
# （DATABASE_URL 等を使っていない）、パスワードを変えてもアプリは止まらない。
$secure = Read-Host -Prompt "Supabase の DB パスワード" -AsSecureString
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
try {
    $env:PGPASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
} finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
}

try {
    # --- 本体: public スキーマを丸ごと（スキーマ + データ） ---------------
    # --no-owner / --no-privileges: Supabase のロールは復元先に無いことがあるため
    # --format=custom: pg_restore で部分復元できる圧縮形式
    Write-Output "public スキーマをダンプしています..."
    & $pgDump `
        --host=$dbHost --port=5432 --username=$dbUser --dbname=postgres `
        --schema=public `
        --format=custom --no-owner --no-privileges `
        --file=$dataFile
    if ($LASTEXITCODE -ne 0) { throw "pg_dump (public) が失敗しました" }

    # --- 参考: auth.users --------------------------------------------------
    # アカウントの一覧。別プロジェクトへそのまま流し込むことはできないが、
    # 誰が登録していたかを失わないために取っておく。
    Write-Output "auth.users をダンプしています..."
    & $pgDump `
        --host=$dbHost --port=5432 --username=$dbUser --dbname=postgres `
        --table=auth.users --data-only `
        --format=plain --no-owner --no-privileges `
        --file=$authFile
    if ($LASTEXITCODE -ne 0) { throw "pg_dump (auth.users) が失敗しました" }
} finally {
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}

Write-Output ""
Write-Output "完了:"
Get-ChildItem $dataFile, $authFile | ForEach-Object {
    Write-Output ("  {0}  ({1:N0} bytes)" -f $_.Name, $_.Length)
}

Write-Output ""
Write-Output "中身の確認 (復元はしない):"
Write-Output ("    & '" + $pgDump.Replace('pg_dump.exe', 'pg_restore.exe') + "' --list '" + $dataFile + "'")
Write-Output ""
Write-Output "⚠️ 取ったダンプは一度「戻せること」を試すこと。試していないバックアップはバックアップではない。"
Write-Output "⚠️ このファイルは利用者の売上データ。リポジトリの中に移さないこと。"
