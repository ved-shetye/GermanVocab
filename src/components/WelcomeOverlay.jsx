import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowRight, BookOpen } from 'lucide-react';

export default function WelcomeOverlay({ onComplete }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Automatically trigger exit slide animation after 1.8s
    const timer = setTimeout(() => {
      handleStart();
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  const handleStart = () => {
    setExiting(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 600); // match exit transition duration
  };

  return (
    <div className={`welcome-overlay ${exiting ? 'exit' : ''}`}>
      <div className="welcome-card">
        <div className="welcome-badge">
          <Sparkles size={16} />
          <span>DeutschVocab Game</span>
        </div>

        {/* German & English Welcome Message */}
        <h1 className="welcome-title-de">
          Willkommen bei DeutschVocab!
        </h1>
        
        <p className="welcome-title-en">
          Master German vocabulary through interactive game play and smart flashcards.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
          <button 
            className="game-submit-btn" 
            onClick={handleStart}
            style={{ padding: '0.85rem 2rem', fontSize: '1.05rem' }}
          >
            <span>Jetzt Starten / Start Now</span>
            <ArrowRight size={20} />
          </button>
        </div>

        <div className="welcome-progress-bar">
          <div className="welcome-progress-fill" />
        </div>
      </div>
    </div>
  );
}
