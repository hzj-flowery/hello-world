-- Description: 历代名将详情觉醒消耗
-- Company: yoka
-- Author: chenzhongjie
-- Date: 2019-09-23

local ListViewCellBase = require("app.ui.ListViewCellBase")
local HistoryHeroDetailAwakenCell = class("HistoryHeroDetailAwakenCell", ListViewCellBase)
local HeroSkillActiveConfig = require("app.config.hero_skill_active")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local HistoryHeroDataHelper = require("app.utils.data.HistoryHeroDataHelper")

function HistoryHeroDetailAwakenCell:ctor(configId)
	self._configId = configId

	local resource = {
		file = Path.getCSB("HistoryHeroDetailAwakenCell", "historyhero"),

	}
	HistoryHeroDetailAwakenCell.super.ctor(self, resource)
end

function HistoryHeroDetailAwakenCell:onCreate()
	local type = TypeConvertHelper.TYPE_HISTORY_HERO
	local param = TypeConvertHelper.convert(type, self._configId, 1)

	self._historyIcon:updateUI(self._configId, 1)
	self._historyIcon:setRoundType(false)
	-- 多级页面很烦
	self._historyIcon:setTouchEnabled(false)
	self._historyIcon:updateUIBreakThrough(2)
    self._heroName:setString(param.name)
	self._heroName:setColor(param.icon_color)
	require("yoka.utils.UIHelper").updateTextOutline(self._heroName, param)


	--tips
	self._tips:setString(Lang.get("historyhero_weapon_detail_awaken_tips"))

	self:_updateDesc(self._configId)

	-- local contentSize = self._panelBg:getContentSize()
	-- local height = contentSize.height
	-- local size = cc.size(contentSize.width, height) 
	-- self:setContentSize(size)
end

function HistoryHeroDetailAwakenCell:_updateDesc(configId)
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
    local MARGIN = 10
    local HERO_NAME_HEIGHT = 30
    local height = self._panelBg:getContentSize().height
    local desHeight = self._label:getContentSize().height + MARGIN * 2 + HERO_NAME_HEIGHT
    height = math.max(height, desHeight)--上下各扩展5像素
    self._label:setPosition(cc.p(115, height - MARGIN - HERO_NAME_HEIGHT))
    local size = cc.size(BG_WIDTH, height)
    self._panelBg:setContentSize(size)
    self:setContentSize(size)
end

function HistoryHeroDetailAwakenCell:update(configId)
	self._historyIcon:updateUI(configId, 1)
end


return HistoryHeroDetailAwakenCell