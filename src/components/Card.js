import React from 'react';
import './Card.css';

const Card = ({ card, onClick, isFlipped, isMatched }) => {
  return (
    <div className={`card ${isFlipped || isMatched ? 'flipped' : ''}`} onClick={() => onClick(card)}>
      <div className="card-inner">
        <div className="card-front">?</div>
        <div className="card-back">{card.value}</div>
      </div>
    </div>
  );
};

export default Card;
