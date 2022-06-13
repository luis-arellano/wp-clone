import { View, Text } from "react-native";
import React, { useContext, useEffect } from "react";
import { query, collection, where, onSnapshot } from "@firebase/firestore";
import { db, auth } from "../firebase";
import GlobalContext from "../context/Context";
import ContactsFloatingIcon from "../components/ContactsFloatingIcon";

// Chats will query all chat rooms from Firebase, and store these
// on the global context so that we can use them in other places.
export default function Chats() {
  const { currentUser } = auth;
  const { rooms, setRooms } = useContext(GlobalContext);
  const chatsQuery = query(
    collection(db, "rooms"),
    where("participantsArray", "array-contains", currentUser.email)
  );

  useEffect(() => {
    const unsubscribe = onSnapshot(chatsQuery, (QuerySnapshot) => {
      // only display rooms that have messages
      const parsedChats = QuerySnapshot.docs
        .filter((doc) => doc.data().lastMessage)
        .map((doc) => ({
          // need to map data from the document
          ...doc.data(),
          id: doc.id,
          userB: doc
            .data()
            .participants.find((p) => p.email != currentUser.email),
        }));

      // Once we have data from the query, we can set the rooms on Context
      setRooms(parsedChats);
    });
    return () => unsubscribe();
  }, []);

  return (
    <View style={{ flex: 1, padding: 5, paddingRight: 10 }}>
      <Text>Chats Test</Text>
      <ContactsFloatingIcon />
    </View>
  );
}
