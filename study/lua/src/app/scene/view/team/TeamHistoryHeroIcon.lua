--[[
   Description: 阵容-历代名将
   Company: yoka
   Author: chenzhongjie
   Date: 2019-08-13 10:52:34
   LastEditors: chenzhongjie
   LastEditTime: 2019-08-13 11:18:16
]]

local TeamHistoryHeroIcon = class("TeamHistoryHeroIcon")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local PopupItemGuider = require("app.ui.PopupItemGuider")
local PopupChooseHorseHelper = require("app.ui.PopupChooseHorseHelper")
local RedPointHelper = require("app.data.RedPointHelper")
local HistoryHeroConst = require("app.const.HistoryHeroConst")
local UIHelper = require("yoka.utils.UIHelper")

local POSX_STAR = {
	[1] = 45,
	[2] = 37,
	[3] = 29,
}

function TeamHistoryHeroIcon:ctor(target)
	self._target = target
	self._pos = nil
	self._heroId = nil 
	self._totalList = {} --总的更换列表
	self._noWearList = {} --未穿戴的更换列表

	self._spriteAdd = ccui.Helper:seekNodeByName(self._target, "SpriteAdd")
	self._textName = ccui.Helper:seekNodeByName(self._target, "TextName")
	self._imageNameBg = ccui.Helper:seekNodeByName(self._target, "ImageNameBg")
	self._fileNodeCommon = ccui.Helper:seekNodeByName(self._target, "FileNodeCommon")
	cc.bind(self._fileNodeCommon, "CommonHistoryHeroIcon")
	self._imageRedPoint = ccui.Helper:seekNodeByName(self._target, "ImageRedPoint")
	self._imageArrow = ccui.Helper:seekNodeByName(self._target, "ImageArrow")
	self._panelTouch = ccui.Helper:seekNodeByName(self._target, "PanelTouch")
	self._panelTouch:addClickEventListenerEx(handler(self, self._onPanelTouch))
end

function TeamHistoryHeroIcon:_initUI()
	self._spriteAdd:setVisible(false)
	self._fileNodeCommon:setVisible(false)
	self._textName:setVisible(false)
	self._imageNameBg:setVisible(false)
	self._imageRedPoint:setVisible(false)
	self._imageArrow:setVisible(false)
end

function TeamHistoryHeroIcon:updateIcon(pos)
	self._pos = pos
	local historyHeroData = G_UserData:getHistoryHero():getHeroDataWithPos(pos)
	self:_initUI()

	if historyHeroData then
		self._historyHeroId = historyHeroData:getId()
		self._fileNodeCommon:updateUIWithUnitData(historyHeroData, 1)
		self._fileNodeCommon:setVisible(true)
		self._fileNodeCommon:setRoundType(false)

		local reach1 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HISTORY_FORMATION, "strongerThanMe", historyHeroData)
		local reach2 = RedPointHelper.isModuleReach(FunctionConst.FUNC_HISTORY_HERO_WAKEN, historyHeroData)

		local HistoryHeroDataHelper = require("app.utils.data.HistoryHeroDataHelper")
		local heroStepInfo = HistoryHeroDataHelper.getHistoryHeroStepByHeroId(historyHeroData:getSystem_id(), 2)
		local exist = false
		if historyHeroData:getBreak_through() == 2 then
			for i = 1, 3 do
				local value = heroStepInfo["value_"..i]
				local reach3 = G_UserData:getHistoryHero():existLevel2Hero(value)
				local reach4 = G_UserData:getHistoryHero():existLevel1HeroWithWeapon(value)
				exist = exist or (reach3 or reach4)
			end
		end
		
		self:showRedPoint(reach1 or reach2 or exist)
		
		local param = self._fileNodeCommon:getParam()
		self._imageNameBg:setVisible(true)
		self._textName:setVisible(true)
		self._textName:setString(historyHeroData:getConfig().name)
		self._textName:setColor(param.icon_color)
		UIHelper.updateTextOutline(self._textName, param)
	else
		self._historyHeroId = nil
		local reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HISTORY_FORMATION, "space")
		self._spriteAdd:setVisible(reach)
		self:showRedPoint(reach)
		if reach then
			local UIActionHelper = require("app.utils.UIActionHelper")
			UIActionHelper.playBlinkEffect(self._spriteAdd)
		end

		self._imageNameBg:setVisible(false)
		self._textName:setVisible(false)
	end
end

function TeamHistoryHeroIcon:_onPanelTouch()
	local isOpen, des, info = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_HISTORY_HERO)
	if not isOpen then
		G_Prompt:showTip(des)
		return	
	end

	local historyHeroData = G_UserData:getHistoryHero():getHeroDataWithPos(self._pos)
	if historyHeroData then
		G_SceneManager:showScene("historyheroTrain", self._pos)
		-- local isHave = G_UserData:getHistoryHero():isHaveHero(historyHeroData:getConfig().id)
		-- local list = {}
		-- table.insert(list, {cfg = historyHeroData:getConfig(), isHave = isHave})
		-- local PopupHeroDetail = require("app.scene.view.historyhero.PopupHistoryHeroDetail").new(
		-- 	TypeConvertHelper.TYPE_HISTORY_HERO, nil, list, false, historyHeroData:getBreak_through(), historyHeroData:getConfig().id)
		-- PopupHeroDetail:openWithAction()
	else
		--选择历代名将
		local function okCallback(id)
			self._isDoOnformation = true
			G_UserData:getHistoryHero():c2sStarEquip(id, self._pos - 1)
		end
	
		local notInFormationList = G_UserData:getHistoryHero():getNotInFormationList()
		if #notInFormationList == 0 then
			--未上阵列表为空
			local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
			PopupItemGuider:updateUI(TypeConvertHelper.TYPE_HISTORY_HERO, HistoryHeroConst.DEFAULT_HISTORY_HERO_ID)
			PopupItemGuider:openWithAction()
		else
			--选择
			local PopupChooseHistoricalItemView = require("app.scene.view.historyhero.PopupChooseHistoricalItemView").new(
																HistoryHeroConst.TAB_TYPE_HERO, nil, okCallback)
			PopupChooseHistoricalItemView:open()
		end
	end
end

function TeamHistoryHeroIcon:_onChooseHorse(horseId)
	G_UserData:getHorse():c2sWarHorseFit(self._pos, horseId)
end

function TeamHistoryHeroIcon:showRedPoint(visible)
	self._imageRedPoint:setVisible(visible)
end

function TeamHistoryHeroIcon:showUpArrow(visible)
	local UIActionHelper = require("app.utils.UIActionHelper")
	self._imageArrow:setVisible(visible)
	if visible then
		UIActionHelper.playFloatEffect(self._imageArrow)
	end
end

function TeamHistoryHeroIcon:_blankFunc()
	
end

--只显示
function TeamHistoryHeroIcon:onlyShow(data)
	self:_initUI()
	self._panelTouch:setEnabled(false)
	if data then
		self._historyHeroId = data:getId()
		self._fileNodeCommon:updateUIWithUnitData(data, 1)
		self._fileNodeCommon:setVisible(true)
		self._fileNodeCommon:setRoundType(false)
		self._fileNodeCommon:setCallBack(handler(self, self._blankFunc))

		local param = self._fileNodeCommon:getParam()
		self._imageNameBg:setVisible(true)
		self._textName:setVisible(true)
		self._textName:setString(data:getConfig().name)
		self._textName:setColor(param.icon_color)
		UIHelper.updateTextOutline(self._textName, param)
	end
end

return TeamHistoryHeroIcon