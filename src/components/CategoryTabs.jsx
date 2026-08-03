import React from 'react';
import { Zap, Box, Sparkles, Activity, Dices, ArrowLeftRight, Clock, Layers } from 'lucide-react';

export default function CategoryTabs({ 
  activeCategory, 
  onSelectCategory, 
  counts, 
  gameMode, 
  setGameMode,
  direction,
  setDirection
}) {
  const tabs = [
    { id: 'adverb', label: 'Adverben', count: counts.adverb || 253, icon: Zap, color: '#f59e0b' },
    { id: 'noun', label: 'Nomen', count: counts.noun || 1781, icon: Box, color: '#ef4444' },
    { id: 'adjective', label: 'Adjektive', count: counts.adjective || 648, icon: Sparkles, color: '#fbbf24' },
    { id: 'verb', label: 'Verben', count: counts.verb || 1054, icon: Activity, color: '#dc2626' },
    { id: 'random', label: 'Zufällig (Mix)', count: counts.total_words || 3736, icon: Dices, color: '#10b981' }
  ];

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      
      {/* 5 Main Animated Category Tabs */}
      <div className="tab-container">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeCategory === t.id;
          return (
            <button
              key={t.id}
              className={`category-tab ${isActive ? 'active' : ''}`}
              onClick={() => onSelectCategory(t.id)}
            >
              <Icon size={18} color={isActive ? '#ffffff' : t.color} />
              <span>{t.label}</span>
              <span className="category-badge">{t.count}</span>
            </button>
          );
        })}
      </div>

      {/* Secondary Controls Bar: Game Mode & Question Direction */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '1rem',
        padding: '0.85rem 1.25rem',
        background: 'rgba(18, 19, 28, 0.7)',
        borderRadius: '16px',
        border: '1px solid rgba(245, 158, 11, 0.15)',
        maxWidth: '720px',
        margin: '0 auto'
      }}>
        
        {/* Game Mode Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: '800', textTransform: 'uppercase' }}>
            Modus:
          </span>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={() => setGameMode('flashcard')}
              className="icon-btn"
              style={{
                fontSize: '0.85rem',
                fontWeight: '700',
                padding: '0.4rem 0.85rem',
                background: gameMode === 'flashcard' ? 'rgba(220, 38, 38, 0.25)' : 'transparent',
                borderColor: gameMode === 'flashcard' ? 'var(--de-red)' : 'rgba(255,255,255,0.08)',
                color: gameMode === 'flashcard' ? '#ffffff' : 'var(--text-muted)'
              }}
            >
              <Layers size={14} style={{ marginRight: '4px' }} /> Practice
            </button>
            
            <button
              onClick={() => setGameMode('timeattack')}
              className="icon-btn"
              style={{
                fontSize: '0.85rem',
                fontWeight: '700',
                padding: '0.4rem 0.85rem',
                background: gameMode === 'timeattack' ? 'rgba(245, 158, 11, 0.25)' : 'transparent',
                borderColor: gameMode === 'timeattack' ? 'var(--de-gold)' : 'rgba(255,255,255,0.08)',
                color: gameMode === 'timeattack' ? '#ffffff' : 'var(--text-muted)'
              }}
            >
              <Clock size={14} style={{ marginRight: '4px' }} /> 60s Speed Run
            </button>
          </div>
        </div>

        {/* Direction Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: '800', textTransform: 'uppercase' }}>
            Prompt:
          </span>
          <button
            onClick={() => {
              const dirs = ['DE_TO_EN', 'EN_TO_DE', 'MIXED'];
              const nextIndex = (dirs.indexOf(direction) + 1) % dirs.length;
              setDirection(dirs[nextIndex]);
            }}
            className="icon-btn"
            style={{
              fontSize: '0.85rem',
              fontWeight: '700',
              padding: '0.4rem 0.9rem',
              background: 'rgba(245, 158, 11, 0.15)',
              borderColor: 'rgba(245, 158, 11, 0.3)',
              color: '#fbbf24'
            }}
          >
            <ArrowLeftRight size={14} style={{ marginRight: '6px' }} />
            {direction === 'DE_TO_EN' && 'DE ➔ EN'}
            {direction === 'EN_TO_DE' && 'EN ➔ DE'}
            {direction === 'MIXED' && '🔀 Mixed Random'}
          </button>
        </div>

      </div>
    </div>
  );
}
