import { Routes,Route, useLocation } from 'react-router-dom'
import Projects from './pages/Projects'
import MyProjects from './pages/MyProjects'
import Preview from './pages/Preview'
import Community from './pages/Community'
import Home from './pages/Home'
import Pricing from './pages/Pricing'
import View from './pages/View'
import Navbar from './components/Navbar'
import { Toaster } from "sonner"
import AuthPage from './pages/auth/AuthPage'


const App = () => {
  const {pathname}= useLocation();

  const hideNavbar = pathname.startsWith('/projects/') && pathname !== '/projects' || pathname.startsWith('/preview/')
    || pathname.startsWith('/view/')
    || pathname === '/preview/';


  return (
    <div>
      <Toaster/>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/pricing" element={<Pricing/>} />
        <Route path="/projects/:projectId" element={<Projects/>} />
        <Route path="/projects" element={<MyProjects/>} />
        <Route path="/preview/:projectId" element={<Preview/>} />
        <Route path="/preview/:projectId/:versionId" element={<Preview/>} />
        <Route path="/community" element={<Community/>} />
        <Route path="/view/:projectId" element={<View/>} />
        <Route path="/auth/:pathname" element={<AuthPage />} />
      </Routes>
    </div>
  )
}

export default App



