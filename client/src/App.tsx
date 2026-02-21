import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/home-page";
import TriagePage from "./pages/triage-page";
import ResultPage from "./pages/result-page";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/triage" element={<TriagePage />} />
        <Route path="/result" element={<ResultPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
