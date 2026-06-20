// AddBookScreen v2.1 — Responsivo
import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  StatusBar, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import COLORS from '../constants/colors';
import { registerBook } from '../utils/helpers';
import { scale, fontScale, wp } from '../utils/responsive';

export default function AddBookScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [totalPages, setTotalPages] = useState('');
  const [loading, setLoading] = useState(false);
  const authorRef = useRef(null);
  const pagesRef = useRef(null);

  const handleSave = async () => {
    if (loading) return;
    setLoading(true);
    const newBook = await registerBook(title, author, totalPages);
    setLoading(false);
    if (newBook) { setTitle(''); setAuthor(''); setTotalPages(''); navigation.goBack(); }
  };

  const isFormValid = title.trim() && author.trim() && totalPages.trim();

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        <View style={styles.topRow}>
          <View style={styles.iconCircle}>
            <Text style={{ fontSize: scale(22) }}>📖</Text>
          </View>
          <View>
            <Text style={styles.screenTitle}>Nuevo Libro</Text>
            <Text style={styles.screenSub}>Completa la información</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.label}>TÍTULO</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. El Principito"
          placeholderTextColor={COLORS.textMuted}
          value={title}
          onChangeText={setTitle}
          maxLength={100}
          returnKeyType="next"
          onSubmitEditing={() => authorRef.current?.focus()}
          blurOnSubmit={false}
        />

        <Text style={styles.label}>AUTOR</Text>
        <TextInput
          ref={authorRef}
          style={styles.input}
          placeholder="Ej. Antoine de Saint-Exupéry"
          placeholderTextColor={COLORS.textMuted}
          value={author}
          onChangeText={setAuthor}
          maxLength={80}
          returnKeyType="next"
          onSubmitEditing={() => pagesRef.current?.focus()}
          blurOnSubmit={false}
        />

        <Text style={styles.label}>TOTAL DE PÁGINAS</Text>
        <TextInput
          ref={pagesRef}
          style={[styles.input, styles.inputLarge]}
          placeholder="0"
          placeholderTextColor={COLORS.textMuted}
          value={totalPages}
          onChangeText={setTotalPages}
          keyboardType="numeric"
          maxLength={6}
          returnKeyType="done"
          onSubmitEditing={handleSave}
          textAlign="center"
        />

        <TouchableOpacity
          style={[styles.saveBtn, (!isFormValid || loading) && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={!isFormValid || loading}
          activeOpacity={0.85}
        >
          <Text style={styles.saveBtnText}>{loading ? 'Guardando...' : 'Registrar libro'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, paddingHorizontal: scale(24), paddingTop: scale(24), paddingBottom: scale(48) },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: scale(12), marginBottom: scale(18) },
  iconCircle: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(25),
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.primary + '66',
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenTitle: { color: COLORS.text, fontSize: fontScale(19), fontWeight: '800' },
  screenSub: { color: COLORS.textSecondary, fontSize: fontScale(12), marginTop: 1 },
  divider: { height: 1, backgroundColor: COLORS.border, marginBottom: scale(22) },
  label: { color: COLORS.textSecondary, fontSize: fontScale(11), fontWeight: '700', letterSpacing: 1.4, marginBottom: scale(7) },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: scale(12),
    paddingHorizontal: scale(16),
    paddingVertical: scale(13),
    color: COLORS.text,
    fontSize: fontScale(15),
    marginBottom: scale(18),
  },
  inputLarge: { fontSize: fontScale(28), fontWeight: '800', color: COLORS.primary, paddingVertical: scale(14), letterSpacing: 2 },
  saveBtn: { backgroundColor: COLORS.primary, borderRadius: scale(14), paddingVertical: scale(15), alignItems: 'center', marginTop: scale(4), marginBottom: scale(12) },
  saveBtnDisabled: { backgroundColor: COLORS.surfaceHigh },
  saveBtnText: { color: COLORS.background, fontSize: fontScale(15), fontWeight: '800' },
  cancelBtn: { alignSelf: 'center', paddingVertical: scale(8) },
  cancelText: { color: COLORS.textSecondary, fontSize: fontScale(13) },
});
