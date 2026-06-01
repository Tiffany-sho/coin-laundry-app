import { createClient } from "@/utils/supabase/server";
import Script from "next/script";
import ErrorPage from "./feacher/jumpPage/ErrorPage/ErrorPage";
import NotLoginUserHome from "./feacher/home/components/NotLoginUserHome/NotLoginUserHome";
import LoginUserHome from "./feacher/home/components/LoginUserHome/LoginUserHome";
import WelcomeHome from "./feacher/home/components/WelcomeHome/WelcomeHome";
import { getUser } from "./api/supabaseFunctions/supabaseDatabase/user/action";
import { getMyOrganization } from "./api/supabaseFunctions/supabaseDatabase/organization/action";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "コインランドリー集金アプリ | 無料で始める - Collecie",
  description:
    "コインランドリーの集金記録・売上管理・在庫管理・機器状態をスマホでかんたん一元管理。月次レポートの自動生成やCSV/Excelエクスポートにも対応。3店舗まで永久無料。",
  alternates: {
    canonical: "https://www.collecie.com",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Collecie",
  alternateName: "コインランドリー集金管理アプリ",
  description:
    "コインランドリーの集金記録・売上管理・在庫管理・機器状態をスマホでかんたん一元管理できるWebアプリ。月次レポートの自動生成やCSV/Excelエクスポートにも対応。",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: "https://www.collecie.com",
  inLanguage: "ja",
  offers: [
    {
      "@type": "Offer",
      name: "Free",
      price: "0",
      priceCurrency: "JPY",
      description: "3店舗まで永久無料",
    },
    {
      "@type": "Offer",
      name: "Pro",
      price: "780",
      priceCurrency: "JPY",
      description: "5店舗まで・CSV/Excelエクスポート・チームメンバー招待",
    },
    {
      "@type": "Offer",
      name: "Max",
      price: "2980",
      priceCurrency: "JPY",
      description: "無制限店舗・全機能・メンバー無制限",
    },
  ],
  featureList: [
    "集金記録・売上管理",
    "在庫管理（洗剤・柔軟剤）",
    "機器状態管理",
    "売上グラフ・月次レポート",
    "CSV/Excelエクスポート",
    "チームメンバー招待",
    "コインランドリー複数店舗管理",
  ],
};

const getData = async () => {
  const { user } = await getUser();

  if (!user) {
    return {
      error: null,
      user: null,
      data: null,
    };
  }

  const supabase = await createClient();

  try {
    const [profileResult, orgResult] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id),
      getMyOrganization(),
    ]);

    if (profileResult.error) {
      return {
        error: { msg: "データの取得に失敗しました", status: 500 },
        user: user,
        data: null,
      };
    }

    if (!profileResult.data || profileResult.data.length === 0) {
      return { data: null, user: user, error: null };
    }
    return {
      data: profileResult.data[0],
      user: user,
      myRole: orgResult.data?.myRole ?? "viewer",
      hasOrg: !!orgResult.data,
    };
  } catch (err) {
    return {
      error: { msg: "予期しないエラーが発生しました", status: 400 },
      user: user,
      data: null,
    };
  }
};

const Home = async () => {
  const { data, error, user, myRole, hasOrg } = await getData();
  if (error) return <ErrorPage title={error.msg} status={error.status} />;
  if (!user)
    return (
      <>
        <Script
          id="json-ld-app"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <NotLoginUserHome />
      </>
    );
  if (!data) return <WelcomeHome user={user} />;
  return <LoginUserHome id={data.id} username={data.username} myRole={myRole} hasOrg={hasOrg} />;
};

export default Home;
