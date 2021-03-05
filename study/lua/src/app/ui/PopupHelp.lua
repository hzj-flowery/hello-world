--帮助界面
local PopupBase = require("app.ui.PopupBase")
local PopupHelp = class("PopupHelp", PopupBase)
local Path = require("app.utils.Path")

local TypeConvertHelper = require("app.utils.TypeConvertHelper")


function PopupHelp:ctor( title, callback )
	--
	self._title = title or Lang.get("common_btn_help") 
	self._callback = callback
	self._itemId = nil
	self._useNum = 1
	--control init
	self._btnOk = nil -- 
	self._btnCancel = nil
	self._itemName = nil -- 物品名称

	self._textListView = nil --拥有物品
	--
	local resource = {
		file = Path.getCSB("PopupHelp", "common"),
		binding = {

		}
	}
	PopupHelp.super.ctor(self, resource, true)
end

--
function PopupHelp:onCreate()

	self._commonNodeBk:setTitle(self._title)
	self._commonNodeBk:addCloseEventListener(handler(self, self.onBtnCancel))
end

function PopupHelp:updateUI(params)
	for index, value in ipairs(params) do
		if value.title and value.title ~= "" then
			local titleLabel = self:_createTitleLabel(value.title)
			self._textListView:pushBackCustomItem(titleLabel)
		end
		if value.content and value.content ~= "" then
			local contentLabel = self:_createContentLabel(value.content)
			self._textListView:pushBackCustomItem(contentLabel)
		end
	end
end

function PopupHelp:_createTitleLabel(text)
	local UIHelper = require("yoka.utils.UIHelper")
	local params = {
		fontSize = 24,
		color = Colors.COLOR_POPUP_TITLE_TINY,
		contentSize = cc.size(520,30)
	}

    local label = UIHelper.createLabel(params)
	local render = label:getVirtualRenderer()
	render:setMaxLineWidth(520)
    render:setLineBreakWithoutSpace(true)
	render:setString(text)
	return label
end


function PopupHelp:_createContentLabel(text)
	local UIHelper = require("yoka.utils.UIHelper")
	local params = {
		fontSize = 20,
		color = Colors.COLOR_POPUP_DESC_NORMAL,
		contentSize = cc.size(520,30)
	}

    local label = UIHelper.createLabel(params)
	local render = label:getVirtualRenderer()
	render:setMaxLineWidth(520)
    render:setLineBreakWithoutSpace(true)
	render:setString(text)
	return label
end


function PopupHelp:onEnter()
    
end

function PopupHelp:onExit()
    
end

function PopupHelp:onBtnCancel()
	if not isBreak then
		self:close()
	end
end

return PopupHelp