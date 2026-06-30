import { Suspense, lazy } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import { Toaster } from "sonner"
import ProtectedRoute from './components/ProtectedRoute'
import { Loader2Icon } from 'lucide-react'

const Projects = lazy(() => import('./pages/Projects'))
const MyProjects = lazy(() => import('./pages/MyProjects'))
const Preview = lazy(() => import('./pages/Preview'))
const Community = lazy(() => import('./pages/Community'))
const Home = lazy(() => import('./pages/Home'))
const Pricing = lazy(() => import('./pages/Pricing'))
const View = lazy(() => import('./pages/View'))
const AuthPage = lazy(() => import('./pages/auth/AuthPage'))

const PageLoader = () => (
  <div className="flex h-screen items-center justify-center bg-slate-950">
    <Loader2Icon className="size-8 animate-spin text-indigo-500" />
  </div>
)

const App = () => {
  const {pathname}= useLocation();

  const hideNavbar = pathname.startsWith('/projects/') && pathname !== '/projects' || pathname.startsWith('/preview/')
    || pathname.startsWith('/view/')
    || pathname === '/preview/';


  return (
    <div>
      <Toaster/>
      {!hideNavbar && <Navbar />}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/pricing" element={<Pricing/>} />
          <Route path="/projects/:projectId" element={<ProtectedRoute><Projects/></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><MyProjects/></ProtectedRoute>} />
          <Route path="/preview/:projectId" element={<ProtectedRoute><Preview/></ProtectedRoute>} />
          <Route path="/preview/:projectId/:versionId" element={<ProtectedRoute><Preview/></ProtectedRoute>} />
          <Route path="/community" element={<Community/>} />
          <Route path="/view/:projectId" element={<View/>} />
          <Route path="/auth/:pathname" element={<AuthPage />} />
        </Routes>
      </Suspense>
    </div>
  )
}

export default App



