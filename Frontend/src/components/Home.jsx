import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import useGetAllPosts from "../hooks/getallpost";
import Suggested from "./Suggested";
import Post from "./Post";

let motion;
let AnimatePresence;
try {
  ({ motion, AnimatePresence } = require('framer-motion'));
} catch (error) {
  console.warn('Framer Motion not available - falling back to regular components');
  motion = {
    div: 'div',
  };
  AnimatePresence = ({ children }) => children;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3
    }
  }
};

// Placeholder story data (replace with actual data from your backend)
const SAMPLE_STORIES = [
  { id: 1, username: 'user1', avatar: 'https://i.pravatar.cc/150?img=1', hasStory: true },
  { id: 2, username: 'user2', avatar: 'https://i.pravatar.cc/150?img=2', hasStory: true },
  { id: 3, username: 'user3', avatar: 'https://i.pravatar.cc/150?img=3', hasStory: true },
  { id: 4, username: 'user4', avatar: 'https://i.pravatar.cc/150?img=4', hasStory: false },
  { id: 5, username: 'user5', avatar: 'https://i.pravatar.cc/150?img=5', hasStory: true },
  { id: 6, username: 'user6', avatar: 'https://i.pravatar.cc/150?img=6', hasStory: true },
  { id: 7, username: 'user7', avatar: 'https://i.pravatar.cc/150?img=7', hasStory: true },
];

const StoryCircle = ({ avatar, username, hasStory }) => {
  const Component = motion.div || 'div';
  return (
    <Component 
      variants={itemVariants}
      className="flex flex-col items-center space-y-1 cursor-pointer transform transition-transform hover:scale-105"
    >
      <div className={`w-16 h-16 rounded-full p-[3px] ${hasStory ? 'bg-gradient-to-tr from-yellow-400 to-fuchsia-600' : 'bg-gray-200'}`}>
        <img
          src={avatar}
          alt={username}
          className="w-full h-full object-cover rounded-full border-2 border-white"
        />
      </div>
      <span className="text-xs text-gray-600 truncate w-16 text-center">{username}</span>
    </Component>
  );
};

const LoadingSkeleton = () => (
  <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
    <div className="flex items-center space-x-2">
      <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
      <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
    </div>
    <div className="w-full h-96 bg-gray-200 rounded-lg animate-pulse"></div>
  </div>
);

const Home = () => {
  useGetAllPosts();
  const allposts = useSelector((state => state.posts.posts));
  const [isLoading, setIsLoading] = useState(true);
  const MainContainer = motion.div || 'div';
  const PostContainer = motion.div || 'div';
  const SuggestedContainer = motion.div || 'div';

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex justify-center gap-8 bg-gray-50 min-h-screen">
      {/* Main Content */}
      <div className="w-full max-w-[470px] pt-4 pb-8">
        {/* Stories Section */}
        <MainContainer 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-lg shadow-sm p-4 mb-4"
        >
          <div className="flex space-x-4 overflow-x-auto hide-scrollbar pb-2">
            <AnimatePresence>
              {SAMPLE_STORIES.map((story) => (
                <StoryCircle
                  key={story.id}
                  avatar={story.avatar}
                  username={story.username}
                  hasStory={story.hasStory}
                />
              ))}
            </AnimatePresence>
          </div>
        </MainContainer>

        {/* Posts Feed */}
        <PostContainer 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          <AnimatePresence mode="wait">
            {isLoading ? (
              // Loading skeletons
              Array(3).fill(0).map((_, i) => (
                <MainContainer
                  key={`skeleton-${i}`}
                  variants={itemVariants}
                >
                  <LoadingSkeleton />
                </MainContainer>
              ))
            ) : (
              allposts.map((post) => (
                <MainContainer
                  key={post._id}
                  variants={itemVariants}
                  layout
                  className="transform transition-all duration-300"
                >
                  <Post post={post} />
                </MainContainer>
              ))
            )}
          </AnimatePresence>
        </PostContainer>
      </div>

      {/* Suggested Users Section */}
      <SuggestedContainer 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:block w-[350px] pt-4"
      >
        <div className="fixed w-[350px]">
          <Suggested />
        </div>
      </SuggestedContainer>
    </div>
  );
};

// Add custom scrollbar styles
const style = document.createElement('style');
style.textContent = `
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;
document.head.appendChild(style);

export default Home;
