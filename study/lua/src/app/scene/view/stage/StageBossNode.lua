
local ListViewCellBase = require("app.ui.ListViewCellBase")
local StageBossNode = class("StageBossNode", ListViewCellBase)
function StageBossNode:ctor()
    self._panelBoss = nil
    self._bossIcon = nil
    self._bossName = nil
    self._bossCome = nil
    self._imageKill = nil
	local resource = {
		file = Path.getCSB("StageBossNode", "stage"),
		binding = {
           _panelBoss = {
				events = {{event = "touch", method = "_onBossClick"}}
			},
		}
	}
	StageBossNode.super.ctor(self, resource)
end

function StageBossNode:onCreate()
end


--刷新boss信息
function StageBossNode:refreshBossInfo(chapterData)
	local bossid = chapterData:getBossId()
	local bossState = chapterData:getBossState()
	if bossid ~= 0 then
        local StoryEssenceBoss = require("app.config.story_essence_boss")
		local bossData = StoryEssenceBoss.get(bossid)
		assert(bossData, "bossid "..bossid.." error")
		self:_refreshBossPanel(bossData)
		if bossState == 1 then
			self._imageKill:setVisible(true)
		else
			self._imageKill:setVisible(false)
		end
	else
		self._panelBoss:setVisible(false)
	end
end

function StageBossNode:_refreshBossPanel(bossData)
	self._bossName:setString(bossData.name)
	self._bossName:setColor(Colors.getColor(bossData.color))
	self._bossName:enableOutline(Colors.getColorOutline(bossData.color), 2)	
	self._bossIcon:updateUI(bossData.res_id)
	self._bossIcon:setQuality(bossData.color)
	self._panelBoss:setVisible(true)
end


function StageBossNode:_onBossClick(sender)
	local offsetX = math.abs(sender:getTouchEndPosition().x - sender:getTouchBeganPosition().x)
	local offsetY = math.abs(sender:getTouchEndPosition().y - sender:getTouchBeganPosition().y)
	if offsetX < 20 and offsetY < 20  then
		self:dispatchCustomCallback()
	end
end

return StageBossNode