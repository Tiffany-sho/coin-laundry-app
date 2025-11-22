import { createClient } from "@/utils/supabase/server";
import ErrorPage from "./feacher/jumpPage/ErrorPage/ErrorPage";
import NotLoginUserHome from "./feacher/home/components/NotLoginUserHome/NotLoginUserHome";
import LoginUserHome from "./feacher/home/components/LoginUserHome/LoginUserHome";
import WelcomeHome from "./feacher/home/components/WelcomeHome/WelcomeHome";
import { getUser } from "./api/supabaseFunctions/supabaseDatabase/user/action";

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
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id);

    if (error) {
      return {
        error: { msg: "データの取得に失敗しました", status: 500 },
        user: user,
        data: null,
      };
    }

    if (!data || data.length === 0) {
      return { data: null, user: user, error: null };
    }
    return { data: data[0], user: user };
  } catch (err) {
    return {
      error: { msg: "予期しないエラーが発生しました", status: 400 },
      user: user,
      data: null,
    };
  }
};

const Home = async () => {
  const { data, error, user } = await getData();
  if (error) return <ErrorPage title={error.msg} status={error.status} />;
  if (!user) return <NotLoginUserHome />;
  if (!data) return <WelcomeHome user={user} />;
  return <LoginUserHome id={data.id} username={data.username} />;
};

export default Home;
