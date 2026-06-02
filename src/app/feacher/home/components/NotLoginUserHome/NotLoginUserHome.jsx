import BeforeAfter from "./BeforeAfter";
import FeatureShowcase from "./FeatureShowcase";
import PricingSection from "./PricingSection";
import Procedure from "./Procedure";
import Subscribe from "./Subscribe";
import TopPop from "./TopPop";

const NotLoginUserHome = () => {
  return (
    <div style={{ fontFamily: "'Zen Kaku Gothic New', sans-serif" }}>
      <TopPop />
      <BeforeAfter />
      <FeatureShowcase />
      <Procedure />
      <PricingSection />
      <Subscribe />
    </div>
  );
};

export default NotLoginUserHome;
