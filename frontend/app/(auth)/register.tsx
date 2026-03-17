import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'expo-router';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { Colors } from '@/constants/colors';

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  organizationName: string;
};

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { firstName: '', lastName: '', email: '', password: '', organizationName: '' },
  });

  const onSubmit = async (data: FormData) => {
    clearError();
    await register({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      organizationName: data.organizationName,
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: Colors.background }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View
          style={{
            backgroundColor: Colors.white,
            paddingTop: 60,
            paddingBottom: 24,
            paddingHorizontal: 24,
            borderBottomWidth: 1,
            borderBottomColor: Colors.border,
          }}
        >
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 16 }}>
            <Text style={{ color: Colors.primary, fontSize: 15 }}>← Retour</Text>
          </TouchableOpacity>
          <Image
            source={require('@/assets/Capgemini_Logo_Nom.png')}
            style={{ width: 180, height: 48, resizeMode: 'contain', marginBottom: 16 }}
          />
          <Text style={{ fontSize: 22, fontWeight: '700', color: Colors.primary }}>
            Créer un compte
          </Text>
          <Text style={{ color: Colors.textSecondary, marginTop: 4, fontSize: 14 }}>
            Vous serez administrateur de votre organisation
          </Text>
        </View>

        {/* Form */}
        <View style={{ padding: 24 }}>
          {error && (
            <View
              style={{
                backgroundColor: '#FEE2E2',
                borderRadius: 8,
                padding: 12,
                marginBottom: 16,
                borderLeftWidth: 3,
                borderLeftColor: Colors.danger,
              }}
            >
              <Text style={{ color: Colors.danger, fontSize: 14 }}>{error}</Text>
            </View>
          )}

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Controller
                control={control}
                name="firstName"
                rules={{ required: 'Requis' }}
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Prénom"
                    value={value}
                    onChangeText={onChange}
                    placeholder="Jean"
                    error={errors.firstName?.message}
                  />
                )}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Controller
                control={control}
                name="lastName"
                rules={{ required: 'Requis' }}
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Nom"
                    value={value}
                    onChangeText={onChange}
                    placeholder="Dupont"
                    error={errors.lastName?.message}
                  />
                )}
              />
            </View>
          </View>

          <Controller
            control={control}
            name="organizationName"
            rules={{ required: "Nom d'organisation requis" }}
            render={({ field: { onChange, value } }) => (
              <Input
                label="Nom de l'organisation"
                value={value}
                onChangeText={onChange}
                placeholder="Capgemini Paris"
                error={errors.organizationName?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            rules={{
              required: 'Email requis',
              pattern: { value: /^\S+@\S+$/i, message: 'Email invalide' },
            }}
            render={({ field: { onChange, value } }) => (
              <Input
                label="Email"
                value={value}
                onChangeText={onChange}
                placeholder="vous@capgemini.com"
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            rules={{ required: 'Requis', minLength: { value: 8, message: '8 caractères minimum' } }}
            render={({ field: { onChange, value } }) => (
              <Input
                label="Mot de passe"
                value={value}
                onChangeText={onChange}
                placeholder="8 caractères minimum"
                secureTextEntry
                error={errors.password?.message}
              />
            )}
          />

          <Button
            title="Créer mon compte"
            onPress={handleSubmit(onSubmit)}
            isLoading={isLoading}
            fullWidth
            style={{ marginTop: 8 }}
          />

          <TouchableOpacity
            onPress={() => router.push('/(auth)/login')}
            style={{ marginTop: 20, alignItems: 'center' }}
          >
            <Text style={{ color: Colors.primary, fontSize: 15 }}>
              Déjà un compte ? <Text style={{ fontWeight: '700' }}>Se connecter</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
