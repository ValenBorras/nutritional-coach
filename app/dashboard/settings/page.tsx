'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Badge } from "@/app/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { UserAvatar } from "@/app/components/ui/user-avatar";
import DashboardLayout from "@/app/components/dashboard-layout";
import ConnectNutritionist from "@/app/components/connect-nutritionist";
import PushNotificationsManager from "@/app/components/push-notifications-manager";
import { useAuth } from "@/app/components/auth/auth-provider";
import { User, Camera, Target, Heart, AlertCircle, Plus, X, Upload } from "lucide-react";
import { motion } from "framer-motion";

interface UserData {
  name: string;
  email: string;
  image?: string;
}

interface ProfileData {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  birth_date?: string;
  gender?: 'male' | 'female' | 'other';
  height?: number;
  weight?: number;
  activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goals?: string[];
  allergies?: string[];
  dietary_restrictions?: string[];
  medical_conditions?: string[];
  specializations?: string[];
  experience?: number;
  certifications?: string[];
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData>({
    name: '',
    email: '',
    image: '',
  });
  const [profileData, setProfileData] = useState<ProfileData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for dynamic arrays
  const [newGoal, setNewGoal] = useState('');
  const [newAllergy, setNewAllergy] = useState('');
  const [newRestriction, setNewRestriction] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [newSpecialization, setNewSpecialization] = useState('');
  const [newCertification, setNewCertification] = useState('');

  const isNutritionist = user?.role === 'nutritionist';

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setUserData({
          name: data.user?.name || '',
          email: data.user?.email || '',
          image: data.user?.image || '',
        });
        setProfileData(data.profile || {});
      } else {
        setError('Error loading profile data');
      }
    } catch (error) {
      setError('Error loading profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userData: {
            name: userData.name,
            image: userData.image,
          },
          profileData,
        }),
      });

      if (response.ok) {
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error updating profile');
      }
    } catch (error) {
      setError('Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const addToArray = (field: keyof ProfileData, value: string, setter: (value: string) => void) => {
    if (!value.trim()) return;
    const currentArray = (profileData[field] as string[]) || [];
    setProfileData({
      ...profileData,
      [field]: [...currentArray, value.trim()],
    });
    setter('');
  };

  const removeFromArray = (field: keyof ProfileData, index: number) => {
    const currentArray = (profileData[field] as string[]) || [];
    setProfileData({
      ...profileData,
      [field]: currentArray.filter((_, i) => i !== index),
    });
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Tipo de archivo no válido. Solo se permiten JPEG, PNG y WebP.');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Archivo demasiado grande. El tamaño máximo es 5MB.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api/user/upload-avatar', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(prev => ({ ...prev, image: data.imageUrl }));
        setSuccess('Foto de perfil actualizada exitosamente!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error subiendo la imagen');
      }
    } catch (error) {
      setError('Error subiendo la imagen');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-marcellus text-charcoal mb-2">Configuración</h1>
          <p className="text-charcoal/70">
            Gestiona tu perfil, objetivos y preferencias
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700"
          >
            <AlertCircle size={20} />
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700"
          >
            <Heart size={20} />
            {success}
          </motion.div>
        )}

        <div className="space-y-6">
          {/* Profile Picture & Basic Info */}
          <Card className="bg-warm-sand border-soft-rose/20">
            <CardHeader>
              <CardTitle className="text-xl font-medium flex items-center gap-2">
                <User className="w-5 h-5 text-coral" />
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <UserAvatar
                    src={userData.image}
                    name={userData.name}
                    size="xl"
                    className="w-20 h-20"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="absolute -bottom-2 -right-2 w-8 h-8 p-0 rounded-full bg-white border-2 border-soft-rose/20"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-coral"></div>
                    ) : (
                      <Camera size={14} />
                    )}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
                <div className="flex-1">
                  <Label>Foto de perfil</Label>
                  <div className="mt-2 space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-full"
                    >
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-coral mr-2"></div>
                          Subiendo...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Subir nueva foto
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-charcoal/60">
                      JPG, PNG o WebP. Máximo 5MB.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre completo</Label>
                  <Input
                    id="name"
                    value={userData.name}
                    onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={userData.email}
                    disabled
                    className="mt-1 bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input
                    id="firstName"
                    value={profileData.first_name || ''}
                    onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input
                    id="lastName"
                    value={profileData.last_name || ''}
                    onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={profileData.phone_number || ''}
                    onChange={(e) => setProfileData({ ...profileData, phone_number: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="birthDate">Fecha de nacimiento</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={profileData.birth_date || ''}
                    onChange={(e) => setProfileData({ ...profileData, birth_date: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Physical Information (for patients) */}
          {!isNutritionist && (
            <Card className="bg-warm-sand border-soft-rose/20">
              <CardHeader>
                <CardTitle className="text-xl font-medium flex items-center gap-2">
                  <Target className="w-5 h-5 text-sage-green" />
                  Información Física
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="gender">Género</Label>
                    <Select
                      value={profileData.gender || ''}
                      onValueChange={(value) => setProfileData({ ...profileData, gender: value as any })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Masculino</SelectItem>
                        <SelectItem value="female">Femenino</SelectItem>
                        <SelectItem value="other">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="height">Altura (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={profileData.height || ''}
                      onChange={(e) => setProfileData({ ...profileData, height: parseFloat(e.target.value) || undefined })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight">Peso (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={profileData.weight || ''}
                      onChange={(e) => setProfileData({ ...profileData, weight: parseFloat(e.target.value) || undefined })}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="activityLevel">Nivel de actividad</Label>
                  <Select
                    value={profileData.activity_level || ''}
                    onValueChange={(value) => setProfileData({ ...profileData, activity_level: value as any })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Seleccionar nivel de actividad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">Sedentario</SelectItem>
                      <SelectItem value="light">Ligero</SelectItem>
                      <SelectItem value="moderate">Moderado</SelectItem>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="very_active">Muy activo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Professional Information (for nutritionists) */}
          {isNutritionist && (
            <Card className="bg-warm-sand border-soft-rose/20">
              <CardHeader>
                <CardTitle className="text-xl font-medium flex items-center gap-2">
                  <Target className="w-5 h-5 text-sage-green" />
                  Información Profesional
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="experience">Años de experiencia</Label>
                    <Input
                      id="experience"
                      type="number"
                      value={profileData.experience || ''}
                      onChange={(e) => setProfileData({ ...profileData, experience: parseInt(e.target.value) || undefined })}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Specializations */}
                <div>
                  <Label>Especializaciones</Label>
                  <div className="mt-2">
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={newSpecialization}
                        onChange={(e) => setNewSpecialization(e.target.value)}
                        placeholder="Agregar especialización..."
                        onKeyPress={(e) => e.key === 'Enter' && addToArray('specializations', newSpecialization, setNewSpecialization)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addToArray('specializations', newSpecialization, setNewSpecialization)}
                      >
                        <Plus size={16} />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(profileData.specializations || []).map((spec, index) => (
                        <Badge key={index} variant="secondary" className="gap-1">
                          {spec}
                          <button
                            onClick={() => removeFromArray('specializations', index)}
                            className="ml-1 hover:text-red-500"
                          >
                            <X size={12} />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Certifications */}
                <div>
                  <Label>Certificaciones</Label>
                  <div className="mt-2">
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={newCertification}
                        onChange={(e) => setNewCertification(e.target.value)}
                        placeholder="Agregar certificación..."
                        onKeyPress={(e) => e.key === 'Enter' && addToArray('certifications', newCertification, setNewCertification)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addToArray('certifications', newCertification, setNewCertification)}
                      >
                        <Plus size={16} />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(profileData.certifications || []).map((cert, index) => (
                        <Badge key={index} variant="secondary" className="gap-1">
                          {cert}
                          <button
                            onClick={() => removeFromArray('certifications', index)}
                            className="ml-1 hover:text-red-500"
                          >
                            <X size={12} />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Goals & Health Information (for patients) */}
          {!isNutritionist && (
            <Card className="bg-warm-sand border-soft-rose/20">
              <CardHeader>
                <CardTitle className="text-xl font-medium flex items-center gap-2">
                  <Target className="w-5 h-5 text-coral" />
                  Objetivos y Salud
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Goals */}
                <div>
                  <Label>Objetivos</Label>
                  <div className="mt-2">
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={newGoal}
                        onChange={(e) => setNewGoal(e.target.value)}
                        placeholder="Agregar objetivo..."
                        onKeyPress={(e) => e.key === 'Enter' && addToArray('goals', newGoal, setNewGoal)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addToArray('goals', newGoal, setNewGoal)}
                      >
                        <Plus size={16} />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(profileData.goals || []).map((goal, index) => (
                        <Badge key={index} variant="secondary" className="gap-1">
                          {goal}
                          <button
                            onClick={() => removeFromArray('goals', index)}
                            className="ml-1 hover:text-red-500"
                          >
                            <X size={12} />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Allergies */}
                <div>
                  <Label>Alergias</Label>
                  <div className="mt-2">
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={newAllergy}
                        onChange={(e) => setNewAllergy(e.target.value)}
                        placeholder="Agregar alergia..."
                        onKeyPress={(e) => e.key === 'Enter' && addToArray('allergies', newAllergy, setNewAllergy)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addToArray('allergies', newAllergy, setNewAllergy)}
                      >
                        <Plus size={16} />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(profileData.allergies || []).map((allergy, index) => (
                        <Badge key={index} variant="destructive" className="gap-1">
                          {allergy}
                          <button
                            onClick={() => removeFromArray('allergies', index)}
                            className="ml-1 hover:text-red-300"
                          >
                            <X size={12} />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Dietary Restrictions */}
                <div>
                  <Label>Restricciones Dietéticas</Label>
                  <div className="mt-2">
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={newRestriction}
                        onChange={(e) => setNewRestriction(e.target.value)}
                        placeholder="Agregar restricción..."
                        onKeyPress={(e) => e.key === 'Enter' && addToArray('dietary_restrictions', newRestriction, setNewRestriction)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addToArray('dietary_restrictions', newRestriction, setNewRestriction)}
                      >
                        <Plus size={16} />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(profileData.dietary_restrictions || []).map((restriction, index) => (
                        <Badge key={index} variant="outline" className="gap-1">
                          {restriction}
                          <button
                            onClick={() => removeFromArray('dietary_restrictions', index)}
                            className="ml-1 hover:text-red-500"
                          >
                            <X size={12} />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Medical Conditions */}
                <div>
                  <Label>Condiciones Médicas</Label>
                  <div className="mt-2">
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={newCondition}
                        onChange={(e) => setNewCondition(e.target.value)}
                        placeholder="Agregar condición médica..."
                        onKeyPress={(e) => e.key === 'Enter' && addToArray('medical_conditions', newCondition, setNewCondition)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addToArray('medical_conditions', newCondition, setNewCondition)}
                      >
                        <Plus size={16} />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(profileData.medical_conditions || []).map((condition, index) => (
                        <Badge key={index} variant="secondary" className="gap-1">
                          {condition}
                          <button
                            onClick={() => removeFromArray('medical_conditions', index)}
                            className="ml-1 hover:text-red-500"
                          >
                            <X size={12} />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Connect Nutritionist (for patients) */}
          {!isNutritionist && (
            <ConnectNutritionist />
          )}

          {/* Push Notifications */}
          <PushNotificationsManager />

          {/* Save Button */}
          <div className="flex justify-end pt-6">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-coral hover:bg-coral/90 text-mist-white px-8"
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 