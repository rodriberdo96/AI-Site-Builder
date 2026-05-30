import { BotIcon, EyeIcon, Loader2Icon, SendIcon, UserIcon } from 'lucide-react';
import type { Message, Project, Version } from '../types';
import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { projectsApi } from '../lib/api';
import { toast } from 'sonner';

interface SidebarProps {
    isMenuOpen: boolean;
    project: Project;
    setProject: (project: Project) => void;
    isGenerating: boolean;
    setIsGenerating: (isGenerating: boolean) => void;
}

const Sidebar = ({isMenuOpen, project, setProject, isGenerating, setIsGenerating}: SidebarProps) => {
    const messageRef = useRef<HTMLDivElement>(null);
    
    const [input , setInput] = useState('');
    
    const handleRollBack = async (versionId: string) => {
        try {
            const { project: updated } = await projectsApi.restoreVersion(project.id, versionId);
            setProject(updated);
            toast.success('Version restored');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Unable to restore version');
        }
    }

    const handleRevisions = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        setIsGenerating(true);
        try {
            const { project: updated } = await projectsApi.generate(project.id, input);
            setProject(updated);
            setInput('');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Unable to update website');
        } finally {
            setIsGenerating(false);
        }
    };



    useEffect(() => {
        if (messageRef.current) {
            messageRef.current.scrollIntoView({behavior: 'smooth'});
        }
    }, [project.conversation.length, project.versions.length, isGenerating]);
  return (
    <div className={`h-full sm:max-w-sm rounded-xl bg-gray-900 border-gray-800 transition-all ${isMenuOpen ? 'max-sm:w-0 overflow-hidden' : 'w-full'} `}>
        <div className='flex flex-col h-full'>
            {/* Messages Container */}
            <div className='flex-1 overflow-y-auto no-scrollbar px-3 flex flex-col gap-4'>
                {[...project.conversation, ...project.versions]
                .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                .map((message) => {
                    const isMessage = 'content' in message;
                    if (isMessage) {
                        const msg= message as Message;
                        const isUser = msg.role === 'user';
                        return (
                            <div key={msg.id} className={`flex items-start  gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                                {!isUser && (
                                    <div className='w-8 h-8 rounded-full bg-linear-to-br from-indigo-600 flex-items-center justify-center'>
                                        <BotIcon className='size-5 text-white'/>
                                    </div>
                                )}
                                <div className={`max-w-xs sm:max-w-sm px-4 py-2 rounded-lg ${isUser ? 'bg-violet-600 text-white' : 'bg-gray-800 text-gray-300'}`}>
                                    <p className='whitespace-pre-wrap'>{msg.content}</p>
                                </div>
                                {isUser &&(
                                    <div className='w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center'>
                                        <UserIcon className='size-5 text-gray-200'/>
                                    </div>
                                )}
                            </div>
                        );
                    } else {
                        const ver= message as Version;
                        return(
                            <div key={ver.id} className='w-4/5 mx-auto my-2 p-3 rounded-xl bg-gray-800 text-gray-100 shadow flex flex-col gap-2'>
                                <div className='text-xs font-medium'>
                                    code updated <br /> <span className='text-gray-500 text-xs font-normal'>
                                        {new Date(ver.timestamp).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className='flex items-center justify-center'>
                                    {project.current_version_index === ver.id ? (
                                        <button className='px-3 py-1 rounded-md text-xs bg-gray-700 '>Current Version</button>
                                    ): (
                                        <button onClick={()=> handleRollBack(ver.id)} className='px-3 py-1 rounded-md text-xs bg-indigo-500 hover:bg-indigo-600 text-white'>Roll back to this version</button>
                                    )}
                                    <Link to={`/preview/${project.id}/${ver.id}`} target='_blank'>
                                    <EyeIcon className='p-1 bg-gray-700 hover:bg-indigo-500 size-6 transitions-colors rounded'/> View Code
                                    </Link>
                                </div>
                            </div>
                        )
                    }
                })}
                {isGenerating && (
                    <div className='flex items-start gap-3 justify-start'>
                        <div className='w-8 h-8 rounded-full bg-linear-to-br from-indigo-600 to-indigo-700 flex items-center justify-center'>
                            <BotIcon className='size-5 text-white'/>
                        </div>
                        {/*three dot loader*/}
                        <div className='flex gap-1.5 h-full items-end'>
                            <span className='size-2 rounded-full animate-bounce bg-gray-600' style={{animationDelay: '0s'}}/>
                            <span className='size-2 rounded-full animate-bounce bg-gray-600' style={{animationDelay: '0.2s'}}/>
                            <span className='size-2 rounded-full animate-bounce bg-gray-600' style={{animationDelay: '0.4s'}}/>
                        </div>
                    </div>
                )
                }
                <div ref={messageRef}/>
            </div>
            {/* Input Area */}
            <form className='m-3 relative' onSubmit={handleRevisions}>
                <div className='flex items-center gap-2'>
                    <textarea value={input} onChange={(e)=>setInput(e.target.value)} rows={4} placeholder='Describe your website or request changes...' className='flex-1 p-3 rounded-xl resize-none text-sm outline-none ring  ring-gray-700 focus:ring-indigo-500 bg-gray-800 text-gray-100 placeholder-gray-400 transition-all' disabled={isGenerating}/>
                        <button disabled={isGenerating || !input.trim()} className='absolute bottom-2.5 right-2.5 rounded-full bg-linear-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white transition-colors disabled:opacity-60'>
                            {isGenerating ? <Loader2Icon className='size-7 p-1.5 animate-spin text-white'/> :
                            <SendIcon className='size-7 p-1.5 text-white'/>
                            }
                        </button>
                </div>
            </form>
        </div>
    </div>
  ) 
}

export default Sidebar