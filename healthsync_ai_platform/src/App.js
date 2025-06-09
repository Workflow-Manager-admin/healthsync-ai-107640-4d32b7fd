import React from 'react';
import './App.css';
import { SupabaseProvider, useSupabase } from './SupabaseContext';

import RoleAuth from './features/RoleAuth';
import PatientIntakeForm from './features/PatientIntakeForm';
import AITriage from './features/AITriage';
import AIChat from './features/AIChat';
import ProviderDashboard from './features/ProviderDashboard';

function MainContent() {
  const { role } = useSupabase();

  return (
    <main>
      <div className="container">
        {/* Show authentication/role switch always */}
        <RoleAuth />
        {/* Routing/Conditional rendering, ideally via react-router. Here, simple switches */}
        {role === "patient" && (
          <>
            <PatientIntakeForm />
            <AITriage />
            <AIChat />
          </>
        )}
        {role === "provider" && (
          <ProviderDashboard />
        )}
        {role === "admin" && (
          <div className="my-8 p-6 rounded bg-secondary shadow text-center font-semibold">[Admin view placeholder]</div>
        )}
        {!role && (
          <div className="my-8 text-center text-gray-600">Choose a role and sign in to continue.</div>
        )}
      </div>
    </main>
  );
}

// PUBLIC_INTERFACE
function App() {
  return (
    <SupabaseProvider>
      <div className="app min-h-screen bg-secondary text-gray-900">
        <nav className="navbar" style={{background: "var(--primary, #249eeb)"}}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <div className="logo text-white">
                <span className="logo-symbol text-accent">*</span> HealthSync AI
              </div>
              <span className="text-white font-medium">Secure Healthcare Platform</span>
            </div>
          </div>
        </nav>
        <MainContent />
      </div>
    </SupabaseProvider>
  );
}

export default App;