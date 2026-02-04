import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AgentList from "./components/Agents/AgentList";
import AddAgent from "./components/Agents/AddAgent";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/agents" element={<AgentList />} />
                <Route path="/agents/add" element={<AddAgent />} />
            </Routes>
        </Router>
    );
}

export default App;
