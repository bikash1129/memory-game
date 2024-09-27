import React, { useState, useEffect, useCallback } from 'react';
import Card from './Card';
import './GameBoard.css';
import { Modal, Button } from 'react-bootstrap';
import flipSoundFile from '../assets/flip.mp3';
import matchSoundFile from '../assets/match.mp3';

const shuffleCards = (cards) => {
  return cards.concat(cards).sort(() => Math.random() - 0.5).map((card, index) => ({ ...card, id: index }));
};

// Move cardValues outside the component to avoid redeclaring in every render
const cardValues = [
  { value: 1 }, { value: 2 }, { value: 3 },
  { value: 4 }, { value: 5 }, { value: 6 },
  { value: 7 }, { value: 8 }
];

const GameBoard = () => {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [gameActive, setGameActive] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [bestScore, setBestScore] = useState(localStorage.getItem('bestScore') || Number.MAX_VALUE);
  const [leaderboard, setLeaderboard] = useState(JSON.parse(localStorage.getItem('leaderboard')) || []);

  const flipSound = new Audio(flipSoundFile);
  const matchSound = new Audio(matchSoundFile);

  // Define updateLeaderboard above its usage
  const updateLeaderboard = useCallback((moves, time) => {
    const newEntry = { moves, time, date: new Date().toLocaleString() };
    const updatedLeaderboard = [...leaderboard, newEntry].sort((a, b) => a.moves - b.moves);
    setLeaderboard(updatedLeaderboard);
    localStorage.setItem('leaderboard', JSON.stringify(updatedLeaderboard));
  }, [leaderboard]);

  useEffect(() => {
    setCards(shuffleCards(cardValues));
  }, []);

  useEffect(() => {
    if (gameActive) {
      const interval = setInterval(() => setTime((prevTime) => prevTime + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [gameActive]);

  const handleCardClick = (card) => {
    if (flippedCards.length === 2 || matchedCards.includes(card.id)) return;

    flipSound.play();
    setFlippedCards([...flippedCards, card]);

    if (flippedCards.length === 1) {
      setMoves(moves + 1);

      if (flippedCards[0].value === card.value) {
        matchSound.play();
        setMatchedCards([...matchedCards, flippedCards[0].id, card.id]);
        setFlippedCards([]);
      } else {
        setTimeout(() => setFlippedCards([]), 1000);
      }
    }
  };

  const restartGame = () => {
    setCards(shuffleCards(cardValues));
    setFlippedCards([]);
    setMatchedCards([]);
    setMoves(0);
    setTime(0);
    setGameActive(true);
  };

  useEffect(() => {
    if (matchedCards.length === cards.length) {
      setGameActive(false);
      setShowModal(true);
      updateLeaderboard(moves, time);
      if (moves < bestScore) {
        setBestScore(moves);
        localStorage.setItem('bestScore', moves);
      }
    }
  }, [matchedCards, cards, moves, bestScore, updateLeaderboard, time]);


  return (
    <div>
      <div className="stats">
        <p>Moves: {moves}</p>
        <p>Time: {time} seconds</p>
        <p>Best Score: {bestScore !== Number.MAX_VALUE ? bestScore : 'N/A'}</p>
      </div>

      <div className="game-board">
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            onClick={handleCardClick}
            isFlipped={flippedCards.includes(card)}
            isMatched={matchedCards.includes(card.id)}
          />
        ))}
      </div>

      <Button onClick={restartGame} className="mt-3 btn-primary">Restart Game</Button>

      {/* Leaderboard */}
      <div className="leaderboard">
        <h3>Leaderboard</h3>
        <ul>
          {leaderboard.slice(0, 5).map((entry, index) => (
            <li key={index}>Moves: {entry.moves}, Time: {entry.time} sec, Date: {entry.date}</li>
          ))}
        </ul>
      </div>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Congratulations!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>You completed the game in {moves} moves and {time} seconds!</p>
          {moves < bestScore && <p>New Best Score!</p>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
          <Button variant="primary" onClick={restartGame}>Play Again</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default GameBoard;
