--
-- Author: JerryHe
-- Date: 2019-02-28
-- 战报解析弹窗
-- 
local PopupBase = require("app.ui.PopupBase")
local PopupReportParse = class("PopupReportParse", PopupBase)
local PopupReportParseCell = require("app.ui.PopupReportParseCell")

local ReportLang = require("app.fight.reportParse.ReportLang")

function PopupReportParse:ctor(parent,reportData,callback)
    self._commonNodeBk = nil --弹框背景
    self._parent    = parent
    self._callback  = callback
    self._reportData    = reportData
	local resource = {
		file = Path.getCSB("PopupReportParse", "common"),
		binding = {
			
		}
	}
	self:setName("PopupReportParse")
	PopupReportParse.super.ctor(self, resource)
end

function PopupReportParse:onCreate()
    self._commonNodeBk:addCloseEventListener(handler(self, self._onButtonClose))
    
	self._listView:setTemplate(PopupReportParseCell)
	self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listView:setCustomCallback(handler(self, self._onItemTouch))
end


function PopupReportParse:onShowFinish()
    -- G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP,self.__cname)
    local actions   = {}
    actions[1]      = cc.DelayTime:create(0.5)
    actions[2]      = cc.CallFunc:create(function()
        if self._callback then
            self._callback()
        end
    end)

    self:runAction(cc.Sequence:create(actions))
end

function PopupReportParse:onEnter()
    self:_refreshList()
    self:setTitle()
end

function PopupReportParse:onExit()
	if self._callback then
        self._callback()
    end

    self:stopAllActions()
end

function PopupReportParse:setTitle(title)
	self._commonNodeBk:setTitle(ReportLang.get("report_parse_title"))
end

function PopupReportParse:_refreshList()
	self._listView:clearAll()
	self._count = math.ceil(#self._reportData)
	self._listView:resize(self._count,1)
end

function PopupReportParse:_onItemUpdate(item, index)
    local data  = self._reportData[index]
    item:update(data)
end

function PopupReportParse:_onItemSelected(item, index)
	
end

function PopupReportParse:_onItemTouch(index, t)
	-- local unitData = self._equipDatas[index * 2 + t]

	-- if self._callBack then
	-- 	self._callBack(unitData)
	-- end

	-- self:close()
end

function PopupReportParse:_onButtonClose()
	self:close()
end

return PopupReportParse