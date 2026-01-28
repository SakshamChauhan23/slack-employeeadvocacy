import { Hash, Search, Users, Info, Pin } from "lucide-react";
import BotMessage from "@/components/slack/BotMessage";
import { ScrollArea } from "@/components/ui/scroll-area";

export const ChannelView = ({ posts, loading, onShare, onAction }) => {
  return (
    <div className="flex-1 flex flex-col bg-white h-full" data-testid="channel-view">
      <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Hash className="w-5 h-5 text-gray-600" />
          <h2 className="font-bold text-[#1D1C1D] text-lg">company-news</h2>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>432</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded" data-testid="search-button">
            <Search className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded">
            <Info className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="py-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Loading messages...</div>
            </div>
          ) : (
            <>
              <div className="px-5 py-4 mb-4">
                <div className="border-l-4 border-gray-300 pl-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Pin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-semibold text-gray-700">Pinned by SocialRipple</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Welcome to #company-news! This is where the Please Share bot will post content for you to share with your network.
                  </p>
                </div>
              </div>

              {posts.map((post) => (
                <BotMessage
                  key={post.id}
                  post={post}
                  onShare={onShare}
                  onAction={onAction}
                />
              ))}
            </>
          )}
        </div>
      </ScrollArea>

      <div className="border-t border-gray-200 p-4">
        <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-500">
          Message #company-news
        </div>
      </div>
    </div>
  );
};

export default ChannelView;