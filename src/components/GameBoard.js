import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Card from './Card';
import './GameBoard.css';
import { Modal, Button } from 'react-bootstrap';

const shuffleCards = (cards) => {
  return cards.concat(cards).sort(() => Math.random() - 0.5).map((card, index) => ({ ...card, id: index }));
};

const GameBoard = () => {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [gameActive, setGameActive] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [bestScore, setBestScore] = useState(localStorage.getItem('bestScore') || 0);
  const [leaderboard, setLeaderboard] = useState(JSON.parse(localStorage.getItem('leaderboard')) || []);

  // Memoize cardValues so it doesn't get recreated on every render
  const cardValues = useMemo(() => [
    { value: 1 },{ value: 2 },
    { value: 2 }, { value: 3 },
    { value: 4 }, { value: 5 }, { value: 6 },
    { value: 7 },
  ], []);


  const handleCloseModal = () => {
    console.log("coem")
    setShowModal(false);
  };

  const restartGame = () => {
    setCards(shuffleCards(cardValues));
    setFlippedCards([]);
    setMatchedCards([]);
    setMoves(0);
    setTime(0);
    setGameActive(true);
  };




  const updateLeaderboard = (moves, time) => {

    console.log('Com eheres')
    const newEntry = { moves, time, date: new Date().toLocaleString() };
    console.log(newEntry)
    const updatedLeaderboard1 = [...leaderboard, newEntry]
      .sort((a, b) => a.moves - b.moves)
      .slice(0, 3); // Keep only top 3 entries
    setLeaderboard(updatedLeaderboard1);
    localStorage.setItem('leaderboard', JSON.stringify(updatedLeaderboard1));
    console.log(leaderboard)
  };

  // Shuffle cards when the component mounts
  useEffect(() => {
    setCards(shuffleCards(cardValues));
  }, [cardValues]);

  useEffect(() => {
    if (gameActive) {
      const interval = setInterval(() => setTime(time + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [time, gameActive]);

  useEffect(() => {
    if (matchedCards.length === cards.length) {
      setGameActive(false);
      setShowModal(true);
      if(moves != 0)
      {
       updateLeaderboard(moves, time); 
      }
            if (moves > bestScore) {
        setBestScore(moves);
        localStorage.setItem('bestScore', moves);
      }
      // return;
    }
  }, [matchedCards, cards, moves, bestScore, time]);



  const handleCardClick = (card) => {
    if (flippedCards.length === 2 || matchedCards.includes(card.id)) return;

    setFlippedCards([...flippedCards, card]);

    if (flippedCards.length === 1) {
      setMoves(moves + 1);

      if (flippedCards[0].value === card.value) {
        setMatchedCards([...matchedCards, flippedCards[0].id, card.id]);
        setFlippedCards([]);
      } else {
        setTimeout(() => setFlippedCards([]), 1000);
      }
    }
  };

  return (
    <div>
      <div className="stats">
        <p>Moves: {moves}</p>
        <p>Time: {time} seconds</p>
        <p>Best Score: {bestScore && bestScore > 0 ? bestScore : 0}</p>
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


      {time == 0 && <Button onClick={restartGame} className="mt-3 btn-primary">Start Game</Button>}

      <Button onClick={restartGame} className="mt-3 btn-primary">Restart Game</Button>

      {/* Leaderboard */}
      <div className="leaderboard">
        <h3>Top 3 Leaderboard</h3>
        <ul>
          {leaderboard.length > 0 && leaderboard.map((entry, index) => (
            
            <li key={index}>Moves: 
            
            
            {entry.moves }, Time: {entry.time} sec, Date: {entry.date}
            
            
            
            </li>
          ))}
        </ul>
      </div>

      {/* Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Congratulations!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>You completed the game in {moves} moves and {time} seconds!</p>
          {moves > bestScore && <p>New Best Score!</p>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>Close</Button>
          <Button variant="primary" onClick={restartGame}>Play Again</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default GameBoard;
