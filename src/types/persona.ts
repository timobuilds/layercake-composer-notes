export interface Persona {
  id: string;
  name: string;
  color: string;
  instructions: string;
  category: PersonaCategory;
  createdAt: string;
  updatedAt: string;
  isTemplate?: boolean;
  tags?: string[];
}

export type PersonaCategory = 'Creative' | 'Technical' | 'Business' | 'Marketing' | 'Design' | 'Other';

export interface PersonaTemplate {
  id: string;
  name: string;
  color: string;
  instructions: string;
  category: PersonaCategory;
  description: string;
}

export interface PersonaFormData {
  name: string;
  color: string;
  instructions: string;
  category: PersonaCategory;
  tags: string[];
}

export interface PersonaManagerState {
  personas: Persona[];
  selectedPersona: Persona | null;
  searchQuery: string;
  selectedCategory: PersonaCategory | 'All';
  isEditing: boolean;
  isDirty: boolean;
  showTemplates: boolean;
  selectedPersonas: string[];
}