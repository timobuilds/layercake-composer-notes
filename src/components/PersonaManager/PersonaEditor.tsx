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
    setFormData({
      ...formData,
      color
    });
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
  return <div className="flex-1 space-y-4 overflow-y-auto p-1">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input id="name" placeholder="Persona name..." value={formData.name} onChange={e => setFormData({
        ...formData,
        name: e.target.value
      })} className={errors.name ? 'border-destructive' : ''} />
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
      </div>

      {/* Color */}
      <div className="space-y-2">
        
        <div className="flex gap-2">
          {availableColors.slice(0, 6).map(colorOption => <button key={colorOption.value} onClick={() => handleColorSelect(colorOption.value)} className={`w-8 h-8 rounded border-2 ${formData.color === colorOption.value ? 'border-primary' : 'border-border'}`} style={{
          backgroundColor: colorOption.value
        }} />)}
        </div>
      </div>

      {/* Instructions */}
      <div className="space-y-2 flex-1">
        <Label htmlFor="instructions">Instructions *</Label>
        <Textarea id="instructions" placeholder="Enter persona instructions..." value={formData.instructions} onChange={e => setFormData({
        ...formData,
        instructions: e.target.value
      })} className={`min-h-48 resize-none ${errors.instructions ? 'border-destructive' : ''}`} />
        {errors.instructions && <p className="text-sm text-destructive">{errors.instructions}</p>}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button onClick={handleSave} className="flex-1">
          {isEditing ? 'Update' : 'Save'}
        </Button>
      </div>
    </div>;
};