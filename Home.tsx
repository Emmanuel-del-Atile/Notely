import {
  Pressable,
  Text,
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert,
  AccessibilityInfo,
} from "react-native";

import {
  getMyNotes,
  getCachedNotes,
  deleteNote,
  togglePin,
  toggleFavorite,
  updateNoteColor,
} from "./services/notes";

import NoteColorPicker from "./components/NoteColorPicker";
import NoteActionMenu from "./components/NoteActionMenu";

import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useState, useCallback } from "react";

import type { Note } from "./types/note";
import { formatDate } from "./utils/date";
import { searchNotes } from "./utils/noteHelper";

import { typography, spacing } from "./theme";
import { useTheme } from "./theme/ThemeContext";
import type { ThemeColors } from "./theme/colors";

type ScreenStatus = "loading" | "success" | "error";

type NoteGroup = {
  title: string;
  notes: Note[];
};

function getDateLabel(date: Date): string {
  const now = new Date();

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const noteDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const difference = today.getTime() - noteDay.getTime();
  const oneDay = 24 * 60 * 60 * 1000;

  if (difference >= 0 && difference < oneDay) {
    return "Today";
  }

  if (difference >= oneDay && difference < oneDay * 2) {
    return "Yesterday";
  }

  return date.toLocaleDateString(undefined, {
    month: "long",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function groupNotesByDate(notes: Note[]): NoteGroup[] {
  const groups = new Map<string, Note[]>();

  const sorted = [...notes].sort((a, b) => {
    if (a.isPinned !== b.isPinned) {
      return a.isPinned ? -1 : 1;
    }

    const dateA = a.updatedAt?.getTime() ?? a.createdAt?.getTime() ?? 0;

    const dateB = b.updatedAt?.getTime() ?? b.createdAt?.getTime() ?? 0;

    return dateB - dateA;
  });

  for (const note of sorted) {
    const date = note.updatedAt ?? note.createdAt ?? new Date();
    const label = getDateLabel(date);

    if (!groups.has(label)) {
      groups.set(label, []);
    }

    groups.get(label)!.push(note);
  }

  return Array.from(groups.entries()).map(([title, groupedNotes]) => ({
    title,
    notes: groupedNotes,
  }));
}

export default function Home({ navigation }: any) {
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
  const [searchText, setSearchText] = useState("");

  const [status, setStatus] = useState<ScreenStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function load() {
        const cachedNotes = getCachedNotes();

        if (cachedNotes) {
          if (active) {
            setNotes(cachedNotes);
            setStatus("success");
          }

          try {
            const freshNotes = await getMyNotes(true);

            if (active) {
              setNotes(freshNotes);
            }
          } catch (error) {
            console.error("Background refresh failed:", error);
          }

          return;
        }

        setStatus("loading");
        setErrorMessage(null);

        try {
          const data = await getMyNotes();

          if (active) {
            setNotes(data);
            setStatus("success");
          }
        } catch (error) {
          console.error("Failed to load notes:", error);

          if (active) {
            setErrorMessage("Failed to load notes. Please try again.");
            setStatus("error");

            AccessibilityInfo.announceForAccessibility(
              "Failed to load notes. Please try again.",
            );
          }
        }
      }

      void load();

      return () => {
        active = false;
      };
    }, []),
  );

  const filteredNotes = searchNotes(notes, searchText);
  const visibleNotes = searchText.trim() ? filteredNotes : notes;
  const noteGroups = groupNotesByDate(visibleNotes);

  async function handleTogglePin(note: Note) {
    try {
      await togglePin(note.id, note.isPinned);

      setNotes((current) =>
        current.map((item) =>
          item.id === note.id ? { ...item, isPinned: !item.isPinned } : item,
        ),
      );

      setSelectedNote(null);

      AccessibilityInfo.announceForAccessibility(
        note.isPinned ? "Note unpinned." : "Note pinned.",
      );
    } catch (error) {
      console.error("Failed to toggle pin:", error);
      Alert.alert("Couldn't update note", "Please try again.");
    }
  }

  async function handleToggleFavorite(note: Note) {
    try {
      await toggleFavorite(note.id, note.isFavorite);

      setNotes((current) =>
        current.map((item) =>
          item.id === note.id
            ? { ...item, isFavorite: !item.isFavorite }
            : item,
        ),
      );

      setSelectedNote(null);

      AccessibilityInfo.announceForAccessibility(
        note.isFavorite ? "Removed from favorites." : "Added to favorites.",
      );
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      Alert.alert("Couldn't update note", "Please try again.");
    }
  }

  function handleEdit(note: Note) {
    setSelectedNote(null);
    navigation.navigate("NoteEditor", { note });
  }

  function handleChangeColor() {
    setColorPickerVisible(true);
  }

  async function handleSelectColor(color: Note["color"]) {
    if (!selectedNote) return;

    try {
      await updateNoteColor(selectedNote.id, color);

      setNotes((current) =>
        current.map((item) =>
          item.id === selectedNote.id ? { ...item, color } : item,
        ),
      );

      setSelectedNote(null);
      setColorPickerVisible(false);

      AccessibilityInfo.announceForAccessibility("Note color updated.");
    } catch (error) {
      console.error("Failed to update note color:", error);
      Alert.alert("Couldn't change color", "Please try again.");
    }
  }

  function confirmDeleteNote(note: Note) {
    Alert.alert(
      "Delete note?",
      `Are you sure you want to delete "${note.title}"?`,
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
                Alert.alert("Couldn't delete note", "Please try again.");
                return;
              }

              setNotes((current) =>
                current.filter((item) => item.id !== note.id),
              );

              AccessibilityInfo.announceForAccessibility("Note deleted.");
            } catch (error) {
              console.error("Failed to delete note:", error);
              Alert.alert("Couldn't delete note", "Please try again.");
            }
          },
        },
      ],
    );
  }

  async function retryLoadingNotes() {
    setStatus("loading");
    setErrorMessage(null);

    try {
      const data = await getMyNotes();
      setNotes(data);
      setStatus("success");
    } catch (error) {
      console.error("Failed to reload notes:", error);
      setErrorMessage("Failed to load notes. Please try again.");
      setStatus("error");
    }
  }

  if (status === "loading") {
    return (
      <SafeAreaView style={styles.container}>
        <View
          style={styles.statusContainer}
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel="Loading your notes"
        >
          <Text style={styles.statusText} accessibilityLiveRegion="polite">
            Loading your notes...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (status === "error") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.statusContainer}>
          <View style={styles.emptyIcon} accessible={false}>
            <Ionicons
              name="cloud-offline-outline"
              size={32}
              color={colors.primary}
            />
          </View>

          <Text style={styles.statusText} accessibilityRole="alert">
            {errorMessage ?? "Something went wrong."}
          </Text>

          <Pressable
            style={styles.retryButton}
            onPress={retryLoadingNotes}
            accessibilityRole="button"
            accessibilityLabel="Retry loading notes"
            hitSlop={8}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.brandContainer}>
          <View style={styles.brandIcon} accessible={false}>
            <Ionicons name="document-text" size={23} color={colors.primary} />
          </View>

          <Text style={styles.brand} accessibilityRole="header">
            Notely
          </Text>
        </View>

        {notes.length > 0 && (
          <View style={styles.headerActions}>
            <Pressable
              style={styles.headerIconButton}
              onPress={() => navigation.navigate("Favorites")}
              accessibilityRole="button"
              accessibilityLabel="View favorite notes"
              hitSlop={6}
            >
              <Ionicons
                name="star-outline"
                size={23}
                color={colors.text}
                accessible={false}
              />
            </Pressable>

            <View
              style={styles.countBadge}
              accessible
              accessibilityLabel={`${notes.length} ${
                notes.length === 1 ? "note" : "notes"
              }`}
            >
              <Text style={styles.countNumber}>{notes.length}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Search */}
      {notes.length > 0 && (
        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={21}
            color={colors.mutedText}
            accessible={false}
          />

          <TextInput
            style={styles.searchInput}
            placeholder="Search your notes..."
            placeholderTextColor={colors.mutedText}
            value={searchText}
            onChangeText={setSearchText}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            accessibilityLabel="Search your notes"
            accessibilityHint="Enter words to filter your notes"
          />

          {searchText.length > 0 && (
            <Pressable
              onPress={() => setSearchText("")}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              hitSlop={8}
              style={styles.clearSearchButton}
            >
              <Ionicons
                name="close-circle"
                size={21}
                color={colors.mutedText}
                accessible={false}
              />
            </Pressable>
          )}
        </View>
      )}

      {/* Notes or empty state */}
      {notes.length > 0 ? (
        <ScrollView
          style={styles.notesScroll}
          contentContainerStyle={styles.notesContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          accessibilityLabel="Your notes"
        >
          {visibleNotes.length === 0 ? (
            <View style={styles.searchEmptyState}>
              <Ionicons
                name="search-outline"
                size={42}
                color={colors.mutedText}
                accessible={false}
              />

              <Text style={styles.emptyTitle} accessibilityRole="header">
                No notes found
              </Text>

              <Text style={styles.emptyMessage}>Try another search term.</Text>
            </View>
          ) : (
            noteGroups.map((group) => (
              <View key={group.title} style={styles.noteGroup}>
                <Text style={styles.sectionTitle} accessibilityRole="header">
                  {searchText.trim() ? "Search results" : group.title}
                </Text>

                <View style={styles.noteGroupCard}>
                  {group.notes.map((note, index) => {
                    const isDefaultColor =
                      !note.color || note.color === "default";

                    return (
                      <View key={note.id}>
                        <Pressable
                          style={[
                            styles.noteItem,
                            {
                              backgroundColor:
                                noteColors[note.color] ?? colors.surface,
                            },
                          ]}
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
                            note.isFavorite ? "Favorite" : "",
                          ]
                            .filter(Boolean)
                            .join(". ")}
                          accessibilityHint="Double tap to open. Long press to show note actions."
                        >
                          <View style={styles.noteTitleRow}>
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

                            <View
                              style={styles.noteIndicators}
                              accessible={false}
                            >
                              {note.isPinned && (
                                <Ionicons
                                  name="pin"
                                  size={17}
                                  color={
                                    isDefaultColor ? colors.primary : "#334155"
                                  }
                                />
                              )}

                              {note.isFavorite && (
                                <Ionicons
                                  name="star"
                                  size={17}
                                  color={
                                    isDefaultColor ? colors.primary : "#334155"
                                  }
                                />
                              )}
                            </View>
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

                          <View
                            style={styles.noteMeta}
                            accessible
                            accessibilityLabel={`Last updated ${formatDate(
                              note.updatedAt ?? note.createdAt,
                            )}`}
                          >
                            <Ionicons
                              name="time-outline"
                              size={14}
                              color={
                                isDefaultColor ? colors.mutedText : "#666666"
                              }
                              accessible={false}
                            />

                            <Text
                              style={[
                                styles.noteDate,
                                {
                                  color: isDefaultColor
                                    ? colors.mutedText
                                    : "#666666",
                                },
                              ]}
                            >
                              {formatDate(note.updatedAt ?? note.createdAt)}
                            </Text>

                            <View
                              style={[
                                styles.metaDot,
                                {
                                  backgroundColor: isDefaultColor
                                    ? colors.mutedText
                                    : "#888888",
                                },
                              ]}
                            />

                            <Text
                              style={[
                                styles.noteCategory,
                                {
                                  color: isDefaultColor
                                    ? colors.secondaryText
                                    : "#666666",
                                },
                              ]}
                            >
                              Note
                            </Text>
                          </View>
                        </Pressable>

                        {index < group.notes.length - 1 && (
                          <View style={styles.noteDivider} accessible={false} />
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            ))
          )}
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyIllustration} accessible={false}>
            <Ionicons
              name="document-text-outline"
              size={43}
              color={colors.primary}
            />

            <View style={styles.emptySparkle}>
              <Ionicons name="sparkles" size={19} color={colors.primary} />
            </View>
          </View>

          <Text style={styles.emptyTitle} accessibilityRole="header">
            Nothing here yet
          </Text>

          <Text style={styles.emptyMessage}>
            Capture your first thought, idea or reminder with Notely.
          </Text>
        </View>
      )}

      {/* Floating create button */}
      <Pressable
        style={styles.createButton}
        onPress={() => navigation.navigate("NoteEditor")}
        accessibilityRole="button"
        accessibilityLabel="Create a new note"
        accessibilityHint="Opens the note editor"
        hitSlop={8}
      >
        <Ionicons
          name="add"
          size={34}
          color={colors.primary}
          accessible={false}
        />
      </Pressable>

      {/* Note action menu */}
      {selectedNote && (
        <NoteActionMenu
          note={selectedNote}
          onPin={() => handleTogglePin(selectedNote)}
          onFavorite={() => handleToggleFavorite(selectedNote)}
          onColor={handleChangeColor}
          onEdit={() => handleEdit(selectedNote)}
          onDelete={() => {
            const note = selectedNote;
            setSelectedNote(null);
            confirmDeleteNote(note);
          }}
          onClose={() => setSelectedNote(null)}
        />
      )}

      {/* Color picker */}
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
      paddingHorizontal: spacing.lg,
    },

    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: spacing.lg,
      paddingBottom: spacing.xl,
    },

    brandContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
    },

    brandIcon: {
      width: 43,
      height: 43,
      borderRadius: 14,
      backgroundColor: colors.primaryLight,
      justifyContent: "center",
      alignItems: "center",
    },

    brand: {
      fontSize: typography.title,
      fontWeight: typography.bold,
      color: colors.text,
    },

    headerActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },

    headerIconButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "center",
      alignItems: "center",
    },

    countBadge: {
      minWidth: 42,
      height: 42,
      paddingHorizontal: spacing.sm,
      borderRadius: 21,
      backgroundColor: colors.primaryLight,
      justifyContent: "center",
      alignItems: "center",
    },

    countNumber: {
      fontSize: typography.body,
      fontWeight: typography.bold,
      color: colors.primary,
    },

    searchContainer: {
      minHeight: 54,
      backgroundColor: colors.surface,
      borderRadius: 17,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.lg,
      gap: spacing.md,
      marginBottom: spacing.xl,
    },

    searchInput: {
      flex: 1,
      fontSize: typography.body,
      color: colors.text,
      minHeight: 52,
    },

    clearSearchButton: {
      width: 40,
      height: 44,
      justifyContent: "center",
      alignItems: "center",
    },

    notesScroll: {
      flex: 1,
    },

    notesContainer: {
      paddingBottom: 120,
    },

    noteGroup: {
      marginBottom: spacing.xl,
    },

    sectionTitle: {
      fontSize: typography.heading,
      fontWeight: typography.bold,
      color: colors.text,
      marginBottom: spacing.md,
    },

    noteGroupCard: {
      borderRadius: 19,
      overflow: "hidden",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },

    noteItem: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.lg,
      minHeight: 100,
    },

    noteTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },

    noteTitle: {
      flex: 1,
      fontSize: typography.subheading,
      fontWeight: typography.semibold,
    },

    noteIndicators: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },

    notePreview: {
      fontSize: typography.bodySmall,
      lineHeight: 21,
      marginBottom: spacing.md,
    },

    noteMeta: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
    },

    noteDate: {
      fontSize: typography.caption,
    },

    noteCategory: {
      fontSize: typography.caption,
    },

    metaDot: {
      width: 3,
      height: 3,
      borderRadius: 2,
      marginHorizontal: spacing.xs,
    },

    noteDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
      marginHorizontal: spacing.lg,
    },

    emptyState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.xxl,
      paddingBottom: 65,
    },

    emptyIllustration: {
      width: 100,
      height: 100,
      borderRadius: 32,
      backgroundColor: colors.primaryLight,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: spacing.xl,
    },

    emptySparkle: {
      position: "absolute",
      top: 8,
      right: 8,
    },

    emptyIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
      marginBottom: 16,
      backgroundColor: colors.primaryLight,
    },

    emptyTitle: {
      fontSize: typography.heading,
      fontWeight: typography.bold,
      color: colors.text,
      textAlign: "center",
      marginBottom: spacing.sm,
    },

    emptyMessage: {
      fontSize: typography.bodySmall,
      lineHeight: 22,
      color: colors.secondaryText,
      textAlign: "center",
      maxWidth: 290,
    },

    searchEmptyState: {
      alignItems: "center",
      paddingTop: 70,
      paddingHorizontal: spacing.xxl,
    },

    statusContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: spacing.lg,
    },

    statusText: {
      fontSize: typography.body,
      color: colors.text,
      textAlign: "center",
      marginBottom: spacing.md,
    },

    retryButton: {
      minHeight: 48,
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
    },

    retryButtonText: {
      fontSize: typography.body,
      color: colors.white,
      fontWeight: typography.semibold,
    },

    createButton: {
      position: "absolute",
      right: spacing.xl,
      bottom: spacing.xl,
      width: 62,
      height: 62,
      borderRadius: 31,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "center",
      alignItems: "center",
      elevation: 6,
      shadowColor: "#000000",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },
  });
}
