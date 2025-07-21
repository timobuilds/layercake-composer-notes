import { Persona, PersonaTemplate, PersonaCategory } from '@/types/persona';

const PERSONAS_KEY = 'workflowy_personas';
const DRAFTS_KEY = 'workflowy_persona_drafts';

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const defaultPersonaTemplates: PersonaTemplate[] = [
  {
    id: 'screenwriter',
    name: 'Screenwriter',
    color: 'hsl(var(--persona-blue))',
    category: 'Creative',
    description: 'Professional script writing and story development',
    instructions: 'You are a professional screenwriter with extensive experience in film and television. Your role is to provide expert guidance on script development, character creation, dialogue writing, and story structure. Focus on industry best practices and creative storytelling techniques.'
  },
  {
    id: 'editor',
    name: 'Editor',
    color: 'hsl(var(--persona-green))',
    category: 'Creative',
    description: 'Content editing and refinement specialist',
    instructions: 'You are a skilled film editor and content specialist. Help with editing scripts, refining dialogue, improving pacing, and ensuring narrative coherence. Focus on clarity, flow, and emotional impact.'
  },
  {
    id: 'director',
    name: 'Director',
    color: 'hsl(var(--persona-yellow))',
    category: 'Creative',
    description: 'Creative vision and project leadership',
    instructions: 'You are an experienced film director with a strong creative vision. Provide guidance on visual storytelling, character direction, scene composition, and overall creative decisions. Focus on bringing stories to life through compelling visuals and performances.'
  },
  {
    id: 'producer',
    name: 'Producer',
    color: 'hsl(var(--persona-brown))',
    category: 'Business',
    description: 'Project management and business strategy',
    instructions: 'You are a seasoned film producer focused on project management, budget considerations, scheduling, and business strategy. Help with practical decisions, resource allocation, and ensuring projects stay on track and within budget.'
  },
  {
    id: 'actor',
    name: 'Actor',
    color: 'hsl(var(--persona-purple))',
    category: 'Creative',
    description: 'Character development and performance',
    instructions: 'You are a professional actor with deep understanding of character development, motivation, and performance. Provide insights on character arcs, emotional depth, dialogue delivery, and bringing characters to life authentically.'
  },
  {
    id: 'technical-writer',
    name: 'Technical Writer',
    color: 'hsl(220, 70%, 50%)',
    category: 'Technical',
    description: 'Clear technical documentation and communication',
    instructions: 'You are a technical writer specializing in clear, concise documentation. Help create user guides, technical specifications, API documentation, and ensure complex information is accessible to the target audience.'
  },
  {
    id: 'marketing-specialist',
    name: 'Marketing Specialist',
    color: 'hsl(340, 70%, 50%)',
    category: 'Marketing',
    description: 'Brand messaging and audience engagement',
    instructions: 'You are a marketing specialist focused on brand messaging, audience engagement, and promotional strategies. Help create compelling marketing copy, social media content, and develop strategies to reach target audiences effectively.'
  },
  {
    id: 'ux-designer',
    name: 'UX Designer',
    color: 'hsl(280, 70%, 50%)',
    category: 'Design',
    description: 'User experience and interface design',
    instructions: 'You are a UX designer focused on creating intuitive, user-friendly experiences. Provide guidance on user flows, interface design, accessibility, and ensuring products meet user needs effectively.'
  }
];

export const personaStorage = {
  getPersonas(): Persona[] {
    try {
      const stored = localStorage.getItem(PERSONAS_KEY);
      if (!stored) {
        // Initialize with default personas from templates
        const defaultPersonas: Persona[] = defaultPersonaTemplates.map(template => ({
          id: template.id,
          name: template.name,
          color: template.color,
          instructions: template.instructions,
          category: template.category,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: []
        }));
        this.savePersonas(defaultPersonas);
        return defaultPersonas;
      }
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error loading personas:', error);
      return [];
    }
  },

  savePersonas(personas: Persona[]): void {
    try {
      localStorage.setItem(PERSONAS_KEY, JSON.stringify(personas));
    } catch (error) {
      console.error('Error saving personas:', error);
    }
  },

  addPersona(persona: Omit<Persona, 'id' | 'createdAt' | 'updatedAt'>): Persona {
    const newPersona: Persona = {
      ...persona,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const personas = this.getPersonas();
    personas.push(newPersona);
    this.savePersonas(personas);
    return newPersona;
  },

  updatePersona(id: string, updates: Partial<Persona>): Persona | null {
    const personas = this.getPersonas();
    const index = personas.findIndex(p => p.id === id);
    
    if (index === -1) return null;
    
    personas[index] = {
      ...personas[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    this.savePersonas(personas);
    return personas[index];
  },

  deletePersona(id: string): boolean {
    const personas = this.getPersonas();
    const filtered = personas.filter(p => p.id !== id);
    
    if (filtered.length === personas.length) return false;
    
    this.savePersonas(filtered);
    return true;
  },

  deletePersonas(ids: string[]): number {
    const personas = this.getPersonas();
    const filtered = personas.filter(p => !ids.includes(p.id));
    const deletedCount = personas.length - filtered.length;
    
    this.savePersonas(filtered);
    return deletedCount;
  },

  duplicatePersona(id: string): Persona | null {
    const personas = this.getPersonas();
    const original = personas.find(p => p.id === id);
    
    if (!original) return null;
    
    return this.addPersona({
      ...original,
      name: `${original.name} (Copy)`,
    });
  },

  exportPersonas(): string {
    const personas = this.getPersonas();
    return JSON.stringify(personas, null, 2);
  },

  importPersonas(jsonString: string): { success: boolean; imported: number; error?: string } {
    try {
      const importedPersonas = JSON.parse(jsonString) as Persona[];
      
      if (!Array.isArray(importedPersonas)) {
        return { success: false, imported: 0, error: 'Invalid format: expected array' };
      }
      
      const existingPersonas = this.getPersonas();
      const newPersonas = importedPersonas.filter(p => 
        !existingPersonas.some(existing => existing.id === p.id)
      );
      
      this.savePersonas([...existingPersonas, ...newPersonas]);
      return { success: true, imported: newPersonas.length };
    } catch (error) {
      return { success: false, imported: 0, error: 'Invalid JSON format' };
    }
  },

  // Draft management for auto-save
  saveDraft(formData: any): void {
    try {
      localStorage.setItem(DRAFTS_KEY, JSON.stringify({
        ...formData,
        savedAt: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  },

  getDraft(): any {
    try {
      const draft = localStorage.getItem(DRAFTS_KEY);
      return draft ? JSON.parse(draft) : null;
    } catch (error) {
      console.error('Error loading draft:', error);
      return null;
    }
  },

  clearDraft(): void {
    localStorage.removeItem(DRAFTS_KEY);
  }
};

export const availableColors = [
  { name: 'Blue', value: 'hsl(var(--persona-blue))' },
  { name: 'Green', value: 'hsl(var(--persona-green))' },
  { name: 'Yellow', value: 'hsl(var(--persona-yellow))' },
  { name: 'Brown', value: 'hsl(var(--persona-brown))' },
  { name: 'Purple', value: 'hsl(var(--persona-purple))' },
  { name: 'Red', value: 'hsl(0, 70%, 50%)' },
  { name: 'Orange', value: 'hsl(30, 70%, 50%)' },
  { name: 'Pink', value: 'hsl(340, 70%, 50%)' },
  { name: 'Teal', value: 'hsl(180, 70%, 40%)' },
  { name: 'Indigo', value: 'hsl(250, 70%, 50%)' }
];

export const categories: PersonaCategory[] = ['Creative', 'Technical', 'Business', 'Marketing', 'Design', 'Other'];