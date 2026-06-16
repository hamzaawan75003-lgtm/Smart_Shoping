import React from 'react';
import Image from 'next/image';
import styles from './Card.module.css';

interface CardProps {
  backgroundImage: string;
  characterImage: string;
  title: string;
}

const Card: React.FC<CardProps> = ({ backgroundImage, characterImage, title }) => {
  return (
    <div className={styles.card}>
      <div className={styles.wrapper}>
        <div className={styles.coverImage}>
          <Image 
            src={backgroundImage} 
            alt="Background" 
            fill 
            className="object-cover"
            priority
          />
        </div>
      </div>
      <div className={styles.characterContainer}>
        <div className={styles.character}>
          <Image 
            src={characterImage} 
            alt={title} 
            fill 
            className="object-contain object-bottom"
          />
        </div>
      </div>
      <h2 className={styles.title}>{title}</h2>
    </div>
  );
};

export default Card;
