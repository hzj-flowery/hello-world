local ChatFacePageNode = class("ChatFacePageNode", ccui.Widget)

ChatFacePageNode.FACE_INTERVAL_ST_X = 23
ChatFacePageNode.FACE_INTERVAL_ST_Y = 214
ChatFacePageNode.FACE_INTERVAL_W = 51
ChatFacePageNode.FACE_INTERVAL_H = 48

ChatFacePageNode.COL_NUM  = 11--列数
ChatFacePageNode.ROW_NUM  = 5 --行数
ChatFacePageNode.FACE_NUM = ChatFacePageNode.COL_NUM  *  ChatFacePageNode.ROW_NUM --表情数

function ChatFacePageNode:ctor(pageView)
    self._faceImageList = {}
    local size = pageView:getContentSize()
    self:setContentSize(size)

    for row = 1, ChatFacePageNode.ROW_NUM ,1 do
        for col = 1, ChatFacePageNode.COL_NUM ,1 do
            local imageView = ccui.Button:create()
            imageView:setPosition(ChatFacePageNode.FACE_INTERVAL_ST_X  + (col -1)* ChatFacePageNode.FACE_INTERVAL_W,
               ChatFacePageNode.FACE_INTERVAL_ST_Y  - (row -1)* ChatFacePageNode.FACE_INTERVAL_H)
            --imageView:addTouchEventListenerEx(handler(self, self._onTouchCallBack))
            imageView:addClickEventListenerEx(handler(self, self._onTouchCallBack), nil, 0)
	        imageView:setSwallowTouches(false)
           -- imageView:setScale(1.5)
            imageView:setTouchEnabled(true)
            self:addChild(imageView)
            table.insert(self._faceImageList,imageView)
        end
    end
end


function ChatFacePageNode:_onTouchCallBack(sender,state)
	-----------防止拖动的时候触发点击
	if(state == ccui.TouchEventType.ended) or not state then
		local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
		local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
		if moveOffsetX < 20 and moveOffsetY < 20 then
            local faceId = sender:getTag()
            G_SignalManager:dispatch(SignalConst.EVENT_CHAT_SELECTE_FACE,faceId)
		end
	end
end

function ChatFacePageNode:updateUI(faceList,pageIndex)
    local startIndex = (pageIndex -1)* ChatFacePageNode.FACE_NUM  + 1
    for k,v in ipairs(self._faceImageList) do
        local index = startIndex + k -1
        if faceList[index] then
            v:setVisible(true)  
            --v:loadTexture(Path.getChatFaceMiniRes(faceList[index]))
            v:loadTextures(Path.getChatFaceMiniRes(faceList[index]),"")	
            v:setTag(index)
        else
            v:setVisible(false)  
        end
    end
end

function ChatFacePageNode:onEnter()
end

function ChatFacePageNode:onExit()
end

return ChatFacePageNode
