--
-- Author: JerryHe
-- Date: 2019-01-28
-- 战马装备详情
-- 
local ViewBase = require("app.ui.ViewBase")
local HorseEquipDetailView = class("HorseEquipDetailView", ViewBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local RedPointHelper = require("app.data.RedPointHelper")
local HorseConst = require("app.const.HorseConst")
local CSHelper = require("yoka.utils.CSHelper")
local HorseEquipDetailBaseView = require("app.scene.view.horseEquipDetail.HorseEquipDetailBaseView")
local HorseEquipDataHelper = require("app.utils.data.HorseEquipDataHelper")
local HorseDataHelper = require("app.utils.data.HorseDataHelper")

function HorseEquipDetailView:ctor(equipData, rangeType)
    G_UserData:getHorseEquipment():setCurEquipmentId(equipData:getId())
    
    logWarn("装备详情页面，id = "..equipData:getId())

	self._topbarBase 		= nil --顶部条
	self._buttonLeft 		= nil --左箭头按钮
	self._buttonRight 		= nil --右箭头按钮
	self._buttonReplace 	= nil --更换按钮
	self._buttonUnload		= nil --卸下按钮
    self._nodeDetailView 	= nil 

    self._equipData         = equipData
    self._equipId           = equipData:getId()
    self._horseId           = equipData:getHorse_id()

	self._rangeType = rangeType or HorseConst.HORSE_EQUIP_RANGE_TYPE_1
	self._allHorseEquipList = {}

	local resource = {
		file = Path.getCSB("HorseEquipDetailView", "horse"),
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
	HorseEquipDetailView.super.ctor(self, resource)
end

function HorseEquipDetailView:onCreate()
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

function HorseEquipDetailView:onEnter()
    self._singleHorseEquipAddSuccess = G_SignalManager:add(SignalConst.EVENT_HORSE_EQUIP_ADD_SUCCESS,handler(self,self._horseEquipAddSuccess))
	
	self:_initHorseEquipList()
	self:_updatePageView()
	self:_updateArrowBtn()
	self:_updateInfo()
end

function HorseEquipDetailView:onExit()
	self._singleHorseEquipAddSuccess:remove()
	self._singleHorseEquipAddSuccess = nil
end

function HorseEquipDetailView:_initHorseEquipList()
	if self._rangeType == HorseConst.HORSE_EQUIP_RANGE_TYPE_1 then
		self._allHorseEquipList = G_UserData:getHorseEquipment():getListDataBySort()
    elseif self._rangeType == HorseConst.HORSE_EQUIP_RANGE_TYPE_2 then
        self._allHorseEquipList = G_UserData:getHorseEquipment():getEquipedEquipListWithHorseId(self._horseId)
	end

	self._selectedPos = 0
    for i, equipUnitData in ipairs(self._allHorseEquipList) do
        logWarn("第 "..i .. " 个装备 战马id "..equipUnitData:getHorse_id()..", 类别 "..equipUnitData:getConfig().type)
		if equipUnitData:getId() == self._equipId then
			self._selectedPos = i
		end
    end

	self._maxCount = #self._allHorseEquipList
end

function HorseEquipDetailView:_createPageItem(width, height, i)
	local unitData = self._allHorseEquipList[i]
	local baseId = unitData:getBase_id()

	local widget = ccui.Widget:create()
	widget:setContentSize(width, height)
	local avatar = CSHelper.loadResourceNode(Path.getCSB("CommonHorseEquipAvatar", "common"))
	avatar:updateUI(baseId)
	avatar:showShadow(false)
	local size = widget:getContentSize()
	avatar:setPosition(cc.p(size.width / 2, 300))
	widget:addChild(avatar)

	return widget, avatar
end

function HorseEquipDetailView:_updatePageView()
	self._pageView:removeAllPages()
	self._pageAvatars = {}
	local viewSize = self._pageView:getContentSize()
    for i = 1, self._maxCount do
    	local item, avatar = self:_createPageItem(viewSize.width, viewSize.height, i)
        self._pageView:addPage(item)
        self._pageAvatars[i] = avatar
    end
    self._pageView:setCurrentPageIndex(self._selectedPos - 1)
end

function HorseEquipDetailView:_updateArrowBtn()
	self._buttonLeft:setVisible(self._selectedPos > 1)
	self._buttonRight:setVisible(self._selectedPos < self._maxCount)
end

function HorseEquipDetailView:_updateInfo()

    local equipmentData = G_UserData:getHorseEquipment()
    local curEquipmentId = equipmentData:getCurEquipmentId()
    local curEquipData = equipmentData:getHorseEquipWithEquipId(curEquipmentId)

    -- local heroBaseId = HorseDataHelper.getHeroBaseIdWithHorseId(curEquipData:getHorse_id())
    -- local isInBattle = (curEquipData:getHorse_id() ~= 0) and (heroBaseId ~= nil)

	self._buttonUnload:setVisible(false)
	self._buttonReplace:setVisible(false)

	self._nodeDetailView:removeAllChildren()
	local horseDetail = HorseEquipDetailBaseView.new(curEquipData, self._rangeType)
	self._nodeDetailView:addChild(horseDetail)

	self:_checkRedPoint()
end

function HorseEquipDetailView:_onButtonLeftClicked()
	if self._selectedPos <= 1 then
		return
	end
    self._selectedPos = self._selectedPos - 1
    
    local curEquipData = self._allHorseEquipList[self._selectedPos]
	G_UserData:getHorseEquipment():setCurEquipmentId(curEquipData:getId())
	self:_updateArrowBtn()
	self._pageView:setCurrentPageIndex(self._selectedPos - 1)
	self:_updateInfo()
end

function HorseEquipDetailView:_onButtonRightClicked()
	if self._selectedPos >= self._maxCount then
		return
	end
	self._selectedPos = self._selectedPos + 1
	local curEquipData = self._allHorseEquipList[self._selectedPos]
	G_UserData:getHorseEquipment():setCurEquipmentId(curEquipData:getId())
	self:_updateArrowBtn()
	self._pageView:setCurrentPageIndex(self._selectedPos - 1)
	self:_updateInfo()
end

function HorseEquipDetailView:_onButtonReplaceClicked()
    local function showHorseEquipReplace()
        G_SceneManager:popScene()
        local scene = G_SceneManager:getTopScene()
        local view = scene:getSceneView()
        local viewName = view:getName()
        logWarn("点击更好马具了,viewName = "..tostring(viewName))
        if viewName == "HorseDetailView" or viewName == "HorseTrainView"  then
            local equipData = self._allHorseEquipList[self._selectedPos]
            view:popupHorseEquipReplace(equipData:getConfig().type)
        end
    end

    local function callback(backType)
        if backType then
            if backType == "change" then
                showHorseEquipReplace()
            elseif backType == "put_off" then
                self:_onButtonUnloadClicked()
            end
        end
    end
    local popupHorseEquipInfo = require("app.ui.PopupHorseEquipInfo").new(callback)
    popupHorseEquipInfo:updateUI(TypeConvertHelper.TYPE_HORSE_EQUIP,self._equipData:getBase_id())
    popupHorseEquipInfo:openWithAction()
end

function HorseEquipDetailView:_onButtonUnloadClicked()
    local curEquipData = self._allHorseEquipList[self._selectedPos]
    local curHorseId = curEquipData:getHorse_id()
	G_UserData:getHorseEquipment():c2sEquipWarHorseEquipment(curHorseId,curEquipData:getConfig().type,0)
end

function HorseEquipDetailView:_horseEquipAddSuccess(event,equipPos)
	G_SceneManager:popScene()
    local scene = G_SceneManager:getTopScene()
    local sceneName = scene:getName()
    local view = scene:getSceneView()
    if view then
        local viewName = view:getName()
        if viewName == "HorseTrainView" or viewName == "HorseDetailView" then
            view:updateHorseEquipDifPrompt()
            return
        end
    end
end

function HorseEquipDetailView:_checkRedPoint()
    if self._equipData:getHorse_id() == 0 then
        -- 没有装备战马，不显示红点
        self._buttonReplace:showRedPoint(false)
        return
    end

    -- 装备了战马，根据马具静态id，寻找是否有更好的空闲马具
    local equipBaseId = self._equipData:getBase_id()
    local isBetter = G_UserData:getHorseEquipment():isHaveBetterHorseEquip(equipBaseId)
    self._buttonReplace:showRedPoint(isBetter)
end

function HorseEquipDetailView:_onPageTouch(sender, state)
	if state == ccui.TouchEventType.began then
		return true
	elseif state == ccui.TouchEventType.moved then
		
	elseif state == ccui.TouchEventType.ended or state == ccui.TouchEventType.canceled then
		
	end
end

function HorseEquipDetailView:_onPageViewEvent(sender,event)
	if event == ccui.PageViewEventType.turning and sender == self._pageView then
		local targetPos = self._pageView:getCurrentPageIndex() + 1
		if targetPos ~= self._selectedPos then
			self._selectedPos = targetPos
			local curEquipId = self._allHorseEquipList[self._selectedPos]:getId()
			G_UserData:getHorseEquipment():setCurEquipmentId(curEquipId)
			self:_updateArrowBtn()
			self:_updateInfo()
		end
	end
end

return HorseEquipDetailView