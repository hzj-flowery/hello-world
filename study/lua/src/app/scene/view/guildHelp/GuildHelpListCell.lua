--
-- Author: Liangxu
-- Date: 2017-06-29 17:01:17
-- 军团求助列表Cell
local ListViewCellBase = require("app.ui.ListViewCellBase")
local GuildHelpListCell = class("GuildHelpListCell", ListViewCellBase)
local UserDataHelper = require("app.utils.UserDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")

GuildHelpListCell.LINE_ITEM_NUM = 2
GuildHelpListCell.MAX_FRAGMENT = 5

function GuildHelpListCell:ctor()
	local resource = {
		file = Path.getCSB("GuildHelpListCell", "guild"),
		binding = {
			_buttonHelp1 = {
				events = {{event = "touch", method = "_onButtonHelpClicked1"}}
			},
			_buttonHelp2 = {
				events = {{event = "touch", method = "_onButtonHelpClicked2"}}
			},
		}
	}
	GuildHelpListCell.super.ctor(self, resource)
end

function GuildHelpListCell:onCreate()
	self._fragmentId = {} --碎片Id

	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)


end

function GuildHelpListCell:update(data1,data2)
	
	self:_updateItem(1,data1)
	self:_updateItem(2,data2)
end

function GuildHelpListCell:_updateItem(index,data)
	if not data then
		self["_panel"..index]:setVisible(false)
		return 
	end
	
	self["_panel"..index]:setVisible(true)

	local memberData = data:getMember()
	local helpBaseData = data:getHelp_base()
	local name = memberData:getName()
	local official = memberData:getOfficer_level()
	local officialName, officialColor = UserDataHelper.getOfficialInfo(official)
	local position = memberData:getPosition()
	local duties = UserDataHelper.getGuildDutiesName(position)
	local fragmentId = helpBaseData:getHelp_id()
	local fragmentParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_FRAGMENT, fragmentId)
	local fragName = fragmentParam.name
	local limitMax = helpBaseData:getLimit_max()
	local alreadyHelp = helpBaseData:getAlready_help()
	local percent = math.ceil(alreadyHelp / limitMax * 100)
	local fragCount = alreadyHelp.."/"..limitMax
	--local haveFragCount = G_UserData:getFragments():getFragNumByID(fragmentId)
	--local canHelp = haveFragCount > 0
	
	self["_textName"..index]:setString(name)
	self["_textPosition"..index]:setString(duties)
	self["_fileNodeIcon"..index]:updateUI(fragmentId)
	self["_textFragName"..index]:setString(fragName)
  	local itemParams = self["_fileNodeIcon"..index]:getItemParams()
    self["_textFragName"..index]:setColor(itemParams.icon_color)
    --self["_textFragName"..index]:enableOutline(itemParams.icon_color_outline,2)

	--self["_loadingBarFrag"..index]:setPercent(percent)
	--self["_textGetFragCount"..index]:setString(fragCount)
	self["_commonProgressBar"..index]:setPercent(alreadyHelp,limitMax)
	self["_commonProgressBar"..index]:showDivider(true,GuildHelpListCell.MAX_FRAGMENT,alreadyHelp,limitMax)--最多5个碎片

	--self["_textHaveFragCount"..index]:setString(Lang.get("guild_help_have_fragment_count", {count = haveFragCount}))

	self._fragmentId[index] = fragmentId

	local gold = UserDataHelper.getGuildHelpNeedGold()
	self:updateBtnState(index,gold)
end

function GuildHelpListCell:updateBtnState(index, gold)
	if not self["_panel"..index]:isVisible() then
		return 
	end

	local showCostGold = gold and gold > 0
	self["_buttonHelp"..index]:setString(showCostGold and "" or Lang.get("guild_help_btn"))
	self["_buttonHelp"..index]:setEnabled(true)

	self["_commonResInfo"..index]:setVisible(showCostGold)
	if showCostGold then
		self["_commonResInfo"..index]:updateUI(TypeConvertHelper.TYPE_RESOURCE,DataConst.RES_DIAMOND,gold)
		self["_commonResInfo"..index]:setCountColorToBtnLevel1Bright()
		self["_commonResInfo"..index]:setFontSize(22)

	end
end


function GuildHelpListCell:_onButtonHelpClicked1()
	self:dispatchCustomCallback(1,self._fragmentId[1])
end

function GuildHelpListCell:_onButtonHelpClicked2()
	self:dispatchCustomCallback(2,self._fragmentId[2])
end


return GuildHelpListCell                             