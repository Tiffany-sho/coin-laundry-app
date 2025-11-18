import ExplainFunction from "./ExplainFunction";
import Procedure from "./Procedure";
import Subscribe from "./Subscribe";
import TopPop from "./TopPop";

const NotLoginUserHome = () => {
  return (
    <>
      <TopPop />
      <ExplainFunction />
      <Procedure />
      <Subscribe />
    </>
  );
};

export default NotLoginUserHome;
