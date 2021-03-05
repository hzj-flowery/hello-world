--帮助界面
local PopupBase = require("app.ui.PopupBase")
local PopupHelpInfoCell = import(".PopupHelpInfoCell")
local PopupHelpInfoTitleCell = import(".PopupHelpInfoTitleCell")
local PopupHelpInfo = class("PopupHelpInfo", PopupBase)


function PopupHelpInfo:ctor()
	self._scrollView = nil
	self._title = nil
	local resource = {
		file = Path.getCSB("PopupHelpInfo", "common"),
		binding = {
            _buttonClose = {
				events = {{event = "touch", method = "_onClickClose"}}
			},
		}
	}
	PopupHelpInfo.super.ctor(self, resource, true)
end


function PopupHelpInfo:onCreate()
	self._title:setString(Lang.get("helperInfo_title"))
end

function PopupHelpInfo:onEnter()
end

function PopupHelpInfo:onExit()
end

function PopupHelpInfo:updateUI(txtList)
	self._listView:removeAllChildren()
	for k, txt in ipairs(txtList) do
		local itemWidget = self:_createItem(txt)
		self._listView:pushBackCustomItem(itemWidget)
	end
end

function PopupHelpInfo:updateUIForHasSubTitle(txtData)
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


function PopupHelpInfo:updateByFunctionId(functionId, param)
	local funcName = FunctionConst.getFuncName(functionId)
	local txtData = Lang.get(funcName)

	if self:_isTxtList(txtData) then
		self:updateUI(txtData)
	else
		txtData = Lang.getTableTxt(txtData, param)
		self:updateUIForHasSubTitle(txtData)
	end
	
end

function PopupHelpInfo:updateByLangName(langName)
	local txtData = Lang.get(langName)
	if self:_isTxtList(txtData) then
		self:updateUI(txtData)
	else
		self:updateUIForHasSubTitle(txtData)
	end
end

function PopupHelpInfo:_createItem(txt)
    local cell = PopupHelpInfoCell.new()
    cell:updateUI(txt)
    return cell
end

function PopupHelpInfo:_createTitle(txt)
    local cell = PopupHelpInfoTitleCell.new()
    cell:updateUI(txt)
    return cell
end

function PopupHelpInfo:_isTxtList(data)
	for k,v in pairs(data) do
		if type(v) == "table" then
			return false
		end
	end
	return true
end


function PopupHelpInfo:_onClickClose()
	self:close()
end

return PopupHelpInfo