import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, RefreshCw, Layers, CheckCircle, XCircle, Sparkles } from 'lucide-react';

export default function SummaryModal({ stats, missedWords, onRestart, onChangeCategory }) {
  
  useEffect(() => {
    // Launch celebratory confetti effect on mount
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.warn("Confetti error:", e);
    }
  }, []);

  const totalAttempted = stats.correct + stats.incorrect;
  const accuracy = totalAttempted > 0 ? Math.round((stats.correct / totalAttempted) * 100) : 0;

  return (
    <div className="glass-panel-glow" style={{ maxWidth: '580px', margin: '2rem auto', padding: '2.5rem 2rem', textAlign: 'center' }}>
      
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 1.25rem',
        boxShadow: '0 0 30px rgba(16, 185, 129, 0.4)'
      }}>
        <Award size={36} color="#ffffff" />
      </div>

      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>
        Session Completed! 🎉
      </h2>

      <p style={{ color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
        Gute Arbeit! You mastered practice round words.
      </p>

      {/* Stats Summary Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '0.25rem' }}>ACCURACY</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: '800', color: 'var(--accent-emerald)' }}>
            {accuracy}%
          </div>
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '0.25rem' }}>TOTAL XP</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: '800', color: 'var(--primary-cyan)' }}>
            +{stats.xp}
          </div>
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '0.25rem' }}>BEST STREAK</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: '800', color: 'var(--accent-amber)' }}>
            🔥 {stats.maxStreak}
          </div>
        </div>
      </div>

      {/* Missed Words Review Section */}
      {missedWords && missedWords.length > 0 && (
        <div style={{
          textAlign: 'left',
          background: 'rgba(244, 63, 94, 0.08)',
          border: '1px solid rgba(244, 63, 94, 0.2)',
          borderRadius: '16px',
          padding: '1.25rem',
          marginBottom: '2rem',
          maxHeight: '220px',
          overflowY: 'auto'
        }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fecdd3', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <XCircle size={16} color="var(--accent-rose)" /> Review Words to Work On ({missedWords.length}):
          </h4>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {missedWords.map((w, idx) => (
              <div key={idx} style={{ fontSize: '0.88rem', display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.6rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                <span style={{ fontWeight: '700', color: '#ffffff' }}>🇩🇪 {w.german}</span>
                <span style={{ color: 'var(--text-muted)' }}>🇬🇧 {w.english}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button className="game-submit-btn" onClick={onRestart} style={{ padding: '0.85rem 1.5rem' }}>
          <RefreshCw size={18} /> Play Again
        </button>
        
        <button 
          className="icon-btn" 
          onClick={onChangeCategory}
          style={{ padding: '0.85rem 1.5rem', fontWeight: '700', color: '#ffffff' }}
        >
          <Layers size={18} style={{ marginRight: '6px' }} /> Change Category
        </button>
      </div>

    </div>
  );
}
