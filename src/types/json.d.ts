export {};

declare global {
  type MessagesJSONKeys = keyof typeof import("@/assets/messages.json");
  type MessagesContactsJSONKeys = keyof typeof import("@/assets/messages_contacts.json");
  type CharactersJSONKeys = keyof typeof import("@/assets/characters.json");
}
