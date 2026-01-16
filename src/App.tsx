import { Routes, Route } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import endPoint from "@/router/endPoint";

export default function App() {
  return (
    <Routes>
      <Route path={endPoint.HOMEPAGE} element={<LoginPage />} />
      <Route path={endPoint.AUTH} element={<LoginPage />} />
    </Routes>
  );
}
