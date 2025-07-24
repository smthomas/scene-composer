import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2, Clock, Volume2, Camera } from 'lucide-react';
import { TimelineSequence } from './YamlGenerator';

interface TimelineBuilderProps {
  sequences: TimelineSequence[];
  onChange: (sequences: TimelineSequence[]) => void;
  onRemove: (index: number) => void;
}

export const TimelineBuilder: React.FC<TimelineBuilderProps> = ({
  sequences,
  onChange,
  onRemove
}) => {
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const updateSequence = (index: number, updates: Partial<TimelineSequence>) => {
    const newSequences = [...sequences];
    newSequences[index] = { ...newSequences[index], ...updates };
    
    // Update timestamp when duration or startTime changes
    if (updates.duration !== undefined || updates.startTime !== undefined) {
      const seq = newSequences[index];
      const endTime = seq.startTime + seq.duration;
      seq.timestamp = `${formatTime(seq.startTime)}-${formatTime(endTime)}`;
    }
    
    onChange(newSequences);
  };

  const updateDuration = (index: number, newDuration: number) => {
    const newSequences = [...sequences];
    const sequence = newSequences[index];
    
    // Ensure minimum 1 second duration
    const minDuration = 1;
    
    // Calculate total time used by all sequences after this one
    const subsequentDuration = sequences.slice(index + 1).reduce((total, seq) => total + seq.duration, 0);
    
    // Maximum duration is 8 seconds minus start time minus time needed for subsequent sequences
    const maxDuration = 8 - sequence.startTime - subsequentDuration;
    
    const clampedDuration = Math.max(minDuration, Math.min(newDuration, maxDuration));
    
    // Update current sequence
    sequence.duration = clampedDuration;
    sequence.timestamp = `${formatTime(sequence.startTime)}-${formatTime(sequence.startTime + clampedDuration)}`;
    
    // Update subsequent sequences (waterfall effect)
    for (let i = index + 1; i < newSequences.length; i++) {
      const prevSequence = newSequences[i - 1];
      newSequences[i].startTime = prevSequence.startTime + prevSequence.duration;
      
      // Ensure the sequence doesn't exceed 8 seconds
      if (newSequences[i].startTime >= 8) {
        // Remove sequences that would start at or after 8 seconds
        newSequences.splice(i);
        break;
      }
      
      // Adjust duration if it would exceed 8 seconds
      const maxRemainingTime = 8 - newSequences[i].startTime;
      if (newSequences[i].duration > maxRemainingTime) {
        newSequences[i].duration = maxRemainingTime;
      }
      
      // Update timestamp
      const seq = newSequences[i];
      seq.timestamp = `${formatTime(seq.startTime)}-${formatTime(seq.startTime + seq.duration)}`;
    }
    
    onChange(newSequences);
  };

  const getMaxDurationForSequence = (index: number): number => {
    const sequence = sequences[index];
    const subsequentDuration = sequences.slice(index + 1).reduce((total, seq) => total + seq.duration, 0);
    return 8 - sequence.startTime - subsequentDuration;
  };

  const getTotalDuration = () => {
    if (sequences.length === 0) return 0;
    const lastSequence = sequences[sequences.length - 1];
    return lastSequence.startTime + lastSequence.duration;
  };

  return (
    <div className="space-y-4">
      {/* Timeline Visual */}
      <div className="bg-timeline-bg border border-timeline-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <Label className="text-sm font-medium">Timeline Overview (8 seconds total)</Label>
          <span className="text-sm text-muted-foreground">
            Used: {getTotalDuration()}s / 8s
          </span>
        </div>
        <div className="relative h-12 bg-muted rounded border">
          {/* Time markers */}
          <div className="absolute inset-0 flex">
            {Array.from({ length: 9 }, (_, i) => (
              <div
                key={i}
                className="border-l border-border flex-1 relative"
                style={{ width: '12.5%' }}
              >
                <span className="absolute -bottom-6 left-0 text-xs text-muted-foreground">
                  {i}s
                </span>
              </div>
            ))}
          </div>
          
          {/* Sequence blocks */}
          {sequences.map((seq, index) => (
            <div
              key={seq.sequence}
              className="absolute top-1 bottom-1 bg-sequence-bg border border-sequence-border rounded flex items-center justify-center text-white text-xs font-medium cursor-pointer hover:bg-sequence-bg/80 transition-colors"
              style={{
                left: `${(seq.startTime / 8) * 100}%`,
                width: `${(seq.duration / 8) * 100}%`
              }}
              title={`Sequence ${seq.sequence}: ${seq.timestamp}`}
            >
              #{seq.sequence}
            </div>
          ))}
        </div>
      </div>

      {/* Sequence Cards */}
      <div className="space-y-3">
        {sequences.map((sequence, index) => (
          <Card key={sequence.sequence} className="p-4 border-l-4 border-l-primary">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                  {sequence.sequence}
                </div>
                <div>
                  <h3 className="font-medium">Sequence {sequence.sequence}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {sequence.timestamp}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Duration:</Label>
                  <Input
                    type="number"
                    min="1"
                    max={getMaxDurationForSequence(index)}
                    value={sequence.duration}
                    onChange={(e) => updateDuration(index, parseInt(e.target.value) || 1)}
                    className="w-16 h-8 text-xs"
                  />
                  <span className="text-xs text-muted-foreground">sec</span>
                </div>
                <Button
                  onClick={() => onRemove(index)}
                  size="sm"
                  variant="outline"
                  disabled={sequences.length <= 1}
                  className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-1">
                  <Camera className="w-3 h-3" />
                  Action Description
                </Label>
                <Textarea
                  value={sequence.action}
                  onChange={(e) => updateSequence(index, { action: e.target.value })}
                  placeholder="Describe what happens in this sequence..."
                  rows={3}
                  className="text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-1">
                  <Volume2 className="w-3 h-3" />
                  Audio Description
                </Label>
                <Textarea
                  value={sequence.audio}
                  onChange={(e) => updateSequence(index, { audio: e.target.value })}
                  placeholder="Describe the audio for this sequence..."
                  rows={3}
                  className="text-sm"
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {sequences.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No sequences added yet. Click "Add Sequence" to get started.</p>
        </div>
      )}
    </div>
  );
};