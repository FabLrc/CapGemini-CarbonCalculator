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

type FormData = { email: string; password: string };

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ defaultValues: { email: '', password: '' } });

  const onSubmit = async (data: FormData) => {
    clearError();
    await login(data.email, data.password);
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
            paddingTop: 72,
            paddingBottom: 32,
            paddingHorizontal: 32,
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: Colors.border,
          }}
        >
          <Image
            source={require('@/assets/Capgemini_Logo_Nom.png')}
            style={{ width: 220, height: 60, resizeMode: 'contain', marginBottom: 20 }}
          />
          <View style={{ height: 1, backgroundColor: Colors.border, width: '100%', marginBottom: 20 }} />
          <Text style={{ fontSize: 24, fontWeight: '700', color: Colors.primary, textAlign: 'center' }}>
            Carbon Calculator
          </Text>
          <Text style={{ fontSize: 14, color: Colors.textSecondary, marginTop: 6, textAlign: 'center' }}>
            Mesurez l'empreinte carbone de vos sites
          </Text>
        </View>

        {/* Form */}
        <View style={{ padding: 24, paddingTop: 40 }}>
          <Text style={{ fontSize: 22, fontWeight: '700', color: Colors.textPrimary, marginBottom: 28 }}>
            Connexion
          </Text>

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
                autoComplete="email"
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            rules={{ required: 'Mot de passe requis' }}
            render={({ field: { onChange, value } }) => (
              <Input
                label="Mot de passe"
                value={value}
                onChangeText={onChange}
                placeholder="••••••••"
                secureTextEntry
                autoComplete="password"
                error={errors.password?.message}
              />
            )}
          />

          <Button
            title="Se connecter"
            onPress={handleSubmit(onSubmit)}
            isLoading={isLoading}
            fullWidth
            style={{ marginTop: 8 }}
          />

          <TouchableOpacity
            onPress={() => router.push('/(auth)/register')}
            style={{ marginTop: 20, alignItems: 'center' }}
          >
            <Text style={{ color: Colors.primary, fontSize: 15 }}>
              Pas encore de compte ?{' '}
              <Text style={{ fontWeight: '700' }}>S'inscrire</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
