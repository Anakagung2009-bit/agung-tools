// Text to Binary
export function textToBinary(text: string): string {
  return text
    .split("")
    .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
    .join(" ");
}

// Binary to Text
export function binaryToText(binary: string): string {
  try {
    const bytes = binary.replace(/\s/g, "").match(/.{1,8}/g) || [];
    return bytes
      .map((byte) => String.fromCharCode(parseInt(byte, 2)))
      .join("");
  } catch {
    return "Invalid binary input";
  }
}

// Number to Binary
export function numberToBinary(num: number): string {
  return num.toString(2);
}

// Binary to Number
export function binaryToNumber(binary: string): number | string {
  try {
    const cleaned = binary.replace(/\s/g, "");
    return parseInt(cleaned, 2);
  } catch {
    return "Invalid binary input";
  }
}

// Text to Hex
export function textToHex(text: string): string {
  return text
    .split("")
    .map((char) => char.charCodeAt(0).toString(16).padStart(2, "0"))
    .join(" ");
}

// Hex to Text
export function hexToText(hex: string): string {
  try {
    const cleaned = hex.replace(/\s/g, "");
    const bytes = cleaned.match(/.{1,2}/g) || [];
    return bytes
      .map((byte) => String.fromCharCode(parseInt(byte, 16)))
      .join("");
  } catch {
    return "Invalid hex input";
  }
}

// Hex to Number
export function hexToNumber(hex: string): number | string {
  try {
    const cleaned = hex.replace(/\s/g, "").replace(/^0x/i, "");
    return parseInt(cleaned, 16);
  } catch {
    return "Invalid hex input";
  }
}

// Number to Hex
export function numberToHex(num: number): string {
  return num.toString(16).toUpperCase();
}

// Text to Base64
export function textToBase64(text: string): string {
  try {
    return btoa(unescape(encodeURIComponent(text)));
  } catch {
    return "Invalid input";
  }
}

// Base64 to Text
export function base64ToText(base64: string): string {
  try {
    return decodeURIComponent(escape(atob(base64)));
  } catch {
    return "Invalid Base64 input";
  }
}

// Text to Octal
export function textToOctal(text: string): string {
  return text
    .split("")
    .map((char) => char.charCodeAt(0).toString(8).padStart(3, "0"))
    .join(" ");
}

// Octal to Text
export function octalToText(octal: string): string {
  try {
    const cleaned = octal.replace(/\s/g, "");
    const bytes = cleaned.match(/.{1,3}/g) || [];
    return bytes
      .map((byte) => String.fromCharCode(parseInt(byte, 8)))
      .join("");
  } catch {
    return "Invalid octal input";
  }
}

// Number to Octal
export function numberToOctal(num: number): string {
  return num.toString(8);
}

// Octal to Number
export function octalToNumber(octal: string): number | string {
  try {
    const cleaned = octal.replace(/\s/g, "");
    return parseInt(cleaned, 8);
  } catch {
    return "Invalid octal input";
  }
}

// Morse code mapping
const MORSE_CODE: Record<string, string> = {
  A: ".-",
  B: "-...",
  C: "-.-.",
  D: "-..",
  E: ".",
  F: "..-.",
  G: "--.",
  H: "....",
  I: "..",
  J: ".---",
  K: "-.-",
  L: ".-..",
  M: "--",
  N: "-.",
  O: "---",
  P: ".--.",
  Q: "--.-",
  R: ".-.",
  S: "...",
  T: "-",
  U: "..-",
  V: "...-",
  W: ".--",
  X: "-..-",
  Y: "-.--",
  Z: "--..",
  "0": "-----",
  "1": ".----",
  "2": "..---",
  "3": "...--",
  "4": "....-",
  "5": ".....",
  "6": "-....",
  "7": "--...",
  "8": "---..",
  "9": "----.",
  ".": ".-.-.-",
  ",": "--..--",
  "?": "..--..",
  "'": ".----.",
  "!": "-.-.--",
  "/": "-..-.",
  "(": "-.--.",
  ")": "-.--.-",
  "&": ".-...",
  ":": "---...",
  ";": "-.-.-.",
  "=": "-...-",
  "+": ".-.-.",
  "-": "-....-",
  _: "..--.-",
  '"': ".-..-.",
  $: "...-..-",
  "@": ".--.-.",
};

const REVERSE_MORSE: Record<string, string> = Object.fromEntries(
  Object.entries(MORSE_CODE).map(([k, v]) => [v, k])
);

// Text to Morse
export function textToMorse(text: string): string {
  return text
    .toUpperCase()
    .split("")
    .map((char) => {
      if (char === " ") return "/";
      return MORSE_CODE[char] || char;
    })
    .join(" ");
}

// Morse to Text
export function morseToText(morse: string): string {
  return morse
    .split(" ")
    .map((code) => {
      if (code === "/") return " ";
      return REVERSE_MORSE[code] || code;
    })
    .join("");
}

// Caesar Cipher
export function caesarCipher(text: string, shift: number, encode: boolean = true): string {
  const actualShift = encode ? shift : -shift;
  return text
    .split("")
    .map((char) => {
      if (char.match(/[a-z]/i)) {
        const code = char.charCodeAt(0);
        const isUpperCase = code >= 65 && code <= 90;
        const base = isUpperCase ? 65 : 97;
        return String.fromCharCode(
          ((code - base + actualShift + 26) % 26) + base
        );
      }
      return char;
    })
    .join("");
}

// Validate binary input
export function isValidBinary(text: string): boolean {
  return /^[01\s]+$/.test(text);
}

// Validate hex input
export function isValidHex(text: string): boolean {
  return /^[0-9a-fA-F\s]+$/.test(text);
}

// Validate octal input
export function isValidOctal(text: string): boolean {
  return /^[0-7\s]+$/.test(text);
}

// Validate Base64 input
export function isValidBase64(text: string): boolean {
  try {
    return btoa(atob(text)) === text;
  } catch {
    return false;
  }
}

// Get bit length
export function getBitLength(binary: string): number {
  return binary.replace(/\s/g, "").length;
}

// Get byte size
export function getByteSize(binary: string): number {
  return Math.ceil(binary.replace(/\s/g, "").length / 8);
}
