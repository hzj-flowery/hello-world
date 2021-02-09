
local ListViewCellBase = require("app.ui.ListViewCellBase")
local GuildDungeonPlaybackItemNode = class("GuildDungeonPlaybackItemNode", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst =  require("app.const.DataConst")
local UserDataHelper = require("app.utils.UserDataHelper")
function GuildDungeonPlaybackItemNode:ctor()
    self._resourceNode = nil
    self._imageBg = nil
    self._textRank = nil
    self._imageOfficial = nil
    self._textName = nil
    self._record01 = nil
    self._textTime = nil
    self._commonSeeBtn = nil
	local resource = {
		file = Path.getCSB("GuildDungeonPlaybackItemNode", "guildDungeon"),
		binding = {
            _commonSeeBtn = {
				events = {{event = "touch", method = "_onButtonSee"}}
			},
		}
	}
	GuildDungeonPlaybackItemNode.super.ctor(self, resource)
end

function GuildDungeonPlaybackItemNode:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)

    self._commonSeeBtn:setString(Lang.get("common_btn_playback"))
end


function GuildDungeonPlaybackItemNode:_onButtonSee()
    local record =  self._data.record
    local member =  self._data.member
	self:dispatchCustomCallback(record:getReport_id())
end

function GuildDungeonPlaybackItemNode:update(data,index)
	self._data = data
    local record =  data.record
    local member =  data.member

    local officialName, officialColor,officialInfo = UserDataHelper.getOfficialInfo(record:getPlayer_officer())

    self._imageBg:setVisible(index % 2 == 0)
    if member then
        self._textRank:setString(tostring(member:getRankPower())..".")
        self._textRank:setColor(officialColor)
        require("yoka.utils.UIHelper").updateTextOfficialOutline(self._textRank, record:getPlayer_officer())
    else
        self._textRank:setString("")
    end
    
    self._imageOfficial:loadTexture(Path.getTextHero(officialInfo.picture))
	self._imageOfficial:ignoreContentAdaptWithSize(true)
    self._textName:setString(record:getPlayer_name())
    self._textName:setColor(officialColor)
    require("yoka.utils.UIHelper").updateTextOfficialOutline(self._textName, record:getPlayer_officer())
 
    self._record01:updateView(
        record:isIs_win(),
        tostring(record:getTarget_rank()) .. "." .. record:getTarget_name(),
        Colors.getOfficialColor(record:getTarget_officer()),
        Colors.getOfficialColorOutlineEx(record:getTarget_officer())
    )

   
    self._textTime:setString(G_ServerTime:getPassTime(record:getTime()))

end


return GuildDungeonPlaybackItemNode