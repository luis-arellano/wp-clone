import { View, Text } from "react-native";
import React, { useContext, useEffect } from "react";
import { collection, onSnapshot, query, where } from "@firebase/firestore";
import { db, auth } from "../firebase";
import GlobalContext from "../context/Context";
import ContactsFloatingIcon from "../components/ContactsFloatingIcon";
import ListItem from "../components/ListItem";
import useContacts from "../hooks/useHooks";

// Chats will query all chat rooms from Firebase, and store these
// on the global context so that we can use them in other places.
export default function Chats() {
  const { currentUser } = auth;
  const { rooms, setRooms, setUnfilteredRooms } = useContext(GlobalContext);
  const contacts = useContacts();
  const chatsQuery = query(
    collection(db, "rooms"),
    where("participantsArray", "array-contains", currentUser.email)
  );

  useEffect(() => {
    const unsubscribe = onSnapshot(chatsQuery, (querySnapshot) => {
      const parsedChats = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        userB: doc
          .data()
          .participants.find((p) => p.email !== currentUser.email),
      }));
      setUnfilteredRooms(parsedChats);
      setRooms(parsedChats.filter((doc) => doc.lastMessage));
    });
    return () => unsubscribe();
  }, []);

  function getUserB(user, contacts) {
    // if we have the contact saved, we want to use the name we have stored
    // else simply return the contact
    // const userContact = contacts.find((c) => c.email == user.email);
    // if (userContact && userContact.contactName) {
    //   return { ...user, contactName: userContact.contactName };
    // }
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
          room={room}
          time={room.lastMessage.createdAt}
          user={(getUserB(room.userB), contacts)}
        />
      ))}
      <ContactsFloatingIcon />
    </View>
  );
}
