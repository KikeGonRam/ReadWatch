// AddBookScreen v3 — Campo de notas opcionales de lectura
import React, { useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, StatusBar, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../constants/colors';
import { registerBook } from '../utils/helpers';
import { scale, fontScale, isWatchScreen, safeCircularPad } from '../utils/responsive';

export default function AddBookScreen({ navigation }) {
  const [title, setTitle]           = useState('');
  const [author, setAuthor]         = useState('');
  const [totalPages, setTotalPages] = useState('');
  const [notes, setNotes]           = useState('');
  const [loading, setLoading]       = useState(false);
  const authorRef = useRef(null);
  const pagesRef  = useRef(null);
  const notesRef  = useRef(null);

  const handleSave = async () => {
    if (loading) return;
    setLoading(true);
    const newBook = await registerBook(title, author, totalPages, notes);
    setLoading(false);
    if (newBook) { setTitle(''); setAuthor(''); setTotalPages(''); setNotes(''); navigation.goBack(); }
  };

  const isFormValid = title.trim() && author.trim() && totalPages.trim();

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        <View style={styles.topRow}>
          <View style={styles.iconCircle}>
            <Ionicons name="book" size={scale(24)} color={COLORS.primary} />
          </View>
          <View>
            <Text style={styles.screenTitle}>Nuevo Libro</Text>
            <Text style={styles.screenSub}>Completa la información</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Título */}
        <Text style={styles.label}>TÍTULO <Text style={styles.required}>*</Text></Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="text-outline" size={scale(16)} color={COLORS.textSecondary} style={styles.inputIcon} />
          <TextInput style={styles.input} placeholder="Ej. El Principito" placeholderTextColor={COLORS.textMuted} value={title} onChangeText={setTitle} maxLength={100} returnKeyType="next" onSubmitEditing={() => authorRef.current?.focus()} blurOnSubmit={false} />
        </View>

        {/* Autor */}
        <Text style={styles.label}>AUTOR <Text style={styles.required}>*</Text></Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="person-outline" size={scale(16)} color={COLORS.textSecondary} style={styles.inputIcon} />
          <TextInput ref={authorRef} style={styles.input} placeholder="Ej. Antoine de Saint-Exupéry" placeholderTextColor={COLORS.textMuted} value={author} onChangeText={setAuthor} maxLength={80} returnKeyType="next" onSubmitEditing={() => pagesRef.current?.focus()} blurOnSubmit={false} />
        </View>

        {/* Páginas */}
        <Text style={styles.label}>TOTAL DE PÁGINAS <Text style={styles.required}>*</Text></Text>
        <TextInput ref={pagesRef} style={styles.inputLarge} placeholder="0" placeholderTextColor={COLORS.textMuted} value={totalPages} onChangeText={setTotalPages} keyboardType="numeric" maxLength={6} returnKeyType="next" onSubmitEditing={() => notesRef.current?.focus()} blurOnSubmit={false} textAlign="center" />

        {/* Notas — campo opcional */}
        <View style={styles.labelRow}>
          <Ionicons name="document-text-outline" size={scale(13)} color={COLORS.textSecondary} />
          <Text style={styles.label}> NOTAS <Text style={styles.optional}>(opcional)</Text></Text>
        </View>
        <TextInput
          ref={notesRef}
          style={styles.notesInput}
          placeholder="Sinopsis, por qué quieres leerlo, dónde lo conseguiste..."
          placeholderTextColor={COLORS.textMuted}
          value={notes}
          onChangeText={setNotes}
          maxLength={300}
          multiline
          numberOfLines={3}
          returnKeyType="default"
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>{notes.length}/300</Text>

        {/* Botón guardar */}
        <TouchableOpacity style={[styles.saveBtn, (!isFormValid || loading) && styles.saveBtnDisabled]} onPress={handleSave} disabled={!isFormValid || loading} activeOpacity={0.85}>
          {loading
            ? <Ionicons name="hourglass-outline" size={scale(18)} color={COLORS.background} />
            : <Ionicons name="checkmark-circle" size={scale(18)} color={COLORS.background} />
          }
          <Text style={styles.saveBtnText}>{loading ? 'Guardando...' : 'Registrar libro'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={scale(14)} color={COLORS.textSecondary} />
          <Text style={styles.cancelText}> Cancelar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, paddingHorizontal: isWatchScreen ? safeCircularPad : scale(24), paddingTop: scale(24), paddingBottom: scale(48) },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: scale(12), marginBottom: scale(18) },
  iconCircle: { width: scale(50), height: scale(50), borderRadius: scale(25), backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.primary + '66', alignItems: 'center', justifyContent: 'center' },
  screenTitle: { color: COLORS.text, fontSize: fontScale(19), fontWeight: '800' },
  screenSub: { color: COLORS.textSecondary, fontSize: fontScale(12), marginTop: 1 },
  divider: { height: 1, backgroundColor: COLORS.border, marginBottom: scale(22) },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: scale(7) },
  label: { color: COLORS.textSecondary, fontSize: fontScale(11), fontWeight: '700', letterSpacing: 1.4, marginBottom: scale(7) },
  required: { color: COLORS.primary },
  optional: { color: COLORS.textMuted, fontWeight: '400', letterSpacing: 0 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.borderLight, borderRadius: scale(12), marginBottom: scale(18) },
  inputIcon: { marginLeft: scale(14) },
  input: { flex: 1, paddingHorizontal: scale(10), paddingVertical: scale(13), color: COLORS.text, fontSize: fontScale(15) },
  inputLarge: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.borderLight, borderRadius: scale(12), paddingVertical: scale(14), color: COLORS.primary, fontSize: fontScale(28), fontWeight: '800', letterSpacing: 2, marginBottom: scale(18) },
  // Campo de notas multilínea
  notesInput: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.borderLight, borderRadius: scale(12), paddingHorizontal: scale(14), paddingVertical: scale(12), color: COLORS.text, fontSize: fontScale(14), minHeight: scale(90), marginBottom: scale(4) },
  charCount: { color: COLORS.textMuted, fontSize: fontScale(11), textAlign: 'right', marginBottom: scale(18) },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: scale(8), backgroundColor: COLORS.primary, borderRadius: scale(14), paddingVertical: scale(15), marginTop: scale(4), marginBottom: scale(12) },
  saveBtnDisabled: { backgroundColor: COLORS.surfaceHigh },
  saveBtnText: { color: COLORS.background, fontSize: fontScale(15), fontWeight: '800' },
  cancelBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: scale(8) },
  cancelText: { color: COLORS.textSecondary, fontSize: fontScale(13) },
});
