import React, { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MetadataForm } from "./MetadataForm";
import { TimelineBuilder } from "./TimelineBuilder";
import { SavedPromptsSidebar } from "./SavedPromptsSidebar";
import { ThemeToggle } from "./ThemeToggle";

export interface MetadataFields {
  prompt_name: string;
  base_style: string;
  aspect_ratio: string;
  room_description: string;
  camera_setup: string;
  key_elements: string[];
  element_categories: { [categoryName: string]: string[] };
  negative_prompts: string[];
}

export interface TimelineSequence {
  sequence: number;
  timestamp: string;
  action: string;
  audio: string;
  startTime: number;
  duration: number;
}

const defaultMetadata: MetadataFields = {
  prompt_name: "",
  base_style: "cinematic, photorealistic, 4K",
  aspect_ratio: "16:9",
  room_description: "",
  camera_setup: "",
  key_elements: [],
  element_categories: {},
  negative_prompts: [],
};

const defaultSequence: Omit<TimelineSequence, "sequence"> = {
  timestamp: "00:00-00:01",
  action: "",
  audio: "",
  startTime: 0,
  duration: 1,
};

export const YamlGenerator: React.FC = () => {
  const [metadata, setMetadata] = useState<MetadataFields>(defaultMetadata);
  const [sequences, setSequences] = useState<TimelineSequence[]>([
    { ...defaultSequence, sequence: 1, startTime: 0, duration: 1 },
  ]);
  const { toast } = useToast();

  const generateYaml = useCallback(() => {
    const yamlData = {
      metadata: {
        ...metadata,
        key_elements: metadata.key_elements.filter((el) => el.trim()),
        element_categories: Object.fromEntries(
          Object.entries(metadata.element_categories).map(([key, value]) => [
            key,
            value.filter((el) => el.trim()),
          ])
        ),
        negative_prompts: metadata.negative_prompts.filter((el) => el.trim()),
      },
      timeline: sequences.map((seq) => ({
        sequence: seq.sequence,
        timestamp: seq.timestamp,
        action: seq.action,
        audio: seq.audio,
      })),
    };

    // Convert to YAML format
    let yamlString = "metadata:\n";
    yamlString += `  prompt_name: "${yamlData.metadata.prompt_name}"\n`;
    yamlString += `  base_style: "${yamlData.metadata.base_style}"\n`;
    yamlString += `  aspect_ratio: "${yamlData.metadata.aspect_ratio}"\n`;
    yamlString += `  environment_description: "${yamlData.metadata.room_description}"\n`;
    yamlString += `  camera_setup: "${yamlData.metadata.camera_setup}"\n`;

    if (yamlData.metadata.key_elements.length > 0) {
      yamlString += "  key_elements:\n";
      yamlData.metadata.key_elements.forEach((element) => {
        yamlString += `    - "${element}"\n`;
      });
    }

    Object.entries(yamlData.metadata.element_categories).forEach(
      ([categoryName, elements]) => {
        if (elements.length > 0) {
          yamlString += `  ${categoryName}:\n`;
          elements.forEach((element) => {
            yamlString += `    - "${element}"\n`;
          });
        }
      }
    );

    if (yamlData.metadata.negative_prompts.length > 0) {
      yamlString += "  negative_prompts:\n";
      yamlData.metadata.negative_prompts.forEach((prompt) => {
        yamlString += `    - "${prompt}"\n`;
      });
    }

    yamlString += "\ntimeline:\n";
    yamlData.timeline.forEach((seq) => {
      yamlString += `  - sequence: ${seq.sequence}\n`;
      yamlString += `    timestamp: "${seq.timestamp}"\n`;
      yamlString += `    action: "${seq.action}"\n`;
      yamlString += `    audio: "${seq.audio}"\n\n`;
    });

    return yamlString;
  }, [metadata, sequences]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateYaml());
      toast({
        title: "Copied to clipboard",
        description: "YAML content has been copied successfully.",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const addSequence = () => {
    if (sequences.length >= 8) return;

    const lastSequence = sequences[sequences.length - 1];
    const newStartTime = lastSequence.startTime + lastSequence.duration;

    if (newStartTime >= 8) return; // Can't exceed 8 seconds

    const maxDuration = 8 - newStartTime;
    const newSequence: TimelineSequence = {
      ...defaultSequence,
      sequence: sequences.length + 1,
      startTime: newStartTime,
      duration: Math.min(1, maxDuration),
      timestamp: `${String(Math.floor(newStartTime / 60)).padStart(
        2,
        "0"
      )}:${String(newStartTime % 60).padStart(2, "0")}-${String(
        Math.floor((newStartTime + Math.min(1, maxDuration)) / 60)
      ).padStart(2, "0")}:${String(
        (newStartTime + Math.min(1, maxDuration)) % 60
      ).padStart(2, "0")}`,
    };

    setSequences([...sequences, newSequence]);
  };

  const removeSequence = (index: number) => {
    if (sequences.length <= 1) return;

    const newSequences = sequences.filter((_, i) => i !== index);
    // Renumber sequences and adjust timing
    const updatedSequences = newSequences.map((seq, i) => ({
      ...seq,
      sequence: i + 1,
    }));

    setSequences(updatedSequences);
  };

  const handleLoadPrompt = (
    loadedMetadata: MetadataFields,
    loadedSequences: TimelineSequence[]
  ) => {
    setMetadata(loadedMetadata);
    setSequences(loadedSequences);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Scene Composer
              </h1>
              <p className="text-muted-foreground mt-2">
                A Veo3 prompt composer with an intuitive interface
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <SavedPromptsSidebar
                metadata={metadata}
                sequences={sequences}
                onLoadPrompt={handleLoadPrompt}
              />
              <a
                href="https://github.com/smthomas/scene-composer"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-md hover:bg-muted transition-colors duration-200"
                aria-label="View on GitHub"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
              <a
                href="https://x.com/smthomas3"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-md hover:bg-muted transition-colors duration-200"
                aria-label="Follow on X"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Form Section */}
          <div className="space-y-6">
            <Card className="p-6 shadow-card">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                Metadata Configuration
              </h2>
              <MetadataForm metadata={metadata} onChange={setMetadata} />
            </Card>

            <Card className="p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Timeline Builder</h2>
                <div className="flex gap-2">
                  <Button
                    onClick={addSequence}
                    disabled={sequences.length >= 8}
                    size="sm"
                    className="bg-gradient-primary hover:opacity-90 transition-opacity"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Sequence
                  </Button>
                </div>
              </div>
              <TimelineBuilder
                sequences={sequences}
                onChange={setSequences}
                onRemove={removeSequence}
              />
            </Card>
          </div>

          {/* YAML Preview Section */}
          <div className="space-y-6">
            <Card className="p-6 shadow-card sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  Veo3 Prompt (YAML format)
                </h2>
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  size="sm"
                  className="hover:shadow-elegant transition-all duration-300"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy YAML
                </Button>
              </div>
              <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-auto max-h-[calc(100vh-200px)]">
                <pre className="whitespace-pre-wrap text-foreground">
                  {generateYaml()}
                </pre>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
