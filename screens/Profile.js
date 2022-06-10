import { Text, View, Image, Button } from "react-native";
import React, {
  Component,
  useContext,
  useEffect,
  useInsertionEffect,
  useState,
} from "react";
import { StatusBar } from "react-native-web";
import Constants from "expo-constants";
import { askForPermission, theme, uploadImage, pickImage } from "../utils";
import GlobalContext from "../context/Context";
import { TextInput, TouchableOpacity } from "react-native-gesture-handler";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { auth, db } from "../firebase";
import { updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function Profile() {
  const [displayName, setDisplayName] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [permissionStatus, setPermisssionStatus] = useState(null);

  useEffect(() => {
    //we have to do this, because we need an asyc function, but hooks (use effect)
    // don't allow aysnc functions. so we set-up an async function.
    (async () => {
      const status = await askForPermission();
      setPermisssionStatus(status);
    })();
  }, []);

  const {
    theme: { colors },
  } = useContext(GlobalContext);

  if (!permissionStatus) {
    return <Text>Loading...</Text>;
  }

  if (permissionStatus != "granted") {
    return <Text>You need to allow this persmission</Text>;
  }

  /** Uploads the image to Firebase */
  async function handlePress() {
    const user = auth.currentUser;
    let photoURL;
    if (selectedImage) {
      const { url } = await uploadImage(
        selectedImage,
        `images/${user.uid}`,
        "profilePicture"
      );
      photoURL = url;
    }
    const userData = {
      displayName,
      email: user.email,
    };

    if (photoURL) {
      userData.photoURL = photoURL;
    }

    console.log("ABOUT TO CALL PROMISE ALL......");
    await Promise.all([
      updateProfile(user, userData),
      setDoc(doc(db, "users", user.uid), { ...userData, uid: user.uid }),
    ]);
  }

  /** Handles the pressing on profile picture */
  async function handleProfilePicture() {
    const result = await pickImage();
    if (!result.cancelled) {
      setSelectedImage(result.uri);
    }
  }

  return (
    <React.Fragment>
      <StatusBar style="auto"></StatusBar>
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
          paddingTop: Constants.statusBarHeight + 20,
          padding: 20,
        }}
      >
        <Text
          style={{
            fontSize: 22,
            color: colors.foreground,
          }}
        >
          Profile Info
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: colors.text,
            marginTop: 20,
          }}
        >
          Please provide your name and an optional profile photo
        </Text>
        <TouchableOpacity
          onPress={handleProfilePicture}
          style={{
            marginTop: 30,
            borderRadius: 120,
            width: 120,
            height: 120,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: colors.background,
          }}
        >
          {!selectedImage ? (
            <MaterialCommunityIcons
              name="camera-plus"
              color={colors.iconGray}
              size={45}
            />
          ) : (
            <Image
              source={{ uri: selectedImage }}
              style={{ width: "100%", height: "100%", borderRadius: 120 }}
            />
          )}
        </TouchableOpacity>
        <TextInput
          placeholder="Type your name"
          value={displayName}
          onChangeText={setDisplayName}
          style={{
            borderBottomColor: colors.primary,
            marginTop: 40,
            borderBottomWidth: 2,
            width: "100%",
          }}
        />
        <View style={{ marginTop: "auto", width: 80 }}>
          <Button
            title="next"
            color={colors.secondary}
            onPress={handlePress}
            disabled={!displayName}
          />
        </View>
      </View>
    </React.Fragment>
  );
}
