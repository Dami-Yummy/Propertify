
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Directory, File, Paths } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useSQLiteContext } from "expo-sqlite";

import { createProperty } from "../../../database/propertyQueries";

export default function CreatePropertyScreen() {
  const db = useSQLiteContext();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] =
    useState<ImagePicker.ImagePickerAsset | null>(null);
  const [saving, setSaving] = useState(false);

  // Choose an image from the phone's gallery
  const pickImage = async () => {
    try {
      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          quality: 0.8,
        });

      if (!result.canceled && result.assets.length > 0) {
        setImage(result.assets[0]);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not select an image.");
    }
  };

  // Copy selected image into persistent app storage
  const saveImageLocally = async (
    selectedImage: ImagePicker.ImagePickerAsset
  ): Promise<string> => {
    const directory = new Directory(Paths.document, "properties");

    if (!directory.exists) {
      directory.create();
    }

    const extension =
      selectedImage.mimeType === "image/png" ? "png" : "jpg";

    const filename =
      `property_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}.${extension}`;

    const source = new File(selectedImage.uri);
    const destination = new File(directory, filename);

    await source.copy(destination);

    return destination.uri;
  };

  const handleSave = async () => {
    if (!title.trim() || !price.trim()) {
      Alert.alert("Missing Details", "Enter a title and price.");
      return;
    }

    const numericPrice = Number(price);

    if (
      !Number.isFinite(numericPrice) ||
      numericPrice < 0
    ) {
      Alert.alert("Invalid Price", "Enter a valid price.");
      return;
    }

    let savedImageUri: string | null = null;

    try {
      setSaving(true);

      if (image) {
        savedImageUri = await saveImageLocally(image);
      }

      await createProperty(db, {
        title: title.trim(),
        price: numericPrice,
        location: location.trim(),
        description: description.trim(),
        image_uri: savedImageUri,
      });

      Alert.alert("Success", "Property saved successfully!");

      setTitle("");
      setPrice("");
      setLocation("");
      setDescription("");
      setImage(null);
    } catch (error) {
      console.error("Save failed:", error);

      // Remove the copied image if database saving fails.
      if (savedImageUri) {
        try {
          new File(savedImageUri).delete();
        } catch (cleanupError) {
          console.error("Image cleanup failed:", cleanupError);
        }
      }

      Alert.alert("Error", "Failed to save property.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Create Property</Text>

      <TextInput
        style={styles.input}
        placeholder="Property Title"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={styles.input}
        placeholder="Price (LKR)"
        keyboardType="numeric"
        value={price}
        onChangeText={setPrice}
      />

      <TextInput
        style={styles.input}
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
      />

      <TextInput
        style={[styles.input, styles.description]}
        placeholder="Description"
        multiline
        value={description}
        onChangeText={setDescription}
      />

      <Text style={styles.label}>Property Image</Text>

      <TouchableOpacity
        style={styles.imagePicker}
        onPress={pickImage}
      >
        {image ? (
          <Image
            source={{ uri: image.uri }}
            style={styles.preview}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePickerText}>
              + Add Property Image
            </Text>
            <Text style={styles.hint}>
              Tap to select from gallery
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {image && (
        <TouchableOpacity
          onPress={() => setImage(null)}
          style={styles.removeButton}
        >
          <Text style={styles.removeText}>
            Remove Image
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.button, saving && { opacity: 0.6 }]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.buttonText}>
          {saving ? "Saving..." : "Save Property"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: "#FFFFFF",
    flexGrow: 1,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    marginTop: 30
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 15,
  },
  description: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  imagePicker: {
    height: 190,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderStyle: "dashed",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 10,
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },
  imagePickerText: {
    color: "#3985D6",
    fontSize: 16,
    fontWeight: "600",
  },
  hint: {
    color: "#777777",
    marginTop: 8,
  },
  preview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  removeButton: {
    alignSelf: "flex-end",
    marginBottom: 15,
  },
  removeText: {
    color: "#D93025",
  },
  button: {
    backgroundColor: "#3985D6",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});
