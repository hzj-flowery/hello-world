--玩家信息弹框

local PopupBase = require("app.ui.PopupBase")
local PopupPlayerModifyName = class("PopupPlayerModifyName", PopupBase)
local Path = require("app.utils.Path")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local LogicCheckHelper  = require("app.utils.LogicCheckHelper")
local DataConst = require("app.const.DataConst")
local TextHelper = require("app.utils.TextHelper")

local PARAMS_RENAME = 40 -- 改名价格ID

function PopupPlayerModifyName:ctor(title, callback )
	--
	self._title = title or Lang.get("player_detail_change_name")
	self._callback = callback

	self._resCost = nil -- 消费元宝

	self._renameParam = require("app.config.parameter").get(PARAMS_RENAME)
	assert(self._renameParam, "can not find id in parameter "..PARAMS_RENAME)

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
	PopupPlayerModifyName.super.ctor(self, resource, false)
end

function PopupPlayerModifyName:_onPlaceRandomName()
	local oldName = G_UserData:getBase():getName()
	self._editBox:setText(oldName)
end


--
function PopupPlayerModifyName:onCreate()
	self._commonNodeBk:addCloseEventListener(handler(self, self.onBtnCancel))
	self._commonNodeBk:setTitle(self._title)


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
			placeholder = Lang.get("lang_create_role_error_too_long"),
			maxLength = 7,
		}
	)
	--刚进来不用随机名字
	--self:_onPlaceRandomName()


	self._textFreeCost:setString(Lang.get("player_detail_change_name_free"))
	self:_updateResCost()
end

function PopupPlayerModifyName:_updateResCost()
	local needMoney = self:_getResCost()
	if needMoney == 0 then
		self._textFreeCost:setVisible(true)
		self._resCost:setVisible(false)
	else
		self._textFreeCost:setVisible(false)
		self._resCost:setVisible(true)
		self._resCost:updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND,needMoney)
	end
end


function PopupPlayerModifyName:_getResCost()
	local changeCount = G_UserData:getBase():getChange_name_count()
	if changeCount == 0 then
		return 0
	end

	local money = tonumber(self._renameParam.content)
	return money
end

function PopupPlayerModifyName:_onCheckBoxClick(sender)

end


function PopupPlayerModifyName:onEnter()
	self._getChangeName = G_NetworkManager:add(MessageIDConst.ID_S2C_ChangeName, handler(self, self.recvChangeName))
end

function PopupPlayerModifyName:recvChangeName(id, message)
	if message.ret ~= 1 then
		return
	end

	G_Prompt:showTip(Lang.get("player_detail_change_name_ok"))
	self:close()
end

function PopupPlayerModifyName:onExit()
	self._getChangeName:remove()
	self._getChangeName = nil
end


function PopupPlayerModifyName:onBtnConfirm(sender)
	local playerName = self._editBox:getText()
	playerName = string.trim(playerName)
	if TextHelper.isNameLegal(playerName,2,7) then
		--发送消息给服务器
		local needMoney = self:_getResCost()

		--执行成功后回调
		local success, popFunc = LogicCheckHelper.enoughCash(needMoney)
        if success then
            G_GameAgent:checkContent(playerName, function() 
                local message = {name = playerName}
			    G_NetworkManager:send(MessageIDConst.ID_C2S_ChangeName, message)
            end)
			
		else
			popFunc()
		end
	end
end



function PopupPlayerModifyName:onBtnCancel()
	if not isBreak then
		self:close()
	end
end

return PopupPlayerModifyName
