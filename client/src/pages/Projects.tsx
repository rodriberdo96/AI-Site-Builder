import { Link, useParams, useNavigate } from 'react-router-dom'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Project } from '../types';
import { Loader2Icon, MessageSquareIcon, SmartphoneIcon, XIcon, LaptopIcon, TabletIcon, SaveIcon, FullscreenIcon, ArrowBigDownDashIcon, EyeOffIcon, EyeIcon } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ProjectPreview from '../components/ProjectPreview';
import type { ProjectPreviewRef } from '../components/ProjectPreview';
import { projectsApi } from '../lib/api';
import { toast } from 'sonner';

const Projects = () => {
  const {projectId} = useParams()
  const navigate = useNavigate(); 


  const [isGenerating, setIsGenerating] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const[isMenuOpen, setIsMenuOpen] = useState(false);
  const[device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const previewRef= useRef<ProjectPreviewRef>(null);

  const saveProject = async () => {
    const code = previewRef.current?.getCode();
    if (!project || !code) return;
    setIsSaving(true);
    try {
      const { project: updated } = await projectsApi.update(project.id, { current_code: code });
      setProject(updated);
      toast.success('Project saved');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save project');
    } finally {
      setIsSaving(false);
    }
  }

  const downloadCode = () => {
    // Function to download the generated code as a zip file
    const code = previewRef.current?.getCode() || project?.current_code;
    if (!code){
      if (isGenerating) {
        return
    }
    return 
  }
    const element = document.createElement('a');
    const file = new Blob([code], {type: 'text/html'});
    element.href = URL.createObjectURL(file);
    element.download = 'index.html';
    document.body.appendChild(element);
    element.click();
  }

  const togglePublish = async () => {
    if (!project) return;
    try {
      const { project: updated } = project.isPublished
        ? await projectsApi.unpublish(project.id)
        : await projectsApi.publish(project.id);
      setProject(updated);
      toast.success(updated.isPublished ? 'Project published' : 'Project unpublished');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update publishing');
    }
  }

  const fetchProject = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const { project } = await projectsApi.get(projectId);
      setProject(project);
      setIsGenerating(project.generationStatus === 'generating');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to load project');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  }, [navigate, projectId])

  useEffect(() => {
    void fetchProject();
  },[fetchProject]);
  if (loading){
    return(
      <>
        <div className='flex items-center justify-center h-screen'>
          <Loader2Icon className='animate-spin text-violet-200 size-7'/>
        </div>
      </>
    )
  }
  return project ? (
    <div className='flex flex-col h-screen w-full bg-gray-900 text-white'>
      {/*Builder Navbar*/}
      <div className='flex max-sm:flex-col sm:items-center gap-4 px-4 py-2 no-scrollbar'>
        {/*Left Section*/}
        <div className='flex items-center gap-2 sm:min-90 text-nowrap'>
          <img src="/favicon.svg" alt="logo" className='h-6 cursor-pointer' onClick={()=>navigate('/')}/>
          <div className='max-w-64 sm:max-w-xs'>
            <p className='text-sm text-medium capitalize truncate'>{project.name}</p>
            <p className='text-xs text-gray-400 -mt-0.5'>Previewing last saved version</p>
          </div>
          <div className='sm:hidden flex-1 flex justify-end'>
            {isMenuOpen ? <MessageSquareIcon className='size-6 cursor-pointer' onClick={() => setIsMenuOpen(false)}/> : <XIcon className='size-6 cursor-pointer' onClick={() => setIsMenuOpen(true)}/>}
          </div>
        </div>
        {/*Center Section*/}
        <div className='hidden sm:flex gap-2 bg-gray-950 p-1.5 rounded-md'>
          <SmartphoneIcon className={`size-6 p-1 rounded cursor-pointer ${device === 'mobile' ? 'bg-gray-700' : ''}`} onClick={() => setDevice('mobile')}/>
          <TabletIcon className={`size-7 p-1 rounded cursor-pointer ${device === 'tablet' ? 'bg-gray-700' : ''}`} onClick={() => setDevice('tablet')}/>
          <LaptopIcon className={`size-8 p-1 rounded cursor-pointer ${device === 'desktop' ? 'bg-gray-700' : ''}`} onClick={() => setDevice('desktop')}/>
        </div>
        {/*Right Section*/}
        <div className='flex items-center justify-end gap-3 flex-1 text-xs sm:text-sm'>
          <button onClick={saveProject} disabled={isSaving} className='max-sm:hidden bg-gray-800 hover:bg-gray-700 text-white px-3.5 py-1 flex items-center gap-2 rounded sm:rounded-sm transition-colors border border-gray-700'>
            {isSaving ? <Loader2Icon className='animate-spin size-6'/> : 
              <SaveIcon size={16}/>} Save  
          </button>
          <Link target='_blank' to={`/preview/${project.id}`} className='flex items-center gap-2 px-4 py-1 rounded sm:rounded-sm border border-gray-700 hover:border-gray-500 transition-colors'>
            <FullscreenIcon size={16}/> Preview
          </Link>
          <button onClick={downloadCode} className='bg-linear-to-br from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white px-3.5 py-1 flex items-center gap-2 rounded sm:rounded-sm transition-colors'>
            <ArrowBigDownDashIcon size={16}/> Download
          </button>
          <button onClick={togglePublish} className='bg-linear-to-br from-indigo-700 to-indigo-600 hover:from-indigo-600 hover:to-indigo-500 text-white px-3.5 py-1 flex items-center gap-2 rounded sm:rounded-sm transition-colors'>
            {project.isPublished ? 
            <EyeOffIcon size={16}/> : <EyeIcon size={16}/> }
            {project.isPublished ? 'Unpublish' : 'Publish'}
          </button>
        </div>
      </div>
      <div className='flex-1 flex overflow-auto'>
              <Sidebar  isMenuOpen={isMenuOpen} project={project} setProject={(p)=> setProject(p)} isGenerating={isGenerating} setIsGenerating={setIsGenerating}/>
              <div className='flex-1 p-2 pl-0'>
                <ProjectPreview ref={previewRef} project={project} isGenerating={isGenerating} device={device} />
              </div>
      </div>
    </div>
  ) 
  :
  (
    <div className='flex items-center justify-center h-screen'>
      <p className='text-2xl font-medium text-gray-200'>Unable to load project.</p>
    </div>
  ) 
}

export default Projects