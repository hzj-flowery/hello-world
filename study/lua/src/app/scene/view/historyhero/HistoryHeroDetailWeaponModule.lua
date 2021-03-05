-- Description: 历代名将详情武器模块
-- Company: yoka
-- Author: chenzhongjie
-- Date: 2019-09-23

local ListViewCellBase = require("app.ui.ListViewCellBase")
local HistoryHeroDetailWeaponModule = class("HistoryHeroDetailWeaponModule", ListViewCellBase)
local HistoryHeroDetailSkillCell = require("app.scene.view.historyhero.HistoryHeroDetailSkillCell")
local CSHelper = require("yoka.utils.CSHelper")
local HistoryHeroDataHelper = require("app.utils.data.HistoryHeroDataHelper")


function HistoryHeroDetailWeaponModule:ctor(configId)
	self._configId 	   = configId

	local resource = {
		file = Path.getCSB("HistoryHeroDetailWeaponModule", "historyhero"),
	}
	HistoryHeroDetailWeaponModule.super.ctor(self, resource)
end

function HistoryHeroDetailWeaponModule:updateUI(configId)
	self:_updateIcon(configId)
end

function HistoryHeroDetailWeaponModule:onCreate()
	self._nodeTitle:setFontSize(24)
    self._nodeTitle:setTitle(Lang.get("historyhero_weapon_detail_title_weapon"))

	self:_updateIcon(self._configId)
	self:_updateDesc(self._configId)
end

function HistoryHeroDetailWeaponModule:_updateIcon(configId)
	local heroStepInfo = HistoryHeroDataHelper.getHistoryHeroStepByHeroId(configId, 1)
	self["_commonItem"]:unInitUI()
	self["_commonItem"]:initUI(heroStepInfo.type_1, heroStepInfo.value_1, heroStepInfo.size_1)
	-- 防止界面循环，名将-武器-名将
	self["_commonItem"]:setTouchEnabled(false)
	local TypeConvertHelper = require("app.utils.TypeConvertHelper")
	local weaponParam = TypeConvertHelper.convert(heroStepInfo.type_1 , heroStepInfo.value_1, heroStepInfo.size_1)
	self["_commonItem"]:loadIcon(weaponParam.icon)
    self["_commonItem"]:setIconMask(false)
    
    
    --武器名字
	self._weaponName:setString(weaponParam.name)
    self._weaponName:setColor(weaponParam.icon_color)-- 和名将一样的颜色
    require("yoka.utils.UIHelper").updateTextOutline(self._weaponName, weaponParam)
end

function HistoryHeroDetailWeaponModule:_updateDesc(configId)
	local heroStepInfo = HistoryHeroDataHelper.getHistoryHeroStepByHeroId(configId, 1)
    if self._label == nil then
        self._label = cc.Label:createWithTTF("", Path.getCommonFont(), 20)
        self._label:setColor(Colors.BRIGHT_BG_TWO)
        self._label:setWidth(270)
        self._label:setAnchorPoint(cc.p(0, 1))
        self._panelBg:addChild(self._label)
    end
    self._label:setString(heroStepInfo.description)    

    local BG_WIDTH = 402
    local ORG_HEIGHT = 164
    local MARGIN = 10
    local WEAPON_NAME_HEIGHT = 30
    local height = self._panelBg:getContentSize().height
    local desHeight = self._label:getContentSize().height + 41 + MARGIN * 2 + WEAPON_NAME_HEIGHT
    height = math.max(height, desHeight)--上下各扩展5像素
    self._label:setPosition(cc.p(115, height - 41 - MARGIN - WEAPON_NAME_HEIGHT))
    -- self._nodeTitle:setPositionY(height - 25)
    local size = cc.size(BG_WIDTH, height)
    self._panelBg:setContentSize(size)
    self:setContentSize(size)
	-- 适配描述过长
    local offset = math.max(0, height - ORG_HEIGHT)
    self._commonItem:setPositionY(self._commonItem:getPositionY()+offset)
    self._weaponName:setPositionY(self._weaponName:getPositionY()+offset)
    self._nodeTitle:setPositionY(self._nodeTitle:getPositionY()+offset)
    -- _panelBg _commonItem _weaponName _nodeTitle
end


return HistoryHeroDetailWeaponModule