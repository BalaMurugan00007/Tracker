"use client";

import React, { useEffect, useState } from 'react';
import { Briefcase } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinish, 500); // Wait for fade out animation
    }, 2000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--bg-app)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.5s ease-in-out',
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
    >
      <div style={{ 
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent-blue) 100%)',
        padding: '20px',
        borderRadius: '50%',
        marginBottom: '20px',
        boxShadow: '0 0 30px rgba(0, 230, 118, 0.3)'
      }}>
        <Briefcase size={48} color="#fff" />
      </div>
      <h1 style={{ 
        fontSize: '2rem', 
        fontWeight: 'bold', 
        background: 'linear-gradient(to right, #fff, #a1a1aa)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        JobTracker
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
        Intelligence for your career
      </p>
    </div>
  );
}
