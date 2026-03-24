// Morse code audio player using Web Audio API

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)();
  }
  return audioContext;
}

function playBeep(
  ctx: AudioContext,
  frequency: number,
  duration: number,
  startTime: number
): void {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = "sine";

  // Smooth envelope
  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(0.5, startTime + 0.01);
  gainNode.gain.setValueAtTime(0.5, startTime + duration - 0.01);
  gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
}

export interface MorseTiming {
  dotDuration: number; // 1 unit
  dashDuration: number; // 3 units
  symbolGap: number; // 1 unit (between dots/dashes in a letter)
  letterGap: number; // 3 units
  wordGap: number; // 7 units
}

export const DEFAULT_TIMING: MorseTiming = {
  dotDuration: 100, // ms
  dashDuration: 300, // ms
  symbolGap: 100, // ms
  letterGap: 300, // ms
  wordGap: 700, // ms
};

export function playMorse(
  morse: string,
  timing: MorseTiming = DEFAULT_TIMING,
  frequency: number = 600
): Promise<void> {
  return new Promise((resolve) => {
    const ctx = getAudioContext();
    let currentTime = ctx.currentTime + 0.1;

    const chars = morse.split("");

    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];

      if (char === ".") {
        playBeep(ctx, frequency, timing.dotDuration / 1000, currentTime);
        currentTime += timing.dotDuration / 1000;
        // Add symbol gap if next char is dot or dash
        if (chars[i + 1] && [".", "-"].includes(chars[i + 1])) {
          currentTime += timing.symbolGap / 1000;
        }
      } else if (char === "-") {
        playBeep(ctx, frequency, timing.dashDuration / 1000, currentTime);
        currentTime += timing.dashDuration / 1000;
        // Add symbol gap if next char is dot or dash
        if (chars[i + 1] && [".", "-"].includes(chars[i + 1])) {
          currentTime += timing.symbolGap / 1000;
        }
      } else if (char === " ") {
        // Letter gap (space between letters)
        currentTime += timing.letterGap / 1000;
      } else if (char === "/") {
        // Word gap
        currentTime += timing.wordGap / 1000;
      }
    }

    // Resolve after all sounds have played
    const totalDuration = (currentTime - ctx.currentTime) * 1000;
    setTimeout(resolve, totalDuration + 100);
  });
}

export function stopMorse(): void {
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
}
