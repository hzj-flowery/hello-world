--秦皇陵帮助界面

local PopupBase = require("app.ui.PopupBase")
local PopupQinTombHelp = class("PopupQinTombHelp", PopupBase)
local UIHelper = require("yoka.utils.UIHelper")
local PopupHelpInfoCell = require("app.ui.PopupHelpInfoCell")
local PopupHelpInfoTitleCell = require("app.ui.PopupHelpInfoTitleCell")

function PopupQinTombHelp:ctor()
    self._scrollView = nil
	local resource = {
		file = Path.getCSB("PopupQinTombHelp", "qinTomb"),
		binding = {
            _buttonClose = {
				events = {{event = "touch", method = "_onClickClose"}}
			},
		}
	}
	PopupQinTombHelp.super.ctor(self, resource, true)
end


function PopupQinTombHelp:onCreate()
end

function PopupQinTombHelp:onEnter()
end

function PopupQinTombHelp:onExit()
end

function PopupQinTombHelp:updateUI(txtList)
	--self._listView:setScrollBarEnabled(true)
	self._listView:removeAllChildren()
	for k, txt in ipairs(txtList) do
		local itemWidget = self:_createItem(txt)
		self._listView:pushBackCustomItem(itemWidget)
	end
end

function PopupQinTombHelp:updateUIForHasSubTitle(txtData)
	self._listView:removeAllChildren()
	for k,v in ipairs(txtData) do
		local itemWidget = self:_createTitle(v.title)
		self._listView:pushBackCustomItem(itemWidget)
		for k, txt in ipairs(v.list) do
			local itemWidget = self:_createItem(txt)
			self._listView:pushBackCustomItem(itemWidget)
		end
	end
end


function PopupQinTombHelp:updateByFunctionId(functionId)
	local funcName = FunctionConst.getFuncName(functionId)
	local txtData = Lang.get(funcName)
	if self:_isTxtList(txtData) then
		self:updateUI(txtData)
	else
		self:updateUIForHasSubTitle(txtData)
	end
end


function PopupQinTombHelp:_createItem(txt)
    local cell = PopupHelpInfoCell.new()
    cell:updateUI(txt,280)
    return cell
end

function PopupQinTombHelp:_createTitle(txt)
    local cell = PopupHelpInfoTitleCell.new()
    cell:updateUI(txt)
    return cell
end


function PopupQinTombHelp:_isTxtList(data)
	for k,v in pairs(data) do
		if type(v) == "table" then
			return false
		end
	end
	return true
end


function PopupQinTombHelp:_onClickClose()
	self:close()
end

return PopupQinTombHelp