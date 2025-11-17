import { createClient } from "@/utils/supabase/server";
import ErrorPage from "./feacher/jumpPage/ErrorPage/ErrorPage";
import NotLoginUserHome from "./feacher/home/components/NotLoginUserHome/NotLoginUserHome";
import LoginUserHome from "./feacher/home/components/LoginUserHome/LoginUserHome";

const getData = async () => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  try {
    if (error) {
      return {
        error: { msg: "データの取得に失敗しました", status: 500 },
      };
    }
    return { data: user };
  } catch (err) {
    return {
      error: { msg: "予期しないエラー", status: 400 },
    };
  }
};

const Home = async () => {
  const { data, error } = await getData();

  if (error) return <ErrorPage title={error.msg} status={error.status} />;

  if (!data) {
    return <NotLoginUserHome />;
  }

<<<<<<< HEAD:src/app/page.jsx
  return <LoginUserHome id={data.id} username={data.username} />;
=======
  return (
    <>
      <LoginUserHome id={data.id} />
    </>
  );
>>>>>>> parent of d9b631f (ログインユーザのホーム画面完成):src/app/page.js
};

export default Home;
