import { Navigate, useLocation } from 'react-router-dom';
import { Loader2Icon } from 'lucide-react';
import { useSession } from '../lib/auth-client';

import React from 'react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2Icon className="size-7 animate-spin text-indigo-200" />
      </div>
    );
  }

  if (!session?.user) {
    return <Navigate to="/auth/sign-in" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
