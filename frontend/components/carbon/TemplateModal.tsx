import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { SiteTemplate, useTemplatesStore } from '@/stores/templatesStore';

interface TemplateModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (template: SiteTemplate) => void;
}

export function TemplateModal({ visible, onClose, onSelect }: TemplateModalProps) {
  const { templates, deleteTemplate } = useTemplatesStore();

  const handleDelete = (id: string) => {
    if (Platform.OS === 'web') {
      if (!window.confirm('Supprimer ce modèle ?')) return;
    }
    deleteTemplate(id);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}>
        <View
          style={{
            backgroundColor: Colors.white,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingTop: 16,
            maxHeight: '75%',
          }}
        >
          {/* Handle */}
          <View style={{ width: 40, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: 16 }} />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: Colors.textPrimary }}>
              Modèles de bâtiments
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ fontSize: 22, color: Colors.textSecondary }}>✕</Text>
            </TouchableOpacity>
          </View>

          {templates.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24 }}>
              <Text style={{ fontSize: 32, marginBottom: 12 }}>📋</Text>
              <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.textPrimary, textAlign: 'center' }}>
                Aucun modèle enregistré
              </Text>
              <Text style={{ fontSize: 13, color: Colors.textSecondary, textAlign: 'center', marginTop: 8 }}>
                Depuis la fiche d'un site, utilisez "Enregistrer comme modèle" pour sauvegarder sa configuration.
              </Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}>
              {templates.map((t) => (
                <View
                  key={t.id}
                  style={{
                    borderWidth: 1.5,
                    borderColor: Colors.border,
                    borderRadius: 12,
                    padding: 14,
                    marginBottom: 10,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.textPrimary }}>
                        {t.name}
                      </Text>
                      <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 2 }}>
                        {t.materials.length} matériau{t.materials.length > 1 ? 'x' : ''} · {t.energyFactorCode}
                      </Text>
                      {t.materials.length > 0 && (
                        <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 4 }} numberOfLines={2}>
                          {t.materials.map((m) => `${m.factorLabel} (${m.quantity} ${m.unit})`).join(', ')}
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDelete(t.id)}
                      style={{ paddingLeft: 12 }}
                    >
                      <Text style={{ fontSize: 16, color: Colors.danger }}>🗑️</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    onPress={() => { onSelect(t); onClose(); }}
                    style={{
                      marginTop: 12,
                      backgroundColor: Colors.primary,
                      borderRadius: 8,
                      paddingVertical: 9,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: Colors.white, fontWeight: '700', fontSize: 13 }}>
                      Utiliser ce modèle
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}
