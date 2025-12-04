import { Helmet } from "react-helmet-async";
import ChatRoom from "@/components/chat/ChatRoom";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Vhisper - Real-time Chat</title>
        <meta
          name="description"
          content="Real-time campus chat. Connect with your campus community instantly. No login required!"
        />
      </Helmet>
      <ChatRoom />
    </>
  );
};

export default Index;
