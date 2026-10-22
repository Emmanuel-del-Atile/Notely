
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import type { Note } from "../types/note";

import { typography, spacing } from "../theme";
import { useTheme } from "../theme/ThemeContext";
import type { ThemeColors } from "../theme/colors";

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
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  return (
    <View style={styles.overlay}>
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close note actions"
      />

      <View
        style={styles.menu}
        accessibilityLabel="Note actions"
      >
        {/* Pin */}
        <Pressable
          style={({ pressed }) => [
            styles.menuItem,
            pressed && styles.menuItemPressed,
          ]}
          onPress={onPin}
          accessibilityRole="button"
          accessibilityLabel={note.isPinned ? "Unpin note" : "Pin note"}
        >
          <Ionicons
            name={note.isPinned ? "pin" : "pin-outline"}
            size={20}
            color={colors.text}
          />

          <Text style={styles.menuText}>
            {note.isPinned ? "Unpin" : "Pin"}
          </Text>
        </Pressable>

        {/* Favorite */}
        <Pressable
          style={({ pressed }) => [
            styles.menuItem,
            pressed && styles.menuItemPressed,
          ]}
          onPress={onFavorite}
          accessibilityRole="button"
          accessibilityLabel={
            note.isFavorite
              ? "Remove from favorites"
              : "Add to favorites"
          }
        >
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
        <Pressable
          style={({ pressed }) => [
            styles.menuItem,
            pressed && styles.menuItemPressed,
          ]}
          onPress={onColor}
          accessibilityRole="button"
          accessibilityLabel="Change note color"
        >
          <Ionicons
            name="color-palette-outline"
            size={20}
            color={colors.text}
          />

          <Text style={styles.menuText}>Change Color</Text>
        </Pressable>

        {/* Edit */}
        <Pressable
          style={({ pressed }) => [
            styles.menuItem,
            pressed && styles.menuItemPressed,
          ]}
          onPress={onEdit}
          accessibilityRole="button"
          accessibilityLabel="Edit note"
        >
          <Ionicons
            name="create-outline"
            size={20}
            color={colors.text}
          />

          <Text style={styles.menuText}>Edit</Text>
        </Pressable>

        {/* Delete */}
        <Pressable
          style={({ pressed }) => [
            styles.menuItem,
            pressed && styles.deleteItemPressed,
          ]}
          onPress={onDelete}
          accessibilityRole="button"
          accessibilityLabel="Delete note"
        >
          <Ionicons
            name="trash-outline"
            size={20}
            color={colors.danger}
          />

          <Text style={[styles.menuText, styles.deleteText]}>
            Delete
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
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
      borderRadius: 14,
      paddingVertical: spacing.xs,
      borderWidth: 1,
      borderColor: colors.border,
      elevation: 8,
      shadowColor: colors.black,
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.18,
      shadowRadius: 6,
    },

    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      gap: spacing.md,
      minHeight: 48,
    },

    menuItemPressed: {
      backgroundColor: colors.inputBackground,
    },

    deleteItemPressed: {
      backgroundColor: colors.dangerLight,
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
}
