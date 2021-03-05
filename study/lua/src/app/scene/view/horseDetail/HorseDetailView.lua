--
-- Author: Liangxu
-- Date: 2018-8-29
-- 战马详情
local ViewBase = require("app.ui.ViewBase")
local HorseDetailView = class("HorseDetailView", ViewBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local RedPointHelper = require("app.data.RedPointHelper")
local HorseConst = require("app.const.HorseConst")
local CSHelper = require("yoka.utils.CSHelper")
local HorseDetailBaseView = require("app.scene.view.horseDetail.HorseDetailBaseView")
local HorseDataHelper = require("app.utils.data.HorseDataHelper")
local HorseDetailEquipNode = require("app.scene.view.horseDetail.HorseDetailEquipNode")

function HorseDetailView:ctor(horseId, rangeType)
	G_UserData:getHorse():setCurHorseId(horseId)

	self._topbarBase 		= nil --顶部条
	self._buttonLeft 		= nil --左箭头按钮
	self._buttonRight 		= nil --右箭头按钮
	self._buttonReplace 	= nil --更换按钮
	self._buttonUnload		= nil --卸下按钮
    self._nodeDetailView 	= nil 
    
    self._canRefreshAttr    = true

	self._rangeType = rangeType or HorseConst.HORSE_RANGE_TYPE_1
    self._allHorseIds = {}
    
    self._recordAttr = G_UserData:getAttr():createRecordData(horseId)

	local resource = {
		file = Path.getCSB("HorseDetailView", "horse"),
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
    
    self:setName("HorseDetailView")
	HorseDetailView.super.ctor(self, resource)
end

function HorseDetailView:onCreate()
	self._pageAvatars = {}

	local TopBarStyleConst = require("app.const.TopBarStyleConst")
	self._topbarBase:updateUI(TopBarStyleConst.STYLE_COMMON)
	self._topbarBase:setImageTitle("txt_sys_com_horse")

	self._pageView:setScrollDuration(0.3)
	self._pageView:addEventListener(handler(self,self._onPageViewEvent))
    self._pageView:addTouchEventListener(handler(self,self._onPageTouch))

	self._buttonUnload:setString(Lang.get("horse_detail_btn_unload"))
	self._buttonReplace:setString(Lang.get("horse_detail_btn_replace"))
end

function HorseDetailView:onEnter()
    self._signalHorseRemoveSuccess = G_SignalManager:add(SignalConst.EVENT_HORSE_CLEAR_SUCCESS, handler(self, self._horseRemoveSuccess))
	
	local curHorseId = G_UserData:getHorse():getCurHorseId()
	if self._rangeType == HorseConst.HORSE_RANGE_TYPE_1 then
		self._allHorseIds = G_UserData:getHorse():getRangeDataBySort()
	elseif self._rangeType == HorseConst.HORSE_RANGE_TYPE_2 then
		local unit = G_UserData:getHorse():getUnitDataWithId(curHorseId)
		local pos = unit:getPos()
		if pos then
			self._allHorseIds = G_UserData:getBattleResource():getHorseIdsWithPos(pos)
		end
	end

	self._selectedPos = 0
	for i, id in ipairs(self._allHorseIds) do
		if id == curHorseId then
			self._selectedPos = i
		end
	end
	self._maxCount = #self._allHorseIds
	self:_initPageView()
	self:_updateArrowBtn()
	self:_updateInfo()
end

function HorseDetailView:onExit()
	self._signalHorseRemoveSuccess:remove()
	self._signalHorseRemoveSuccess = nil
end

function HorseDetailView:_initPageView()
	self._pageItems = {}
	self._pageView:removeAllPages()
	local viewSize = self._pageView:getContentSize()
	for i = 1, self._maxCount do
    	local widget = self:_createPageItem(viewSize.width, viewSize.height)
        self._pageView:addPage(widget)
        self._pageItems[i] = widget
    end
    self:_updatePageItem()
    self._pageView:setCurrentPageIndex(self._selectedPos - 1)
end

function HorseDetailView:_createPageItem(width, height)
	local widget = ccui.Widget:create()
	widget:setContentSize(width, height)
	return widget
end

function HorseDetailView:_updatePageItem()
	local index = self._selectedPos
	for i = index-1, index+1 do
		local widget = self._pageItems[i]
		if widget then --如果当前位置左右没有加Avatar，加上
			local count = widget:getChildrenCount()
			if count == 0 then
				local horseId = self._allHorseIds[i]
				local unitData = G_UserData:getHorse():getUnitDataWithId(horseId)
				local baseId = unitData:getBase_id()
				local avatar = CSHelper.loadResourceNode(Path.getCSB("CommonHorseAvatar", "common"))
				avatar:updateUI(baseId)
				avatar:showShadow(false)
				avatar:showEffect(true)
				local size = widget:getContentSize()
				avatar:setPosition(cc.p(size.width*0.57, 200))
				widget:addChild(avatar)
			end
		end
	end
end

function HorseDetailView:_updateArrowBtn()
	self._buttonLeft:setVisible(self._selectedPos > 1)
	self._buttonRight:setVisible(self._selectedPos < self._maxCount)
end

function HorseDetailView:_updateInfo()
	local horseId = G_UserData:getHorse():getCurHorseId()
	self._horseData = G_UserData:getHorse():getUnitDataWithId(horseId)
	self._buttonUnload:setVisible(self._horseData:isInBattle())
    self._buttonReplace:setVisible(self._horseData:isInBattle())
    if self._canRefreshAttr then
        local attrInfo = HorseDataHelper.getHorseAttrInfo(self._horseData)    
        self._recordAttr:updateData(attrInfo)
    end

    self._nodeEquip:removeAllChildren()
    self._horseEquipItem = HorseDetailEquipNode.new()
    self._nodeEquip:addChild(self._horseEquipItem)
	self._nodeDetailView:removeAllChildren()
	self._horseDetail = HorseDetailBaseView.new(self._horseData, self._rangeType, self._recordAttr, self._horseEquipItem)
    self._nodeDetailView:addChild(self._horseDetail)

	self:_checkRedPoint()

	local avatar = self._pageAvatars[self._selectedPos]
	if avatar then
		avatar:playAnimationOnce("win")
		HorseDataHelper.playVoiceWithId(self._horseData:getBase_id())
	end
end

function HorseDetailView:_onButtonLeftClicked()
	if self._selectedPos <= 1 then
		return
	end
	self._selectedPos = self._selectedPos - 1
	local curHorseId = self._allHorseIds[self._selectedPos]
	G_UserData:getHorse():setCurHorseId(curHorseId)
	self:_updateArrowBtn()
	self._pageView:setCurrentPageIndex(self._selectedPos - 1)
	self:_updateInfo()
	self:_updatePageItem()
end

function HorseDetailView:_onButtonRightClicked()
	if self._selectedPos >= self._maxCount then
		return
	end
	self._selectedPos = self._selectedPos + 1
	local curHorseId = self._allHorseIds[self._selectedPos]
	G_UserData:getHorse():setCurHorseId(curHorseId)
	self:_updateArrowBtn()
	self._pageView:setCurrentPageIndex(self._selectedPos - 1)
	self:_updateInfo()
	self:_updatePageItem()
end

function HorseDetailView:_onButtonReplaceClicked()
	G_SceneManager:popScene()
	local scene = G_SceneManager:getTopScene()
	if scene:getName() == "team" then
		local view = scene:getSceneView()
		view:setNeedPopupHorseReplace(self._btnReplaceShowRP)
	end
end

function HorseDetailView:_onButtonUnloadClicked()
	local pos = self._horseData:getPos()
	G_UserData:getHorse():c2sWarHorseUnFit(pos)
end

function HorseDetailView:_horseRemoveSuccess(eventName, slot)
	G_SceneManager:popScene()
	local scene = G_SceneManager:getTopScene()
	if scene:getName() == "team" then
		local view = scene:getSceneView()
		view:setNeedHorseRemovePrompt(true)
	end
end

function HorseDetailView:_checkRedPoint()
	local pos = self._horseData:getPos()
	local slot = self._horseData:getSlot()
	if pos then
		local heroId = G_UserData:getTeam():getHeroIdWithPos(pos)
		local heroUnitData = G_UserData:getHero():getUnitDataWithId(heroId)
		local heroBaseId = heroUnitData:getBase_id()
		local param = {pos = pos, slot = slot, heroBaseId = heroBaseId,notCheckEquip = true}
		local reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HORSE, "slotRP", param)
		self._buttonReplace:showRedPoint(reach)
		self._btnReplaceShowRP = reach
	end
end

function HorseDetailView:_onPageTouch(sender, state)
	if state == ccui.TouchEventType.began then
		return true
	elseif state == ccui.TouchEventType.moved then
		
	elseif state == ccui.TouchEventType.ended or state == ccui.TouchEventType.canceled then
		
	end
end

function HorseDetailView:_onPageViewEvent(sender,event)
	if event == ccui.PageViewEventType.turning and sender == self._pageView then
		local targetPos = self._pageView:getCurrentPageIndex() + 1
		if targetPos ~= self._selectedPos then
			self._selectedPos = targetPos
			local curHorseId = self._allHorseIds[self._selectedPos]
			G_UserData:getHorse():setCurHorseId(curHorseId)
			self:_updateArrowBtn()
			self:_updateInfo()
			self:_updatePageItem()
		end
	end
end

function HorseDetailView:popupHorseEquipReplace(equipPos)
    logWarn("HorseDetailView:popupHorseEquipReplace "..tostring(equipPos))
    local curHorseId = G_UserData:getHorse():getCurHorseId()
    local totalList,noWearList = G_UserData:getHorseEquipment():getReplaceEquipmentListWithSlot(equipPos,curHorseId)

    -- if #noWearList == 0 then
    --     G_Prompt:showTipOnTop(Lang.get("horse_equip_empty_tip"))
    -- end
    local PopupChooseHorseEquipHelper = require("app.ui.PopupChooseHorseEquipHelper")
    local popup = require("app.ui.PopupChooseHorseEquip").new(self)
    local callBack = function(equipInfo)
        logWarn("点击更好战马装备")
        dump(equipInfo)
        local horseId = curHorseId
        G_UserData:getHorseEquipment():c2sEquipWarHorseEquipment(horseId,equipPos,equipInfo:getId())
    end
    popup:setTitle(Lang.get("horse_equip_wear_title"))                
    popup:updateUI(PopupChooseHorseEquipHelper.FROM_TYPE2, callBack, totalList, nil, noWearList, equipPos)
    popup:openWithAction()
end

function HorseDetailView:updateHorseEquipDifPrompt()
    self._canRefreshAttr = false
    local actions = {}
    actions[1] = cc.DelayTime:create(0.2)
    actions[2] = cc.CallFunc:create(function()
        self._canRefreshAttr = true
        local attrInfo = HorseDataHelper.getHorseAttrInfo(self._horseData)    
        self._recordAttr:updateData(attrInfo)
        self._horseDetail:updateHorseEquipDifPrompt()
    end)

    self:runAction(cc.Sequence:create(actions))
end

return HorseDetailView