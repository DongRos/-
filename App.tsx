import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import AddVideo from './components/AddVideo';
import ReviewSession from './components/ReviewSession';
import VideoLibrary from './components/VideoLibrary';
import { ViewState, StudyEntry, DailyStats } from './types';
import { getEntries, saveEntries, getStats, saveStats, recordActivity } from './services/storageService';
import { getReviewStatus } from './services/srsService';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('dashboard');
  const [entries, setEntries] = useState<StudyEntry[]>([]);
  const [stats, setStats] = useState<DailyStats[]>([]);
  const [reviewQueue, setReviewQueue] = useState<StudyEntry[]>([]);

  // Load initial data
  useEffect(() => {
    setEntries(getEntries());
    setStats(getStats());
  }, []);

  // Save entries whenever they change
  useEffect(() => {
    saveEntries(entries);
  }, [entries]);

  const handleNavigate = (newView: ViewState) => {
    setView(newView);
  };

  const handleAddEntry = (entry: StudyEntry) => {
    const updatedEntries = [...entries, entry];
    setEntries(updatedEntries);
    recordActivity('learn');
    setStats(getStats()); // Refresh stats
    setView('library');
  };

  const handleUpdateEntries = (updatedEntries: StudyEntry[]) => {
    setEntries(updatedEntries);
  };

  const startReview = () => {
    const { due } = getReviewStatus(entries);
    setReviewQueue(due);
    setView('review');
  };

  const handleReviewComplete = (updatedEntry: StudyEntry) => {
    const updatedEntries = entries.map(e => e.id === updatedEntry.id ? updatedEntry : e);
    setEntries(updatedEntries);
    recordActivity('review');
    setStats(getStats());
  };

  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return (
          <Dashboard 
            entries={entries} 
            stats={stats} 
            onStartReview={startReview} 
            onAddVideo={() => setView('add-video')} 
          />
        );
      case 'add-video':
        return (
          <AddVideo 
            onSave={handleAddEntry} 
            onCancel={() => setView('dashboard')} 
          />
        );
      case 'review':
        return (
          <ReviewSession 
            entriesToReview={reviewQueue} 
            onCompleteItem={handleReviewComplete} 
            onExit={() => setView('dashboard')} 
          />
        );
      case 'library':
        return (
          <VideoLibrary 
            entries={entries} 
            onUpdateEntries={handleUpdateEntries}
          />
        );
      default:
        return <div>Not found</div>;
    }
  };

  return (
    <Layout currentView={view} onNavigate={handleNavigate}>
      {renderContent()}
    </Layout>
  );
};

export default App;