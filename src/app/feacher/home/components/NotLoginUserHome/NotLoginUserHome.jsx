import BeforeAfter from "./BeforeAfter";
import FeatureShowcase from "./FeatureShowcase";
import PricingSection from "./PricingSection";
import Procedure from "./Procedure";
import Subscribe from "./Subscribe";
import TopPop from "./TopPop";

const NotLoginUserHome = () => {
  return (
    <>
      <TopPop />
      <BeforeAfter />
      <FeatureShowcase />
      <Procedure />
      <PricingSection />
      <Subscribe />
    </>
  );
};

export default NotLoginUserHome;
