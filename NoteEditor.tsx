
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import { useEffect, useState } from "react";

import type { Note } from "./types/note";

import {
  createNote,
  updateNote,
} from "./services/notes";

import { getLocalNote } from "./services/localNotes";

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
  const noteId: string | undefined =
    route.params?.noteId;

  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(
    Boolean(noteId)
  );
  const [isSaving, setIsSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!noteId) {
      setNote(null);
      setTitle("");
      setContent("");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const localNote = getLocalNote(noteId);

      if (!localNote) {
        setNote(null);
        setError("This note could not be found.");
        return;
      }

      setNote(localNote);
      setTitle(localNote.title);
      setContent(localNote.content);
    } catch (loadError) {
      console.error("Failed to load note:", loadError);
      setError("Failed to load this note. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [noteId]);

  async function handleSave() {
    if (isSaving || isLoading) return;

    setError("");

    const validationError = validateNote(title, content);

    if (validationError) {
      setError(validationError);
      return;
    }

    if (noteId && !note) {
      setError("The note could not be loaded. Please go back and try again.");
      return;
    }

    try {
      setIsSaving(true);

      if (noteId && note) {
        await updateNote(noteId, title, content);
      } else {
        await createNote(title, content);
      }

      navigation.goBack();
    } catch (saveError) {
      console.error("Failed to save note:", saveError);
      setError("Failed to save note. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
        <Text style={styles.loadingText}>
          Loading note...
        </Text>
      </View>
    );
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
            <Text style={styles.brand}>Notely</Text>

            <Text style={styles.mode}>
              {noteId
                ? "Edit your note"
                : "Capture a new thought"}
            </Text>
          </View>
        </View>

        <Text style={styles.label}>Title</Text>

        <TextInput
          style={styles.titleInput}
          placeholder="Give your note a title"
          placeholderTextColor={colors.mutedText}
          value={title}
          onChangeText={setTitle}
          maxLength={100}
          editable={!isSaving}
        />

        <Text style={styles.label}>Note</Text>

        <TextInput
          style={styles.contentInput}
          placeholder="Start writing..."
          placeholderTextColor={colors.mutedText}
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
          editable={!isSaving}
        />

        {error !== "" && (
          <Text style={styles.error}>{error}</Text>
        )}

        <Pressable
          style={[
            styles.saveButton,
            (isSaving || isLoading || (noteId && !note)) &&
              styles.disabledButton,
          ]}
          onPress={handleSave}
          disabled={isSaving || isLoading || (Boolean(noteId) && !note)}
        >
          <Text style={styles.saveText}>
            {isSaving
              ? "Saving..."
              : noteId
                ? "Save Changes"
                : "Save Note"}
          </Text>
        </Pressable>

        <Pressable
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelText}>Cancel</Text>
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

  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: spacing.md,
    color: colors.secondaryText,
    fontSize: typography.body,
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

  disabledButton: {
    opacity: 0.5,
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
});
