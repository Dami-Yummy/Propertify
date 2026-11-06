
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
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
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";

import {
    getPropertyById,
    updateProperty,
    type Property,
} from "../../../database/propertyQueries";

export default function EditPropertyScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [property, setProperty] = useState<Property | null>(null);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);

  const [newImage, setNewImage] =
    useState<ImagePicker.ImagePickerAsset | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load existing property information
  useEffect(() => {
    let active = true;

    async function loadProperty() {
      try {
        const propertyId = Number(id);

        if (!Number.isSafeInteger(propertyId) || propertyId <= 0) {
          throw new Error("Invalid property ID");
        }

        const data = await getPropertyById(db, propertyId);

        if (!active) return;

        if (!data) {
          Alert.alert("Not Found", "Property does not exist.");
          return;
        }

        setProperty(data);
        setTitle(data.title);
        setPrice(String(data.price));
        setLocation(data.location ?? "");
        setDescription(data.description ?? "");
        setImageUri(data.image_uri);
      } catch (error) {
        console.error("Failed to load property:", error);
        if (active) {
          Alert.alert("Error", "Could not load property.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProperty();

    return () => {
      active = false;
    };
  }, [db, id]);

  // Select a replacement image
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        const selected = result.assets[0];

        setNewImage(selected);
        setImageUri(selected.uri);
      }
    } catch (error) {
      console.error("Image selection failed:", error);
      Alert.alert("Error", "Could not select an image.");
    }
  };

  // Store new image permanently
  const saveImageLocally = async (
    selected: ImagePicker.ImagePickerAsset
  ): Promise<string> => {
    const directory = new Directory(Paths.document, "properties");

    if (!directory.exists) {
      directory.create();
    }

    const extension =
      selected.mimeType === "image/png" ? "png" : "jpg";

    const filename =
      `property_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}.${extension}`;

    const source = new File(selected.uri);
    const destination = new File(directory, filename);

    await source.copy(destination);

    return destination.uri;
  };

  // Update the existing SQLite record
  const handleUpdate = async () => {
    if (!property || saving) return;

    if (!title.trim() || !price.trim()) {
      Alert.alert("Missing Details", "Enter a title and price.");
      return;
    }

    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      Alert.alert("Invalid Price", "Enter a valid price.");
      return;
    }

    let newlySavedImage: string | null = null;

    try {
      setSaving(true);

      let finalImageUri = property.image_uri;

      if (newImage) {
        newlySavedImage = await saveImageLocally(newImage);
        finalImageUri = newlySavedImage;
      }

      await updateProperty(db, property.id, {
        title: title.trim(),
        price: numericPrice,
        location: location.trim(),
        description: description.trim(),
        image_uri: finalImageUri,
        property_type: property.property_type,
      });

      // The record is now updated.
      // Return to the details screen, which reloads on focus.
      router.back();
    } catch (error) {
      console.error("Property update failed:", error);

      // Remove any newly copied image if UPDATE fails
      if (newlySavedImage) {
        try {
          new File(newlySavedImage).delete();
        } catch (cleanupError) {
          console.error("Image cleanup failed:", cleanupError);
        }
      }

      Alert.alert("Error", "Could not update the property.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3985D6" />
      </View>
    );
  }

  if (!property) {
    return (
      <View style={styles.center}>
        <Text>Property not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Edit Property</Text>

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
        style={[styles.input, styles.descriptionInput]}
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
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.preview}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imageText}>
              + Select Property Image
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <Text style={styles.hint}>
        Tap the image to replace it.
      </Text>

      <TouchableOpacity
        style={[styles.button, saving && { opacity: 0.6 }]}
        onPress={handleUpdate}
        disabled={saving}
      >
        <Text style={styles.buttonText}>
          {saving ? "Updating..." : "Update Property"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 50,
    backgroundColor: "#FFFFFF",
    flexGrow: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 15,
  },
  descriptionInput: {
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
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },
  preview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageText: {
    color: "#3985D6",
    fontWeight: "600",
  },
  hint: {
    marginTop: 8,
    color: "#777777",
    fontSize: 13,
  },
  button: {
    backgroundColor: "#3985D6",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 25,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
