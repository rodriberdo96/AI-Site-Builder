/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { dummyProjects } from "../assets/assets";
import type { Project } from "../types";
import ProjectPreview from "../components/ProjectPreview";




const Preview = () => {

  const {projectId} = useParams();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);

    const fetchCode = async () => {
      // Fetch the generated code for the project from the API
      setTimeout(() => {
        const code = dummyProjects.find(project => project.id === projectId)?.current_code || '';
        if (code){
          setCode(code);
          setLoading(false);
        }
      }, 2000);
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