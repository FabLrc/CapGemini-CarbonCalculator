import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useRouter } from 'expo-router';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useSitesStore } from '@/stores/sitesStore';
import { emissionFactorsApi } from '@/services/api';
import { Colors } from '@/constants/colors';
import { BottomTabBar } from '@/components/layout/BottomTabBar';
import { TemplateModal } from '@/components/carbon/TemplateModal';
import { useTemplatesStore, SiteTemplate } from '@/stores/templatesStore';

type MaterialUnit = 'kg' | 't';
type MaterialForm = { emissionFactorCode: string; quantity: string; unit: MaterialUnit };

type FormData = {
  name: string;
  location: string;
  constructionYear: string;
  totalAreaM2: string;
  parkingSpaces: string;
  annualEnergyKwh: string;
  employeeCount: string;
  energyFactorCode: string;
  materials: MaterialForm[];
};

const toKg = (quantity: string, unit: MaterialUnit): number => {
  const val = parseFloat(quantity);
  return unit === 't' ? val * 1000 : val;
};

type Factor = { id: number; code: string; label: string; category: string; unit: string };

export default function NewSiteScreen() {
  const router = useRouter();
  const { createSite, isLoading } = useSitesStore();
  const [materialFactors, setMaterialFactors] = useState<Factor[]>([]);
  const [energyFactors, setEnergyFactors] = useState<Factor[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { name: '', location: '', constructionYear: '', totalAreaM2: '', parkingSpaces: '', annualEnergyKwh: '', employeeCount: '', energyFactorCode: 'ELECTRICITY_FR', materials: [] as MaterialForm[] },
  });

  const { fields, append, remove, replace } = useFieldArray({ control, name: 'materials' });

  const applyTemplate = (template: SiteTemplate) => {
    setValue('energyFactorCode', template.energyFactorCode);
    replace(template.materials.map((m) => ({
      emissionFactorCode: m.emissionFactorCode,
      quantity: m.quantity,
      unit: m.unit,
    })));
  };

  useEffect(() => {
    emissionFactorsApi.list().then(({ data }) => {
      setMaterialFactors(data.filter((f: Factor) => f.category === 'MATERIAL'));
      setEnergyFactors(data.filter((f: Factor) => f.category === 'ENERGY'));
    });
  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      const site = await createSite({
        name: data.name,
        location: data.location,
        constructionYear: data.constructionYear ? parseInt(data.constructionYear) : null,
        totalAreaM2: parseFloat(data.totalAreaM2),
        parkingSpaces: parseInt(data.parkingSpaces),
        annualEnergyKwh: parseFloat(data.annualEnergyKwh),
        employeeCount: parseInt(data.employeeCount),
        energyFactorCode: data.energyFactorCode,
        materials: data.materials
          .filter((m) => m.emissionFactorCode && parseFloat(m.quantity) > 0)
          .map((m) => ({
            emissionFactorCode: m.emissionFactorCode,
            quantityKg: toKg(m.quantity, m.unit),
          })),
      });
      router.replace(`/(app)/sites/${site.id}`);
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <TemplateModal
        visible={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelect={applyTemplate}
      />

      {/* Custom header */}
      <View style={{ backgroundColor: Colors.primary, paddingTop: isDesktop ? 24 : 52, paddingBottom: 16, paddingHorizontal: 16 }}>
        {!isDesktop && (
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 8 }}>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>← Retour</Text>
          </TouchableOpacity>
        )}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: Colors.white }}>Nouveau site</Text>
          <TouchableOpacity
            onPress={() => setShowTemplates(true)}
            style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }}
          >
            <Text style={{ color: Colors.white, fontSize: 13, fontWeight: '600' }}>📋 Modèles</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1, backgroundColor: Colors.background }}
        contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
        keyboardShouldPersistTaps="handled"
      >

        {/* Informations générales */}
        <Card style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.primary, marginBottom: 16 }}>
            Informations générales
          </Text>
          <Controller
            control={control}
            name="name"
            rules={{ required: 'Nom requis' }}
            render={({ field: { onChange, value } }) => (
              <Input label="Nom du site" value={value} onChangeText={onChange}
                placeholder="Campus Paris La Défense" error={errors.name?.message} />
            )}
          />
          <Controller
            control={control}
            name="location"
            render={({ field: { onChange, value } }) => (
              <Input label="Localisation" value={value} onChangeText={onChange}
                placeholder="92400 Courbevoie" />
            )}
          />
        </Card>

        {/* Données physiques */}
        <Card style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.primary, marginBottom: 16 }}>
            Données physiques
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Controller
                control={control}
                name="totalAreaM2"
                rules={{ required: 'Requis', pattern: { value: /^\d+(\.\d+)?$/, message: 'Nombre invalide' } }}
                render={({ field: { onChange, value } }) => (
                  <Input label="Surface (m²)" value={value} onChangeText={onChange}
                    placeholder="5000" keyboardType="numeric" error={errors.totalAreaM2?.message} />
                )}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Controller
                control={control}
                name="parkingSpaces"
                rules={{ required: 'Requis' }}
                render={({ field: { onChange, value } }) => (
                  <Input label="Places parking" value={value} onChangeText={onChange}
                    placeholder="200" keyboardType="numeric" error={errors.parkingSpaces?.message} />
                )}
              />
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Controller
                control={control}
                name="employeeCount"
                rules={{ required: 'Requis' }}
                render={({ field: { onChange, value } }) => (
                  <Input label="Employés" value={value} onChangeText={onChange}
                    placeholder="350" keyboardType="numeric" error={errors.employeeCount?.message} />
                )}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Controller
                control={control}
                name="annualEnergyKwh"
                rules={{ required: 'Requis' }}
                render={({ field: { onChange, value } }) => (
                  <Input label="Énergie annuelle (kWh)" value={value} onChangeText={onChange}
                    placeholder="850000" keyboardType="numeric" error={errors.annualEnergyKwh?.message} />
                )}
              />
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Controller
                control={control}
                name="constructionYear"
                rules={{ pattern: { value: /^\d{4}$/, message: 'Année invalide (ex: 2010)' } }}
                render={({ field: { onChange, value } }) => (
                  <Input label="Année de construction" value={value} onChangeText={onChange}
                    placeholder="2010" keyboardType="numeric" error={errors.constructionYear?.message} />
                )}
              />
            </View>
            <View style={{ flex: 1 }} />
          </View>
        </Card>

        {/* Mix énergétique */}
        <Card style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.primary, marginBottom: 4 }}>
            Mix énergétique
          </Text>
          <Text style={{ fontSize: 12, color: Colors.textSecondary, marginBottom: 12 }}>
            Source d'énergie principale du site (impacte le CO₂ d'exploitation)
          </Text>
          <Controller
            control={control}
            name="energyFactorCode"
            render={({ field: { onChange, value } }) => (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'nowrap' }}>
                  {energyFactors.map((f) => (
                    <TouchableOpacity
                      key={f.code}
                      onPress={() => onChange(f.code)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 8,
                        borderWidth: 1.5,
                        borderColor: value === f.code ? Colors.primary : Colors.border,
                        backgroundColor: value === f.code ? '#EBF5FB' : Colors.white,
                        minWidth: 80,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: value === f.code ? '700' : '400', color: value === f.code ? Colors.primary : Colors.textSecondary, textAlign: 'center' }}>
                        {f.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            )}
          />
        </Card>

        {/* Matériaux */}
        <Card style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.primary }}>
              Matériaux de construction
            </Text>
            <TouchableOpacity
              onPress={() => append({ emissionFactorCode: materialFactors[0]?.code ?? '', quantity: '', unit: 't' })}
              style={{
                backgroundColor: Colors.primaryLight,
                borderRadius: 6,
                paddingHorizontal: 12,
                paddingVertical: 6,
              }}
            >
              <Text style={{ color: Colors.white, fontWeight: '600', fontSize: 13 }}>+ Ajouter</Text>
            </TouchableOpacity>
          </View>

          {fields.length === 0 && (
            <Text style={{ color: Colors.textSecondary, fontSize: 13, textAlign: 'center', paddingVertical: 8 }}>
              Optionnel — ajoutez des matériaux pour affiner le calcul de construction.
            </Text>
          )}

          {fields.map((field, index) => (
            <View key={field.id} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.textSecondary }}>
                  MATÉRIAU {index + 1}
                </Text>
                <TouchableOpacity onPress={() => remove(index)}>
                  <Text style={{ color: Colors.danger, fontSize: 13 }}>Supprimer</Text>
                </TouchableOpacity>
              </View>
              <Controller
                control={control}
                name={`materials.${index}.emissionFactorCode`}
                render={({ field: { onChange, value } }) => (
                  <View style={{ marginBottom: 8 }}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        {materialFactors.map((f) => (
                          <TouchableOpacity
                            key={f.code}
                            onPress={() => onChange(f.code)}
                            style={{
                              paddingHorizontal: 12,
                              paddingVertical: 8,
                              borderRadius: 8,
                              borderWidth: 1.5,
                              borderColor: value === f.code ? Colors.primary : Colors.border,
                              backgroundColor: value === f.code ? '#EBF5FB' : Colors.white,
                            }}
                          >
                            <Text style={{
                              fontSize: 13,
                              fontWeight: value === f.code ? '700' : '400',
                              color: value === f.code ? Colors.primary : Colors.textSecondary,
                            }}>
                              {f.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                )}
              />
              {/* Quantité + sélecteur d'unité */}
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
                <View style={{ flex: 1 }}>
                  <Controller
                    control={control}
                    name={`materials.${index}.quantity`}
                    rules={{ required: 'Requis', pattern: { value: /^\d+(\.\d+)?$/, message: 'Nombre invalide' } }}
                    render={({ field: { onChange, value } }) => (
                      <Input
                        label="Quantité"
                        value={value}
                        onChangeText={onChange}
                        placeholder="ex: 1 500"
                        keyboardType="numeric"
                        error={errors.materials?.[index]?.quantity?.message}
                      />
                    )}
                  />
                </View>
                <Controller
                  control={control}
                  name={`materials.${index}.unit`}
                  render={({ field: { onChange, value } }) => (
                    <View style={{ flexDirection: 'row', borderRadius: 8, borderWidth: 1.5, borderColor: Colors.border, overflow: 'hidden', marginBottom: 16 }}>
                      {(['t', 'kg'] as MaterialUnit[]).map((u) => (
                        <TouchableOpacity
                          key={u}
                          onPress={() => onChange(u)}
                          style={{
                            paddingHorizontal: 14,
                            paddingVertical: 10,
                            backgroundColor: value === u ? Colors.primary : Colors.white,
                          }}
                        >
                          <Text style={{ fontSize: 13, fontWeight: '600', color: value === u ? Colors.white : Colors.textSecondary }}>
                            {u}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                />
              </View>
            </View>
          ))}
        </Card>

        <Button
          title="Calculer l'empreinte carbone"
          onPress={handleSubmit(onSubmit)}
          isLoading={isLoading}
          fullWidth
        />
      </ScrollView>
      {!isDesktop && <BottomTabBar />}
    </KeyboardAvoidingView>
  );
}
