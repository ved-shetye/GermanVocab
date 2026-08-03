import React, { useState, useEffect } from 'react';
import WelcomeOverlay from './components/WelcomeOverlay';
import GameHeader from './components/GameHeader';
import CategoryTabs from './components/CategoryTabs';
import FlashCardGame from './components/FlashCardGame';
import SummaryModal from './components/SummaryModal';
import { shuffleArray, sfx } from './utils/gameUtils';
import vocabData from './data/vocabulary.json';

export default function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [activeCategory, setActiveCategory] = useState('adverb'); // 'adverb' | 'noun' | 'adjective' | 'verb' | 'random'
  const [gameMode, setGameMode] = useState('flashcard'); // 'flashcard' | 'timeattack'
  const [direction, setDirection] = useState('DE_TO_EN'); // 'DE_TO_EN' | 'EN_TO_DE' | 'MIXED'
  
  // Game session states
  const [cardDeck, setCardDeck] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [sessionFinished, setSessionFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Player stats
  const [stats, setStats] = useState({
    xp: 0,
    streak: 0,
    maxStreak: 0,
    correct: 0,
    incorrect: 0
  });

  const [missedWords, setMissedWords] = useState([]);

  // Load and shuffle cards whenever category changes
  useEffect(() => {
    startNewSession(activeCategory);
  }, [activeCategory, gameMode]);

  // Timer countdown logic for Time Attack mode
  useEffect(() => {
    let timerId;
    if (gameMode === 'timeattack' && !sessionFinished && !showWelcome) {
      if (timeLeft > 0) {
        timerId = setInterval(() => {
          setTimeLeft((t) => t - 1);
        }, 1000);
      } else {
        setSessionFinished(true);
      }
    }
    return () => clearInterval(timerId);
  }, [gameMode, sessionFinished, showWelcome, timeLeft]);

  const getCategoryCards = (cat) => {
    if (cat === 'random') {
      const all = [
        ...(vocabData.adverb || []),
        ...(vocabData.verb || []),
        ...(vocabData.noun || []),
        ...(vocabData.adjective || [])
      ];
      return shuffleArray(all);
    }
    return shuffleArray(vocabData[cat] || []);
  };

  const startNewSession = (cat) => {
    const cards = getCategoryCards(cat);
    setCardDeck(cards);
    setCurrentCardIndex(0);
    setSessionFinished(false);
    setTimeLeft(60);
    setMissedWords([]);
  };

  const handleAnswerSubmit = (isCorrect, card) => {
    if (isCorrect) {
      const newStreak = stats.streak + 1;
      const xpEarned = 15 + Math.min(newStreak * 5, 25);
      
      setStats((prev) => ({
        ...prev,
        xp: prev.xp + xpEarned,
        streak: newStreak,
        maxStreak: Math.max(prev.maxStreak, newStreak),
        correct: prev.correct + 1
      }));

      if (newStreak % 5 === 0) {
        sfx.playStreak();
      }
    } else {
      setStats((prev) => ({
        ...prev,
        streak: 0,
        incorrect: prev.incorrect + 1
      }));

      setMissedWords((prev) => {
        if (!prev.some((w) => w.id === card.id)) {
          return [...prev, card];
        }
        return prev;
      });
    }
  };

  const handleNextCard = () => {
    if (currentCardIndex + 1 < cardDeck.length && currentCardIndex < 25) { // 25 cards per session round
      setCurrentCardIndex((idx) => idx + 1);
    } else {
      setSessionFinished(true);
    }
  };

  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex((idx) => idx - 1);
    }
  };

  const currentCard = cardDeck[currentCardIndex];

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      
      {/* Animated Welcome Overlay */}
      {showWelcome && (
        <WelcomeOverlay onComplete={() => setShowWelcome(false)} />
      )}

      {/* Main Game Interface */}
      <GameHeader 
        stats={stats}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onResetStats={() => setStats({ xp: 0, streak: 0, maxStreak: 0, correct: 0, incorrect: 0 })}
      />

      {/* Category Selection Tabs */}
      <CategoryTabs 
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
        }}
        counts={vocabData.stats}
        gameMode={gameMode}
        setGameMode={setGameMode}
        direction={direction}
        setDirection={setDirection}
      />

      {/* Game Content Area */}
      {!sessionFinished ? (
        <FlashCardGame 
          card={currentCard}
          directionMode={direction}
          onAnswerSubmit={handleAnswerSubmit}
          onNextCard={handleNextCard}
          onPrevCard={handlePrevCard}
          hasPrevCard={currentCardIndex > 0}
          gameMode={gameMode}
          timeLeft={timeLeft}
        />
      ) : (
        <SummaryModal 
          stats={stats}
          missedWords={missedWords}
          onRestart={() => startNewSession(activeCategory)}
          onChangeCategory={() => {
            setSessionFinished(false);
          }}
        />
      )}

      {/* Footer info */}
      <footer style={{ textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center', marginTop: '3rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
        DeutschVocab • Made By Ved
      </footer>
    </div>
  );
}
