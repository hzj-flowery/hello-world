--
-- Author: Liangxu
-- Date: 2017-04-12 16:46:24
-- 装备详情
local ViewBase = require("app.ui.ViewBase")
local EquipmentDetailView = class("EquipmentDetailView", ViewBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local EquipConst = require("app.const.EquipConst")
local EquipDetailBaseView = require("app.scene.view.equipmentDetail.EquipDetailBaseView")
local RedPointHelper = require("app.data.RedPointHelper")
local CSHelper = require("yoka.utils.CSHelper")

function EquipmentDetailView:ctor(equipId, rangeType)
	G_UserData:getEquipment():setCurEquipId(equipId)
	self._rangeType = rangeType or EquipConst.EQUIP_RANGE_TYPE_1
	self._allEquipIds = {}

	self._topbarBase 		= nil --顶部条
	self._buttonReplace		= nil --更换按钮
	self._buttonUnload		= nil --卸下按钮
	self._btnReplaceShowRP  = false --更换按钮是否显示红点

	local resource = {
		file = Path.getCSB("EquipmentDetailView", "equipment"),
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
	EquipmentDetailView.super.ctor(self, resource)
end

function EquipmentDetailView:onCreate()
	local TopBarStyleConst = require("app.const.TopBarStyleConst")
	self._topbarBase:updateUI(TopBarStyleConst.STYLE_COMMON)
	self._topbarBase:setImageTitle("txt_sys_com_zhuangbei")

	self._pageView:setScrollDuration(0.3)
	self._pageView:addEventListener(handler(self,self._onPageViewEvent))
    self._pageView:addTouchEventListener(handler(self,self._onPageTouch))

	self._buttonReplace:setString(Lang.get("equipment_detail_btn_replace"))
	self._buttonUnload:setString(Lang.get("equipment_detail_btn_unload"))
end

function EquipmentDetailView:onEnter()
	self._signalEquipClearSuccess = G_SignalManager:add(SignalConst.EVENT_EQUIP_CLEAR_SUCCESS, handler(self, self._equipClearSuccess))

	local equipId = G_UserData:getEquipment():getCurEquipId()
	if self._rangeType == EquipConst.EQUIP_RANGE_TYPE_1 then
		self._allEquipIds = G_UserData:getEquipment():getListDataBySort()
	elseif self._rangeType == EquipConst.EQUIP_RANGE_TYPE_2 then
		local unit = G_UserData:getEquipment():getEquipmentDataWithId(equipId)
		local pos = unit:getPos()
		if pos then
			self._allEquipIds = G_UserData:getBattleResource():getEquipIdsWithPos(pos)
		end
	end
	
	self._selectedPos = 1
	
	for i, id in ipairs(self._allEquipIds) do
		if id == equipId then
			self._selectedPos = i
		end
	end
	self._equipCount = #self._allEquipIds
	self:_updatePageView()
	self:_updateArrowBtn()
	self:updateInfo()

	--抛出新手事件出新手事件
    G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, self.__cname)
end

function EquipmentDetailView:onExit()
	self._signalEquipClearSuccess:remove()
	self._signalEquipClearSuccess = nil
end

function EquipmentDetailView:_createPageItem(width, height, i)
	local equipId = self._allEquipIds[i]
	local unitData = G_UserData:getEquipment():getEquipmentDataWithId(equipId)
	local equipBaseId = unitData:getBase_id()

	local widget = ccui.Widget:create()
	widget:setContentSize(width, height)
	local avatar = CSHelper.loadResourceNode(Path.getCSB("CommonEquipAvatar", "common"))
	avatar:showShadow(false)
	avatar:updateUI(equipBaseId)
	local size = widget:getContentSize()
	avatar:setPosition(cc.p(size.width*0.54, size.height / 2))
	widget:addChild(avatar)

	return widget
end

function EquipmentDetailView:_updatePageView()
	self._pageView:removeAllPages()
	local viewSize = self._pageView:getContentSize()
    for i = 1, self._equipCount do
    	local item = self:_createPageItem(viewSize.width, viewSize.height, i)
        self._pageView:addPage(item)
    end
    self._pageView:setCurrentPageIndex(self._selectedPos - 1)
end

function EquipmentDetailView:updateInfo()
	local equipId = G_UserData:getEquipment():getCurEquipId()
	self._equipData = G_UserData:getEquipment():getEquipmentDataWithId(equipId)
	self._buttonReplace:setVisible(self._equipData:isInBattle())
	self._buttonUnload:setVisible(self._equipData:isInBattle())

	self._nodeEquipDetailView:removeAllChildren()
	local equipDetail = EquipDetailBaseView.new(self._equipData, self._rangeType)
	self._nodeEquipDetailView:addChild(equipDetail)

	self:_checkRedPoint()
end

function EquipmentDetailView:_updateArrowBtn()
	self._buttonLeft:setVisible(self._selectedPos > 1)
	self._buttonRight:setVisible(self._selectedPos < self._equipCount)
end

function EquipmentDetailView:_onButtonLeftClicked()
	if self._selectedPos <= 1 then
		return
	end

	self._selectedPos = self._selectedPos - 1
	local curEquipId = self._allEquipIds[self._selectedPos]
	G_UserData:getEquipment():setCurEquipId(curEquipId)
	self:_updateArrowBtn()
	self._pageView:setCurrentPageIndex(self._selectedPos - 1)
	self:updateInfo()
end

function EquipmentDetailView:_onButtonRightClicked()
	if self._selectedPos >= self._equipCount then
		return
	end

	self._selectedPos = self._selectedPos + 1
	local curEquipId = self._allEquipIds[self._selectedPos]
	G_UserData:getEquipment():setCurEquipId(curEquipId)
	self:_updateArrowBtn()
	self._pageView:setCurrentPageIndex(self._selectedPos - 1)
	self:updateInfo()
end

function EquipmentDetailView:_onButtonReplaceClicked()
	G_SceneManager:popScene()
	local scene = G_SceneManager:getTopScene()
	if scene:getName() == "team" then
		local view = scene:getSceneView()
		view:setNeedPopupEquipReplace(self._btnReplaceShowRP)
	end
end

function EquipmentDetailView:_onButtonUnloadClicked()
	local pos = self._equipData:getPos()
	local slot = self._equipData:getSlot()
	G_UserData:getEquipment():c2sClearFightEquipment(pos, slot)
end

function EquipmentDetailView:_equipClearSuccess(eventName, slot)
	G_SceneManager:popScene()
	local scene = G_SceneManager:getTopScene()
	if scene:getName() == "team" then
		local view = scene:getSceneView()
		view:setNeedEquipClearPrompt(true)
	end
end

function EquipmentDetailView:_checkRedPoint()
	local pos = self._equipData:getPos()
	local slot = self._equipData:getSlot()
	local param = {pos = pos, slot = slot}
	local reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_EQUIP, "slotRP", param)
	self._buttonReplace:showRedPoint(reach)
	self._btnReplaceShowRP = reach
end

function EquipmentDetailView:_onPageTouch(sender, state)
	if state == ccui.TouchEventType.began then
		return true
	elseif state == ccui.TouchEventType.moved then
		
	elseif state == ccui.TouchEventType.ended or state == ccui.TouchEventType.canceled then
		
	end
end

function EquipmentDetailView:_onPageViewEvent(sender,event)
	if event == ccui.PageViewEventType.turning and sender == self._pageView then
		local targetPos = self._pageView:getCurrentPageIndex() + 1
		if targetPos ~= self._selectedPos then
			self._selectedPos = targetPos
			local curEquipId = self._allEquipIds[self._selectedPos]
			G_UserData:getEquipment():setCurEquipId(curEquipId)
			self:_updateArrowBtn()
			self:updateInfo()
		end
	end
end

return EquipmentDetailView