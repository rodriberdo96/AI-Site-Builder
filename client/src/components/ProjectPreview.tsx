import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import type { Project } from '../types';
import { iframeScript } from '../assets/assets';
import { useState } from 'react';
import EditorPanel from './EditorPanel';
import type { ElementUpdate, SelectedElement } from './EditorPanel';

interface ProjectPreviewProps {
    project: Project;
    isGenerating: boolean;
    device?: 'mobile' | 'tablet' | 'desktop';
    showEditorPanel?: boolean;
}

export interface ProjectPreviewRef {
    getCode: () => string | undefined
}

const ProjectPreview = forwardRef<ProjectPreviewRef, ProjectPreviewProps>(({project,isGenerating, device= 'desktop',showEditorPanel = true}, ref) => {

    const iFrameRef= useRef<HTMLIFrameElement>(null);

    const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);

    const handleUpdate = (updates: ElementUpdate) => {
        if (iFrameRef.current?.contentWindow && selectedElement) {
            iFrameRef.current.contentWindow.postMessage({
                type: 'UPDATE_ELEMENT',
                payload: updates,
            }, window.location.origin);
        }
    }; 

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.source !== iFrameRef.current?.contentWindow) return;
            if (event.data.type === 'ELEMENT_SELECTED') {
                setSelectedElement(event.data.payload as SelectedElement);
            } else if (event.data.type === 'CLEAR_SELECTION') {
                setSelectedElement(null);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, []);

    const injectPreview = (html: string) => {
        if (!html) return '';
        if (!showEditorPanel) return html;
        if (html.includes ('</body>')) {
            return html.replace( '</body>', iframeScript + '</body>');
        }else {
            return html + iframeScript;
        }}

        const resolutions = {
        desktop: 'w-full',
        tablet: 'w-[768px]',
        mobile: 'w-[412px]',
        }

        useImperativeHandle(ref, () => ({
            getCode: () => {
                const doc= iFrameRef.current?.contentDocument;
                if (!doc) return undefined;

                doc.querySelectorAll('.ai-selected-element,[data-ai-selected]').forEach((el) => {
                    el.classList.remove('ai-selected-element');
                    el.removeAttribute('data-ai-selected');
                    (el as HTMLElement).style.outline = '';
                })       
                const previewStyle = doc.getElementById('ai-preview-style');
                if (previewStyle) { previewStyle.remove(); }
                const previewScript = doc.getElementById('ai-preview-script');
                if (previewScript) { previewScript.remove(); }
                return doc.documentElement.outerHTML;
            }
        }));
        
    return (
    <div className='relative h-full bg-gray-900 flex-1 rounded-xl overflow-hidden max-sm:ml-2'>
        {project.current_code ? (
            <>
                <iframe
                    ref={iFrameRef}
                    title="Project Preview"
                    srcDoc={injectPreview(project.current_code)}
                    className={`
                        max-sm:w-full h-full border-0
                        ${resolutions[device]} mx-auto transition-all
                    `}
                    sandbox={showEditorPanel ? 'allow-scripts allow-same-origin' : ''}
                />
                {showEditorPanel && selectedElement && (
                    <EditorPanel selectedElement={selectedElement} 
                    onUpdate={handleUpdate} 
                    onClose={() => {setSelectedElement (null)
                        if (iFrameRef.current?.contentWindow) {
                            iFrameRef.current.contentWindow.postMessage({type: 'CLEAR_SELECTION_REQUEST'}, window.location.origin);
                    }}} />
                )}
            </>
        ) : isGenerating ? ( <div className='flex h-full items-center justify-center text-gray-300'>Generating preview…</div> ) : (<div className='flex h-full items-center justify-center text-gray-300'>No code generated yet.</div> )}
    </div>
    )
})

export default ProjectPreview
