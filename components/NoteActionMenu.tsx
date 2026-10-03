import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import type { Note } from "../types/note";

import { colors, typography, spacing } from "../theme";

type NoteActionMenuProps = {
  note: Note;
  onPin: () => void;
  onFavorite: () => void;
  onColor: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
};

export default function NoteActionMenu({
  note,
  onPin,
  onFavorite,
  onColor,
  onEdit,
  onDelete,
  onClose,
}: NoteActionMenuProps) {
  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={styles.menu}>
        {/* Pin */}
        <Pressable style={styles.menuItem} onPress={onPin}>
          <Ionicons
            name={note.isPinned ? "pin" : "pin-outline"}
            size={20}
            color={colors.text}
          />

          <Text style={styles.menuText}>{note.isPinned ? "Unpin" : "Pin"}</Text>
        </Pressable>

        {/* Favorite */}
        <Pressable style={styles.menuItem} onPress={onFavorite}>
          <Ionicons
            name={note.isFavorite ? "star" : "star-outline"}
            size={20}
            color={colors.text}
          />

          <Text style={styles.menuText}>
            {note.isFavorite ? "Remove from favorites" : "Favorite"}
          </Text>
        </Pressable>

        {/* Color */}
        <Pressable style={styles.menuItem} onPress={onColor}>
          <Ionicons
            name="color-palette-outline"
            size={20}
            color={colors.text}
          />

          <Text style={styles.menuText}>Change Color</Text>
        </Pressable>

        {/* Edit */}
        <Pressable style={styles.menuItem} onPress={onEdit}>
          <Ionicons name="create-outline" size={20} color={colors.text} />

          <Text style={styles.menuText}>Edit</Text>
        </Pressable>

        {/* Delete */}
        <Pressable style={styles.menuItem} onPress={onDelete}>
          <Ionicons name="trash-outline" size={20} color={colors.danger} />

          <Text style={[styles.menuText, styles.deleteText]}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },

  menu: {
    position: "absolute",
    right: spacing.lg,
    top: spacing.lg,
    width: 240,

    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: spacing.xs,

    elevation: 8,

    shadowColor: colors.text,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,

    gap: spacing.md,
  },

  menuText: {
    flex: 1,
    fontSize: typography.body,
    color: colors.text,
  },

  deleteText: {
    color: colors.danger,
  },
});
