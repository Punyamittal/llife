import { Helmet } from "react-helmet-async";
import ChatPanel from "@/components/chat/ChatPanel";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Vhispers - Campus Chat</title>
        <meta name="description" content="Anonymous campus chat for college students. Connect, share, and vibe with your campus community." />
      </Helmet>

      <div className="min-h-screen bg-background noise-texture">
        {/* Background Gradient */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>

        {/* Main Content */}
        <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
          {/* Hero */}
          <div className="text-center max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-4">
              <span className="w-2 h-2 bg-online rounded-full animate-pulse" />
              <span className="text-sm text-primary">Live Campus Chat</span>
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                Vhispers
              </span>
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed max-w-lg mx-auto">
              Your anonymous campus community. Share thoughts, ask questions, and connect with fellow students.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg">
                <span className="text-2xl">🎓</span>
                <span className="text-sm text-foreground">Campus Life</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg">
                <span className="text-2xl">🤫</span>
                <span className="text-sm text-foreground">Anonymous</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg">
                <span className="text-2xl">💬</span>
                <span className="text-sm text-foreground">Real-time</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground pt-8">
              Check out the chat panel in the bottom right corner →
            </p>
          </div>
        </main>

        {/* Chat Panel */}
        <ChatPanel />
      </div>
    </>
  );
};

export default Index;
