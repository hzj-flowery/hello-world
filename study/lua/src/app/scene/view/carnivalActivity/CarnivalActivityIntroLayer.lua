local ViewBase = require("app.ui.ViewBase")
local CarnivalActivityIntroLayer = class("CarnivalActivityIntroLayer", ViewBase)
local FestivalResConfog = require("app.config.festival_res")
local CustomActivityUIHelper = require("app.scene.view.customactivity.CustomActivityUIHelper")

CarnivalActivityIntroLayer.TEXT_WIDTH = 576--403
CarnivalActivityIntroLayer.TEXT_UP_GAP = 10
CarnivalActivityIntroLayer.TEXT_DOWN_GAP = 26--32

function CarnivalActivityIntroLayer:ctor(actType)
	self._actType = actType	
	self._activityData = nil
	self._resConfig = nil
	local resource = {
		file = Path.getCSB("CarnivalActivityIntroLayer", "carnivalActivity"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
		},
	}
	CarnivalActivityIntroLayer.super.ctor(self, resource)
end

function CarnivalActivityIntroLayer:onCreate()
end

function CarnivalActivityIntroLayer:_updateText()
	self._listView:removeAllChildren()

	local title = self._activityData:getTitle1()
	local desc = self._activityData:getDesc1()
	local title2 = self._activityData:getTitle2()
	local desc2 = self._activityData:getDesc2()


	local resId =  self._activityData:getDrop_res_id()
	local resConfig = FestivalResConfog.get(resId)
	assert(resConfig ~= nil, "can not find res id")
	self._resConfig = resConfig

	logWarn("--ddd-----------"..resId)
	self._imageBg:loadTexture(resConfig.res_id)--大背景图




	if title and title ~= "" then
		local timeWidget = self:_createTitleWidget(title)
		self._listView:pushBackCustomItem(timeWidget)
	end

	if desc and desc ~= "" then
		local contentWidget = self:_createContentWidget(desc,1)
		self._listView:pushBackCustomItem(contentWidget)
	end

	if title2 and title2 ~= "" then
		local timeWidget = self:_createTitleWidget(title2)
		self._listView:pushBackCustomItem(timeWidget)
	end

	if desc2 and desc2 ~= "" then
		local contentWidget = self:_createContentWidget(desc2,2)
		self._listView:pushBackCustomItem(contentWidget)
	end
	
end

function CarnivalActivityIntroLayer:_createTitleWidget(title)

	local widget = ccui.Widget:create()
	local CSHelper = require("yoka.utils.CSHelper")
	local resourceNode = CSHelper.loadResourceNode(Path.getCSB("CarnivalActivityIntroTitleNode", "carnivalActivity"))
	resourceNode:loadTexture(self._resConfig.res_id_2)--大背景图
	resourceNode:updateLabel("Text",{text = title,color = Colors.toColor3B(tonumber(self._resConfig.color_1)) })
	local size = resourceNode:getContentSize()
	widget:addChild(resourceNode)
	widget:setContentSize(size)
	return widget
end

function CarnivalActivityIntroLayer:_createContentWidget(desc,index)
	local widget = ccui.Widget:create()


	local textColor =  Colors.toColor3B(tonumber(self._resConfig.color_2))
	local specialColor =  Colors.toColor3B(tonumber(self._resConfig.color_3))

	local RichTextHelper = require("app.utils.RichTextHelper")
    local subTitles = RichTextHelper.parse2SubTitleExtend(desc,true)
    subTitles =  RichTextHelper.fillSubTitleUseColor(subTitles,
		{nil,specialColor,nil})
    
    local richElementList = RichTextHelper.convertSubTitleToRichMsgArr({
        textColor = textColor,
        fontSize = 20,
    },subTitles)
	local richStr = json.encode(richElementList)
	logWarn(richStr)

	local UIHelper = require("yoka.utils.UIHelper")
	local labelText = UIHelper.createMultiAutoCenterRichTextByParam(desc,
	{defaultColor = textColor,defaultSize = 20,
		other = {
			{fontSize = 20, color = specialColor},
		}

	 } , 8, 1, CarnivalActivityIntroLayer.TEXT_WIDTH,"=")
--[[
	local labelText = ccui.RichText:createWithContent(richStr)
    labelText:setWrapMode(1)
	labelText:setVerticalSpace(8)
    labelText:setCascadeOpacityEnabled(true)
    labelText:ignoreContentAdaptWithSize(false)
    labelText:setContentSize(cc.size(CarnivalActivityIntroLayer.TEXT_WIDTH,0))--高度设置成0则高度自适应
    labelText:formatText()
	]]
    local size = labelText:getVirtualRendererSize()

	local height = size.height + CarnivalActivityIntroLayer.TEXT_UP_GAP
	if index ~= 2 then
		height  = height + CarnivalActivityIntroLayer.TEXT_DOWN_GAP
	end

	labelText:setAnchorPoint(cc.p(0,1))
	labelText:setPosition(cc.p(0, height-CarnivalActivityIntroLayer.TEXT_UP_GAP))
	
	widget:addChild(labelText)
	widget:setContentSize(cc.size(CarnivalActivityIntroLayer.TEXT_WIDTH, height))

	return widget
end

function CarnivalActivityIntroLayer:refreshView(activityData,resetListData)
	self._activityData = activityData
	self:_updateText()
	self:_refreshTime()
end


function CarnivalActivityIntroLayer:_refreshTime()
	self._countdownTime:stopAllActions()
	self:_updateTime()
	local UIActionHelper = require("app.utils.UIActionHelper")
	local action = UIActionHelper.createUpdateAction(function()
		self:_updateTime()
	end, 0.5)
	self._countdownTime:runAction(action)
end

function CarnivalActivityIntroLayer:_updateTime()
	if not self._activityData then
		return
	end
	local startTime = self._activityData:getStart_time()
	local endTime = self._activityData:getEnd_time()
	local awardTime = self._activityData:getAward_time()
	local curTime = G_ServerTime:getTime()

	if curTime < startTime then
		self._countdownText:setVisible(true)
		self._countdownText:setString(Lang.get("lang_carnival_activity_begin_countdown"))
		self._countdownTime:setString(CustomActivityUIHelper.getLeftDHMSFormat(startTime))
	elseif curTime >= startTime and curTime < endTime then
		self._countdownText:setVisible(true)
		self._countdownText:setString(Lang.get("lang_carnival_activity_end_countdown"))
		self._countdownTime:setString(CustomActivityUIHelper.getLeftDHMSFormat(endTime))
	elseif curTime >= endTime and curTime < awardTime then
		self._countdownText:setVisible(true)
		self._countdownText:setString(Lang.get("lang_carnival_activity_award_end_countdown"))
		self._countdownTime:setString(CustomActivityUIHelper.getLeftDHMSFormat(awardTime))
	else
		self._countdownText:setVisible(false)
		self._countdownTime:stopAllActions()
		self._countdownTime:setString(Lang.get("lang_carnival_activity_award_end"))
	end

	local targetPosX = (self._countdownText:getPositionX() + self._countdownText:getContentSize().width + 6)
	self._countdownTime:setPositionX(targetPosX)
end




return CarnivalActivityIntroLayer