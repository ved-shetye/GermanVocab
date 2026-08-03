import React from 'react';
import { Volume2, VolumeX, Flame, RefreshCw } from 'lucide-react';
import { sfx } from '../utils/gameUtils';

export default function GameHeader({ stats, soundEnabled, setSoundEnabled, onResetStats }) {
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    sfx.enabled = !soundEnabled;
  };

  const level = Math.floor(stats.xp / 100) + 1;
  const currentLevelXp = stats.xp % 100;

  return (
    <header className="glass-panel" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem', borderLeft: '4px solid #dc2626' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Brand Logo with German Flag Accent */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #000000 0%, #dc2626 50%, #f59e0b 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.3rem',
            boxShadow: '0 4px 15px rgba(220, 38, 38, 0.4)'
          }}>
            🇩🇪
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: '900', lineHeight: '1' }}>
              Deutsch<span style={{ color: 'var(--de-gold-bright)' }}>Vocab</span>
            </h1>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '700', letterSpacing: '0.05em' }}>
              GERMAN VOCABULARY GAME
            </span>
          </div>
        </div>

        {/* Level & XP Progress Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: '180px' }}>
            <div style={{
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              padding: '0.3rem 0.7rem',
              borderRadius: '8px',
              fontWeight: '900',
              fontSize: '0.85rem',
              color: '#fef08a'
            }}>
              STUFE {level}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.25rem', color: 'var(--text-muted)' }}>
                <span>XP</span>
                <span>{currentLevelXp}/100</span>
              </div>
              <div style={{ height: '6px', width: '100%', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${currentLevelXp}%`,
                  background: 'linear-gradient(90deg, #dc2626, #f59e0b)',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          </div>

          {/* Streak Flame */}
          {stats.streak > 0 && (
            <div className="streak-badge">
              <Flame size={18} fill="#f59e0b" />
              <span>{stats.streak}x Serie</span>
            </div>
          )}

          {/* Sound Toggle */}
          <button 
            className="icon-btn" 
            onClick={toggleSound} 
            title={soundEnabled ? "Sound Off" : "Sound On"}
          >
            {soundEnabled ? <Volume2 size={20} color="#fbbf24" /> : <VolumeX size={20} color="#94a3b8" />}
          </button>
        </div>

      </div>
    </header>
  );
}
