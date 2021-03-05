
local ListViewCellBase = require("app.ui.ListViewCellBase")
local GuildDungeonMemberItemNode = class("GuildDungeonMemberItemNode", ListViewCellBase)
local UserDataHelper = require("app.utils.UserDataHelper")


function GuildDungeonMemberItemNode:ctor()
    self._resourceNode = nil
    self._imageBg = nil
    self._imageOfficial = nil
    self._textName = nil
    self._textPoint = nil
    self._textRank = nil
    self._record01 = nil
    self._record02 = nil
    self._record03 = nil

	local resource = {
		file = Path.getCSB("GuildDungeonMemberItemNode", "guildDungeon"),
		binding = {
		}
	}
	GuildDungeonMemberItemNode.super.ctor(self, resource)
end

function GuildDungeonMemberItemNode:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)

    self._recordNodeList = {self._record01,self._record02,self._record03}
end


function GuildDungeonMemberItemNode:update(data,index)
	self._data = data
    local recordList =  data.recordList
    local member =  data.member
    local rank = data.rank
    local officialName, officialColor,officialInfo = UserDataHelper.getOfficialInfo(member:getOfficer_level())
    
    if index == 35 then
         dump(member)
    end
   

    self._imageBg:setVisible(index % 2 == 0)
    self._textRank:setString(tostring(rank)..".")
    self._textRank:setColor(officialColor)
    self._imageOfficial:loadTexture(Path.getTextHero(officialInfo.picture))
	self._imageOfficial:ignoreContentAdaptWithSize(true)
    self._textName:setString(member:getName())
    self._textName:setColor(officialColor)
   
    self._textPoint:setString(tostring(member:getDungeon_point()))
   
 
    for k,v in ipairs(self._recordNodeList) do
        local record = recordList[k]
        if record then
            v:updateView(
              record:isIs_win(),
              tostring(record:getTarget_rank()) .. "." .. record:getTarget_name(),
              Colors.getOfficialColor(record:getTarget_officer()),
              Colors.getOfficialColorOutlineEx(record:getTarget_officer())
            )
        else
            v:updateToEmptyRecordView()
        end
    end

end

return GuildDungeonMemberItemNode