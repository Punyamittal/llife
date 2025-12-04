import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Post, Category } from "@/types/post";
import { mockPosts, trendingPosts } from "@/data/forumData";
import Header from "@/components/forum/Header";
import CategoryTabs from "@/components/forum/CategoryTabs";
import PostCard from "@/components/forum/PostCard";
import Sidebar from "@/components/forum/Sidebar";
import NewPostModal from "@/components/forum/NewPostModal";
import MobileNav from "@/components/forum/MobileNav";

const Index = () => {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [newPostIds, setNewPostIds] = useState<Set<string>>(new Set());

  // Filter posts
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory =
        activeCategory === "all" || post.category === activeCategory;
      const matchesSearch =
        !searchQuery ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.username.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [posts, activeCategory, searchQuery]);

  // Handle voting
  const handleVote = (postId: string, vote: "up" | "down") => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;

        const currentVote = post.userVote;
        let upvotes = post.upvotes;
        let downvotes = post.downvotes;
        let newVote: "up" | "down" | null = vote;

        // Remove previous vote
        if (currentVote === "up") upvotes--;
        if (currentVote === "down") downvotes--;

        // Toggle or set new vote
        if (currentVote === vote) {
          newVote = null;
        } else {
          if (vote === "up") upvotes++;
          if (vote === "down") downvotes++;
        }

        return { ...post, upvotes, downvotes, userVote: newVote };
      })
    );
  };

  // Handle new post
  const handleNewPost = (content: string, category: Category) => {
    const usernames = [
      "MysticPhoenix",
      "SilentStorm",
      "CrypticShadow",
      "NeonDreamer",
      "PixelWanderer",
    ];
    const colors = [
      "bg-emerald-600",
      "bg-blue-600",
      "bg-purple-600",
      "bg-pink-600",
      "bg-orange-600",
    ];
    const randomName = usernames[Math.floor(Math.random() * usernames.length)];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newPost: Post = {
      id: `new-${Date.now()}`,
      content,
      username: randomName + Math.floor(Math.random() * 1000),
      avatarInitial: randomName[0],
      avatarColor: randomColor,
      category,
      timestamp: new Date(),
      upvotes: 1,
      downvotes: 0,
      commentCount: 0,
      userVote: "up",
    };

    setPosts((prev) => [newPost, ...prev]);
    setNewPostIds((prev) => new Set(prev).add(newPost.id));

    setTimeout(() => {
      setNewPostIds((prev) => {
        const next = new Set(prev);
        next.delete(newPost.id);
        return next;
      });
    }, 500);
  };

  return (
    <>
      <Helmet>
        <title>Vhispers - Campus Forum</title>
        <meta
          name="description"
          content="Anonymous campus forum for college students. Share thoughts, ask questions, and connect with your campus community."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header
          onNewPost={() => setIsNewPostOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <CategoryTabs
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        <main className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex gap-6">
            {/* Feed */}
            <div className="flex-1 space-y-4 pb-20 lg:pb-6">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onVote={handleVote}
                    isNew={newPostIds.has(post.id)}
                  />
                ))
              ) : (
                <div className="bg-card border border-border rounded-xl p-12 text-center">
                  <p className="text-muted-foreground">No posts found</p>
                  <button
                    onClick={() => {
                      setActiveCategory("all");
                      setSearchQuery("");
                    }}
                    className="mt-4 text-sm text-primary hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar - Desktop only */}
            <div className="hidden lg:block">
              <div className="sticky top-[140px]">
                <Sidebar
                  onlineCount={72}
                  postsToday={24}
                  trending={trendingPosts}
                />
              </div>
            </div>
          </div>
        </main>

        {/* Mobile Navigation */}
        <MobileNav onNewPost={() => setIsNewPostOpen(true)} />

        {/* New Post Modal */}
        <NewPostModal
          isOpen={isNewPostOpen}
          onClose={() => setIsNewPostOpen(false)}
          onSubmit={handleNewPost}
        />
      </div>
    </>
  );
};

export default Index;
