import { View, Text, Pressable, StyleSheet, Alert } from "react-native";

import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

import type { Note } from "./types/note";
import { formatDate } from "./utils/date";

import { togglePin, toggleFavorite, deleteNote, updateNoteColor } from "./services/notes";

import NoteActionMenu from "./components/NoteActionMenu";
import NoteColorPicker from "./components/NoteColorPicker";

import { colors, typography, spacing } from "./theme";
const noteColors = {
  default: colors.background,
  yellow: "#FFF3A3",
  blue: "#BDE0FE",
  green: "#C7F9CC",
  pink: "#FFC8DD",
};

export default function NoteDetails({ route, navigation }: any) {
  const { note: initialNote }: { note: Note } = route.params;

  const [note, setNote] = useState(initialNote);
  const [menuVisible, setMenuVisible] = useState(false);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);

  // Toggle pin
  async function handleTogglePin() {
    try {
      await togglePin(note.id, note.isPinned);

      setNote((currentNote) => ({
        ...currentNote,
        isPinned: !currentNote.isPinned,
      }));

      setMenuVisible(false);
    } catch (error) {
      console.error("Failed to toggle pin:", error);

      Alert.alert("Error", "Failed to update the note. Please try again.");
    }
  }

  // Toggle favorite
  async function handleToggleFavorite() {
    try {
      await toggleFavorite(note.id, note.isFavorite);

      setNote((currentNote) => ({
        ...currentNote,
        isFavorite: !currentNote.isFavorite,
      }));

      setMenuVisible(false);
    } catch (error) {
      console.error("Failed to toggle favorite:", error);

      Alert.alert("Error", "Failed to update the note. Please try again.");
    }
  }

  // Change color
  function handleChangeColor() {
    setMenuVisible(false);
    setColorPickerVisible(true);
  }

  async function handleSelectColor(color: Note["color"]) {
  try {
    await updateNoteColor(note.id, color);

    setNote((currentNote) => ({
      ...currentNote,
      color,
    }));

    setColorPickerVisible(false);
  } catch (error) {
    console.error(
      "Failed to update note color:",
      error
    );

    Alert.alert(
      "Error",
      "Failed to change note color. Please try again."
    );
  }
}

  // Delete note
  function handleDelete() {
    setMenuVisible(false);

    Alert.alert("Delete Note", "Are you sure you want to delete this note?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const success = await deleteNote(note.id);

            if (!success) {
              Alert.alert("Error", "Failed to delete note.");

              return;
            }

            navigation.goBack();
          } catch (error) {
            console.error("Failed to delete note:", error);

            Alert.alert("Error", "Failed to delete note.");
          }
        },
      },
    ]);
  }

  // Edit note
  function handleEdit() {
    setMenuVisible(false);

    navigation.navigate("NoteEditor", {
      note,
    });
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Note</Text>

        <Pressable
          style={styles.menuButton}
          onPress={() => setMenuVisible((current) => !current)}
        >
          <Ionicons name="ellipsis-vertical" size={24} color={colors.text} />
        </Pressable>
      </View>

      {/* Note Content */}
      <View 
      style={[styles.contentContainer, { backgroundColor: noteColors[note.color] }]}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{note.title}</Text>

          {note.isPinned && (
            <Ionicons
              name="pin"
              size={20}
              color={colors.primary}
              style={styles.pinIndicator}
            />
          )}
        </View>

        <Text style={styles.date}>
          {note.updatedAt
            ? `Updated ${formatDate(note.updatedAt)}`
            : `Created ${formatDate(note.createdAt)}`}
        </Text>

        <Text style={styles.content}>{note.content}</Text>
      </View>

      {/* Edit FAB */}
      <Pressable style={styles.editButton} onPress={handleEdit}>
        <Ionicons name="pencil-outline" size={28} color={colors.background} />
      </Pressable>

      {/* Reusable Note Action Menu */}
      {menuVisible && (
        <NoteActionMenu
          note={note}
          onPin={handleTogglePin}
          onFavorite={handleToggleFavorite}
          onColor={handleChangeColor}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onClose={() => setMenuVisible(false)}
        />
      )}

      {colorPickerVisible && (
        <NoteColorPicker
          currentColor={note.color}
          onSelect={handleSelectColor}
          onClose={() => setColorPickerVisible(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    height: 56,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    zIndex: 10,
  },

  headerTitle: {
    fontSize: typography.heading,
    fontWeight: typography.bold,
    color: colors.text,
  },

  menuButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },

  contentContainer: {
    flex: 1,
    padding: spacing.lg,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },

  title: {
    flex: 1,
    fontSize: typography.title,
    fontWeight: typography.bold,
    color: colors.text,
  },

  pinIndicator: {
    marginLeft: spacing.sm,
  },

  date: {
    fontSize: typography.caption,
    color: colors.secondaryText,
    marginBottom: spacing.xl,
  },

  content: {
    fontSize: typography.body,
    lineHeight: 27,
    color: colors.text,
  },

  editButton: {
    position: "absolute",
    right: spacing.xxl,
    bottom: spacing.xxl,
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",

    elevation: 6,

    shadowColor: colors.text,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
