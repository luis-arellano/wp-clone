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
      // Flatlist expects a key,
      keyExtractor={(_, i) => i}
      // item is the individual item in data array
      renderItem={({ item }) => <ContactPreview contact={item} image={image} />}
    />
  );
}

function ContactPreview({ contact, image }) {
  const { unfilteredRooms, rooms } = useContext(GlobalContext);
  const [user, setUser] = useState(contact);

  // Fetch contact information using contact email from db
  useEffect(() => {
    //query to get the contact
    const q = query(
      collection(db, "users"),
      where("email", "==", contact.email)
    );

    // then we pass the query and get the snapshop
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.docs.length) {
        const userDoc = snapshot.docs[0].data(); // this is user doc, if it exists.
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
      room={unfilteredRooms.find((room) =>
        room.participantsArray.includes(contact.email)
      )}
    />
  );
}
