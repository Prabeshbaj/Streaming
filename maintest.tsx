// main.tsx - Simple Storage Access API demo
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

const App: React.FC = () => {
  const [hasStorageAccess, setHasStorageAccess] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [accessDenied, setAccessDenied] = useState<boolean>(false);

  useEffect(() => {
    checkStorageAccess();
  }, []);

  const checkStorageAccess = async () => {
    if ('hasStorageAccess' in document) {
      try {
        const access = await document.hasStorageAccess();
        console.log('Storage access:', access);
        setHasStorageAccess(access);
        setIsChecking(false);
      } catch (error) {
        console.error('Error:', error);
        setIsChecking(false);
        setAccessDenied(true);
      }
    } else {
      console.log('Storage Access API not supported');
      setIsChecking(false);
      setAccessDenied(true);
    }
  };

  const handleRequestAccess = async () => {
    try {
      await document.requestStorageAccess();
      setHasStorageAccess(true);
      setAccessDenied(false);
      console.log('Storage access granted');
    } catch (error) {
      console.error('Storage access denied:', error);
      setAccessDenied(true);
    }
  };

  if (isChecking) {
    return <div>Loading...</div>;
  }

  if (accessDenied) {
    return (
      <div>
        <h3>Storage Access Blocked</h3>
        <p>Enable cross-site tracking in browser settings</p>
      </div>
    );
  }

  if (!hasStorageAccess) {
    return (
      <div>
        <h3>Storage Access Required</h3>
        <button onClick={handleRequestAccess}>Enable Access</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Storage Access Granted ✓</h2>
      <p>The widget can now use localStorage</p>
      <button onClick={() => {
        localStorage.setItem('test', 'Hello from widget!');
        alert('Saved to localStorage');
      }}>
        Test localStorage
      </button>
    </div>
  );
};

// Mount the app
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
