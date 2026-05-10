"use client";
import React, { useState } from 'react';
import IntroductionPage from "../components/introduction-page";
import MarpoSpiritPage from "../components/marpo-spirit-page";

export default function Home() {
  const [hasEntered, setHasEntered] = useState(false);

  const handleEntry = () => {
    setHasEntered(true);
  };

  return (
    <>
      {hasEntered ? (
        <MarpoSpiritPage />
      ) : (
        <IntroductionPage onStartSession={handleEntry} />
      )}
    </>
  );
}