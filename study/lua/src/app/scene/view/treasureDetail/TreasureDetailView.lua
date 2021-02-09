--
-- Author: Liangxu
-- Date: 2017-05-09 10:03:45
-- 
local ViewBase = require("app.ui.ViewBase")
local TreasureDetailView = class("TreasureDetailView", ViewBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local RedPointHelper = require("app.data.RedPointHelper")
local TreasureConst = require("app.const.TreasureConst")
local CSHelper = require("yoka.utils.CSHelper")

local TreasureDetailBaseView = require("app.scene.view.treasureDetail.TreasureDetailBaseView")

function TreasureDetailView:ctor(treasureId, rangeType)
	G_UserData:getTreasure():setCurTreasureId(treasureId)

	self._topbarBase 		= nil --顶部条
	self._buttonLeft 		= nil --左箭头按钮
	self._buttonRight 		= nil --右箭头按钮
	self._buttonReplace		= nil --更换按钮
	self._buttonUnload		= nil --卸下按钮
	self._nodeTreasureDetailView = nil --宝物详情节点

	self._rangeType = rangeType or TreasureConst.TREASURE_RANGE_TYPE_1
	self._allTreasureIds = {}

	local resource = {
		file = Path.getCSB("TreasureDetailView", "treasure"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_buttonLeft = {
				events = {{event = "touch", method = "_onButtonLeftClicked"}}
			},
			_buttonRight = {
				events = {{event = "touch", method = "_onButtonRightClicked"}}
			},
			_buttonReplace = {
				events = {{event = "touch", method = "_onButtonReplaceClicked"}}
			},
			_buttonUnload = {
				events = {{event = "touch", method = "_onButtonUnloadClicked"}}
			},
		}
	}
	TreasureDetailView.super.ctor(self, resource)
end

function TreasureDetailView:onCreate()
	local TopBarStyleConst = require("app.const.TopBarStyleConst")
	self._topbarBase:updateUI(TopBarStyleConst.STYLE_COMMON)
	self._topbarBase:setImageTitle("txt_sys_com_baowu")

	self._pageView:setScrollDuration(0.3)
	self._pageView:addEventListener(handler(self,self._onPageViewEvent))
    self._pageView:addTouchEventListener(handler(self,self._onPageTouch))

	self._buttonReplace:setString(Lang.get("treasure_detail_btn_replace"))
	self._buttonUnload:setString(Lang.get("treasure_detail_btn_unload"))
end

function TreasureDetailView:onEnter()
	self._signalTreasureRemoveSuccess = G_SignalManager:add(SignalConst.EVENT_TREASURE_REMOVE_SUCCESS, handler(self, self._treasureRemoveSuccess))
	
	local treasureId = G_UserData:getTreasure():getCurTreasureId()
	if self._rangeType == TreasureConst.TREASURE_RANGE_TYPE_1 then
		self._allTreasureIds = G_UserData:getTreasure():getRangeDataBySort()
	elseif self._rangeType == TreasureConst.TREASURE_RANGE_TYPE_2 then
		local unit = G_UserData:getTreasure():getTreasureDataWithId(treasureId)
		local pos = unit:getPos()
		if pos then
			self._allTreasureIds = G_UserData:getBattleResource():getTreasureIdsWithPos(pos)
		end
	end

	self._selectedPos = 0
	local curTreasureId = G_UserData:getTreasure():getCurTreasureId()
	for i, id in ipairs(self._allTreasureIds) do
		if id == curTreasureId then
			self._selectedPos = i
		end
	end
	self._maxCount = #self._allTreasureIds
	self:_updatePageView()
	self:_updateArrowBtn()
	self:_updateInfo()

	--抛出新手事件出新手事件
    G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, self.__cname)
end

function TreasureDetailView:onExit()
	self._signalTreasureRemoveSuccess:remove()
	self._signalTreasureRemoveSuccess = nil
end

function TreasureDetailView:_createPageItem(width, height, i)
	local treasureId = self._allTreasureIds[i]
	local unitData = G_UserData:getTreasure():getTreasureDataWithId(treasureId)
	local baseId = unitData:getBase_id()

	local widget = ccui.Widget:create()
	widget:setContentSize(width, height)
	local avatar = CSHelper.loadResourceNode(Path.getCSB("CommonTreasureAvatar", "common"))
	avatar:showShadow(false)
	avatar:updateUI(baseId)
	local size = widget:getContentSize()
	avatar:setPosition(cc.p(size.width*0.54, size.height / 2))
	widget:addChild(avatar)

	return widget
end

function TreasureDetailView:_updatePageView()
	self._pageView:removeAllPages()
	local viewSize = self._pageView:getContentSize()
    for i = 1, self._maxCount do
    	local item = self:_createPageItem(viewSize.width, viewSize.height, i)
        self._pageView:addPage(item)
    end
    self._pageView:setCurrentPageIndex(self._selectedPos - 1)
end

function TreasureDetailView:_updateArrowBtn()
	self._buttonLeft:setVisible(self._selectedPos > 1)
	self._buttonRight:setVisible(self._selectedPos < self._maxCount)
end

function TreasureDetailView:_updateInfo()
	local treasureId = G_UserData:getTreasure():getCurTreasureId()
	self._treasureData = G_UserData:getTreasure():getTreasureDataWithId(treasureId)
	self._buttonReplace:setVisible(self._treasureData:isInBattle())
	self._buttonUnload:setVisible(self._treasureData:isInBattle())

	self._nodeTreasureDetailView:removeAllChildren()
	local treasureDetail = TreasureDetailBaseView.new(self._treasureData, self._rangeType)
	self._nodeTreasureDetailView:addChild(treasureDetail)

	self:_checkRedPoint()
end

function TreasureDetailView:_onButtonLeftClicked()
	if self._selectedPos <= 1 then
		return
	end
	self._selectedPos = self._selectedPos - 1
	local curTreasureId = self._allTreasureIds[self._selectedPos]
	G_UserData:getTreasure():setCurTreasureId(curTreasureId)
	self:_updateArrowBtn()
	self._pageView:setCurrentPageIndex(self._selectedPos - 1)
	self:_updateInfo()
end

function TreasureDetailView:_onButtonRightClicked()
	if self._selectedPos >= self._maxCount then
		return
	end
	self._selectedPos = self._selectedPos + 1
	local curTreasureId = self._allTreasureIds[self._selectedPos]
	G_UserData:getTreasure():setCurTreasureId(curTreasureId)
	self:_updateArrowBtn()
	self._pageView:setCurrentPageIndex(self._selectedPos - 1)
	self:_updateInfo()
end

function TreasureDetailView:_onButtonReplaceClicked()
	G_SceneManager:popScene()
	local scene = G_SceneManager:getTopScene()
	if scene:getName() == "team" then
		local view = scene:getSceneView()
		view:setNeedPopupTreasureReplace(self._btnReplaceShowRP)
	end
end

function TreasureDetailView:_onButtonUnloadClicked()
	local pos = self._treasureData:getPos()
	local slot = self._treasureData:getSlot()
	G_UserData:getTreasure():c2sRemoveTreasure(pos, slot)
end

function TreasureDetailView:_treasureRemoveSuccess(eventName, slot)
	G_SceneManager:popScene()
	local scene = G_SceneManager:getTopScene()
	if scene:getName() == "team" then
		local view = scene:getSceneView()
		view:setNeedTreasureRemovePrompt(true)
	end
end

function TreasureDetailView:_checkRedPoint()
	local pos = self._treasureData:getPos()
	local slot = self._treasureData:getSlot()
	local param = {pos = pos, slot = slot}
	local reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_TREASURE, "slotRP", param)
	self._buttonReplace:showRedPoint(reach)
	self._btnReplaceShowRP = reach
end

function TreasureDetailView:_onPageTouch(sender, state)
	if state == ccui.TouchEventType.began then
		return true
	elseif state == ccui.TouchEventType.moved then
		
	elseif state == ccui.TouchEventType.ended or state == ccui.TouchEventType.canceled then
		
	end
end

function TreasureDetailView:_onPageViewEvent(sender,event)
	if event == ccui.PageViewEventType.turning and sender == self._pageView then
		local targetPos = self._pageView:getCurrentPageIndex() + 1
		if targetPos ~= self._selectedPos then
			self._selectedPos = targetPos
			local curTreasureId = self._allTreasureIds[self._selectedPos]
			G_UserData:getTreasure():setCurTreasureId(curTreasureId)
			self:_updateArrowBtn()
			self:_updateInfo()
		end
	end
end

return TreasureDetailView