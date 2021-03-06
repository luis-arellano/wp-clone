// @refresh reset
import { View, Text, ImageBackground } from "react-native";
import "react-native-get-random-values";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { useRoute } from "@react-navigation/native";
import { nanoid } from "nanoid";
import GlobalContext from "../context/Context";
import { GiftedChat } from "react-native-gifted-chat";
import {
  collection,
  doc,
  onSnapshot,
  QuerySnapshot,
  setDoc,
} from "firebase/firestore";

const randomId = nanoid();

export default function Chat() {
  const [roomHash, setRoomHash] = useState("");
  const [messages, setMessages] = useState("");
  const {
    theme: { colors },
  } = useContext(GlobalContext);
  const { currentUser } = auth;
  const route = useRoute();
  const room = route.params.room;
  const selectedImage = route.params.image;
  const userB = route.params.user;

  const senderUser = currentUser.photoURL
    ? {
        name: currentUser.displayName,
        _id: currentUser.uid,
        avatar: currentUser.photoURL,
      }
    : { name: currentUser.displayName, _id: currentUser.uid };

  const roomId = room ? room.id : randomId;
  const roomRef = doc(db, "rooms", roomId);

  // messages is a subcolletion of the document rooms
  const roomMessageRef = collection(db, "rooms", roomId, "messages");

  // should create a new room if there is no room already.
  useEffect(() => {
    (async () => {
      if (!room) {
        const currentUserData = {
          displayName: currentUser.displayName,
          email: currentUser.email,
        };
        if (currentUser.photoURL) {
          currentUserData.photoURL = currentUser.photoURL;
        }
        const userBData = {
          displayName: userB.contactName || userB.displayName || "",
          email: userB.email,
        };
        if (userB.photoURL) {
          userBData.photoURL = userB.photoURL;
        }
        const roomData = {
          participants: [currentUserData, userBData],
          pariticpantsArray: [currentUser.email, userB.email],
        };
        try {
          await setDoc(roomRef, roomData);
        } catch (error) {
          console.log(error);
        }
      }
      const emailHash = `${currentUser.email}:${userB.email}`;
      setRoomHash(emailHash);
    })();
  }, []);

  // This use Effect will be used to render the messages.
  useEffect(() => {
    const unsubscribe = onSnapshot(roomMessageRef, (QuerySnapshot) => {
      // just get messages when doc changes
      const messagesFirestory = QuerySnapshot.docChanges()
        .filter(({ type }) => type == "added")
        .map(({ doc }) => {
          const message = doc.data();
          return { ...message, createAt: message.createdAt.toDate() };
        });
      appendMessages(messages);
    });
    return () => unsubscribe();
  }, []);

  // we use useCallback because we want to memoize the function
  const appendMessages = useCallback(
    (messages) => {
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, messages)
      );
    },
    [messages]
  );

  return (
    <ImageBackground
      resizeMode="cover"
      source={require("../assets/chatbg.png")}
      style={{ flex: 1 }}
    >
      <Text>Chat</Text>
    </ImageBackground>
  );
}
