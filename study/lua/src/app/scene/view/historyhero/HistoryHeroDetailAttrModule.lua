
-- Author: �û�����
-- Date:2018-11-23 17:08:09
-- Describle：
local ListViewCellBase = require("app.ui.ListViewCellBase")
local HistoryHeroDetailAttrModule = class("HistoryHeroDetailAttrModule", ListViewCellBase)
local AttributeConst = require("app.const.AttributeConst")


function HistoryHeroDetailAttrModule:ctor()

	--csb bind var name
	self._nodeAttr1 = nil  --CommonAttr
	self._nodeAttr2 = nil  --CommonAttr
	self._nodeAttr3 = nil  --CommonAttr
	self._nodeAttr4 = nil  --CommonAttr
	self._nodeTitle = nil  --CommonDetailTitle
	self._panelBg = nil  --Panel

	local resource = {
		file = Path.getCSB("HistoryHeroDetailAttrModule", "historyhero"),

	}
	HistoryHeroDetailAttrModule.super.ctor(self, resource)
end

function HistoryHeroDetailAttrModule:onCreate()
	local size = self._panelBg:getContentSize()
    self:setContentSize(size.width, size.height)
end

function HistoryHeroDetailAttrModule:onEnter()

end

function HistoryHeroDetailAttrModule:onExit()
end

function HistoryHeroDetailAttrModule:updateUI(stepCfg)
	self._nodeTitle:setFontSize(24)
	self._nodeTitle:setTitle(Lang.get("hero_detail_title_attr"))
	self._nodeAttr1:updateView(AttributeConst.ATK, stepCfg.atk, nil, 4)
	self._nodeAttr2:updateView(AttributeConst.HP, stepCfg.hp, nil, 4)
	self._nodeAttr3:updateView(AttributeConst.PD, stepCfg.pdef, nil, 4)
	self._nodeAttr4:updateView(AttributeConst.MD, stepCfg.mdef, nil, 4)
end



return HistoryHeroDetailAttrModule