import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Eye, EyeOff, Lightbulb, CheckCircle2, XCircle, ArrowRight, ArrowLeft, RotateCcw } from 'lucide-react';
import { checkAnswer, sfx, speakGerman } from '../utils/gameUtils';

export default function FlashCardGame({ 
  card, 
  directionMode, 
  onAnswerSubmit, 
  onNextCard,
  onPrevCard,
  hasPrevCard,
  gameMode,
  timeLeft
}) {
  const [userInput, setUserInput] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'incorrect' | null
  const [hintShown, setHintShown] = useState(false);
  const inputRef = useRef(null);

  // Reset state when card changes
  useEffect(() => {
    setUserInput('');
    setShowAnswer(false);
    setFeedback(null);
    setHintShown(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [card]);

  if (!card) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
        <p>Loading flashcards...</p>
      </div>
    );
  }

  // Determine question & answer based on directionMode
  const isGermanQuestion = directionMode === 'DE_TO_EN' 
    ? true 
    : directionMode === 'EN_TO_DE' 
      ? false 
      : (card.id ? card.id.length % 2 === 0 : true);

  const questionText = isGermanQuestion ? card.german : card.english;
  const targetAnswer = isGermanQuestion ? card.english : card.german;
  const questionLangLabel = isGermanQuestion ? 'German (Deutsch)' : 'English';
  const targetLangLabel = isGermanQuestion ? 'English Translation' : 'German Translation';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userInput.trim() || feedback) return;

    const isCorrect = checkAnswer(userInput, targetAnswer);

    if (isCorrect) {
      setFeedback('correct');
      sfx.playCorrect();
      onAnswerSubmit(true, card);
      
      // Auto advance to next card after 1 second
      setTimeout(() => {
        onNextCard();
      }, 1000);
    } else {
      setFeedback('incorrect');
      setShowAnswer(true); // Reveal answer on wrong entry
      sfx.playIncorrect();
      onAnswerSubmit(false, card);
    }
  };

  const handleSpeak = (e) => {
    e.stopPropagation();
    speakGerman(card.german);
  };

  const getHint = () => {
    if (!targetAnswer) return "";
    const cleanTarget = targetAnswer.replace(/\([^)]*\)/g, "").trim();
    return `Starts with "${cleanTarget.charAt(0).toUpperCase()}" (${cleanTarget.length} characters)`;
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '0 1rem' }}>
      
      {/* Timer Bar for Time Attack Mode */}
      {gameMode === 'timeattack' && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.6rem 1.25rem',
          background: 'rgba(220, 38, 38, 0.15)',
          border: '1px solid rgba(220, 38, 38, 0.35)',
          borderRadius: '14px',
          marginBottom: '1rem',
          color: '#fecdd3',
          fontWeight: '700'
        }}>
          <span>⏱️ Time Attack Remaining:</span>
          <span style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)' }}>{timeLeft}s</span>
        </div>
      )}

      {/* Main Flashcard Card (German Crimson/Gold Theme) */}
      <div className="flashcard-wrapper">
        <div className={`glass-panel-glow flashcard-card ${feedback === 'correct' ? 'correct-glow' : feedback === 'incorrect' ? 'incorrect-glow' : ''}`}>
          
          {/* Card Top Action Bar */}
          <div style={{
            position: 'absolute',
            top: '1.25rem',
            left: '1.25rem',
            right: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{
              fontSize: '0.8rem',
              fontWeight: '800',
              color: 'var(--de-gold-bright)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em'
            }}>
              Kategorie: {card.category || 'Vocabulary'}
            </span>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {/* Pronunciation button */}
              <button className="icon-btn" onClick={handleSpeak} title="Listen to German Pronunciation">
                <Volume2 size={18} color="#fbbf24" />
              </button>
              
              {/* Reveal Answer Toggle */}
              <button 
                className="icon-btn" 
                onClick={() => setShowAnswer(!showAnswer)} 
                title={showAnswer ? "Hide Answer" : "Reveal Answer"}
                style={{
                  background: showAnswer ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                  borderColor: showAnswer ? 'var(--de-gold)' : 'rgba(255, 255, 255, 0.12)'
                }}
              >
                {showAnswer ? <EyeOff size={18} color="#f59e0b" /> : <Eye size={18} color="#a5b4fc" />}
              </button>
            </div>
          </div>

          {/* Question Text */}
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem', marginTop: '2rem' }}>
            Translate from {questionLangLabel}:
          </span>

          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '2.6rem',
            fontWeight: '900',
            color: '#ffffff',
            marginBottom: '1rem'
          }}>
            {questionText}
          </h2>

          {/* Answer Reveal Area */}
          {showAnswer && (
            <div style={{
              marginTop: '0.75rem',
              padding: '0.85rem 1.5rem',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              borderRadius: '16px',
              animation: 'fadeInTabs 0.3s ease-out'
            }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                Full Meaning / Translation:
              </span>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--de-gold-bright)' }}>
                 {card.german} =  {card.english}
              </div>
            </div>
          )}

          {/* Hint Display */}
          {hintShown && !showAnswer && (
            <div style={{
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              padding: '0.4rem 0.9rem',
              borderRadius: '10px',
              fontSize: '0.85rem',
              color: '#fde047',
              marginTop: '0.5rem'
            }}>
              💡 Hint: {getHint()}
            </div>
          )}

        </div>
      </div>

      {/* Answer Input Box & Control Buttons */}
      <div className="game-input-container">
        <form onSubmit={handleSubmit} className="game-input-group">
          <input
            ref={inputRef}
            type="text"
            className="game-input"
            placeholder={`Enter ${targetLangLabel}...`}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={feedback === 'correct'}
            autoComplete="off"
            autoFocus
          />

          {!feedback ? (
            <button type="submit" className="game-submit-btn">
              <span>Submit</span>
              <ArrowRight size={18} />
            </button>
          ) : (
            <button type="button" onClick={onNextCard} className="game-submit-btn" style={{ background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)' }}>
              <span>Nächstes Wort</span>
              <ArrowRight size={18} />
            </button>
          )}
        </form>

        {/* Action Controls Bar: Undo / Previous Word, Hint, Feedback, Next Word */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {/* Undo / Back to Previous Word */}
            {hasPrevCard && (
              <button 
                type="button"
                className="icon-btn" 
                onClick={onPrevCard}
                style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem', gap: '0.4rem', color: '#fef08a' }}
                title="Go back to previous word"
              >
                <RotateCcw size={15} color="#f59e0b" />
                <span>Undo / Zurück</span>
              </button>
            )}

            {/* Hint Button */}
            {!hintShown && !feedback && !showAnswer && (
              <button 
                type="button"
                className="icon-btn" 
                onClick={() => setHintShown(true)}
                style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem', gap: '0.4rem' }}
              >
                <Lightbulb size={15} color="#f59e0b" />
                <span>Hint</span>
              </button>
            )}
          </div>

          {/* Feedback Display */}
          {feedback === 'correct' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-emerald)', fontWeight: '800' }}>
              <CheckCircle2 size={20} />
              <span>Richtig! (+15 XP)</span>
            </div>
          )}

          {feedback === 'incorrect' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--de-red-bright)', fontWeight: '800' }}>
              <XCircle size={20} />
              <span>Target: "{targetAnswer}"</span>
            </div>
          )}

          {/* Skip / Next Word Button */}
          <button 
            type="button"
            className="icon-btn" 
            onClick={onNextCard}
            style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}
          >
            Weiter ➔
          </button>
        </div>

      </div>

    </div>
  );
}
