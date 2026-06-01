/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import ProjectPreview from "../components/ProjectPreview";
import type { Project } from "../types";
import { publicApi } from "../lib/api";


const View = () => {
  const {projectId} = useParams();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCode = async () => {
    if (!projectId) {
      toast.error("Project ID not found");
      setCode('');
      setLoading(false);
      return;
    }

    try {
      const { project } = await publicApi.get(projectId);
      setCode(project.current_code || '');
    } catch {
      toast.error("Failed to load project");
      setCode('');
    } finally {
      setLoading(false);
    }
  }
    useEffect(() => {
      fetchCode();
    }, []);

    if ( loading) {
      return (
      <div className="flex items-center justify-center h-screen">
        <Loader2Icon className="animate-spin size-7 text-indigo-200"/>
      </div>
      )
    }


  return (
    <div className="h-screen">
      {code && <ProjectPreview project={{current_code: code} as Project} 
      isGenerating={false} showEditorPanel={false}/>}
    </div>
  )
}

export default View