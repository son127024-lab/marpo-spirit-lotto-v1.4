"use client";
import React, { useState } from 'react';
import IntroductionPage from "../components/introduction-page";
import MarpoSpiritPage from "../components/marpo-spirit-page";

export default function Home() {
  const [hasEntered, setHasEntered] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');

  const handleEntry = () => {
    setHasEntered(true);
  };

  return (
    <>
      {hasEntered ? (
        <MarpoSpiritPage lang={currentLang} />
      ) : (
        <IntroductionPage 
          onStartSession={handleEntry} 
          currentLang={currentLang} 
          setLang={setCurrentLang} 
        />
      )}
    </>
  );
}