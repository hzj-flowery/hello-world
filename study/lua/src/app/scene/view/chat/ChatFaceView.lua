--聊天表情页面
local ViewBase = require("app.ui.ViewBase")
local ChatFaceView = class("ChatFaceView", ViewBase)
local Path = require("app.utils.Path")
local ChatConst = require("app.const.ChatConst") 
local ChatFacePageNode = import(".ChatFacePageNode")

function ChatFaceView:ctor( title, callback)
	self._callback = callback
	self._listDatas = {}
	self._pageView = nil
	self._commonPageViewIndicator = nil
	local resource = {
		file = Path.getCSB("ChatFaceView", "chat"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_panelTouch = {events = {{event = "touch", method = "_onClickOutSize"}}},
		}
	}
	ChatFaceView.super.ctor(self, resource)
end


function ChatFaceView:onCreate()
	local size = self._pageView:getContentSize()
	--self._pageView:setIndicatorEnabled(true)
	--self._pageView:setIndicatorIndexNodesTexture(Path.getVoiceRes("img_dian01"))
	--self._pageView:setIndicatorPosition(cc.p(size.width*0.5,10))

end

function ChatFaceView:updateUI()

end

function ChatFaceView:_onInit()
end

function ChatFaceView:onEnter()
	self:_refreshListData()
end

function ChatFaceView:onExit()
end

function ChatFaceView:_getListDatas()
	return  self._listDatas 
end

function ChatFaceView:_refreshPageView(pageView,itemList)
	local pageNum = math.ceil(#itemList/ChatFacePageNode.FACE_NUM)
	for k = 1,pageNum,1 do
		local node = ChatFacePageNode.new(pageView)
		node:updateUI(itemList,k)
		pageView:addPage(node)
	end
	self._commonPageViewIndicator:refreshPageData(self._pageView,pageNum,0,14)
end

function ChatFaceView:_onItemSelected(item, index)
end	

function ChatFaceView:_refreshListData()
	local listViewData = self:_makeFaceList()
	self._listDatas = listViewData
	self:_refreshPageView(self._pageView ,listViewData)
end

function ChatFaceView:_makeFaceList()
	local faceList = {}
	for k = 1,ChatConst.MAX_FACE_NUM,1 do
		table.insert( faceList, k)
	end
	return faceList
end

function ChatFaceView:_onClickOutSize()
	--self:removeFromParent()
	self:setVisible(false)
end 


return ChatFaceView