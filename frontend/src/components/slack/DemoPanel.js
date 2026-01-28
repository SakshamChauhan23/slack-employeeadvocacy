import { CheckCircle2, Twitter, Linkedin, Phone } from "lucide-react";

export const DemoPanel = () => {
  return (
    <div className="w-[350px] border-l border-gray-200 bg-white flex flex-col h-full" data-testid="demo-panel">
      <div className="p-6">
        <div className="text-center mb-6">
          <h3 className="text-sm text-gray-500 mb-1">INTERACTIVE PLEASE SHARE DEMO</h3>
        </div>

        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Example "Share" Requests</h4>
          <div className="space-y-2">
            <div className="bg-[#E0F2FE] border border-[#0EA5E9] rounded-lg p-3 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-800">New Content</span>
              <CheckCircle2 className="w-5 h-5 text-[#0EA5E9]" />
            </div>
            <div className="bg-white border border-gray-300 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50">
              <span className="text-sm font-medium text-gray-800">Job Posting</span>
              <div className="w-3 h-3 rounded-full bg-[#1164A3]"></div>
            </div>
            <div className="bg-white border border-gray-300 rounded-lg p-3 flex items-center">
              <span className="text-sm font-medium text-gray-800">Company Event</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Example "Engagement" Requests</h4>
          <div className="space-y-2">
            <div className="bg-[#E0F2FE] border border-[#0EA5E9] rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Twitter className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-800">Twitter post</span>
              </div>
              <CheckCircle2 className="w-5 h-5 text-[#0EA5E9]" />
            </div>
            <div className="bg-white border border-gray-300 rounded-lg p-3 flex items-center cursor-pointer hover:bg-gray-50">
              <Linkedin className="w-4 h-4 text-gray-600 mr-2" />
              <span className="text-sm font-medium text-gray-800">LinkedIn post</span>
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-semibold text-gray-800 mb-2">Your Impact</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Shares:</span>
              <span className="font-semibold text-gray-800">42</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">This Week:</span>
              <span className="font-semibold text-gray-800">12</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Engagement Rate:</span>
              <span className="font-semibold text-green-600">+18%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoPanel;