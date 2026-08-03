# General instructions

All texts inside docs or comments should be in English.

Consult the README.md file for general information about the project.

Consult the docs folder for more context on the project.

# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.

# Code Conventions

## TSX Components

- Define prop types with an `interface` prefixed with `I` (e.g. `IProps`).
- Type the component's `props` parameter directly in the function signature, then destructure the needed fields inside the component body.
- Keep the `StyleSheet.create` styles object separate from and below the component definition.

```tsx
import { StyleSheet, Text, View } from "react-native";

interface IProps {
  title: string;
}

export default function ScreenTitle(props: IProps) {
  const { title } = props;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
});
```
