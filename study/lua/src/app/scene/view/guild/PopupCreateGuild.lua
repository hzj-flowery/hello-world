--
-- Author: Liangxu
-- Date: 2017-06-21 14:03:26
-- 创建军团弹框
local PopupBase = require("app.ui.PopupBase")
local PopupCreateGuild = class("PopupCreateGuild", PopupBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local GuildIconNode = require("app.scene.view.guild.GuildIconNode")
local DataConst = require("app.const.DataConst")
local LogicCheckHelper  = require("app.utils.LogicCheckHelper")
local TextHelper = require("app.utils.TextHelper")
local GuildConst = require("app.const.GuildConst")

function PopupCreateGuild:ctor(onClickCreate)
	self._onClickCreate = onClickCreate

	local resource = {
		file = Path.getCSB("PopupCreateGuild", "guild"),
		binding = {
			_btnConfirm = {
				events = {{event = "touch", method = "_onButtonCreate"}}
			},
			_btnCancel = {
				events = {{event = "touch", method = "_onButtonCancel"}}
			},
		}
	}
	PopupCreateGuild.super.ctor(self, resource, false)
end

function PopupCreateGuild:onCreate()
	self._commonNodeBk:setTitle(Lang.get("guild_title_create"))
	self._commonNodeBk:addCloseEventListener(handler(self, self._onClickClose))

	self._btnConfirm:setString(Lang.get("guild_btn_create"))
	self._btnCancel:setString(Lang.get("guild_btn_create_cancel"))

	local InputUtils = require("app.utils.InputUtils")
	self._nameText = InputUtils.createInputView(
	    {
			bgPanel = self._imageInput,
			fontSize = 20,
			placeholderFontColor = Colors.INPUT_PLACEHOLDER,
			fontColor = Colors.BRIGHT_BG_ONE,
			placeholder = Lang.get("guild_create_name_placeholder"),
			maxLength = GuildConst.GUILD_NAME_MAX_LENGTH ,
		}
	)


	local needMoney = UserDataHelper.getCreateGuildNeedMoney()
	self._resCost:updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, needMoney)
end

function PopupCreateGuild:onEnter()

end

function PopupCreateGuild:onExit()

end


function PopupCreateGuild:_onButtonCreate()
	local guildName = self._nameText:getText()
	if TextHelper.isNameLegal(guildName, GuildConst.GUILD_NAME_MIN_LENGTH ,GuildConst.GUILD_NAME_MAX_LENGTH ) then

		--检查军团创建次数
		local userGuildData = G_UserData:getGuild():getUserGuildInfo()
		local remainCnt = UserDataHelper.getParameter(G_ParameterIDConst.GUILD_CREATE_DAILY_MAX) - 
			userGuildData:getCreate_guild_cnt()
		if remainCnt <= 0 then
			G_Prompt:showTip(Lang.get("guild_create_cnt_not_enough"))
			return
		end

		

		local needMoney = UserDataHelper.getCreateGuildNeedMoney()
		local success, popFunc = LogicCheckHelper.enoughCash(needMoney)
		if not success then
			popFunc()
			return
		end
		
		local FunctionCheck = require("app.utils.logic.FunctionCheck")
		local success, commit, funcLevelInfo =  FunctionCheck.funcIsOpened(FunctionConst.FUNC_GUILD_CREATE)
		if not success then
			--G_Prompt:showTip(Lang.get("guild_create_limit_hint",{value01 = funcLevelInfo.level,value02 = funcLevelInfo.vip_level}))
			G_Prompt:showTip(commit)
			return
		end
			
        if self._onClickCreate then
            G_GameAgent:checkContent(guildName, function() 
                self._onClickCreate(guildName)
                self:close()
            end)
		end
	end
end

function PopupCreateGuild:_onButtonCancel()
	self:close()
end

function PopupCreateGuild:_onClickClose()
	self:close()
end

return PopupCreateGuild
