import { createClient } from "@/utils/supabase/server";
import ErrorPage from "./feacher/jumpPage/ErrorPage/ErrorPage";
import NotLoginUserHome from "./feacher/home/components/NotLoginUserHome/NotLoginUserHome";
import LoginUserHome from "./feacher/home/components/LoginUserHome/LoginUserHome";
import WelcomeHome from "./feacher/home/components/WelcomeHome/WelcomeHome";

const getData = async () => {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        error: { msg: "ユーザデータの取得に失敗しました", status: 500 },
        user: user,
        data: null,
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
        data: null,
      };
    }
    return { data: data, user: user };
  } catch (err) {
    return {
      error: { msg: "予期しないエラー", status: 400 },
      user: user,
      data: null,
    };
  }
};

const Home = async () => {
  const { data, error, user } = await getData();
  if (!data && user) return <WelcomeHome user={user} />;
  if (!user && !data) return <NotLoginUserHome />;
  if (error || (!user && data))
    return <ErrorPage title={error.msg} status={error.status} />;
  if (user && data) {
    return <LoginUserHome id={data.id} username={data.username} />;
  }
};

export default Home;
