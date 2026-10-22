
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import type { Note } from "./types/note";
import { formatDate } from "./utils/date";

import {
  togglePin,
  toggleFavorite,
  deleteNote,
  updateNoteColor,
} from "./services/notes";

import {
  getLocalNote,
  getLocalNoteSyncStatus,
} from "./services/localNotes";

import {
  resolveKeepMyVersion,
  resolveKeepCloudVersion,
} from "./services/syncService";

import NoteActionMenu from "./components/NoteActionMenu";
import NoteColorPicker from "./components/NoteColorPicker";

import { typography, spacing } from "./theme";
import { useTheme } from "./theme/ThemeContext";
import type { ThemeColors } from "./theme/colors";

export default function NoteDetails({
  route,
  navigation,
}: any) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const noteColors: Record<string, string> = {
    default: colors.background,
    yellow: "#FFF3A3",
    blue: "#BDE0FE",
    green: "#C7F9CC",
    pink: "#FFC8DD",
  };

  const { noteId }: { noteId: string } = route.params;

  const [note, setNote] = useState<Note | null>(null);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const localNote = getLocalNote(noteId);
      const status = getLocalNoteSyncStatus(noteId);

      setNote(localNote);
      setSyncStatus(status);
    }, [noteId])
  );

  async function handleTogglePin() {
    if (!note) return;

    try {
      await togglePin(note.id, note.isPinned);

      setNote((currentNote) =>
        currentNote
          ? {
              ...currentNote,
              isPinned: !currentNote.isPinned,
            }
          : null
      );

      setMenuVisible(false);
    } catch (error) {
      console.error("Failed to toggle pin:", error);
      Alert.alert(
        "Error",
        "Failed to update the note. Please try again."
      );
    }
  }

  async function handleToggleFavorite() {
    if (!note) return;

    try {
      await toggleFavorite(note.id, note.isFavorite);

      setNote((currentNote) =>
        currentNote
          ? {
              ...currentNote,
              isFavorite: !currentNote.isFavorite,
            }
          : null
      );

      setMenuVisible(false);
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      Alert.alert(
        "Error",
        "Failed to update the note. Please try again."
      );
    }
  }

  function handleChangeColor() {
    setMenuVisible(false);
    setColorPickerVisible(true);
  }

  async function handleSelectColor(color: Note["color"]) {
    if (!note) return;

    try {
      await updateNoteColor(note.id, color);

      setNote((currentNote) =>
        currentNote
          ? {
              ...currentNote,
              color,
            }
          : null
      );

      setColorPickerVisible(false);
    } catch (error) {
      console.error("Failed to update note color:", error);
      Alert.alert(
        "Error",
        "Failed to change note color. Please try again."
      );
    }
  }

  function handleDelete() {
    if (!note) return;

    setMenuVisible(false);

    Alert.alert(
      "Delete Note",
      "Are you sure you want to delete this note?",
      [
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
      ]
    );
  }

  function handleEdit() {
    if (!note) return;

    setMenuVisible(false);

    navigation.navigate("NoteEditor", {
      noteId: note.id,
    });
  }

  async function handleKeepMyVersion() {
    try {
      const success = await resolveKeepMyVersion(noteId);

      if (!success) {
        Alert.alert(
          "Conflict remains",
          "We couldn't safely resolve this conflict. Your local note is preserved."
        );
        return;
      }

      setSyncStatus(getLocalNoteSyncStatus(noteId));

      Alert.alert(
        "Sync complete",
        "Your local version has been synchronized."
      );
    } catch (error) {
      console.error("Failed to keep local version:", error);
      Alert.alert("Error", "Couldn't resolve the conflict.");
    }
  }

  async function handleKeepCloudVersion() {
    try {
      const success = await resolveKeepCloudVersion(noteId);

      if (!success) {
        Alert.alert(
          "Conflict remains",
          "We couldn't load the cloud version. Your local note is preserved."
        );
        return;
      }

      const localNote = getLocalNote(noteId);

      setNote(localNote);
      setSyncStatus(getLocalNoteSyncStatus(noteId));

      Alert.alert(
        "Cloud version restored",
        "The local note now matches the cloud version."
      );
    } catch (error) {
      console.error("Failed to keep cloud version:", error);
      Alert.alert("Error", "Couldn't restore the cloud version.");
    }
  }

  if (!note) {
    return (
      <View style={styles.container}>
        <Text style={styles.content}>Note not found.</Text>
      </View>
    );
  }

  const isDefaultColor =
    !note.color || note.color === "default";

  const noteTextColor = isDefaultColor
    ? colors.text
    : "#202020";

  const noteSecondaryTextColor = isDefaultColor
    ? colors.secondaryText
    : "#565656";

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Note</Text>

        <Pressable
          style={styles.menuButton}
          onPress={() => setMenuVisible((current) => !current)}
          accessibilityRole="button"
          accessibilityLabel="Note actions"
          accessibilityHint="Opens actions for this note"
          hitSlop={8}
        >
          <Ionicons
            name="ellipsis-vertical"
            size={24}
            color={colors.text}
          />
        </Pressable>
      </View>

      {/* Sync conflict notice */}
      {syncStatus === "conflict" && (
        <View style={styles.conflictNotice}>
          <Ionicons
            name="warning-outline"
            size={22}
            color={colors.primary}
          />

          <View style={styles.conflictTextContainer}>
            <Text style={styles.conflictTitle}>
              Sync conflict
            </Text>

            <Text style={styles.conflictMessage}>
              This note has a different version in the cloud.
              Your local version is preserved.
            </Text>

            <View style={styles.conflictActions}>
              <Pressable
                style={styles.conflictButton}
                onPress={handleKeepMyVersion}
                accessibilityRole="button"
              >
                <Text style={styles.conflictButtonText}>
                  Keep my version
                </Text>
              </Pressable>

              <Pressable
                style={styles.conflictButton}
                onPress={handleKeepCloudVersion}
                accessibilityRole="button"
              >
                <Text style={styles.conflictButtonText}>
                  Keep cloud version
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* Note content */}
      <View
        style={[
          styles.contentContainer,
          {
            backgroundColor:
              noteColors[note.color] ?? colors.background,
          },
        ]}
      >
        <View style={styles.titleRow}>
          <Text
            style={[
              styles.title,
              { color: noteTextColor },
            ]}
          >
            {note.title}
          </Text>

          {note.isPinned && (
            <Ionicons
              name="pin"
              size={20}
              color={isDefaultColor ? colors.primary : "#334155"}
              style={styles.pinIndicator}
            />
          )}

          {note.isFavorite && (
            <Ionicons
              name="star"
              size={20}
              color={isDefaultColor ? colors.primary : "#334155"}
              style={styles.pinIndicator}
            />
          )}
        </View>

        <Text
          style={[
            styles.date,
            { color: noteSecondaryTextColor },
          ]}
        >
          {note.updatedAt
            ? `Updated ${formatDate(note.updatedAt)}`
            : `Created ${formatDate(note.createdAt)}`}
        </Text>

        <Text
          style={[
            styles.content,
            { color: noteTextColor },
          ]}
        >
          {note.content}
        </Text>
      </View>

      {/* Edit button */}
      <Pressable
        style={styles.editButton}
        onPress={handleEdit}
        accessibilityRole="button"
        accessibilityLabel="Edit note"
        hitSlop={8}
      >
        <Ionicons
          name="pencil-outline"
          size={28}
          color={colors.white}
        />
      </Pressable>

      {/* Note action menu */}
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

      {/* Note color picker */}
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

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    header: {
      minHeight: 56,
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

    conflictNotice: {
      flexDirection: "row",
      alignItems: "flex-start",
      backgroundColor: colors.surface,
      padding: spacing.md,
      margin: spacing.md,
      borderRadius: 10,
      gap: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },

    conflictTextContainer: {
      flex: 1,
    },

    conflictTitle: {
      fontSize: typography.body,
      fontWeight: typography.bold,
      color: colors.text,
      marginBottom: 4,
    },

    conflictMessage: {
      fontSize: typography.caption,
      color: colors.secondaryText,
      lineHeight: 20,
    },

    conflictActions: {
      width: "100%",
      gap: spacing.sm,
      marginTop: spacing.sm,
    },

    conflictButton: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },

    conflictButtonText: {
      color: colors.primary,
      fontSize: typography.caption,
      fontWeight: typography.bold,
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
    },

    pinIndicator: {
      marginLeft: spacing.sm,
    },

    date: {
      fontSize: typography.caption,
      marginBottom: spacing.xl,
    },

    content: {
      fontSize: typography.body,
      lineHeight: 27,
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
}
