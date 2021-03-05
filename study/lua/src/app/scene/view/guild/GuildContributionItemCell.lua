
local ListViewCellBase = require("app.ui.ListViewCellBase")
local GuildContributionItemCell = class("GuildContributionItemCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst =  require("app.const.DataConst")
local GuildConst =  require("app.const.GuildConst")
local UserDataHelper =  require("app.utils.UserDataHelper")
local ReturnConst = require("app.const.ReturnConst")

GuildContributionItemCell.BG_IMGS = {[1] = "img_jisi01",[2] = "img_jisi02", [3] = "img_jisi03"}
GuildContributionItemCell.TITLE_IMGS = {[1] = "txt_juntuanjisi01",[2] = "txt_juntuanjisi02", [3] = "txt_juntuanjisi03"}



function GuildContributionItemCell:ctor()
    self._imageBg = nil
    self._textContributionName = nil
    self._imageContributionType = nil
    self._imageReceive = nil
    self._buttonOk = nil
    self._resInfo = nil
    self._item01 = nil
    self._item02 = nil

	local resource = {
		file = Path.getCSB("GuildContributionItemCell", "guild"),
		binding = {
			_buttonOk = {
				events = {{event = "touch", method = "_onButton"}}
			},
		}
	}
	GuildContributionItemCell.super.ctor(self, resource)
end

function GuildContributionItemCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)

    self._buttonOk:setString(Lang.get("guild_contribution_btn_name"))
    self._buttonOk:setSwallowTouches(false)
end


function GuildContributionItemCell:update(config)
    local remainCount = UserDataHelper.getGuildContributionRemainCount()
    local userGuildInfo = G_UserData:getGuild():getUserGuildInfo()
    local index = config.id
    local isContribution = userGuildInfo:getDonate() == config.id
    local canContribution = remainCount > 0--次数够不够
    local contribution = config.contribution
    local exp = config.exp
    self._resInfo:updateUI(config.cost_type,config.cost_value,config.cost_size)

    local restTimes = G_UserData:getReturnData():getPrivilegeRestTimes(ReturnConst.PRIVILEGE_GUILD_CONTRIBUTION)

    self._item01:unInitUI()
    self._item01:initUI( TypeConvertHelper.TYPE_RESOURCE ,DataConst.RES_GUILD_EXP,exp)
    self._item01:showCount(true)
    self._item01:setImageTemplateVisible(true)
    self._item01:showDoubleTips(restTimes > 0)

    self._item02:unInitUI()
    self._item02:initUI( TypeConvertHelper.TYPE_RESOURCE ,DataConst.RES_GONGXIAN,contribution)
    self._item02:showCount(true)
    self._item02:setImageTemplateVisible(true)
    self._item02:showDoubleTips(restTimes > 0)

    self._imageBg:loadTexture(Path.getGuildRes(GuildContributionItemCell.BG_IMGS[index]))
    self._imageContributionType:loadTexture(Path.getTextGuild(GuildContributionItemCell.TITLE_IMGS[index]))
    self._textContributionName:setString(Lang.get("guild_contribution_title_names")[index])

    
    self._imageReceive:setVisible(isContribution)
    self._buttonOk:setVisible(not isContribution)
   
    self._buttonOk:setEnabled(canContribution)
end

function GuildContributionItemCell:_onButton(sender)
    local offsetX = math.abs(sender:getTouchEndPosition().x - sender:getTouchBeganPosition().x)
	local offsetY = math.abs(sender:getTouchEndPosition().y - sender:getTouchBeganPosition().y)
	if offsetX < 20 and offsetY < 20  then
        self:dispatchCustomCallback()
	end
end


return GuildContributionItemCell