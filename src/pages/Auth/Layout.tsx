import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import ForgotPassword from "./ForgotPassword";
import AuthShowcase from "./AuthShowcase";

const AuthPage: React.FC = () => {
  const reduced = useReducedMotion();

  const [searchParams, setSearchParams] = useSearchParams();
  const viewParam = searchParams.get("view");
  const [view, setView] = useState<"login" | "register" | "forgot">("login");

  useEffect(() => {
    if (viewParam === "register") setView("register");
    else if (viewParam === "forgot") setView("forgot");
    else setView("login");
  }, [viewParam]);

  const changeView = (v: "login" | "register" | "forgot") => {
    setSearchParams({ view: v });
  };

  // Banner images (đặt trong /public/image/...)
  const bgImages = useMemo(
    () => [
      "/image/bg1.jpg",
      "/image/bg2.jpg",
      "/image/bg3.jpg",
      "/image/bg4.jpg",
    ],
    [],
  );

  const [bgIndex, setBgIndex] = useState(0);

  //  Preload ảnh để tránh nháy/khựng khi đổi
  useEffect(() => {
    bgImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [bgImages]);

  //  Auto change every 5s
  useEffect(() => {
    if (bgImages.length <= 1) return;
    const t = window.setInterval(() => {
      setBgIndex((i) => (i + 1) % bgImages.length);
    }, 5000);
    return () => window.clearInterval(t);
  }, [bgImages.length]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      {/* Full layout */}
      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.995 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="h-full w-full lg:grid lg:grid-cols-[7fr_5fr]"
      >
        {/* LEFT */}
        <div className="relative hidden lg:block">
          <AuthShowcase />
        </div>

        {/* RIGHT */}
        <div className="relative h-full min-h-0 flex items-center justify-center">
          {/* ✅ Background banner slider (crossfade + Ken Burns nhẹ) */}
          <div className="absolute inset-0">
            <AnimatePresence initial={false} mode="sync">
              <motion.img
                key={bgImages[bgIndex]}
                src={bgImages[bgIndex]}
                alt="background"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ willChange: "transform, opacity" }}
                initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 1.08 }}
                animate={
                  reduced
                    ? { opacity: 1 }
                    : {
                        opacity: 1,
                        // Ken Burns nhẹ: zoom chậm trong 5s
                        scale: [1.08, 1.02, 1.0],
                      }
                }
                exit={reduced ? { opacity: 1 } : { opacity: 0, scale: 1.02 }}
                transition={
                  reduced
                    ? undefined
                    : {
                        opacity: { duration: 1.35, ease: "easeInOut" },
                        scale: { duration: 5.2, ease: "linear" },
                      }
                }
              />
            </AnimatePresence>

            {/* Overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/55 via-slate-900/35 to-emerald-900/35" />
            <div className="absolute inset-0 backdrop-blur-[2px]" />
          </div>

          {/* Card */}
          <div className="relative z-10 w-full max-w-130 px-5 sm:px-8">
            <div
              className="
                max-h-[88svh] overflow-y-auto
                rounded-3xl bg-white/95 shadow-2xl ring-1 ring-black/5
                p-7 sm:p-10
              "
            >
              <AnimatePresence mode="wait">
                {view === "login" && (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, x: -22 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -22 }}
                    transition={{ duration: 0.32, ease: "easeOut" }}
                  >
                    <Login
                      toggleView={() => changeView("register")}
                      onForgotPassword={() => changeView("forgot")}
                    />
                  </motion.div>
                )}

                {view === "register" && (
                  <motion.div
                    key="register"
                    initial={{ opacity: 0, x: 22 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 22 }}
                    transition={{ duration: 0.32, ease: "easeOut" }}
                  >
                    <Register toggleView={() => changeView("login")} />
                  </motion.div>
                )}

                {view === "forgot" && (
                  <motion.div
                    key="forgot"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    transition={{ duration: 0.32, ease: "easeOut" }}
                  >
                    <ForgotPassword toggleView={() => changeView("login")} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <p className="mt-4 text-center text-xs text-white/80">
              Bảo mật · Nhanh gọn · Trải nghiệm mượt
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
