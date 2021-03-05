--
-- Author: Liangxu
-- Date: 2018-8-28
--
local TeamHorseIcon = class("TeamHorseIcon")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local HorseConst = require("app.const.HorseConst")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local PopupItemGuider = require("app.ui.PopupItemGuider")
local PopupChooseHorseHelper = require("app.ui.PopupChooseHorseHelper")
local HorseDataHelper = require("app.utils.data.HorseDataHelper")

local POSX_STAR = {
	[1] = 45,
	[2] = 37,
	[3] = 29,
}

function TeamHorseIcon:ctor(target)
	self._target = target
	self._pos = nil
	self._horseId = nil 
	self._totalList = {} --总的更换列表
	self._noWearList = {} --未穿戴的更换列表

	self._spriteAdd = ccui.Helper:seekNodeByName(self._target, "SpriteAdd")
	self._textName = ccui.Helper:seekNodeByName(self._target, "TextName")
	self._imageNameBg = ccui.Helper:seekNodeByName(self._target, "ImageNameBg")
	self._fileNodeCommon = ccui.Helper:seekNodeByName(self._target, "FileNodeCommon")
	cc.bind(self._fileNodeCommon, "CommonHorseIcon")
	self._imageRedPoint = ccui.Helper:seekNodeByName(self._target, "ImageRedPoint")
	self._fileNodeStar = ccui.Helper:seekNodeByName(self._target, "FileNodeStar")
	cc.bind(self._fileNodeStar, "CommonHeroStar")
	self._imageArrow = ccui.Helper:seekNodeByName(self._target, "ImageArrow")
	self._panelTouch = ccui.Helper:seekNodeByName(self._target, "PanelTouch")
	self._panelTouch:addClickEventListenerEx(handler(self, self._onPanelTouch))
end

function TeamHorseIcon:_initUI()
	self._spriteAdd:setVisible(false)
	self._fileNodeCommon:setVisible(false)
	self._textName:setVisible(false)
	self._imageNameBg:setVisible(false)
	self._imageRedPoint:setVisible(false)
	self._fileNodeStar:setVisible(false)
	self._imageArrow:setVisible(false)
end

function TeamHorseIcon:updateIcon(pos)
	self._pos = pos
	self._horseId = G_UserData:getBattleResource():getResourceId(pos, HorseConst.FLAG, 1)
	
	self:_initUI()

	if self._horseId then
		local horseData = G_UserData:getHorse():getUnitDataWithId(self._horseId)
		local horseBaseId = horseData:getBase_id()
		local star = horseData:getStar()
		local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HORSE, horseBaseId)
		
		self._fileNodeCommon:setVisible(true)
		-- self._fileNodeStar:setVisible(true)
		self._textName:setVisible(true)
		self._imageNameBg:setVisible(true)
		self._fileNodeCommon:updateUI(horseBaseId)
		self._fileNodeStar:setCountEx(star)
		local posX = POSX_STAR[star]
		if posX then
			self._fileNodeStar:setPositionX(posX)
		end
		
		-- self._fileNodeStar:setVisible(star > 0)
		local name = HorseDataHelper.getHorseName(horseBaseId, star)
		self._textName:setString(name)
		self._textName:setColor(param.icon_color)
        -- self._textName:enableOutline(param.icon_color_outline, 2)
        
        -- 添加马具简介icon
        self._fileNodeCommon:setEquipBriefVisible(true)
        self._fileNodeCommon:updateEquipBriefBg(horseData:getConfig().color)
        local equipList = G_UserData:getHorseEquipment():getEquipedEquipListWithHorseId(self._horseId)
        local stateList = {0,0,0}
        for k, equipData in pairs(equipList) do
            local config = equipData:getConfig()
            stateList[config.type] = config.color
        end
        self._fileNodeCommon:updateEquipBriefIcon(stateList)
	else
		local heroId = G_UserData:getTeam():getHeroIdWithPos(self._pos)
		local heroUnitData = G_UserData:getHero():getUnitDataWithId(heroId)
		local heroBaseId = heroUnitData:getAvatarToHeroBaseId()
		self._totalList, self._noWearList = G_UserData:getHorse():getReplaceHorseListWithSlot(pos, heroBaseId)
		local isOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_HORSE)
		if #self._noWearList > 0 and isOpen then
			self._spriteAdd:setVisible(true)
			local UIActionHelper = require("app.utils.UIActionHelper")
			UIActionHelper.playBlinkEffect(self._spriteAdd)
		end
	end
end

function TeamHorseIcon:_onPanelTouch()
	local isOpen, des, info = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_HORSE)
	if not isOpen then
		G_Prompt:showTip(des)
		return	
	end

	if self._horseId then
		G_SceneManager:showScene("horseDetail", self._horseId, HorseConst.HORSE_RANGE_TYPE_2)
	else
		if #self._noWearList == 0 then
			local popup = PopupItemGuider.new(Lang.get("way_type_get"))
		    popup:updateUI(TypeConvertHelper.TYPE_HORSE, DataConst.SHORTCUT_HORSE_ID)
		    popup:openWithAction()
		else
			local popup = require("app.ui.PopupChooseHorse").new()
			local callBack = handler(self, self._onChooseHorse)
			popup:setTitle(Lang.get("horse_wear_title"))
			popup:updateUI(PopupChooseHorseHelper.FROM_TYPE1, callBack, self._totalList)
			popup:openWithAction()
		end
	end
end

function TeamHorseIcon:_onChooseHorse(horseId)
	G_UserData:getHorse():c2sWarHorseFit(self._pos, horseId)
end

function TeamHorseIcon:showRedPoint(visible)
	self._imageRedPoint:setVisible(visible)
end

function TeamHorseIcon:showUpArrow(visible)
	local UIActionHelper = require("app.utils.UIActionHelper")
	self._imageArrow:setVisible(visible)
	if visible then
		UIActionHelper.playFloatEffect(self._imageArrow)
	end
end

--只显示
function TeamHorseIcon:onlyShow(data,horseEquipList)
	self:_initUI()
	self._panelTouch:setEnabled(false)
	if data then
		local baseId = data:getBase_id()
		local star = data:getStar()
		local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HORSE, baseId)
		
		self._fileNodeCommon:setVisible(true)
		-- self._fileNodeStar:setVisible(true)
		self._textName:setVisible(true)
		self._imageNameBg:setVisible(true)
		self._fileNodeCommon:updateUI(baseId)
		self._fileNodeStar:setCountEx(star)
		local posX = POSX_STAR[star]
		if posX then
			self._fileNodeStar:setPositionX(posX)
		end
		local name = HorseDataHelper.getHorseName(baseId, star) 
		self._textName:setString(name)
		self._textName:setColor(param.icon_color)
        self._textName:enableOutline(param.icon_color_outline, 2)
        
        -- 添加马具简介icon
        local horseEquipData = data:getEquip()

        self._fileNodeCommon:setEquipBriefVisible(true)
        self._fileNodeCommon:updateEquipBriefBg(data:getConfig().color)
        if horseEquipList then
            local stateList = {0,0,0}
            for index, equipId in ipairs(horseEquipData) do
                if equipId ~= 0 then
                    local equipData = horseEquipList["k_"..equipId]
                    local config    = equipData:getConfig()
                    stateList[index]    = config.color
                end
            end
            self._fileNodeCommon:updateEquipBriefIcon(stateList)
        end
	end
end

return TeamHorseIcon