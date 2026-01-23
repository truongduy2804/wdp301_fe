import HeroSection from "./Hero_Section";
import StorySection from "./Story_Section";
import AppFeatureSection from "./AppFeature_Section";
import BenefitSection from "./Benefit_Section";
import TimelineSection from "./Timeline_Section";
import CTASection from "./CTA_Section";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <StorySection />
      <AppFeatureSection />
      <BenefitSection />
      <TimelineSection />
      <CTASection/>
    </div>
  );
};

export default AboutPage;
