import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";

import type { NoteColor } from "../types/note";

import {
  colors,
  typography,
  spacing,
} from "../theme";

type NoteColorPickerProps = {
  currentColor: NoteColor;
  onSelect: (color: NoteColor) => void;
  onClose: () => void;
};

const colorOptions: {
  value: NoteColor;
  label: string;
  color: string;
}[] = [
  {
    value: "default",
    label: "Default",
    color: colors.surface,
  },
  {
    value: "yellow",
    label: "Yellow",
    color: "#FFF3A3",
  },
  {
    value: "blue",
    label: "Blue",
    color: "#BDE0FE",
  },
  {
    value: "green",
    label: "Green",
    color: "#C7F9CC",
  },
  {
    value: "pink",
    label: "Pink",
    color: "#FFC8DD",
  },
];

export default function NoteColorPicker({
  currentColor,
  onSelect,
  onClose,
}: NoteColorPickerProps) {
  return (
    <View style={styles.overlay}>

      <Pressable
        style={styles.backdrop}
        onPress={onClose}
      />

      <View style={styles.picker}>

        <Text style={styles.title}>
          Note Color
        </Text>

        <Text style={styles.subtitle}>
          Choose a color for this note
        </Text>

        <View style={styles.options}>

          {colorOptions.map((option) => {
            const isSelected =
              currentColor === option.value;

            return (
              <Pressable
                key={option.value}
                style={styles.option}
                onPress={() =>
                  onSelect(option.value)
                }
              >

                <View
                  style={[
                    styles.colorCircle,
                    {
                      backgroundColor:
                        option.color,
                    },
                    isSelected &&
                      styles.selectedCircle,
                  ]}
                />

                <Text style={styles.label}>
                  {option.label}
                </Text>

              </Pressable>
            );
          })}

        </View>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 200,
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.15)",
  },

  picker: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.xxl,
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: spacing.lg,

    elevation: 10,

    shadowColor: colors.text,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },

  title: {
    fontSize: typography.heading,
    fontWeight: typography.bold,
    color: colors.text,
  },

  subtitle: {
    fontSize: typography.bodySmall,
    color: colors.secondaryText,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },

  options: {
    gap: spacing.sm,
  },

  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },

  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.md,
  },

  selectedCircle: {
    borderWidth: 3,
    borderColor: colors.primary,
  },

  label: {
    fontSize: typography.body,
    color: colors.text,
  },
});