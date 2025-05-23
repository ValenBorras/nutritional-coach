'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Badge } from '@/app/components/ui/badge';
import { Bot, Save, Plus, X, Sparkles } from 'lucide-react';

interface AIRules {
  id?: string;
  diet_philosophy: string;
  general_guidelines: string[];
  response_style: string;
  special_instructions: string[];
}

export default function AIRulesConfig() {
  const [rules, setRules] = useState<AIRules>({
    diet_philosophy: '',
    general_guidelines: [],
    response_style: '',
    special_instructions: []
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Estados para agregar nuevos elementos
  const [newGuideline, setNewGuideline] = useState('');
  const [newInstruction, setNewInstruction] = useState('');

  useEffect(() => {
    fetchAIRules();
  }, []);

  const fetchAIRules = async () => {
    try {
      const response = await fetch('/api/nutritionist/ai-rules');
      if (response.ok) {
        const data = await response.json();
        if (data.rules) {
          setRules(data.rules);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al cargar configuración');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!rules.diet_philosophy.trim() || !rules.response_style) {
      setError('La filosofía dietética y estilo de respuesta son obligatorios');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/nutritionist/ai-rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rules),
      });

      if (response.ok) {
        const data = await response.json();
        setRules(data.rules);
        setSuccess('¡Configuración guardada exitosamente!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al guardar configuración');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setIsSaving(false);
    }
  };

  const addGuideline = () => {
    if (newGuideline.trim()) {
      setRules(prev => ({
        ...prev,
        general_guidelines: [...prev.general_guidelines, newGuideline.trim()]
      }));
      setNewGuideline('');
    }
  };

  const removeGuideline = (index: number) => {
    setRules(prev => ({
      ...prev,
      general_guidelines: prev.general_guidelines.filter((_, i) => i !== index)
    }));
  };

  const addInstruction = () => {
    if (newInstruction.trim()) {
      setRules(prev => ({
        ...prev,
        special_instructions: [...prev.special_instructions, newInstruction.trim()]
      }));
      setNewInstruction('');
    }
  };

  const removeInstruction = (index: number) => {
    setRules(prev => ({
      ...prev,
      special_instructions: prev.special_instructions.filter((_, i) => i !== index)
    }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral mx-auto"></div>
          <p className="mt-2 text-charcoal/70">Cargando configuración...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-warm-sand to-warm-sand/80 border-soft-rose/20 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-charcoal flex items-center gap-2">
          <Bot className="w-6 h-6 text-coral" />
          Configuración del Asistente de IA
        </CardTitle>
        <CardDescription>
          Personaliza cómo tu asistente de IA interactuará con tus pacientes según tu filosofía profesional
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {error && (
          <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-200">
            {error}
          </div>
        )}
        
        {success && (
          <div className="text-sm text-green-500 bg-green-50 p-3 rounded-lg border border-green-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            {success}
          </div>
        )}

        {/* Filosofía Dietética */}
        <div className="space-y-2">
          <Label htmlFor="philosophy">Filosofía Dietética *</Label>
          <Textarea
            id="philosophy"
            value={rules.diet_philosophy}
            onChange={(e) => setRules(prev => ({ ...prev, diet_philosophy: e.target.value }))}
            placeholder="Describe tu enfoque nutricional principal. Ej: 'Enfoque en alimentación intuitiva y sostenible, priorizando alimentos naturales y el equilibrio emocional con la comida...'"
            className="min-h-[100px]"
          />
          <p className="text-xs text-charcoal/60">
            Esta será la base filosófica de todas las respuestas de tu asistente
          </p>
        </div>

        {/* Estilo de Respuesta */}
        <div className="space-y-2">
          <Label htmlFor="response-style">Estilo de Respuesta *</Label>
          <Select 
            value={rules.response_style} 
            onValueChange={(value) => setRules(prev => ({ ...prev, response_style: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el tono de las respuestas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="amigable_cercano">Amigable y Cercano</SelectItem>
              <SelectItem value="profesional_empático">Profesional y Empático</SelectItem>
              <SelectItem value="motivador_energético">Motivador y Energético</SelectItem>
              <SelectItem value="relajado_comprensivo">Relajado y Comprensivo</SelectItem>
              <SelectItem value="científico_detallado">Científico y Detallado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Directrices Generales */}
        <div className="space-y-3">
          <Label>Directrices Generales</Label>
          <div className="flex gap-2">
            <Input
              value={newGuideline}
              onChange={(e) => setNewGuideline(e.target.value)}
              placeholder="Ej: Siempre preguntar sobre alergias antes de sugerir alimentos"
              onKeyPress={(e) => e.key === 'Enter' && addGuideline()}
            />
            <Button 
              onClick={addGuideline}
              size="sm"
              variant="outline"
              className="border-coral text-coral hover:bg-coral/10"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {rules.general_guidelines.map((guideline, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="bg-sage-green/20 text-sage-green hover:bg-sage-green/30 cursor-pointer"
                onClick={() => removeGuideline(index)}
              >
                {guideline}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            ))}
          </div>
          
          <p className="text-xs text-charcoal/60">
            Principios específicos que debe seguir siempre. Haz clic en una directriz para eliminarla.
          </p>
        </div>

        {/* Instrucciones Especiales */}
        <div className="space-y-3">
          <Label>Instrucciones Especiales</Label>
          <div className="flex gap-2">
            <Input
              value={newInstruction}
              onChange={(e) => setNewInstruction(e.target.value)}
              placeholder="Ej: No recomendar ayuno intermitente sin evaluación previa"
              onKeyPress={(e) => e.key === 'Enter' && addInstruction()}
            />
            <Button 
              onClick={addInstruction}
              size="sm"
              variant="outline"
              className="border-coral text-coral hover:bg-coral/10"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {rules.special_instructions.map((instruction, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="bg-soft-rose/20 text-soft-rose hover:bg-soft-rose/30 cursor-pointer"
                onClick={() => removeInstruction(index)}
              >
                {instruction}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            ))}
          </div>
          
          <p className="text-xs text-charcoal/60">
            Restricciones o consideraciones especiales. Haz clic en una instrucción para eliminarla.
          </p>
        </div>

        {/* Botón Guardar */}
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-coral hover:bg-coral/90 text-white"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Guardando...' : 'Guardar Configuración'}
        </Button>

        {/* Preview */}
        {rules.diet_philosophy && rules.response_style && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Vista Previa del Asistente
            </h4>
            <p className="text-blue-800 text-sm">
              Tu asistente seguirá un enfoque <strong>{rules.diet_philosophy.substring(0, 50)}...</strong> con un 
              estilo <strong>{rules.response_style.replace('_', ' ')}</strong>
              {rules.general_guidelines.length > 0 && (
                <>, aplicando {rules.general_guidelines.length} directriz(es) general(es)</>
              )}
              {rules.special_instructions.length > 0 && (
                <> y {rules.special_instructions.length} instrucción(es) especial(es)</>
              )}.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 