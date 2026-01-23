import { Leaf } from "lucide-react";

// Floating Leaf Component với animation mượt hơn
const FloatingLeaf = ({
  className,
  delay,
  duration,
}: {
  className: string;
  delay: number;
  duration: number;
}) => (
  <div
    className={`absolute ${className} opacity-0`}
    style={{
      animation: `floatSmooth ${duration}s ease-in-out infinite`,
      animationDelay: `${delay}s`,
    }}
  >
    <Leaf className="w-6 h-6 text-emerald-400/40 rotate-45" />
  </div>
);

const AnimatedBackground = () => {
  return (
    <>
      <style>
        {`
          @keyframes floatSmooth {
            0%, 100% {
              transform: translate(0, 0) rotate(0deg);
              opacity: 0;
            }
            10% {
              opacity: 0.6;
            }
            50% {
              transform: translate(30px, -50px) rotate(180deg);
              opacity: 0.8;
            }
            90% {
              opacity: 0.6;
            }
          }

          @keyframes gradientShift {
            0%, 100% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
          }

          @keyframes blobFloat {
            0%, 100% {
              transform: translate(0, 0) scale(1);
            }
            33% {
              transform: translate(30px, -30px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
          }



          .gradient-animated {
            background: linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.95),
              rgba(16, 185, 129, 0.12),
              rgba(6, 182, 212, 0.15),
              rgba(255, 255, 255, 0.9)
            );
            background-size: 400% 400%;
            animation: gradientShift 15s ease infinite;
          }
        `}
      </style>

      {/* Animated Gradient Background */}
      <div className="absolute inset-0 gradient-animated" />

      {/* Mesh Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-cyan-50/30 to-emerald-50/20" />

      {/* Floating Elements Container */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large Floating Blobs - Chuyển động mượt hơn */}
        <div
          className="absolute -top-48 -left-48 w-96 h-96 bg-gradient-to-br from-emerald-200/30 to-teal-100/20 rounded-full blur-3xl"
          style={{
            animation: "blobFloat 20s ease-in-out infinite",
          }}
        />
        <div
          className="absolute -bottom-48 -right-48 w-[600px] h-[600px] bg-gradient-to-br from-cyan-200/25 to-sky-100/15 rounded-full blur-3xl"
          style={{
            animation: "blobFloat 25s ease-in-out infinite",
            animationDelay: "-5s",
          }}
        />
        <div
          className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-br from-teal-200/20 to-emerald-100/15 rounded-full blur-3xl"
          style={{
            animation: "blobFloat 22s ease-in-out infinite",
            animationDelay: "-10s",
          }}
        />
        <div
          className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-br from-white/40 to-cyan-100/20 rounded-full blur-3xl"
          style={{
            animation: "blobFloat 18s ease-in-out infinite",
            animationDelay: "-15s",
          }}
        />

        {/* Floating Leaves - Nhiều hơn, mượt hơn */}
        <FloatingLeaf className="top-[8%] left-[12%]" delay={0} duration={10} />
        <FloatingLeaf
          className="top-[18%] right-[18%]"
          delay={2}
          duration={12}
        />
        <FloatingLeaf className="top-[35%] left-[8%]" delay={4} duration={11} />
        <FloatingLeaf
          className="top-[55%] right-[25%]"
          delay={1}
          duration={13}
        />
        <FloatingLeaf
          className="bottom-[25%] left-[15%]"
          delay={3}
          duration={10}
        />
        <FloatingLeaf
          className="bottom-[12%] right-[12%]"
          delay={5}
          duration={12}
        />
        <FloatingLeaf
          className="top-[45%] left-[30%]"
          delay={1.5}
          duration={11}
        />
        <FloatingLeaf
          className="top-[70%] right-[8%]"
          delay={4.5}
          duration={13}
        />
      </div>

      {/* Vignette Effect */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/10" />
    </>
  );
};

export default AnimatedBackground;
