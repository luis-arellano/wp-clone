import { View, Text, FlatList } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import useContacts from "../hooks/useHooks";
import GlobalContext from "../context/Context";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import ListItem from "../components/ListItem";
import { db } from "../firebase";
import { useRoute } from "@react-navigation/native";

// We'll use a custom hook to grab the contacts info

export default function Contacts() {
  const contacts = useContacts();
  const route = useRoute();
  const image = route.params && route.params.image;

  return (
    <FlatList
      style={{ flex: 1, padding: 10 }}
      data={contacts}
      keyExtractor={(_, i) => i}
      renderItem={({ item }) => <ContactPreview contact={item} image={image} />}
    />
  );
}

function ContactPreview({ contact, image }) {
  const { rooms } = useContext(GlobalContext);
  const [user, setUser] = useState(contact);
  useEffect(() => {
    const q = query(
      collection(db, "users"),
      where("email", "==", contact.email)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.docs.length) {
        const userDoc = snapshot.docs[0].data();
        // merging the info from the doc, and also mergin info from contact
        setUser((prevUser) => ({ ...prevUser, userDoc }));
      }
    });
    return () => unsubscribe();
  }, []);
  return (
    <ListItem
      style={{ marginTop: 7 }}
      user={user}
      image={image}
      room={rooms.find((room) =>
        rooms.participantsArray.includes(contact.email)
      )}
    />
  );
}
