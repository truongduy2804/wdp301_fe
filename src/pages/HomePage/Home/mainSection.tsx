import BannerSection from "./Banner";
import CommunitySection from "./Community";
import MapSection from "./Map";
import ProcessSection from "./Process";
import HighLightSection from "./Highlight";
import CTASection from "./CTA";
import CourtSection from "./Court";
import FeedbackSection from "./Feedback";

const MainSection = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 overflow-hidden">
      <BannerSection />
      <CommunitySection />
      <HighLightSection />
      <CourtSection />
      <MapSection />
      <ProcessSection />
      <FeedbackSection />
      <CTASection />
    </div>
  );
};

export default MainSection;
