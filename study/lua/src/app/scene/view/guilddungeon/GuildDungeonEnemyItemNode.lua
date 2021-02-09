
local ListViewCellBase = require("app.ui.ListViewCellBase")
local GuildDungeonEnemyItemNode = class("GuildDungeonEnemyItemNode", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst =  require("app.const.DataConst")

function GuildDungeonEnemyItemNode:ctor()
    self._resourceNode = nil
    self._imageBg = nil
    self._textName = nil
    self._record01 = nil
    self._record02 = nil
    self._record03 = nil
	local resource = {
		file = Path.getCSB("GuildDungeonEnemyItemNode", "guildDungeon"),
		binding = {
		}
	}
	GuildDungeonEnemyItemNode.super.ctor(self, resource)
end

function GuildDungeonEnemyItemNode:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)

    self._recordNodeList = {self._record01,self._record02,self._record03}
end


function GuildDungeonEnemyItemNode:update(data,index)
	self._data = data
    local recordList =  data.recordList
    local memberList =  data.memberList
    local monster = data.monsterBattleUser
    local rank = data.rank
    local name = data.name
    self._imageBg:setVisible(index % 2 == 0)
    self._textName:setString(tostring(rank).."."..name)
    self._textName:setColor(Colors.getOfficialColor(monster:getUser():getOfficer_level()))
    require("yoka.utils.UIHelper").updateTextOfficialOutline(self._textName, monster:getUser():getOfficer_level())
   
    for k,v in ipairs(self._recordNodeList) do
        local record = recordList[k]
        local member = memberList[k]
        if record then
            local attackName =  nil
            if member then
                attackName = tostring(member:getRankPower()) .. "." .. record:getPlayer_name()
            else
                attackName = record:getPlayer_name()
            end 
            v:updateView(
              record:isIs_win(),
              attackName,
              Colors.getOfficialColor(record:getPlayer_officer()),
              Colors.getOfficialColorOutlineEx(record:getPlayer_officer())
            )
        else
            v:updateToEmptyRecordView()
        end
    end

end

return GuildDungeonEnemyItemNode