"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  Binary,
  Hexagon,
  FileCode,
  Radio,
  Octagon,
  Lock,
  Copy,
  ArrowRightLeft,
  Play,
  Square,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import {
  textToBinary,
  binaryToText,
  numberToBinary,
  binaryToNumber,
  textToHex,
  hexToText,
  hexToNumber,
  numberToHex,
  textToBase64,
  base64ToText,
  textToOctal,
  octalToText,
  numberToOctal,
  octalToNumber,
  textToMorse,
  morseToText,
  caesarCipher,
  isValidBinary,
  isValidHex,
  isValidOctal,
  getBitLength,
  getByteSize,
} from "@/lib/tools";
import { playMorse, stopMorse, DEFAULT_TIMING } from "@/lib/morse-audio";
import { cn } from "@/lib/utils";
import { useI18n } from "@/hooks/use-i18n";

// Tool categories
const tools = [
  { id: "text-binary", name: "Text ↔ Binary", icon: Binary, category: "binary" },
  { id: "number-binary", name: "Number ↔ Binary", icon: Binary, category: "binary" },
  { id: "text-hex", name: "Text ↔ Hex", icon: Hexagon, category: "hex" },
  { id: "number-hex", name: "Number ↔ Hex", icon: Hexagon, category: "hex" },
  { id: "base64", name: "Base64", icon: FileCode, category: "encoding" },
  { id: "morse", name: "Morse Code", icon: Radio, category: "encoding" },
  { id: "text-octal", name: "Text ↔ Octal", icon: Octagon, category: "octal" },
  { id: "number-octal", name: "Number ↔ Octal", icon: Octagon, category: "octal" },
  { id: "caesar", name: "Caesar Cipher", icon: Lock, category: "cipher" },
];

export function ToolsGrid() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{t("tools.title")}</h1>
        <p className="text-muted-foreground mt-1">
          {t("tools.subtitle")}
        </p>
      </div>

      {/* Tool Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <Card
            key={tool.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              selectedTool === tool.id && "ring-2 ring-primary"
            )}
            onClick={() => setSelectedTool(tool.id)}
          >
            <CardContent className="flex items-center gap-3 py-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <tool.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{tool.name}</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {t(`tools.categories.${tool.category}`) || tool.category}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tool Panel */}
      {selectedTool && (
        <Card>
          <CardContent className="py-6">
            {selectedTool === "text-binary" && <TextBinaryTool />}
            {selectedTool === "number-binary" && <NumberBinaryTool />}
            {selectedTool === "text-hex" && <TextHexTool />}
            {selectedTool === "number-hex" && <NumberHexTool />}
            {selectedTool === "base64" && <Base64Tool />}
            {selectedTool === "morse" && <MorseCodeTool />}
            {selectedTool === "text-octal" && <TextOctalTool />}
            {selectedTool === "number-octal" && <NumberOctalTool />}
            {selectedTool === "caesar" && <CaesarCipherTool />}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!selectedTool && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Binary className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium mb-1">{t("tools.selectHint")}</p>
            <p className="text-sm text-muted-foreground">
              {t("tools.selectHintSub")}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Shared copy button component
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy}>
      {copied ? (
        <Check className="h-4 w-4 text-success" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );
}

// Text ↔ Binary Tool
function TextBinaryTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");

  const handleConvert = () => {
    if (mode === "encode") {
      setOutput(textToBinary(input));
    } else {
      if (!isValidBinary(input)) {
        toast.error("Invalid binary input");
        return;
      }
      setOutput(binaryToText(input));
    }
  };

  // Real-time conversion
  const handleInputChange = (value: string) => {
    setInput(value);
    if (mode === "encode") {
      setOutput(textToBinary(value));
    } else if (isValidBinary(value)) {
      setOutput(binaryToText(value));
    }
  };

  const handleSwap = () => {
    setMode(mode === "encode" ? "decode" : "encode");
    setInput(output);
    setOutput(input);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Binary className="h-5 w-5" />
          Text ↔ Binary
        </h3>
        <div className="flex items-center gap-2">
          <Badge variant={mode === "encode" ? "default" : "secondary"}>
            {mode === "encode" ? "Text → Binary" : "Binary → Text"}
          </Badge>
          <Button variant="outline" size="icon" onClick={handleSwap}>
            <ArrowRightLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{mode === "encode" ? "Text Input" : "Binary Input"}</Label>
          <Textarea
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={mode === "encode" ? "Enter text..." : "Enter binary (e.g., 01001000 01100101)"}
            className="min-h-[150px] font-mono"
          />
          {mode === "encode" && input && (
            <p className="text-xs text-muted-foreground">
              Bit length: {getBitLength(textToBinary(input))} | Bytes: {getByteSize(textToBinary(input))}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>{mode === "encode" ? "Binary Output" : "Text Output"}</Label>
            <CopyButton text={output} />
          </div>
          <Textarea
            value={output}
            readOnly
            placeholder="Output will appear here..."
            className="min-h-[150px] font-mono"
          />
        </div>
      </div>
    </div>
  );
}

// Number ↔ Binary Tool
function NumberBinaryTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");

  const handleInputChange = (value: string) => {
    setInput(value);
    if (mode === "encode") {
      const num = parseInt(value, 10);
      if (!isNaN(num)) {
        setOutput(numberToBinary(num));
      } else {
        setOutput("");
      }
    } else {
      if (isValidBinary(value)) {
        setOutput(String(binaryToNumber(value)));
      } else {
        setOutput("");
      }
    }
  };

  const handleSwap = () => {
    setMode(mode === "encode" ? "decode" : "encode");
    setInput(output);
    setOutput(input);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Binary className="h-5 w-5" />
          Number ↔ Binary
        </h3>
        <div className="flex items-center gap-2">
          <Badge variant={mode === "encode" ? "default" : "secondary"}>
            {mode === "encode" ? "Number → Binary" : "Binary → Number"}
          </Badge>
          <Button variant="outline" size="icon" onClick={handleSwap}>
            <ArrowRightLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{mode === "encode" ? "Number Input" : "Binary Input"}</Label>
          <Input
            type={mode === "encode" ? "number" : "text"}
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={mode === "encode" ? "Enter a number..." : "Enter binary..."}
            className="font-mono"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>{mode === "encode" ? "Binary Output" : "Number Output"}</Label>
            <CopyButton text={output} />
          </div>
          <Input
            value={output}
            readOnly
            placeholder="Output will appear here..."
            className="font-mono"
          />
        </div>
      </div>
    </div>
  );
}

// Text ↔ Hex Tool
function TextHexTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");

  const handleInputChange = (value: string) => {
    setInput(value);
    if (mode === "encode") {
      setOutput(textToHex(value));
    } else if (isValidHex(value)) {
      setOutput(hexToText(value));
    }
  };

  const handleSwap = () => {
    setMode(mode === "encode" ? "decode" : "encode");
    setInput(output);
    setOutput(input);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Hexagon className="h-5 w-5" />
          Text ↔ Hexadecimal
        </h3>
        <div className="flex items-center gap-2">
          <Badge variant={mode === "encode" ? "default" : "secondary"}>
            {mode === "encode" ? "Text → Hex" : "Hex → Text"}
          </Badge>
          <Button variant="outline" size="icon" onClick={handleSwap}>
            <ArrowRightLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{mode === "encode" ? "Text Input" : "Hex Input"}</Label>
          <Textarea
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={mode === "encode" ? "Enter text..." : "Enter hex (e.g., 48 65 6c 6c 6f)"}
            className="min-h-[150px] font-mono"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>{mode === "encode" ? "Hex Output" : "Text Output"}</Label>
            <CopyButton text={output} />
          </div>
          <Textarea
            value={output}
            readOnly
            placeholder="Output will appear here..."
            className="min-h-[150px] font-mono"
          />
        </div>
      </div>
    </div>
  );
}

// Number ↔ Hex Tool
function NumberHexTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");

  const handleInputChange = (value: string) => {
    setInput(value);
    if (mode === "encode") {
      const num = parseInt(value, 10);
      if (!isNaN(num)) {
        setOutput(numberToHex(num));
      } else {
        setOutput("");
      }
    } else {
      const result = hexToNumber(value);
      setOutput(typeof result === "number" ? String(result) : result);
    }
  };

  const handleSwap = () => {
    setMode(mode === "encode" ? "decode" : "encode");
    setInput(output);
    setOutput(input);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Hexagon className="h-5 w-5" />
          Number ↔ Hexadecimal
        </h3>
        <div className="flex items-center gap-2">
          <Badge variant={mode === "encode" ? "default" : "secondary"}>
            {mode === "encode" ? "Number → Hex" : "Hex → Number"}
          </Badge>
          <Button variant="outline" size="icon" onClick={handleSwap}>
            <ArrowRightLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{mode === "encode" ? "Number Input" : "Hex Input"}</Label>
          <Input
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={mode === "encode" ? "Enter a number..." : "Enter hex..."}
            className="font-mono"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>{mode === "encode" ? "Hex Output" : "Number Output"}</Label>
            <CopyButton text={output} />
          </div>
          <Input
            value={output}
            readOnly
            placeholder="Output will appear here..."
            className="font-mono"
          />
        </div>
      </div>
    </div>
  );
}

// Base64 Tool
function Base64Tool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");

  const handleInputChange = (value: string) => {
    setInput(value);
    if (mode === "encode") {
      setOutput(textToBase64(value));
    } else {
      setOutput(base64ToText(value));
    }
  };

  const handleSwap = () => {
    setMode(mode === "encode" ? "decode" : "encode");
    setInput(output);
    setOutput(input);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileCode className="h-5 w-5" />
          Base64 Encoder/Decoder
        </h3>
        <div className="flex items-center gap-2">
          <Badge variant={mode === "encode" ? "default" : "secondary"}>
            {mode === "encode" ? "Text → Base64" : "Base64 → Text"}
          </Badge>
          <Button variant="outline" size="icon" onClick={handleSwap}>
            <ArrowRightLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{mode === "encode" ? "Text Input" : "Base64 Input"}</Label>
          <Textarea
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={mode === "encode" ? "Enter text..." : "Enter Base64..."}
            className="min-h-[150px] font-mono"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>{mode === "encode" ? "Base64 Output" : "Text Output"}</Label>
            <CopyButton text={output} />
          </div>
          <Textarea
            value={output}
            readOnly
            placeholder="Output will appear here..."
            className="min-h-[150px] font-mono"
          />
        </div>
      </div>
    </div>
  );
}

// Morse Code Tool
function MorseCodeTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [isPlaying, setIsPlaying] = useState(false);

  const handleInputChange = (value: string) => {
    setInput(value);
    if (mode === "encode") {
      setOutput(textToMorse(value));
    } else {
      setOutput(morseToText(value));
    }
  };

  const handleSwap = () => {
    setMode(mode === "encode" ? "decode" : "encode");
    setInput(output);
    setOutput(input);
  };

  const handlePlay = async () => {
    if (isPlaying || !output) return;
    setIsPlaying(true);
    try {
      await playMorse(output.replace(/\//g, " / "));
    } catch (err) {
      toast.error("Failed to play morse code");
    }
    setIsPlaying(false);
  };

  const handleStop = () => {
    stopMorse();
    setIsPlaying(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Radio className="h-5 w-5" />
          Morse Code
        </h3>
        <div className="flex items-center gap-2">
          <Badge variant={mode === "encode" ? "default" : "secondary"}>
            {mode === "encode" ? "Text → Morse" : "Morse → Text"}
          </Badge>
          <Button variant="outline" size="icon" onClick={handleSwap}>
            <ArrowRightLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{mode === "encode" ? "Text Input" : "Morse Input"}</Label>
          <Textarea
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={mode === "encode" ? "Enter text..." : "Enter morse (e.g., .... . .-.. .-.. ---)"}
            className="min-h-[150px] font-mono"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>{mode === "encode" ? "Morse Output" : "Text Output"}</Label>
            <div className="flex items-center gap-1">
              {mode === "encode" && output && (
                <>
                  {isPlaying ? (
                    <Button variant="outline" size="icon" onClick={handleStop}>
                      <Square className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button variant="outline" size="icon" onClick={handlePlay}>
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                </>
              )}
              <CopyButton text={output} />
            </div>
          </div>
          <Textarea
            value={output}
            readOnly
            placeholder="Output will appear here..."
            className="min-h-[150px] font-mono"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>• = dot (100ms)</span>
        <span>− = dash (300ms)</span>
        <span>/ = word separator</span>
      </div>
    </div>
  );
}

// Text ↔ Octal Tool
function TextOctalTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");

  const handleInputChange = (value: string) => {
    setInput(value);
    if (mode === "encode") {
      setOutput(textToOctal(value));
    } else if (isValidOctal(value)) {
      setOutput(octalToText(value));
    }
  };

  const handleSwap = () => {
    setMode(mode === "encode" ? "decode" : "encode");
    setInput(output);
    setOutput(input);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Octagon className="h-5 w-5" />
          Text ↔ Octal
        </h3>
        <div className="flex items-center gap-2">
          <Badge variant={mode === "encode" ? "default" : "secondary"}>
            {mode === "encode" ? "Text → Octal" : "Octal → Text"}
          </Badge>
          <Button variant="outline" size="icon" onClick={handleSwap}>
            <ArrowRightLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{mode === "encode" ? "Text Input" : "Octal Input"}</Label>
          <Textarea
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={mode === "encode" ? "Enter text..." : "Enter octal (e.g., 110 145 154 154 157)"}
            className="min-h-[150px] font-mono"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>{mode === "encode" ? "Octal Output" : "Text Output"}</Label>
            <CopyButton text={output} />
          </div>
          <Textarea
            value={output}
            readOnly
            placeholder="Output will appear here..."
            className="min-h-[150px] font-mono"
          />
        </div>
      </div>
    </div>
  );
}

// Number ↔ Octal Tool
function NumberOctalTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");

  const handleInputChange = (value: string) => {
    setInput(value);
    if (mode === "encode") {
      const num = parseInt(value, 10);
      if (!isNaN(num)) {
        setOutput(numberToOctal(num));
      } else {
        setOutput("");
      }
    } else {
      const result = octalToNumber(value);
      setOutput(typeof result === "number" ? String(result) : result);
    }
  };

  const handleSwap = () => {
    setMode(mode === "encode" ? "decode" : "encode");
    setInput(output);
    setOutput(input);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Octagon className="h-5 w-5" />
          Number ↔ Octal
        </h3>
        <div className="flex items-center gap-2">
          <Badge variant={mode === "encode" ? "default" : "secondary"}>
            {mode === "encode" ? "Number → Octal" : "Octal → Number"}
          </Badge>
          <Button variant="outline" size="icon" onClick={handleSwap}>
            <ArrowRightLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{mode === "encode" ? "Number Input" : "Octal Input"}</Label>
          <Input
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={mode === "encode" ? "Enter a number..." : "Enter octal..."}
            className="font-mono"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>{mode === "encode" ? "Octal Output" : "Number Output"}</Label>
            <CopyButton text={output} />
          </div>
          <Input
            value={output}
            readOnly
            placeholder="Output will appear here..."
            className="font-mono"
          />
        </div>
      </div>
    </div>
  );
}

// Caesar Cipher Tool
function CaesarCipherTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [shift, setShift] = useState(3);
  const [mode, setMode] = useState<"encode" | "decode">("encode");

  const handleInputChange = (value: string) => {
    setInput(value);
    setOutput(caesarCipher(value, shift, mode === "encode"));
  };

  const handleShiftChange = (newShift: number) => {
    setShift(newShift);
    setOutput(caesarCipher(input, newShift, mode === "encode"));
  };

  const handleModeChange = (newMode: "encode" | "decode") => {
    setMode(newMode);
    setOutput(caesarCipher(input, shift, newMode === "encode"));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Caesar Cipher
        </h3>
        <div className="flex items-center gap-2">
          <Badge variant={mode === "encode" ? "default" : "secondary"}>
            {mode === "encode" ? "Encode" : "Decode"}
          </Badge>
        </div>
      </div>

      {/* Shift Control */}
      <div className="flex items-center gap-4">
        <Label className="w-20">Shift:</Label>
        <Slider
          value={[shift]}
          onValueChange={(v) => handleShiftChange(v[0])}
          min={1}
          max={25}
          step={1}
          className="flex-1"
        />
        <Badge variant="outline" className="font-mono tabular-nums w-8 justify-center">
          {shift}
        </Badge>
      </div>

      {/* Mode Toggle */}
      <div className="flex items-center gap-4">
        <Label className="w-20">Mode:</Label>
        <div className="flex gap-2">
          <Button
            variant={mode === "encode" ? "default" : "outline"}
            size="sm"
            onClick={() => handleModeChange("encode")}
          >
            Encode
          </Button>
          <Button
            variant={mode === "decode" ? "default" : "outline"}
            size="sm"
            onClick={() => handleModeChange("decode")}
          >
            Decode
          </Button>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Input Text</Label>
          <Textarea
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Enter text to encrypt/decrypt..."
            className="min-h-[150px] font-mono"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Output</Label>
            <CopyButton text={output} />
          </div>
          <Textarea
            value={output}
            readOnly
            placeholder="Encrypted/decrypted text will appear here..."
            className="min-h-[150px] font-mono"
          />
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Caesar cipher shifts each letter by {shift} positions in the alphabet.
        {mode === "encode"
          ? " Use decode with the same shift to reverse."
          : " Use encode with the same shift to reverse."}
      </p>
    </div>
  );
}
