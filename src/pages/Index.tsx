
import { useEffect } from 'react';

const Index = () => {
  useEffect(() => {
    // Redirect to main app since we're using a single-page application
    window.location.href = '/';
  }, []);

  return null;
};

export default Index;
