import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Save, X, Plus } from 'lucide-react';
import { PersonaFormData, PersonaCategory } from '@/types/persona';
import { availableColors, categories } from '@/lib/personaStorage';

interface PersonaEditorProps {
  formData: PersonaFormData;
  setFormData: (data: PersonaFormData) => void;
  onSave: () => void;
  onCancel: () => void;
  isEditing: boolean;
  onDirtyChange: (isDirty: boolean) => void;
}

export const PersonaEditor = ({
  formData,
  setFormData,
  onSave,
  onCancel,
  isEditing,
  onDirtyChange
}: PersonaEditorProps) => {
  const [customColor, setCustomColor] = useState('');
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    onDirtyChange(!!formData.name || !!formData.instructions);
  }, [formData, onDirtyChange]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Name must be 50 characters or less';
    }
    
    if (!formData.instructions.trim()) {
      newErrors.instructions = 'Instructions are required';
    } else if (formData.instructions.length < 20) {
      newErrors.instructions = 'Instructions must be at least 20 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave();
    }
  };

  const handleColorSelect = (color: string) => {
    setFormData({ ...formData, color });
  };

  const handleCustomColorSubmit = () => {
    if (customColor.trim()) {
      handleColorSelect(customColor);
      setCustomColor('');
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const instructionCount = formData.instructions.length;
  const isInstructionTooShort = instructionCount > 0 && instructionCount < 20;
  const isInstructionTooLong = instructionCount > 2000;

  return (
    <div className="flex-1 space-y-6 overflow-y-auto p-1">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium">
          Persona Name *
        </Label>
        <Input
          id="name"
          placeholder="e.g. Screenwriter, Technical Writer, Marketing Specialist..."
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={errors.name ? 'border-destructive' : ''}
          maxLength={50}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {formData.name.length}/50 characters
        </p>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category" className="text-sm font-medium">
          Category
        </Label>
        <select
          id="category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value as PersonaCategory })}
          className="w-full px-3 py-2 border rounded-md bg-background"
        >
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Color */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Color</Label>
        
        {/* Preset Colors */}
        <div className="grid grid-cols-5 gap-2">
          {availableColors.map((colorOption) => (
            <button
              key={colorOption.value}
              onClick={() => handleColorSelect(colorOption.value)}
              className={`w-12 h-12 rounded border-2 transition-all hover:scale-105 ${
                formData.color === colorOption.value 
                  ? 'border-primary ring-2 ring-primary/20' 
                  : 'border-border hover:border-muted-foreground'
              }`}
              style={{ backgroundColor: colorOption.value }}
              title={colorOption.name}
            />
          ))}
        </div>
        
        {/* Custom Color */}
        <div className="flex gap-2">
          <Input
            placeholder="Custom color (hex, hsl, rgb...)"
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            className="flex-1"
          />
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleCustomColorSubmit}
            disabled={!customColor.trim()}
          >
            Add
          </Button>
        </div>
        
        {/* Current Color Preview */}
        <div className="flex items-center gap-2">
          <div 
            className="w-6 h-6 rounded border"
            style={{ backgroundColor: formData.color }}
          />
          <span className="text-sm text-muted-foreground">
            Current: {formData.color}
          </span>
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Tags (Optional)</Label>
        
        {/* Add Tag */}
        <div className="flex gap-2">
          <Input
            placeholder="Add a tag..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            className="flex-1"
          />
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleAddTag}
            disabled={!newTag.trim() || formData.tags.includes(newTag.trim())}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Tag List */}
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="space-y-2 flex-1">
        <Label htmlFor="instructions" className="text-sm font-medium">
          Instruction Prompt *
        </Label>
        <Textarea
          id="instructions"
          placeholder="Enter detailed persona instructions and behavior guidelines..."
          value={formData.instructions}
          onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
          className={`min-h-64 resize-none ${
            errors.instructions ? 'border-destructive' : 
            isInstructionTooShort ? 'border-yellow-500' :
            isInstructionTooLong ? 'border-destructive' : ''
          }`}
          maxLength={2000}
        />
        {errors.instructions && (
          <p className="text-sm text-destructive">{errors.instructions}</p>
        )}
        <div className="flex justify-between text-xs">
          <span className={`${
            isInstructionTooShort ? 'text-yellow-600' :
            isInstructionTooLong ? 'text-destructive' :
            'text-muted-foreground'
          }`}>
            {isInstructionTooShort && instructionCount > 0 && 'Too short - '}
            {isInstructionTooLong && 'Too long - '}
            {instructionCount}/2000 characters
          </span>
          {instructionCount > 0 && instructionCount < 20 && (
            <span className="text-yellow-600">
              Minimum 20 characters required
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t sticky bottom-0 bg-background">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={!!Object.keys(errors).length}>
            <Save className="h-4 w-4 mr-2" />
            {isEditing ? 'Update Persona' : 'Save Persona'}
          </Button>
        </div>
      </div>
    </div>
  );
};