import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { MyEventsPage } from './components/MyEventsPage';
import { EventsPage } from './components/EventsPage';
import { EventDetailsPage } from './components/EventDetailsPage';
import { AuthForm } from './components/AuthForm';
import { AboutPage } from './components/AboutPage';
import { useAuth } from './contexts/AuthContext';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const { user, loading } = useAuth();

  const handleNavigate = (page: string, eventId?: string, mode?: 'login' | 'signup') => {
    setCurrentPage(page);
    if (eventId) {
      setSelectedEventId(eventId);
    }
    if (mode) {
      setAuthMode(mode);
    }
  };

  const handleAuthSuccess = () => {
    setCurrentPage('home');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Зареждане...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />
      <main>
        {currentPage === 'home' && <HomePage onNavigate={handleNavigate} />}
        {currentPage === 'events' && <EventsPage onNavigate={handleNavigate} />}
        {currentPage === 'event-details' && selectedEventId && (
          <EventDetailsPage
            eventId={selectedEventId}
            onBack={() => handleNavigate('events')}
          />
        )}
        {currentPage === 'my-events' && user && <MyEventsPage />}
        {currentPage === 'about' && <AboutPage onNavigate={handleNavigate} />}
        {currentPage === 'auth' && !user && <div className="container mx-auto px-4 py-16"><AuthForm onSuccess={handleAuthSuccess} defaultMode={authMode} /></div>}
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
