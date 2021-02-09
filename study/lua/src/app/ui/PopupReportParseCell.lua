--
-- Author: JerryHe
-- Date: 2019-02-28
-- Desc: 战报解析Cell
-- 
local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupReportParseCell = class("PopupReportParseCell", ListViewCellBase)

local ReportLang = require("app.fight.reportParse.ReportLang")

local MAX_WIDTH     = 924
local LINE_HEIGHT   = 22

function PopupReportParseCell:ctor()
	local resource = {
		file = Path.getCSB("PopupReportParseCell", "common"),
		binding = {
            
		}
	}
	PopupReportParseCell.super.ctor(self, resource)
end

function PopupReportParseCell:onCreate()
	local size = self._resourceNode:getContentSize()
    self:setContentSize(size.width, size.height + 4)
end

function PopupReportParseCell:update(data)
    if data then
        if data.param then
            for k, v in pairs(data.param) do
                if type(v) == "boolean" then
                    if v then
                        data.param[k] = ReportLang.get("txt_report_fight_"..k)
                    else
                        data.param[k] = ReportLang.get("txt_report_fight_not_"..k)
                    end
                end
            end
        end

        local str       = ReportLang.get(data.key,data.param)
        self._txtDesc:removeFromParent()

        self._txtDesc = ccui.RichText:createRichTextByFormatString2(str,Colors.ReportParseColorDefault, 20)
        self._txtDesc:ignoreContentAdaptWithSize(false)
        self._txtDesc:setVerticalSpace(2)
        self._txtDesc:setAnchorPoint(cc.p(0, 0.5))
        self._txtDesc:setContentSize(cc.size(924,0))--高度0则高度自适应
        self._txtDesc:setPosition(0, 22)
        self._txtDesc:formatText()
        self._resourceNode:addChild(self._txtDesc)
    else
        self._txtDesc:setVisible(false)
    end
end

return PopupReportParseCell