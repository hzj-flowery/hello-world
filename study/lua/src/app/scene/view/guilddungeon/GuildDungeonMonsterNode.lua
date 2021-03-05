local ViewBase = require("app.ui.ViewBase")
local GuildDungeonMonsterNode = class("GuildDungeonMonsterNode", ViewBase)
local UserDataHelper = require("app.utils.UserDataHelper")

GuildDungeonMonsterNode.SCALE = 0.8

function GuildDungeonMonsterNode:ctor(data)
	self._panelAvatar = nil		
	self._panelTouch = nil	
    self._nodeInfo = nil
	self._imageBoat = nil

    local resource = {
		file = Path.getCSB("GuildDungeonMonsterNode", "guildDungeon"),
		size = {1136, 640},
        binding = {
			_panelTouch = {
				events = {{event = "touch", method = "_onPanelClick"}}
			},
		}
	}
	GuildDungeonMonsterNode.super.ctor(self, resource)
end

function GuildDungeonMonsterNode:onCreate()
    self._starPanel = {self._starPanel1, self._starPanel2, self._starPanel3}
    self._panelTouch:setSwallowTouches(false)
	self._imageBoat:ignoreContentAdaptWithSize(true)
end

function GuildDungeonMonsterNode:onEnter()
end

function GuildDungeonMonsterNode:updateUI(data)
	self._data = data
    self._monsterBattleUser = data.monsterBattleUser
    self._rank = data.rank
    self._name = data.name
    self._recordList = data.recordList
    self._memberList = data.memberList

	self:_createHeroSpine()
	self:_updateBaseInfo()

	self:refreshUI()
end

--刷新人物节点状态
function GuildDungeonMonsterNode:refreshUI()
	local data = UserDataHelper.getGuildDungeonMonsterData(self._rank)
	if data then
		self._data = data
		self._monsterBattleUser = data.monsterBattleUser
		self._rank = data.rank
		self._name = data.name
		self._recordList = data.recordList
		self._memberList = data.memberList
		
		self:_refreshStarView()
	end
end

function GuildDungeonMonsterNode:_refreshStarView()
    for k,v in ipairs(self._starPanel) do
        local record = self._recordList[k]
        if record then
            v:setVisible(true)
            v:setBackGroundImage(record:isIs_win() and Path.getGuildRes("img_juntuanfuben_win01") or 
                 Path.getGuildRes("img_juntuanfuben_los02"))
        else
            v:setVisible(false)
        end
    end
end


function GuildDungeonMonsterNode:_updateBaseInfo()
    self._stageName:setString(self._rank.."."..self._monsterBattleUser:getUser():getName())
	self._stageName:setColor(Colors.getOfficialColor(self._monsterBattleUser:getUser():getOfficer_level()))
	--self._stageName:enableOutline(Colors.getOfficialColorOutline(self._monsterBattleUser.user.officer_level), 1)
	local nameWidth = self._stageName:getContentSize().width
	--self._imageNameBG:setContentSize(cc.size(nameWidth + 65, 33))


	local config = self:getConfig()
	self._imageBoat:loadTexture(Path.getGuildDungeonUI("boat_"..config.boat))

	self._imageBoat:setPosition(config.boat_x_position-config.x_position,
		config.boat_y_position-config.y_position)

	local TextHelper = require("app.utils.TextHelper")
	local sizeText = TextHelper.getAmountText(self._monsterBattleUser:getUser():getPower())
	self._textPowerValue:setString(sizeText)
end

function GuildDungeonMonsterNode:getConfig()
	local GuildStageAtkReward = require("app.config.guild_stage_atk_reward")
	local config = GuildStageAtkReward.get(self._rank)
    assert(config,"guild_stage_atk_reward cannot find id "..tostring(self._rank) )
	return config
end

--创建人物spine
function GuildDungeonMonsterNode:_createHeroSpine()
	local palyerInfo = self._monsterBattleUser:getPlayer_info()
	self._panelAvatar:updateUI(palyerInfo.covertId, nil, nil, palyerInfo.limitLevel)
	self._panelAvatar:setTouchEnabled(false)	
	self._panelAvatar:setScale(GuildDungeonMonsterNode.SCALE)
	self._panelAvatar:turnBack()
	self._panelAvatar:moveTalkToTop()
    
    local height = self._panelAvatar:getHeight()
	self._nodeInfo:setPositionY(height*GuildDungeonMonsterNode.SCALE)
end

--人物面板点击
function GuildDungeonMonsterNode:_onPanelClick(sender)
	local offsetX = math.abs(sender:getTouchEndPosition().x - sender:getTouchBeganPosition().x)
	local offsetY = math.abs(sender:getTouchEndPosition().y - sender:getTouchBeganPosition().y)
	if offsetX < 20 and offsetY < 20  then
		self:showStageDetail()
	end
end

--打开详细面板
function GuildDungeonMonsterNode:showStageDetail()


	local popupFamous = require("app.scene.view.guilddungeon.PopupGuildDungeonMonsterDetail").new(self._data)
	popupFamous:open()
end

--返回人物触摸面板
function GuildDungeonMonsterNode:getPanelTouch()
	return self._panelTouch
end

return GuildDungeonMonsterNode
