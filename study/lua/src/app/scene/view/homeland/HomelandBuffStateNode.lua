
local PopupBase = require("app.ui.PopupBase")
local HomelandBuffStateNode = class("HomelandBuffStateNode", PopupBase)
local SchedulerHelper = require ("app.utils.SchedulerHelper")
local HomelandHelp = require("app.scene.view.homeland.HomelandHelp")
local HomelandConst = require("app.const.HomelandConst")

local SPACE = 5 --间隔
local MAX_HEIGHT = 400 --列表最大高度

function HomelandBuffStateNode:ctor(fromNode, showBuffId)
    self._fromNode = fromNode
    self._showBuffId = showBuffId
    self._fromButton = ccui.Helper:seekNodeByName(self._fromNode, "ButtonIcon")
    
	local resource = {
		file = Path.getCSB("HomelandBuffStateNode", "homeland"),
		binding = {
			
		}
    }
    self:setName("HomelandBuffStateNode")
	HomelandBuffStateNode.super.ctor(self, resource, false, true)
end

function HomelandBuffStateNode:onCreate()
	self._panelTouch:setContentSize(G_ResolutionManager:getDesignCCSize())
	self._panelTouch:setSwallowTouches(false)
    self._panelTouch:addTouchEventListener(handler(self, self._onTouchEvent))
    self._countDownInfo = {}
    self._width = self._listView:getContentSize().width
end

function HomelandBuffStateNode:onEnter()
    self:_updateView()
    self:_startCountDown()
end

function HomelandBuffStateNode:onExit()
	self:_stopCountDown()
end


--重写opne&close接口，避免黑底层多层时的混乱现象
function HomelandBuffStateNode:open()
	local scene = G_SceneManager:getRunningScene()
	scene:addChildToPopup(self)
end

function HomelandBuffStateNode:close()
	self:onClose()
	self.signal:dispatch("close")
	self:removeFromParent()
end

function HomelandBuffStateNode:_updateView()
    self._datas = {}

    if self._showBuffId and self._showBuffId > 0 then
        self._datas = G_UserData:getHomeland():getBuffDatasWithBaseId(self._showBuffId)
    else
        self._datas = G_UserData:getHomeland():getBuffDatasBySort()
    end
    
    self._listView:removeAllChildren()
    for i, data in ipairs(self._datas) do
        if i == 1 then --第一个时，加段空的填充顶层
            local emptyItem = self:_createEmptyItem()
            self._listView:pushBackCustomItem(emptyItem)
        end
        local needLine = i ~= #self._datas --不是最后一个时，需要加一条线
        local item = self:_createItem(data, needLine)
        self._listView:pushBackCustomItem(item)
    end

    self._listView:doLayout()
	local contentSize = self._listView:getInnerContainerSize()
    local maxHeight = math.min(contentSize.height, MAX_HEIGHT)
    local listSize = cc.size(contentSize.width, maxHeight)
	self._listView:setContentSize(listSize)

    --确定位置
    
	local nodePos = self._fromButton:convertToWorldSpaceAR(cc.p(0,0))
	local nodeSize = self._fromButton:getContentSize()
	local posX = nodePos.x + nodeSize.width / 2 - 5
    local posY = nodePos.y - 10
    
    if posY - maxHeight < 0 then
        posY = nodePos.y + nodeSize.height / 2 + maxHeight
        posX = nodePos.x - contentSize.width + 5
    end

	local dstPos = self:convertToNodeSpace(cc.p(posX, posY))
	self._listView:setPosition(dstPos)
end

--空的item，为了使顶层item距上边线宽些
function HomelandBuffStateNode:_createEmptyItem()
    local widget = ccui.Widget:create()
    local size = cc.size(self._width, 6)
    widget:setContentSize(size)
    return widget
end

function HomelandBuffStateNode:_createItem(data, needLine)
    local widget = ccui.Widget:create()
    local info = data:getConfig()
    local name = info.name
    local color = info.color
    local type = info.type
    local desBuff = HomelandHelp.getBuffDes(data:getBaseId())

    local labelName = cc.Label:createWithTTF(name, Path.getCommonFont(), 16)
	labelName:setAnchorPoint(cc.p(0, 1))
    labelName:setColor(Colors.getColor(color))
    local nameHeight = labelName:getContentSize().height
    widget:addChild(labelName)
    
    local desState = ""
    local labelState = cc.Label:createWithTTF(desState, Path.getCommonFont(), 16)
    local colorState = nil
    local isEffect = false --是否生效
    if type == HomelandConst.TREE_BUFF_TYPE_1 then
        desState = Lang.get("homeland_buff_des_1")
        colorState = Colors.BRIGHT_BG_RED
        isEffect = false
    elseif type == HomelandConst.TREE_BUFF_TYPE_2 then
        local restCount = data:getRestCount()
        if restCount > 0 then
            desState = Lang.get("homeland_buff_des_2", {count = restCount})
            colorState = Colors.NUMBER_GREEN
            isEffect = true
        else
            desState = Lang.get("homeland_buff_des_1")
            colorState = Colors.BRIGHT_BG_RED
            isEffect = false
        end
    elseif type == HomelandConst.TREE_BUFF_TYPE_3 then
        local targetTime = data:getEndTime()
        local countDown = targetTime - G_ServerTime:getTime()
        if countDown > 0 then
            desState = G_ServerTime:getLeftDHMSFormatEx(targetTime)
            colorState = Colors.NUMBER_GREEN
            isEffect = true
            self._countDownInfo[data:getId()] = {data = data, label = labelState}
        else
            desState = Lang.get("homeland_buff_des_1")
            colorState = Colors.BRIGHT_BG_RED
            isEffect = false
        end
    end
    labelState:setString(desState)
    labelState:setAnchorPoint(cc.p(1, 1))
    labelState:setColor(colorState)
    widget:addChild(labelState)

    local colorDes = isEffect and cc.c3b(0xff, 0xff, 0xff) or cc.c3b(0x83, 0x83, 0x83)
    local labelDes = cc.Label:createWithTTF(desBuff, Path.getCommonFont(), 16)
	labelDes:setAnchorPoint(cc.p(0, 1))
	labelDes:setWidth(self._width - 20)
    labelDes:setColor(colorDes)
    local desHeight = labelDes:getContentSize().height
    widget:addChild(labelDes)
    
    local totalHeight = 0 + SPACE
    if needLine then
        local line = ccui.ImageView:create()
        line:loadTexture(Path.getUICommon("img_com_board_dark02_line"))
        line:setScale9Enabled(true)
        line:setCapInsets(cc.rect(1,1,1,1))
        line:setContentSize(self._width-8, 1)
        line:setAnchorPoint(cc.p(0, 1))
        local lineHeight = line:getContentSize().height
        totalHeight = totalHeight + lineHeight
        widget:addChild(line)
        line:setPosition(cc.p(4, totalHeight))
    end
    
    totalHeight = totalHeight + desHeight + SPACE
    labelDes:setPosition(cc.p(10, totalHeight))
    totalHeight = totalHeight + nameHeight + SPACE
    labelName:setPosition(cc.p(10, totalHeight))
    labelState:setPosition(cc.p(self._width-10, totalHeight))

    local size = cc.size(self._width, totalHeight + SPACE)
    widget:setContentSize(size)
    
    return widget
end

function HomelandBuffStateNode:_onTouchEvent(sender, state)
    if state == ccui.TouchEventType.began then
        return true
    elseif state == ccui.TouchEventType.ended then
        local touchEndPos = self._fromNode:convertToNodeSpace(sender:getTouchEndPosition())
        local rect = self._fromButton:getBoundingBox()
        if not cc.rectContainsPoint(rect, touchEndPos) then --按钮区域外，直接关掉。按钮区域内，是在点击按钮时关掉。
            self:close()
        end
    end
end

function HomelandBuffStateNode:_startCountDown()
    self:_stopCountDown()
    self._scheduleHandler = SchedulerHelper.newSchedule(handler(self, self._updateCountDown), 1)
    self:_updateCountDown()
end

function HomelandBuffStateNode:_stopCountDown()
    if self._scheduleHandler ~= nil then
        SchedulerHelper.cancelSchedule(self._scheduleHandler)
        self._scheduleHandler = nil
    end
end

function HomelandBuffStateNode:_updateCountDown()
    for id, info in pairs(self._countDownInfo) do
        local lable = info.label
        local data = info.data
        local targetTime = data:getEndTime()
        local countDown = targetTime - G_ServerTime:getTime()
        if countDown > 0 then
            local desState = G_ServerTime:getLeftDHMSFormatEx(targetTime)
            lable:setString(desState)
            lable:setColor(Colors.NUMBER_GREEN)
        else
            lable:setString(Lang.get("homeland_buff_des_1"))
            lable:setColor(Colors.BRIGHT_BG_RED)
            self._countDownInfo[id] = nil
        end
    end
end

return HomelandBuffStateNode