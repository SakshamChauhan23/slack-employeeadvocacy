import { Hash, MessageSquare, ChevronDown, Plus } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export const Sidebar = () => {
  return (
    <div className="w-[260px] bg-[#3F0E40] flex flex-col h-full" data-testid="slack-sidebar">
      <div className="p-3 border-b border-[#522653]">
        <button className="flex items-center justify-between w-full text-white font-bold text-lg hover:bg-[#350D36] rounded px-2 py-1">
          <span>SocialRipple</span>
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mt-4">
          <div className="px-4 mb-2 flex items-center justify-between">
            <span className="text-[#B89DB9] text-sm font-semibold">Channels</span>
            <Plus className="w-4 h-4 text-[#B89DB9] cursor-pointer hover:text-white" />
          </div>
          
          <div className="slack-sidebar-item active" data-testid="channel-company-news">
            <Hash className="w-4 h-4" />
            <span>company-news</span>
          </div>
          <div className="slack-sidebar-item">
            <Hash className="w-4 h-4" />
            <span>customer-success</span>
          </div>
          <div className="slack-sidebar-item">
            <Hash className="w-4 h-4" />
            <span>sales-team</span>
          </div>
        </div>

        <div className="mt-6">
          <div className="px-4 mb-2 flex items-center justify-between">
            <span className="text-[#B89DB9] text-sm font-semibold">Direct messages</span>
            <Plus className="w-4 h-4 text-[#B89DB9] cursor-pointer hover:text-white" />
          </div>
          
          <div className="slack-sidebar-item">
            <div className="relative">
              <Avatar className="h-5 w-5 rounded-sm">
                <AvatarImage src="https://images.unsplash.com/photo-1655249481446-25d575f1c054?w=100&h=100&fit=crop" />
                <AvatarFallback>P</AvatarFallback>
              </Avatar>
              <div className="presence-indicator"></div>
            </div>
            <span>Paula</span>
          </div>
          <div className="slack-sidebar-item">
            <div className="relative">
              <Avatar className="h-5 w-5 rounded-sm">
                <AvatarImage src="https://images.unsplash.com/photo-1576558656222-ba66febe3dec?w=100&h=100&fit=crop" />
                <AvatarFallback>S</AvatarFallback>
              </Avatar>
            </div>
            <span className="text-[#B89DB9]">Sakid</span>
          </div>
          <div className="slack-sidebar-item">
            <div className="relative">
              <Avatar className="h-5 w-5 rounded-sm">
                <AvatarImage src="https://images.unsplash.com/photo-1558531304-a4773b7e3a9c?w=100&h=100&fit=crop" />
                <AvatarFallback>W</AvatarFallback>
              </Avatar>
            </div>
            <span className="text-[#B89DB9]">William</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;