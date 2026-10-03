import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";

import { useState } from "react";

import {
  createNote,
  updateNote,
} from "./services/notes";

import {
  colors,
  typography,
  spacing,
} from "./theme";

import { validateNote } from "./utils/validation";

export default function NoteEditor({
  navigation,
  route,
}: any) {
  const { note } = route.params || {};
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState(
    note?.title || ""
  );

  const [content, setContent] = useState(
    note?.content || ""
  );

  const [error, setError] = useState("");

  async function handleSave() {
    if (isSaving) return;

    setError("");

    const validationError = validateNote(title, content);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsSaving(true);

      if (note) {
        await updateNote(note.id, title, content);
      } else {
        await createNote(title, content);
      }

      navigation.goBack();
    } catch (error) {
      setError("Failed to save note. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }
  return (
    <KeyboardAvoidingView
      style={styles.keyboard}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >

        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>
              Notely
            </Text>

            <Text style={styles.mode}>
              {note
                ? "Edit your note"
                : "Capture a new thought"}
            </Text>
          </View>
        </View>

        <Text style={styles.label}>
          Title
        </Text>

        <TextInput
          style={styles.titleInput}
          placeholder="Give your note a title"
          placeholderTextColor={colors.mutedText}
          value={title}
          onChangeText={setTitle}
          maxLength={100}
        />

        <Text style={styles.label}>
          Note
        </Text>

        <TextInput
          style={styles.contentInput}
          placeholder="Start writing..."
          placeholderTextColor={colors.mutedText}
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />

        {error !== "" && (
          <Text style={styles.error}>
            {error}
          </Text>
        )}

        <Pressable
          style={[
            styles.saveButton,
            isSaving && styles.disabledButton,
          ]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveText}>
            {isSaving
              ? "Saving..."
              : note
                ? "Save Changes"
                : "Save Note"}
          </Text>
        </Pressable>

        <Pressable
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelText}>
            Cancel
          </Text>
        </Pressable>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scroll: {
    flex: 1,
  },

  container: {
    padding: spacing.xxl,
    paddingBottom: spacing.huge,
  },

  header: {
    marginBottom: spacing.xxxl,
  },

  brand: {
    fontSize: typography.title,
    fontWeight: typography.bold,
    color: colors.text,
  },

  mode: {
    color: colors.secondaryText,
    fontSize: typography.bodySmall,
    marginTop: spacing.xs,
  },

  label: {
    color: colors.text,
    fontSize: typography.bodySmall,
    fontWeight: typography.semibold,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },

  titleInput: {
    height: 56,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: spacing.lg,
    fontSize: typography.subheading,
    fontWeight: typography.semibold,
    color: colors.text,
  },

  contentInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: spacing.lg,
    minHeight: 260,
    fontSize: typography.body,
    lineHeight: 24,
    color: colors.text,
  },

  error: {
    color: colors.danger,
    fontSize: typography.bodySmall,
    marginTop: spacing.md,
  },

  saveButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.xxl,
  },
  Button:{
    opacity: 0.5
  },

  saveText: {
    color: colors.white,
    fontSize: typography.body,
    fontWeight: typography.bold,
  },

  cancelButton: {
    alignItems: "center",
    padding: spacing.lg,
  },

  cancelText: {
    color: colors.secondaryText,
    fontWeight: typography.semibold,
  },
  disabledButton: {
  opacity: 0.5,
},
});