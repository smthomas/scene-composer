import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';
import { MetadataFields } from './YamlGenerator';

interface MetadataFormProps {
  metadata: MetadataFields;
  onChange: (metadata: MetadataFields) => void;
}

export const MetadataForm: React.FC<MetadataFormProps> = ({ metadata, onChange }) => {
  const updateField = <K extends keyof MetadataFields>(field: K, value: MetadataFields[K]) => {
    onChange({ ...metadata, [field]: value });
  };

  const addToArray = (field: 'key_elements' | 'negative_prompts') => {
    updateField(field, [...metadata[field], '']);
  };

  const updateArrayItem = (field: 'key_elements' | 'negative_prompts', index: number, value: string) => {
    const newArray = [...metadata[field]];
    newArray[index] = value;
    updateField(field, newArray);
  };

  const removeFromArray = (field: 'key_elements' | 'negative_prompts', index: number) => {
    const newArray = metadata[field].filter((_, i) => i !== index);
    updateField(field, newArray);
  };

  const addToCategory = (categoryName: string) => {
    const newCategories = { ...metadata.element_categories };
    if (!newCategories[categoryName]) {
      newCategories[categoryName] = [];
    }
    newCategories[categoryName] = [...newCategories[categoryName], ''];
    updateField('element_categories', newCategories);
  };

  const updateCategoryItem = (categoryName: string, index: number, value: string) => {
    const newCategories = { ...metadata.element_categories };
    newCategories[categoryName][index] = value;
    updateField('element_categories', newCategories);
  };

  const removeCategoryItem = (categoryName: string, index: number) => {
    const newCategories = { ...metadata.element_categories };
    newCategories[categoryName] = newCategories[categoryName].filter((_, i) => i !== index);
    updateField('element_categories', newCategories);
  };

  const sanitizeCategoryName = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .trim();
  };

  const addCategory = () => {
    const categoryName = prompt('Enter category name:');
    if (categoryName) {
      const sanitizedName = sanitizeCategoryName(categoryName);
      if (sanitizedName && !metadata.element_categories[sanitizedName]) {
        const newCategories = { ...metadata.element_categories };
        newCategories[sanitizedName] = [];
        updateField('element_categories', newCategories);
      }
    }
  };

  const removeCategory = (categoryName: string) => {
    const newCategories = { ...metadata.element_categories };
    delete newCategories[categoryName];
    updateField('element_categories', newCategories);
  };

  const ArrayField: React.FC<{
    label: string;
    field: 'key_elements' | 'negative_prompts';
    placeholder: string;
  }> = ({ label, field, placeholder }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <Button
          type="button"
          onClick={() => addToArray(field)}
          size="sm"
          variant="outline"
          className="h-8 w-8 p-0"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <div className="space-y-2">
        {metadata[field].map((item, index) => (
          <div key={`${field}-${index}`} className="flex gap-2">
            <Input
              value={item}
              onChange={(e) => updateArrayItem(field, index, e.target.value)}
              placeholder={placeholder}
              className="flex-1"
            />
            <Button
              type="button"
              onClick={() => removeFromArray(field, index)}
              size="sm"
              variant="outline"
              className="h-10 w-10 p-0 hover:bg-destructive hover:text-destructive-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
        {metadata[field].length === 0 && (
          <p className="text-sm text-muted-foreground italic">
            No {label.toLowerCase()} added yet. Click + to add one.
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="prompt_name">Prompt Name</Label>
          <Input
            id="prompt_name"
            value={metadata.prompt_name}
            onChange={(e) => updateField('prompt_name', e.target.value)}
            placeholder="Enter prompt name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="aspect_ratio">Aspect Ratio</Label>
          <Select
            value={metadata.aspect_ratio}
            onValueChange={(value) => updateField('aspect_ratio', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select aspect ratio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="16:9">16:9 (Recommended)</SelectItem>
              <SelectItem value="9:16">9:16 (Vertical)</SelectItem>
              <SelectItem value="1:1">1:1 (Square)</SelectItem>
              <SelectItem value="4:3">4:3 (Traditional)</SelectItem>
              <SelectItem value="21:9">21:9 (Ultrawide)</SelectItem>
              <SelectItem value="3:2">3:2 (Classic)</SelectItem>
              <SelectItem value="5:4">5:4 (Portrait)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="base_style">Base Style</Label>
        <Input
          id="base_style"
          value={metadata.base_style}
          onChange={(e) => updateField('base_style', e.target.value)}
          placeholder="cinematic, photorealistic, 4K"
        />
        <div className="flex flex-wrap gap-1 text-xs">
          <span className="text-muted-foreground mr-2">Quick options:</span>
          {[
            { name: "Cinematic", style: "cinematic, photorealistic, 4K, film grain, dramatic lighting" },
            { name: "Documentary", style: "documentary style, natural lighting, handheld camera feel, realistic" },
            { name: "Commercial", style: "commercial photography, clean, bright, professional lighting, high contrast" },
            { name: "Artistic", style: "artistic, creative composition, unique angles, stylized, moody lighting" },
            { name: "Corporate", style: "corporate, professional, clean backgrounds, even lighting, business style" },
            { name: "Vintage", style: "vintage, retro, film aesthetic, warm tones, nostalgic feel" },
            { name: "Modern", style: "modern, sleek, minimalist, contemporary design, crisp details" },
            { name: "Dramatic", style: "dramatic lighting, high contrast, intense shadows, cinematic mood" },
            { name: "Natural", style: "natural lighting, soft shadows, realistic colors, authentic feel" },
            { name: "High-End", style: "luxury, premium quality, perfect lighting, ultra-detailed, pristine" }
          ].map((option, index) => (
            <button
              key={index}
              type="button"
              onClick={() => updateField('base_style', option.style)}
              className="text-primary hover:text-primary/80 hover:underline transition-colors cursor-pointer"
            >
              {option.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="room_description">Environment Description</Label>
        <p className="text-xs text-muted-foreground">
          Describe the environment, scenery, or room where the video will take place.
        </p>
        <Textarea
          id="room_description"
          value={metadata.room_description}
          onChange={(e) => updateField('room_description', e.target.value)}
          placeholder="Describe the environment, scenery, or location setting..."
          rows={3}
        />
        <div className="flex flex-wrap gap-1 text-xs">
          <span className="text-muted-foreground mr-2">Quick options:</span>
          {[
            { name: "Modern Office", description: "A sleek modern office space with glass windows, minimalist furniture, and clean lines. Natural light streaming through large windows." },
            { name: "Cozy Living Room", description: "A warm, inviting living room with comfortable furniture, soft lighting, and personal touches like books and plants." },
            { name: "Industrial Kitchen", description: "A professional-grade kitchen with stainless steel appliances, marble countertops, and excellent task lighting." },
            { name: "Outdoor Garden", description: "A lush garden setting with vibrant flowers, green foliage, and natural sunlight filtering through trees." },
            { name: "Urban Street", description: "A bustling city street with modern architecture, pedestrians, and urban elements like streetlights and storefronts." },
            { name: "Beach Setting", description: "A pristine beach environment with golden sand, clear blue water, and natural coastal lighting." },
            { name: "Forest Path", description: "A serene forest trail surrounded by tall trees, dappled sunlight, and natural woodland atmosphere." },
            { name: "Corporate Boardroom", description: "A professional boardroom with a large conference table, executive chairs, and sophisticated lighting." },
            { name: "Art Studio", description: "A creative artist's studio with easels, canvases, art supplies, and natural light from skylights." },
            { name: "Warehouse Space", description: "A spacious industrial warehouse with high ceilings, concrete floors, and dramatic overhead lighting." }
          ].map((option, index) => (
            <button
              key={index}
              type="button"
              onClick={() => updateField('room_description', option.description)}
              className="text-primary hover:text-primary/80 hover:underline transition-colors cursor-pointer"
            >
              {option.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="camera_setup">Camera Setup</Label>
        <Textarea
          id="camera_setup"
          value={metadata.camera_setup}
          onChange={(e) => updateField('camera_setup', e.target.value)}
          placeholder="Describe the camera setup and movement..."
          rows={3}
        />
        <div className="flex flex-wrap gap-1 text-xs">
          <span className="text-muted-foreground mr-2">Quick options:</span>
          {[
            { name: "Static Wide", setup: "A single, fixed, wide-angle shot. The camera does not move for the entire duration." },
            { name: "Dolly In", setup: "Camera starts wide and slowly dollies in towards the subject for dramatic effect." },
            { name: "Tracking Shot", setup: "Camera smoothly tracks alongside the subject as they move through the scene." },
            { name: "Aerial View", setup: "Top-down aerial shot providing a bird's-eye perspective of the entire scene." },
            { name: "POV Shot", setup: "First-person perspective as if seeing through the character's eyes." },
            { name: "Close-up Focus", setup: "Tight close-up shot focusing on specific details with shallow depth of field." },
            { name: "Pan L-R", setup: "Camera pans horizontally from left to right across the scene." },
            { name: "Low Angle", setup: "Low-angle shot looking up at the subject to create an imposing, heroic feel." },
            { name: "Handheld", setup: "Handheld, slightly shaky camera movement for a raw, documentary-style feel." },
            { name: "Steadicam Circle", setup: "Smooth Steadicam movement circling around the central subject." }
          ].map((option, index) => (
            <button
              key={index}
              type="button"
              onClick={() => updateField('camera_setup', option.setup)}
              className="text-primary hover:text-primary/80 hover:underline transition-colors cursor-pointer"
            >
              {option.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">Key Elements</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Describe the key elements that should be included in this video (e.g., "person holding coffee cup", "laptop on desk", "window with natural light").
            </p>
          </div>
          <Button
            type="button"
            onClick={() => addToArray('key_elements')}
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-2">
          {metadata.key_elements.map((item, index) => (
            <div key={`key-element-${index}`} className="flex gap-2">
              <Input
                value={item}
                onChange={(e) => updateArrayItem('key_elements', index, e.target.value)}
                placeholder="Enter key element"
                className="flex-1"
              />
              <Button
                type="button"
                onClick={() => removeFromArray('key_elements', index)}
                size="sm"
                variant="outline"
                className="h-10 w-10 p-0 hover:bg-destructive hover:text-destructive-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {metadata.key_elements.length === 0 && (
            <p className="text-sm text-muted-foreground italic">
              No key elements added yet. Click + to add one.
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">Element Categories</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Use this to configure categories of elements that you can refer to in the timeline prompts below. 
              Each category can contain multiple related elements for easier organization and reference.
            </p>
          </div>
          <Button
            type="button"
            onClick={addCategory}
            size="sm"
            variant="outline"
            className="h-8"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Category
          </Button>
        </div>
        
        <div className="space-y-6">
          {Object.entries(metadata.element_categories).map(([categoryName, elements]) => (
            <div key={categoryName} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium capitalize">{categoryName.replace('_', ' ')}</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={() => addToCategory(categoryName)}
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    onClick={() => removeCategory(categoryName)}
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                {elements.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={item}
                      onChange={(e) => updateCategoryItem(categoryName, index, e.target.value)}
                      placeholder={`Enter ${categoryName.replace('_', ' ')} element`}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={() => removeCategoryItem(categoryName, index)}
                      size="sm"
                      variant="outline"
                      className="h-10 w-10 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {elements.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">
                    No {categoryName.replace('_', ' ')} added yet. Click + to add one.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">Negative Prompts</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Specify what should be excluded from the video (e.g., "no people", "no text overlays", "no distracting music").
            </p>
          </div>
          <Button
            type="button"
            onClick={() => addToArray('negative_prompts')}
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-2">
          {metadata.negative_prompts.map((item, index) => (
            <div key={`negative-prompt-${index}`} className="flex gap-2">
              <Input
                value={item}
                onChange={(e) => updateArrayItem('negative_prompts', index, e.target.value)}
                placeholder="Enter negative prompt"
                className="flex-1"
              />
              <Button
                type="button"
                onClick={() => removeFromArray('negative_prompts', index)}
                size="sm"
                variant="outline"
                className="h-10 w-10 p-0 hover:bg-destructive hover:text-destructive-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {metadata.negative_prompts.length === 0 && (
            <p className="text-sm text-muted-foreground italic">
              No negative prompts added yet. Click + to add one.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
