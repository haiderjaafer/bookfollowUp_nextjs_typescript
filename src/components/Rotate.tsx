import React from 'react';
import styles from './RotatingCoin.module.css'; // Import the CSS module

// IMPORTANT: Ensure 'coin-logo.png' is placed in the 'public' directory 
// of your Next.js project for this path to work.
const COIN_IMAGE_SRC = '/coin-logo.png'; 

const RotatingCoin: React.FC = () => {
  return (
    // Use the container class from the CSS module
    <div className={styles.container}>
      {/* Use the perspectiveContainer class */}
      <div className={styles.perspectiveContainer}>
        
        {/* Use the coin class for the image wrapper */}
        <div className={styles.coin}>
           {/* Image tag for the coin */}
           <img
             src={COIN_IMAGE_SRC} 
             alt="Rotating Coin Logo"
             width={200} // Set explicit width/height or manage via CSS
             height={200}
             // No additional className needed if styles.coin img handles it
           />
        </div>

        {/* Use the shadow class */}
        <div className={styles.shadow} />
      </div>
    </div>
  );
};

export default RotatingCoin;

