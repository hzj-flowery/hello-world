
local PopupBase = require("app.ui.PopupBase")
local PopupGuildChangeName = class("PopupGuildChangeName", PopupBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local LogicCheckHelper  = require("app.utils.LogicCheckHelper")
local DataConst = require("app.const.DataConst")
local TextHelper = require("app.utils.TextHelper")
local GuildConst = require("app.const.GuildConst")

function PopupGuildChangeName:ctor()
	self._resCost = nil 
    self._textHint = nil

    self._callback = nil
    self._costItem = nil

	local resource = {
		file = Path.getCSB("PopupPlayerModifyName", "playerDetail"),
		binding = {
			_btnConfirm = {
				events = {{event = "touch", method = "onBtnConfirm"}}
			},
			_btnCancel = {
				events = {{event = "touch", method = "onBtnCancel"}}
			},
		}
	}
	PopupGuildChangeName.super.ctor(self, resource, false)
end

function PopupGuildChangeName:onCreate()
	self._commonNodeBk:addCloseEventListener(handler(self, self.onBtnCancel))
	self._btnCancel:setString(Lang.get("common_btn_cancel"))
	self._btnConfirm:setString(Lang.get("common_btn_sure"))

	local InputUtils = require("app.utils.InputUtils")
	self._editBox = InputUtils.createInputView(
	    {
			bgPanel = self._imageInput,
			-- fontSize = 24,
			placeholderFontColor = Colors.INPUT_PLACEHOLDER,
			-- fontColor = Colors.LIST_TEXT,
			fontColor = Colors.BRIGHT_BG_ONE,
			placeholder = Lang.get("guild_create_name_placeholder"),
			maxLength = GuildConst.GUILD_NAME_MAX_LENGTH,
		}
	)
end

function PopupGuildChangeName:updateUI(title,hint,costItem,callback)
	self._callback = callback
    self._costItem = costItem
    self._commonNodeBk:setTitle(title)
    self._textHint:setString(hint)

	self:_updateResCost(costItem)
end

function PopupGuildChangeName:updateFreeDes(des)
    self._textFreeCost:setString(des or Lang.get("player_detail_change_name_free"))
end

function PopupGuildChangeName:_updateResCost(costItem)
	if costItem.size == 0 then
		self._textFreeCost:setVisible(true)
		self._resCost:setVisible(false)
	else
		self._textFreeCost:setVisible(false)
		self._resCost:setVisible(true)
		self._resCost:updateUI(costItem.type,costItem.value,costItem.size)
	end
end

function PopupGuildChangeName:onEnter()
end

function PopupGuildChangeName:onExit()
end

function PopupGuildChangeName:onBtnConfirm(sender)
	local playerName = self._editBox:getText()
	playerName = string.trim(playerName)
	if TextHelper.isNameLegal(playerName,GuildConst.GUILD_NAME_MIN_LENGTH ,GuildConst.GUILD_NAME_MAX_LENGTH ) and self._costItem then
		--执行成功后回调
		local success = LogicCheckHelper.enoughValue(self._costItem.type,self._costItem.value,self._costItem.size)
        if success then
            G_GameAgent:checkContent(playerName, function() 
                if self._callback then
                    self._callback(playerName)
                end
                self:close()
            end)
    
		end
	end
end



function PopupGuildChangeName:onBtnCancel()
	self:close()
end

return PopupGuildChangeName
