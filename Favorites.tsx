
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  AccessibilityInfo,
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { Ionicons } from "@expo/vector-icons";

import type { Note } from "./types/note";

import {
  getMyNotes,
  toggleFavorite,
  togglePin,
  deleteNote,
  updateNoteColor,
} from "./services/notes";

import NoteActionMenu from "./components/NoteActionMenu";
import NoteColorPicker from "./components/NoteColorPicker";

import { typography, spacing } from "./theme";
import { useTheme } from "./theme/ThemeContext";
import type { ThemeColors } from "./theme/colors";

export default function Favorites({ navigation }: any) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const noteColors: Record<string, string> = {
    default: colors.surface,
    yellow: "#FFF3A3",
    blue: "#BDE0FE",
    green: "#C7F9CC",
    pink: "#FFC8DD",
  };

  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadFavorites() {
        try {
          setLoading(true);

          const data = await getMyNotes();

          if (active) {
            setNotes(data.filter((note) => note.isFavorite));
          }
        } catch (error) {
          console.error("Failed to load favorites:", error);

          if (active) {
            Alert.alert("Error", "Failed to load favorites.");
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      }

      void loadFavorites();

      return () => {
        active = false;
      };
    }, [])
  );

  async function handleToggleFavorite(note: Note) {
    try {
      await toggleFavorite(note.id, note.isFavorite);

      setNotes((currentNotes) =>
        currentNotes.filter((item) => item.id !== note.id)
      );

      setSelectedNote(null);

      AccessibilityInfo.announceForAccessibility(
        "Removed from favorites."
      );
    } catch (error) {
      console.error("Failed to remove favorite:", error);
      Alert.alert("Error", "Failed to update favorite.");
    }
  }

  async function handleTogglePin(note: Note) {
    try {
      await togglePin(note.id, note.isPinned);

      setNotes((currentNotes) =>
        currentNotes.map((item) =>
          item.id === note.id
            ? { ...item, isPinned: !item.isPinned }
            : item
        )
      );

      setSelectedNote(null);

      AccessibilityInfo.announceForAccessibility(
        note.isPinned ? "Note unpinned." : "Note pinned."
      );
    } catch (error) {
      console.error("Failed to toggle pin:", error);
      Alert.alert("Error", "Failed to update note.");
    }
  }

  function handleEdit(note: Note) {
    setSelectedNote(null);

    navigation.navigate("NoteEditor", {
      noteId: note.id,
    });
  }

  function handleChangeColor() {
    setColorPickerVisible(true);
  }

  async function handleSelectColor(color: Note["color"]) {
    if (!selectedNote) return;

    try {
      await updateNoteColor(selectedNote.id, color);

      setNotes((currentNotes) =>
        currentNotes.map((item) =>
          item.id === selectedNote.id
            ? { ...item, color }
            : item
        )
      );

      setSelectedNote(null);
      setColorPickerVisible(false);

      AccessibilityInfo.announceForAccessibility(
        "Note color updated."
      );
    } catch (error) {
      console.error("Failed to change color:", error);
      Alert.alert("Error", "Failed to change note color.");
    }
  }

  function handleDelete(note: Note) {
    setSelectedNote(null);

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

              setNotes((currentNotes) =>
                currentNotes.filter((item) => item.id !== note.id)
              );

              AccessibilityInfo.announceForAccessibility(
                "Note deleted."
              );
            } catch (error) {
              console.error("Failed to delete note:", error);
              Alert.alert("Error", "Failed to delete note.");
            }
          },
        },
      ]
    );
  }

  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned !== b.isPinned) {
      return a.isPinned ? -1 : 1;
    }

    const dateA = a.updatedAt?.getTime() ?? a.createdAt?.getTime() ?? 0;
    const dateB = b.updatedAt?.getTime() ?? b.createdAt?.getTime() ?? 0;

    return dateB - dateA;
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text
            style={styles.statusText}
            accessibilityRole="progressbar"
            accessibilityLabel="Loading favorite notes"
          >
            Loading favorites...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title} accessibilityRole="header">
            Favorites
          </Text>

          <Text style={styles.subtitle}>
            Notes you've saved
          </Text>
        </View>

        <Ionicons
          name="star"
          size={28}
          color={colors.primary}
          accessible={false}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.notesContainer}
      >
        {sortedNotes.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="star-outline"
              size={64}
              color={colors.mutedText}
              accessible={false}
            />

            <Text
              style={styles.emptyTitle}
              accessibilityRole="header"
            >
              No favorites yet
            </Text>

            <Text style={styles.emptyMessage}>
              Long press a note and choose Favorite to save it here.
            </Text>
          </View>
        ) : (
          sortedNotes.map((note) => {
            const isDefaultColor =
              !note.color || note.color === "default";

            return (
              <View
                key={note.id}
                style={[
                  styles.noteCard,
                  {
                    backgroundColor:
                      noteColors[note.color] ?? colors.surface,
                  },
                ]}
              >
                <Pressable
                  onPress={() =>
                    navigation.navigate("NoteDetails", {
                      noteId: note.id,
                    })
                  }
                  onLongPress={() => setSelectedNote(note)}
                  delayLongPress={400}
                  accessibilityRole="button"
                  accessibilityLabel={[
                    note.title || "Untitled note",
                    note.content || "No preview text",
                    note.isPinned ? "Pinned" : "",
                    "Favorite",
                  ].filter(Boolean).join(". ")}
                  accessibilityHint="Double tap to open the note. Long press for note actions."
                >
                  <View style={styles.noteTop}>
                    <View
                      style={[
                        styles.noteDot,
                        {
                          backgroundColor: isDefaultColor
                            ? colors.primary
                            : "#334155",
                        },
                      ]}
                      accessible={false}
                    />

                    <Text
                      style={[
                        styles.noteTitle,
                        {
                          color: isDefaultColor
                            ? colors.text
                            : "#202020",
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {note.title || "Untitled note"}
                    </Text>

                    {note.isPinned && (
                      <Ionicons
                        name="pin"
                        size={18}
                        color={isDefaultColor ? colors.primary : "#334155"}
                        style={styles.pinIcon}
                        accessible={false}
                      />
                    )}

                    <Ionicons
                      name="star"
                      size={18}
                      color={isDefaultColor ? colors.primary : "#334155"}
                      style={styles.favoriteIcon}
                      accessible={false}
                    />
                  </View>

                  {note.content.trim() !== "" && (
                    <Text
                      style={[
                        styles.notePreview,
                        {
                          color: isDefaultColor
                            ? colors.secondaryText
                            : "#565656",
                        },
                      ]}
                      numberOfLines={2}
                    >
                      {note.content}
                    </Text>
                  )}
                </Pressable>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Action Menu */}
      {selectedNote && !colorPickerVisible && (
        <NoteActionMenu
          note={selectedNote}
          onPin={() => handleTogglePin(selectedNote)}
          onFavorite={() => handleToggleFavorite(selectedNote)}
          onColor={handleChangeColor}
          onEdit={() => handleEdit(selectedNote)}
          onDelete={() => handleDelete(selectedNote)}
          onClose={() => setSelectedNote(null)}
        />
      )}

      {/* Color Picker */}
      {colorPickerVisible && selectedNote && (
        <NoteColorPicker
          currentColor={selectedNote.color}
          onSelect={handleSelectColor}
          onClose={() => {
            setColorPickerVisible(false);
            setSelectedNote(null);
          }}
        />
      )}
    </SafeAreaView>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    header: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.lg,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.surface,
    },

    title: {
      fontSize: typography.title,
      fontWeight: typography.bold,
      color: colors.text,
    },

    subtitle: {
      marginTop: spacing.xs,
      fontSize: typography.bodySmall,
      color: colors.secondaryText,
    },

    notesContainer: {
      padding: spacing.lg,
      paddingBottom: spacing.xxl,
      flexGrow: 1,
    },

    noteCard: {
      borderRadius: 18,
      padding: spacing.lg,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },

    noteTop: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.sm,
    },

    noteDot: {
      width: 8,
      height: 8,
      borderRadius: 8,
      marginRight: spacing.sm,
    },

    noteTitle: {
      flex: 1,
      fontSize: typography.subheading,
      fontWeight: typography.semibold,
    },

    pinIcon: {
      marginLeft: spacing.sm,
    },

    favoriteIcon: {
      marginLeft: spacing.sm,
    },

    notePreview: {
      fontSize: typography.bodySmall,
      lineHeight: 20,
    },

    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },

    statusText: {
      fontSize: typography.body,
      color: colors.text,
    },

    emptyState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 100,
      paddingHorizontal: spacing.xxl,
    },

    emptyTitle: {
      marginTop: spacing.lg,
      fontSize: typography.heading,
      fontWeight: typography.bold,
      color: colors.text,
    },

    emptyMessage: {
      marginTop: spacing.sm,
      fontSize: typography.bodySmall,
      lineHeight: 21,
      color: colors.secondaryText,
      textAlign: "center",
    },
  });
}
