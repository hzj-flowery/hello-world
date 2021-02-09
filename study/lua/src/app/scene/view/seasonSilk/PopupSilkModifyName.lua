-- @Author panhoa
-- @Date 8.30.2018
-- @Role

local PopupBase = require("app.ui.PopupBase")
local PopupSilkModifyName = class("PopupSilkModifyName", PopupBase)
local TextHelper = require("app.utils.TextHelper")


function PopupSilkModifyName:ctor(data, modifiedCallBack)
    self._editBox       = nil
    self._commonNodeBk  = nil
    self._btnConfirm    = nil
    self._btnCancel     = nil
	self._imageInput    = nil
	self._curGroupData	= data
    self._modifiedCallBack = modifiedCallBack -- 改名成功后回调主界面更新

	local resource = {
		file = Path.getCSB("PopupSilkModifyName", "seasonSilk"),
		binding = {
			_btnConfirm = {
				events = {{event = "touch", method = "_onBtnConfirm"}}
			},
			_btnCancel = {
				events = {{event = "touch", method = "_onBtnCancel"}}
			},
		}
	}
	PopupSilkModifyName.super.ctor(self, resource, false)
end

function PopupSilkModifyName:onCreate()
	self._commonNodeBk:addCloseEventListener(handler(self, self._onBtnCancel))
    self._commonNodeBk:setTitle(Lang.get("player_detail_change_name"))
	self._btnCancel:setString(Lang.get("common_btn_cancel"))
	self._btnConfirm:setString(Lang.get("common_btn_sure"))
    
	local InputUtils = require("app.utils.InputUtils")
	self._editBox = InputUtils.createInputView(
	{
			bgPanel = self._imageInput,
			placeholderFontColor = Colors.INPUT_PLACEHOLDER,
			fontColor = Colors.BRIGHT_BG_ONE,
			placeholder = Lang.get("season_silk_equip_namelength"),
			maxLength = 5,
		}
	)
end

function PopupSilkModifyName:onEnter()
end

function PopupSilkModifyName:onExit()
end

-- @Role 设置当前组名
-- @Param curname   名称
function PopupSilkModifyName:setCurGroupName(curname)
	self._editBox:setText(curname)
end

function PopupSilkModifyName:_onBtnConfirm(sender)
	local playerName = self._editBox:getText()
	playerName = string.trim(playerName)
    if TextHelper.isNameLegal(playerName, 1, 5) then
        if self._modifiedCallBack then
            self._modifiedCallBack(playerName)
        end

		G_Prompt:showTip(Lang.get("player_detail_change_name_ok"))
		local silkbag = self._curGroupData.silkbag or nil
		G_UserData:getSeasonSport():setModifySilkGroupName(true)
		G_UserData:getSeasonSport():c2sFightsSilkbagSetting(self._curGroupData.idx, playerName, silkbag)
		
		if self._callBack then
			self._callBack()
		end
		self:close()
	end
end

function PopupSilkModifyName:setCloseCallBack(callback)
	self._callBack = callback
end

function PopupSilkModifyName:_onBtnCancel()
	if self._callBack then
		self._callBack()
	end
	self:close()
end

return PopupSilkModifyName
