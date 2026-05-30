/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Project } from "../types";
import ProjectPreview from "../components/ProjectPreview";
import { projectsApi } from "../lib/api";




const Preview = () => {

  const {projectId, versionId} = useParams();
  const [code, setCode] = useState('');

    const fetchCode = async () => {
      if (!projectId) return;
      const { project } = await projectsApi.get(projectId);
      const versionCode = versionId ? project.versions.find((version) => version.id === versionId)?.code : undefined;
      setCode(versionCode ?? project.current_code ?? '');
    }
      useEffect(() => {
        fetchCode();
      }, []);
  

  return (
    <div className="h-screen">
      {code && <ProjectPreview project={{current_code: code} as Project} 
      isGenerating={false} showEditorPanel={false}/>}
    </div>
  )
}

export default Preview