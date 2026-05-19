"use client";

type MarpoSoundName =
  | "click"
  | "success"
  | "fail"
  | "electric"
  | "warp"
  | "arrival"
  | "unlock"
  | "ore"
  | "fusion";

let audioContext: AudioContext | null = null;

function getAudioContext() {
  if (typeof window === "undefined") return null;

  const AudioContextClass =
    window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) return null;

  if (!audioContext) {
    audioContext = new AudioContextClass();
  }

  if (audioContext.state === "suspended") {
    void audioContext.resume();
  }

  return audioContext;
}

export function isMarpoSoundEnabled() {
  if (typeof window === "undefined") return true;

  const saved = localStorage.getItem("marpo_sound_enabled");

  if (saved === null) return true;

  return saved === "true";
}

export function setMarpoSoundEnabled(enabled: boolean) {
  if (typeof window === "undefined") return;

  localStorage.setItem("marpo_sound_enabled", String(enabled));
}

function playTone(
  frequency: number,
  duration: number,
  options?: {
    type?: OscillatorType;
    gain?: number;
    startTime?: number;
    endFrequency?: number;
  }
) {
  if (!isMarpoSoundEnabled()) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const startTime = options?.startTime ?? ctx.currentTime;
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = options?.type ?? "sine";
  oscillator.frequency.setValueAtTime(frequency, startTime);

  if (options?.endFrequency) {
    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(1, options.endFrequency),
      startTime + duration
    );
  }

  gainNode.gain.setValueAtTime(0.0001, startTime);
  gainNode.gain.exponentialRampToValueAtTime(
    options?.gain ?? 0.08,
    startTime + 0.02
  );
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.03);
}

function playNoise(
  duration: number,
  options?: {
    gain?: number;
    startTime?: number;
    filterFrequency?: number;
  }
) {
  if (!isMarpoSoundEnabled()) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const startTime = options?.startTime ?? ctx.currentTime;
  const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration));
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i += 1) {
    output[i] = Math.random() * 2 - 1;
  }

  const source = ctx.createBufferSource();
  const gainNode = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  source.buffer = buffer;
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(options?.filterFrequency ?? 900, startTime);

  gainNode.gain.setValueAtTime(0.0001, startTime);
  gainNode.gain.exponentialRampToValueAtTime(
    options?.gain ?? 0.06,
    startTime + 0.02
  );
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  source.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  source.start(startTime);
  source.stop(startTime + duration + 0.03);
}

export function playMarpoSound(name: MarpoSoundName) {
  if (!isMarpoSoundEnabled()) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  switch (name) {
    case "click":
      playTone(680, 0.08, {
        type: "triangle",
        gain: 0.045,
        startTime: now,
        endFrequency: 920,
      });
      break;

    case "success":
      playTone(520, 0.12, {
        type: "sine",
        gain: 0.055,
        startTime: now,
        endFrequency: 780,
      });
      playTone(880, 0.16, {
        type: "triangle",
        gain: 0.045,
        startTime: now + 0.08,
        endFrequency: 1320,
      });
      break;

    case "fail":
      playTone(240, 0.18, {
        type: "sawtooth",
        gain: 0.045,
        startTime: now,
        endFrequency: 90,
      });
      playNoise(0.12, {
        gain: 0.035,
        startTime: now + 0.05,
        filterFrequency: 250,
      });
      break;

    case "electric":
      playNoise(0.22, {
        gain: 0.06,
        startTime: now,
        filterFrequency: 1800,
      });
      playTone(1200, 0.08, {
        type: "square",
        gain: 0.03,
        startTime: now + 0.03,
        endFrequency: 600,
      });
      break;

    case "warp":
      playTone(80, 0.9, {
        type: "sine",
        gain: 0.055,
        startTime: now,
        endFrequency: 480,
      });
      playNoise(0.8, {
        gain: 0.04,
        startTime: now + 0.1,
        filterFrequency: 700,
      });
      break;

    case "arrival":
      playTone(440, 0.18, {
        type: "sine",
        gain: 0.06,
        startTime: now,
        endFrequency: 880,
      });
      playTone(990, 0.22, {
        type: "triangle",
        gain: 0.045,
        startTime: now + 0.1,
        endFrequency: 1480,
      });
      break;

    case "unlock":
      playTone(660, 0.12, {
        type: "sine",
        gain: 0.05,
        startTime: now,
      });
      playTone(990, 0.12, {
        type: "sine",
        gain: 0.045,
        startTime: now + 0.12,
      });
      playTone(1320, 0.18, {
        type: "triangle",
        gain: 0.04,
        startTime: now + 0.24,
      });
      break;

    case "ore":
      playTone(340, 0.08, {
        type: "triangle",
        gain: 0.04,
        startTime: now,
      });
      playTone(920, 0.1, {
        type: "sine",
        gain: 0.035,
        startTime: now + 0.05,
      });
      break;

    case "fusion":
      playNoise(0.25, {
        gain: 0.04,
        startTime: now,
        filterFrequency: 1200,
      });
      playTone(420, 0.25, {
        type: "sine",
        gain: 0.045,
        startTime: now + 0.08,
        endFrequency: 1280,
      });
      break;
  }
}

export function playMarpoWarpSequence() {
  if (!isMarpoSoundEnabled()) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  playNoise(0.45, {
    gain: 0.035,
    startTime: now,
    filterFrequency: 500,
  });

  playNoise(0.9, {
    gain: 0.055,
    startTime: now + 0.8,
    filterFrequency: 1900,
  });

  playTone(70, 2.1, {
    type: "sine",
    gain: 0.07,
    startTime: now + 1.2,
    endFrequency: 390,
  });

  playNoise(1.4, {
    gain: 0.045,
    startTime: now + 2.1,
    filterFrequency: 900,
  });

  playTone(520, 0.6, {
    type: "triangle",
    gain: 0.055,
    startTime: now + 3.8,
    endFrequency: 1320,
  });

  playTone(980, 0.5, {
    type: "sine",
    gain: 0.045,
    startTime: now + 4.35,
    endFrequency: 1640,
  });
}