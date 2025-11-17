import ExplainFunction from "./ExplainFunction";
import Footer from "./Footer";
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
      <Footer />
    </>
  );
};

export default NotLoginUserHome;
