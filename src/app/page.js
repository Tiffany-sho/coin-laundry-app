import { createClient } from "@/utils/supabase/server";
import ErrorPage from "./feacher/jumpPage/ErrorPage/ErrorPage";
import NotLoginUserHome from "./feacher/home/components/NotLoginUserHome/NotLoginUserHome";
import LoginUserHome from "./feacher/home/components/LoginUserHome/LoginUserHome";
import WelcomeHome from "./feacher/home/components/WelcomeHome/WelcomeHome";

const getData = async () => {
  const supabase = await createClient();
  const {
    data: { user },
    authError,
  } = await supabase.auth.getUser();
  try {
    if (authError) {
      return {
        error: { msg: "ユーザデータの取得に失敗しました", status: 500 },
      };
    }
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      return {
        error: { msg: "データの取得に失敗しました", status: 500 },
        user: user,
      };
    }
    return { data: data, user: user };
  } catch (err) {
    return {
      error: { msg: "予期しないエラー", status: 400 },
      user: user,
    };
  }
};

const Home = async () => {
  const { data, error, user } = await getData();

  if (!data && user) return <WelcomeHome />;
  if (!user && !data) return <NotLoginUserHome />;
  if (error || (!user && data))
    return <ErrorPage title={error.msg} status={error.status} />;
  if (user && data) {
    return <LoginUserHome id={data.id} username={data.username} />;
  }
};

export default Home;
