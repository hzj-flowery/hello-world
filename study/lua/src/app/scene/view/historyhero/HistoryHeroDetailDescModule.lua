--[[
   Description: 历代名将详情描述
   Company: yoka
   Author: chenzhongjie
   Date: 2019-07-08 16:14:17
   LastEditors: chenzhongjie
   LastEditTime: 2019-07-09 10:26:59
]]
local ListViewCellBase = require("app.ui.ListViewCellBase")
local HistoryHeroDetailDescModule = class("HistoryHeroDetailAttrModule", ListViewCellBase)

function HistoryHeroDetailDescModule:ctor(historyHeroInfo)
	self._nodeTitle = nil  --CommonDetailTitleWithBg
    self._panelBg = nil  --Panel
    self._historyHeroInfo = historyHeroInfo
    self._label = nil
    
	local resource = {
		file = Path.getCSB("HistoryHeroDetailDescModule", "historyhero"),

	}
	HistoryHeroDetailDescModule.super.ctor(self, resource)
end

function HistoryHeroDetailDescModule:onCreate()
	local size = self._panelBg:getContentSize()
    self:setContentSize(size.width, size.height)

    self:updateUI(self._historyHeroInfo)
end

function HistoryHeroDetailDescModule:onEnter()
end

function HistoryHeroDetailDescModule:onExit()
end

function HistoryHeroDetailDescModule:updateUI(historyHeroInfo)
	self._nodeTitle:setFontSize(24)
    self._nodeTitle:setTitle(Lang.get("hero_detail_title_brief"))
    
    if self._label == nil then
        self._label = cc.Label:createWithTTF("", Path.getCommonFont(), 20)
        self._label:setColor(Colors.BRIGHT_BG_TWO)
        self._label:setWidth(370)
        self._label:setAnchorPoint(cc.p(0, 0))
        self._panelBg:addChild(self._label)
    end
    self._label:setString(historyHeroInfo.description)

    local BG_WIDTH = 402
    local MARGIN = 10
    local height = self._panelBg:getContentSize().height
    local desHeight = self._label:getContentSize().height + 41 + MARGIN * 2
    height = math.max(height, desHeight)--上下各扩展5像素
    self._label:setPosition(cc.p(15, MARGIN))
    self._nodeTitle:setPositionY(desHeight - 25)
    local size = cc.size(BG_WIDTH, desHeight)
    self._panelBg:setContentSize(size)
    self:setContentSize(size)
end

return HistoryHeroDetailDescModule