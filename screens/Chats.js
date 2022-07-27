import { View, Text } from "react-native";
import React, { useContext, useEffect } from "react";
import { query, collection, where, onSnapshot } from "@firebase/firestore";
import { db, auth } from "../firebase";
import GlobalContext from "../context/Context";
import ContactsFloatingIcon from "../components/ContactsFloatingIcon";
import ListItem from "../components/ListItem";
import useContacts from "../hooks/useHooks";

// Chats will query all chat rooms from Firebase, and store these
// on the global context so that we can use them in other places.
export default function Chats() {
  const { currentUser } = auth;
  const { rooms, setRooms } = useContext(GlobalContext);
  const contacts = useContacts();
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

  function getUserB(user, contacts) {
    const userContact = contacts.find((c) => c.email == user.email);

    // if we have the contact saved, we want to use the name we have stored
    if (userContact && userContact.contactName) {
      return { ...user, contactName: userContact.contactName };
    }
    // else simply return the contact
    return user;
  }

  return (
    <View style={{ flex: 1, padding: 5, paddingRight: 10 }}>
      {/* we use the rooms from context and map them. */}
      {rooms.map((room) => (
        <ListItem
          type="chat"
          description={room.lastMessage.text}
          key={room.id}
          time={room.lastMessage.createdAt}
          user={(getUserB(room.userB), contacts)}
        />
      ))}
      <ContactsFloatingIcon />
    </View>
  );
}
