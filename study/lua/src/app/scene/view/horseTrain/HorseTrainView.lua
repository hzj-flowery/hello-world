--
-- Author: Liangxu
-- Date: 2018-8-29
-- 战马培养界面
local ViewBase = require("app.ui.ViewBase")
local HorseTrainView = class("HorseTrainView", ViewBase)
local HorseConst = require("app.const.HorseConst")
local HorseTrainUpStarLayer = require("app.scene.view.horseTrain.HorseTrainUpStarLayer")

function HorseTrainView:ctor(horseId, rangeType, isJumpWhenBack)
	G_UserData:getHorse():setCurHorseId(horseId)
	self._rangeType = rangeType or HorseConst.HORSE_RANGE_TYPE_1
	self._isJumpWhenBack = isJumpWhenBack --当点返回时，是否要跳过上一个场景
	self._allHorseIds = {}

	local resource = {
		file = Path.getCSB("HorseTrainView", "horse"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_buttonLeft = {
				events = {{event = "touch", method = "_onButtonLeftClicked"}}
			},
			_buttonRight = {
				events = {{event = "touch", method = "_onButtonRightClicked"}}
			},
		},
    }
    
    self:setName("HorseTrainView")
	HorseTrainView.super.ctor(self, resource)
end

function HorseTrainView:onCreate()
	local TopBarStyleConst = require("app.const.TopBarStyleConst")
	self._topbarBase:updateUI(TopBarStyleConst.STYLE_COMMON)
	self._topbarBase:setImageTitle("txt_sys_com_horse")
	if self._isJumpWhenBack then
		self._topbarBase:setCallBackOnBack(handler(self, self._setCallback))
	end
end

function HorseTrainView:onEnter()
	self._signalHorseStarUpSuccess = G_SignalManager:add(SignalConst.EVENT_HORSE_STARUP_SUCCESS, handler(self, self._onHorseStarUpSuccess))

	self:_updateHorseIds()
	self:_calCurSelectedPos()
	self:updateArrowBtn()
	self:_updateView()
end

function HorseTrainView:onExit()
	self._signalHorseStarUpSuccess:remove()
	self._signalHorseStarUpSuccess = nil
end

function HorseTrainView:_updateHorseIds()
	local horseId = G_UserData:getHorse():getCurHorseId()
	if self._rangeType == HorseConst.HORSE_RANGE_TYPE_1 then
		self._allHorseIds = G_UserData:getHorse():getRangeDataBySort()
	elseif self._rangeType == HorseConst.HORSE_RANGE_TYPE_2 then
		local unit = G_UserData:getHorse():getUnitDataWithId(horseId)
		local pos = unit:getPos()
		if pos then
			self._allHorseIds = G_UserData:getBattleResource():getHorseIdsWithPos(pos)
		end
	end

	self._horseCount = #self._allHorseIds
end

function HorseTrainView:_calCurSelectedPos()
	self._selectedPos = 1
	local horseId = G_UserData:getHorse():getCurHorseId()
	for i, id in ipairs(self._allHorseIds) do
		if id == horseId then
			self._selectedPos = i
		end
	end
end

function HorseTrainView:_updateView()
	if self._subLayer == nil then
		self._subLayer = HorseTrainUpStarLayer.new(self)
		self._panelContent:addChild(self._subLayer)
	end
	self._subLayer:initInfo()
end

function HorseTrainView:_setCallback()
	G_UserData:getTeamCache():setShowHorseTrainFlag(true)
	G_SceneManager:popSceneByTimes(2) --pop2次，返回阵容界面
end

function HorseTrainView:updateArrowBtn()
	self._buttonLeft:setVisible(self._selectedPos > 1)
	self._buttonRight:setVisible(self._selectedPos < self._horseCount)
end

function HorseTrainView:_onButtonLeftClicked()
	if self._selectedPos <= 1 then
		return
	end

	self._selectedPos = self._selectedPos - 1
	local curHorseId = self._allHorseIds[self._selectedPos]
	G_UserData:getHorse():setCurHorseId(curHorseId)
	self:updateArrowBtn()
	self:_updateView()
end

function HorseTrainView:_onButtonRightClicked()
	if self._selectedPos >= self._horseCount then
		return
	end

	self._selectedPos = self._selectedPos + 1
	local curHorseId = self._allHorseIds[self._selectedPos]
	G_UserData:getHorse():setCurHorseId(curHorseId)
	self:updateArrowBtn()
	self:_updateView()
end

function HorseTrainView:getAllHorseIds()
	return self._allHorseIds
end

function HorseTrainView:getHorseCount()
	return self._horseCount
end

function HorseTrainView:setSelectedPos(pos)
	self._selectedPos = pos
end

function HorseTrainView:getSelectedPos()
	return self._selectedPos
end

function HorseTrainView:setArrowBtnEnable(enable)
	self._buttonLeft:setEnabled(enable)
	self._buttonRight:setEnabled(enable)
end

function HorseTrainView:_onHorseStarUpSuccess()
	--全范围的情况，战马升星如果消耗同名卡，要重新更新列表
	if self._rangeType == HorseConst.HORSE_RANGE_TYPE_1 then 
		self:_updateHorseIds()
		self:_calCurSelectedPos()
		self:updateArrowBtn()
		self._subLayer:updatePageView()
	end
end

function HorseTrainView:getRangeType()
	return self._rangeType
end

function HorseTrainView:updateHorseEquipDifPrompt()
    if self._subLayer then
        self._subLayer:updateHorseEquipDifPrompt()
    end
end

function HorseTrainView:popupHorseEquipReplace(equipPos)
    local horseId = G_UserData:getHorse():getCurHorseId()
    local totalList,noWearList = G_UserData:getHorseEquipment():getReplaceEquipmentListWithSlot(equipPos,horseId)

    local PopupChooseHorseEquipHelper = require("app.ui.PopupChooseHorseEquipHelper")
    local popup = require("app.ui.PopupChooseHorseEquip").new(self)
    local callBack = function(equipInfo)
        G_UserData:getHorseEquipment():c2sEquipWarHorseEquipment(horseId,equipPos,equipInfo:getId())
    end
    popup:setTitle(Lang.get("horse_equip_wear_title"))                
    popup:updateUI(PopupChooseHorseEquipHelper.FROM_TYPE2, callBack, totalList, nil, noWearList, equipPos)
    popup:openWithAction()
end

return HorseTrainView