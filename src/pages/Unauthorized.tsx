import React from 'react';
import { useNavigate } from 'react-router-dom';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  const onBackButtonClick = React.useCallback(() => {
    navigate('/');
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-destructive">401</h1>
        <h2 className="mb-8 text-2xl font-semibold text-foreground">Unauthorized Access</h2>
        <p className="mb-8 text-muted-foreground">
          Sorry, you don't have permission to access this page.
        </p>
        <button
          onClick={onBackButtonClick}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
