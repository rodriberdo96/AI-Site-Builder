import React from 'react'
import type { Project } from '../types';
import { Loader2Icon, PlusIcon, TrashIcon } from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import { dummyProjects } from '../assets/assets';
import Footer from '../components/Footer';


const MyProjects = () => {
  const [loading, setLoading] = React.useState(true);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const navigate = useNavigate()

  const fetchProjects = async () => {
    setProjects(dummyProjects);
    //simulate loading
    setTimeout(() => {
      setLoading(false);
  }, 1000)};

  const deleteProject = async (projectId: string) => {
    // Simulate API call delay
    setLoading(true); 
    setTimeout(() => {
      setProjects((prevProjects) => prevProjects.filter((project) => project.id !== projectId));
      setLoading(false);
    }, 500);
  }

  React.useEffect(() => {
    fetchProjects();
  }, []);
  return (
    <>
      <div className="px-4 md:px-16 lg:px-24 xl:px-32">
        {loading ? (
          <div className="flex items-center justify-center h-[80vh]">
            <Loader2Icon className="animate-spin size-7 text-indigo-200" />
          </div>
        ) : projects.length > 0 ? (
          <div className='py-10 min-h-[80vh]' >
            <div className='flex items-center justify-between mb-12' >
              <h1 className='text-2xl font-medium text-white'>My Projects</h1>
              <button onClick={()=> navigate('/')} className="flex items-center gap-2 bg-linear-to-br from-indigo-500 to-indigo-600 hover:opacity-90 text-white px-3 sm:px-6 py-1 sm:py-2 rounded transition-all active:scale-95">
                <PlusIcon size={18}/> Create New
              </button>
            </div>
            <div className='flex flex-wrap gap-3.5'>
              {projects.map((project) => (
                <div
                  onClick={()=> navigate(`/projects/${project.id}`)}
                  key={project.id}
                  className='relative group w-72 max-sm:mx-auto  bg-gray-900/60 border border-gray-700 rounded-lg overflow-hidden cursor-pointer shadow-md group hover:shadow-indigo-700/30 hover:border-indigo-800/80 transition-all duration-300'
                >
                  {/*Desktop-like mini preview*/}
                  <div className='relative w-full h-40 bg-gray-900 overflow-hidden border-b border-gray-800'>
                    {project.current_code ? ( <iframe srcDoc={project.current_code} sandbox='allow-scripts allow-same-origin' className='absolute top-0 left-0 w-[1200px] h-[800px] origin-top-left pointer-events-none' style={{transform:'scale(0.25)'}}/>): (
                      <div className='flex items-center justify-center h-full text-gray-500'>
                        <span className='text-gray-400'>No Preview Available</span>
                      </div>)}
                  </div>
                  {/* Content */}
                  <div className='p-4 text-white bg-linear-180 from-transparent group-hover:from-indigo-950 to-transparent transition-colors'>
                    <div className='flex items-start justify-between'>
                      <h2 className='text-lg font-medium line-clamp-2'>{project.name}</h2>
                      <button className='px-2.5 py-0.5 mt-1 ml-2 text-xs bg-gray-800 border border-gray-700 rounded-full'>Website </button>
                    </div>
                    <p className='text-gray-400 mt-1 text-sm line-clamp-2'>{project.initial_prompt}</p>
                    <div onClick={(e)=>e.stopPropagation() } className='flex justify-between items-center mt-6'>
                      <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                      <div className='flex gap-3 tetx-white text-sm'>
                        <button onClick={()=>navigate( `/preview/${project.id}`)} className='px-3 py-1.5 bg-white/10 hover:bg-white/15 rounded-md transition-all'>Preview</button>
                        <button onClick={()=>navigate( `/projects/${project.id}`)} className='px-3 py-1.5 bg-white/10 hover:bg-white/15 rounded-md transition-all'>Open</button>
                      </div>
                    </div>
                  </div>
                  <div onClick={(e)=>e.stopPropagation()}>
                    <TrashIcon className='absolute top-3 right-3 scale-0 group-hover:scale-100 bg-white p-1.5 size- rounded text-red-500 text-xl cursor-pointer transition-all' onClick={()=>{ deleteProject (project.id); }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center h-[80vh]'>
            <h1 className='text-3xl font-semibold text-gray-300'>You have no projects yet.</h1>
            <button onClick={()=> navigate('/')} className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2 rounded-md transition-all active:scale-95">
              <PlusIcon size={18}/> Create Your First Project
            </button>
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}

export default MyProjects