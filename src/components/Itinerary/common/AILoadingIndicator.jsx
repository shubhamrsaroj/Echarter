import React, { useState, useEffect } from 'react';

const AILoadingIndicator = () => {
  const [loadingText, setLoadingText] = useState('Searching data');
  const [dots, setDots] = useState('');

  useEffect(() => {
    const messages = ['Searching data', 'Analyzing options', 'Generating itinerary'];
    let messageIndex = 0;

    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setLoadingText(messages[messageIndex]);
    }, 3000); // Cycle every 3 seconds for a calm pace

    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500); // Smooth dot progression

    return () => {
      clearInterval(messageInterval);
      clearInterval(dotsInterval);
    };
  }, []);

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes wave {
            0% { transform: scale(1); opacity: 0.3; }
            50% { transform: scale(1.2); opacity: 0.7; }
            100% { transform: scale(1); opacity: 0.3; }
          }
          @keyframes ripple {
            0% { transform: scale(0.8); opacity: 0.5; }
            100% { transform: scale(1.5); opacity: 0; }
          }
          .wave-core { animation: wave 1.5s ease-in-out infinite; }
          .wave-ripple { animation: ripple 2s ease-out infinite; }
          .wave-ripple:nth-child(2) { animation-delay: 0.5s; }
          .wave-ripple:nth-child(3) { animation-delay: 1s; }
        `}
      </style>

      {/* Thinking wave animation */}
      <div style={styles.waveContainer}>
        <div style={styles.waveCore} className="wave-core"></div>
        <div style={styles.waveRipple} className="wave-ripple"></div>
        <div style={styles.waveRipple} className="wave-ripple"></div>
        <div style={styles.waveRipple} className="wave-ripple"></div>
      </div>

      {/* Loading text */}
      <div style={styles.text}>
        {loadingText}
        <span style={styles.dots}>{dots}</span>
      </div>

      {/* Subtle reassurance */}
      <p style={styles.subText}>Processing with intelligence</p>
    </div>
  );
};

// Inline styles
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '48px 0',
  },
  waveContainer: {
    position: 'relative',
    width: '60px',
    height: '60px',
    marginBottom: '20px',
  },
  waveCore: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '20px',
    height: '20px',
    backgroundColor: '#4F46E5', // Indigo-600 equivalent
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
  },
  waveRipple: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '60px',
    height: '60px',
    backgroundColor: '#4F46E5',
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
    opacity: 0,
  },
  text: {
    fontSize: '1.25rem', // text-xl
    fontWeight: 500, // medium
    color: '#111827', // gray-900
    letterSpacing: '0.025em',
  },
  dots: {
    color: '#4F46E5', // indigo-600
    marginLeft: '4px',
  },
  subText: {
    marginTop: '8px',
    fontSize: '0.875rem', // text-sm
    color: '#6B7280', // gray-600
  },
};

export default AILoadingIndicator;