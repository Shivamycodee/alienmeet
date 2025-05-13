import './App.css';
import {Routes,Route} from 'react-router'
import Home from './pages/Home'
import Info from './pages/Info'
import Articles from './pages/Articles'

export default function App() {
  
  return (
   <Routes>
    <Route path="/" element={<Home/>} />
    <Route path="/about" element={<Info/>} />
    <Route path="/articles/:id" element={<Articles />} />
   </Routes>
  );
}





