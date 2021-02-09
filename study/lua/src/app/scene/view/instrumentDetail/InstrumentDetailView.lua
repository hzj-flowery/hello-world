--
-- Author: Liangxu
-- Date: 2017-9-15 17:48:07
-- 神兵详情
local ViewBase = require("app.ui.ViewBase")
local InstrumentDetailView = class("InstrumentDetailView", ViewBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local RedPointHelper = require("app.data.RedPointHelper")
local InstrumentConst = require("app.const.InstrumentConst")
local CSHelper = require("yoka.utils.CSHelper")
local InstrumentDetailBaseView = require("app.scene.view.instrumentDetail.InstrumentDetailBaseView")

function InstrumentDetailView:ctor(instrumentId, rangeType)
	G_UserData:getInstrument():setCurInstrumentId(instrumentId)

	self._topbarBase = nil --顶部条
	self._buttonLeft = nil --左箭头按钮
	self._buttonRight = nil --右箭头按钮
	self._buttonReplace = nil --更换按钮
	self._buttonUnload = nil --卸下按钮
	self._nodeInstrumentDetailView = nil --宝物详情节点

	self._rangeType = rangeType or InstrumentConst.INSTRUMENT_RANGE_TYPE_1
	self._allInstrumentIds = {}

	local resource = {
		file = Path.getCSB("InstrumentDetailView", "instrument"),
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
			}
		}
	}
	InstrumentDetailView.super.ctor(self, resource)
end

function InstrumentDetailView:onCreate()
	local TopBarStyleConst = require("app.const.TopBarStyleConst")
	self._topbarBase:updateUI(TopBarStyleConst.STYLE_COMMON)
	self._topbarBase:setImageTitle("txt_sys_com_shenbing")

	self._pageView:setScrollDuration(0.3)
	self._pageView:addEventListener(handler(self, self._onPageViewEvent))
	self._pageView:addTouchEventListener(handler(self, self._onPageTouch))

	self._buttonUnload:setString(Lang.get("instrument_detail_btn_unload"))
	self._buttonReplace:setString(Lang.get("instrument_detail_btn_replace"))
end

function InstrumentDetailView:onEnter()
	self._signalInstrumentRemoveSuccess =
		G_SignalManager:add(SignalConst.EVENT_INSTRUMENT_CLEAR_SUCCESS, handler(self, self._instrumentRemoveSuccess))

	local instrumentId = G_UserData:getInstrument():getCurInstrumentId()
	if self._rangeType == InstrumentConst.INSTRUMENT_RANGE_TYPE_1 then
		self._allInstrumentIds = G_UserData:getInstrument():getRangeDataBySort()
	elseif self._rangeType == InstrumentConst.INSTRUMENT_RANGE_TYPE_2 then
		local unit = G_UserData:getInstrument():getInstrumentDataWithId(instrumentId)
		local pos = unit:getPos()
		if pos then
			self._allInstrumentIds = G_UserData:getBattleResource():getInstrumentIdsWithPos(pos)
		end
	end

	self._selectedPos = 0
	local curInstrumentId = G_UserData:getInstrument():getCurInstrumentId()
	for i, id in ipairs(self._allInstrumentIds) do
		if id == curInstrumentId then
			self._selectedPos = i
		end
	end
	self._maxCount = #self._allInstrumentIds
	self:_updatePageView()
	self:_updateArrowBtn()
	self:_updateInfo()
end

function InstrumentDetailView:onExit()
	self._signalInstrumentRemoveSuccess:remove()
	self._signalInstrumentRemoveSuccess = nil
end

function InstrumentDetailView:_createPageItem(width, height, i)
	local instrumentId = self._allInstrumentIds[i]
	local unitData = G_UserData:getInstrument():getInstrumentDataWithId(instrumentId)
	local baseId = unitData:getBase_id()
	local limitLevel = unitData:getLimit_level()
	local widget = ccui.Widget:create()
	widget:setContentSize(width, height)
	local avatar = CSHelper.loadResourceNode(Path.getCSB("CommonInstrumentAvatar", "common"))
	avatar:showShadow(false)
	avatar:updateUI(baseId, limitLevel)
	local size = widget:getContentSize()
	avatar:setPosition(cc.p(size.width*0.54, size.height / 2))
	widget:addChild(avatar)

	return widget
end

function InstrumentDetailView:_updatePageView()
	self._pageView:removeAllPages()
	local viewSize = self._pageView:getContentSize()
	for i = 1, self._maxCount do
		local item = self:_createPageItem(viewSize.width, viewSize.height, i)
		self._pageView:addPage(item)
	end
	self._pageView:setCurrentPageIndex(self._selectedPos - 1)
end

function InstrumentDetailView:_updateArrowBtn()
	self._buttonLeft:setVisible(self._selectedPos > 1)
	self._buttonRight:setVisible(self._selectedPos < self._maxCount)
end

function InstrumentDetailView:_updateInfo()
	local instrumentId = G_UserData:getInstrument():getCurInstrumentId()
	self._instrumentData = G_UserData:getInstrument():getInstrumentDataWithId(instrumentId)
	self._buttonUnload:setVisible(self._instrumentData:isInBattle())
	self._buttonReplace:setVisible(self._instrumentData:isInBattle())

	self._nodeInstrumentDetailView:removeAllChildren()
	local instrumentDetail = InstrumentDetailBaseView.new(self._instrumentData, self._rangeType)
	self._nodeInstrumentDetailView:addChild(instrumentDetail)

	self:_checkRedPoint()
end

function InstrumentDetailView:_onButtonLeftClicked()
	if self._selectedPos <= 1 then
		return
	end
	self._selectedPos = self._selectedPos - 1
	local curInstrumentId = self._allInstrumentIds[self._selectedPos]
	G_UserData:getInstrument():setCurInstrumentId(curInstrumentId)
	self:_updateArrowBtn()
	self._pageView:setCurrentPageIndex(self._selectedPos - 1)
	self:_updateInfo()
end

function InstrumentDetailView:_onButtonRightClicked()
	if self._selectedPos >= self._maxCount then
		return
	end
	self._selectedPos = self._selectedPos + 1
	local curInstrumentId = self._allInstrumentIds[self._selectedPos]
	G_UserData:getInstrument():setCurInstrumentId(curInstrumentId)
	self:_updateArrowBtn()
	self._pageView:setCurrentPageIndex(self._selectedPos - 1)
	self:_updateInfo()
end

function InstrumentDetailView:_onButtonReplaceClicked()
	G_SceneManager:popScene()
	local scene = G_SceneManager:getTopScene()
	if scene:getName() == "team" then
		local view = scene:getSceneView()
		view:setNeedPopupInstrumentReplace(self._btnReplaceShowRP)
	end
end

function InstrumentDetailView:_onButtonUnloadClicked()
	local pos = self._instrumentData:getPos()
	G_UserData:getInstrument():c2sClearFightInstrument(pos)
end

function InstrumentDetailView:_instrumentRemoveSuccess(eventName, slot)
	G_SceneManager:popScene()
	local scene = G_SceneManager:getTopScene()
	if scene:getName() == "team" then
		local view = scene:getSceneView()
		view:setNeedInstrumentRemovePrompt(true)
	end
end

function InstrumentDetailView:_checkRedPoint()
	local pos = self._instrumentData:getPos()
	local slot = self._instrumentData:getSlot()
	if pos then
		local heroId = G_UserData:getTeam():getHeroIdWithPos(pos)
		local heroUnitData = G_UserData:getHero():getUnitDataWithId(heroId)
		local heroBaseId = heroUnitData:getBase_id()
		local param = {pos = pos, slot = slot, heroBaseId = heroBaseId}
		local reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_INSTRUMENT, "slotRP", param)
		self._buttonReplace:showRedPoint(reach)
		self._btnReplaceShowRP = reach
	end
end

function InstrumentDetailView:_onPageTouch(sender, state)
	if state == ccui.TouchEventType.began then
		return true
	elseif state == ccui.TouchEventType.moved then
	elseif state == ccui.TouchEventType.ended or state == ccui.TouchEventType.canceled then
	end
end

function InstrumentDetailView:_onPageViewEvent(sender, event)
	if event == ccui.PageViewEventType.turning and sender == self._pageView then
		local targetPos = self._pageView:getCurrentPageIndex() + 1
		if targetPos ~= self._selectedPos then
			self._selectedPos = targetPos
			local curInstrumentId = self._allInstrumentIds[self._selectedPos]
			G_UserData:getInstrument():setCurInstrumentId(curInstrumentId)
			self:_updateArrowBtn()
			self:_updateInfo()
		end
	end
end

return InstrumentDetailView
