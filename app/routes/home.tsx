import type { Route } from "./+types/home";
import { Chat } from "../chat/Chat";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Gnist KI chat" },
    { name: "description", content: "Chat interface for gnist KI chat" },
  ];
}

export default function Home() {
  return <Chat />;
}
