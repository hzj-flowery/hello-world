local ViewBase = require("app.ui.ViewBase")
local EventRebelBossNode = class("EventRebelBossNode", ViewBase)

local ExploreDiscover = require("app.config.explore_discover")
local ExploreRebel = require("app.config.explore_rebel")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local scheduler = require("cocos.framework.scheduler")

function EventRebelBossNode:ctor(eventData)
    self._eventData = eventData
    self._discoverData = ExploreDiscover.get(eventData:getEvent_type())
    self._configData = ExploreRebel.get(eventData:getValue1())

    --ui
    -- self._imageTalkBG = nil     --说话背景
    -- self._textTalk = nil        --说话
    self._talkString = nil            --说话
    self._iconDrops = {}
    self._iconDrop1 = nil       --掉落1
    self._iconDrop2 = nil       --掉落2
    self._iconDrop3 = nil       --掉落3
    self._iconDrop4 = nil       --掉落4
    self._textDrop = nil        --掉落预览
    self._textHpValue = nil     --血量
    self._hpPercent = nil       --血量百分比
    self._textCost = nil        --消耗体力
    self._heroAvatar = nil      -- 人物
    self._leftTimeLabel = nil   -- 倒计时
    local resource = {
		file = Path.getCSB("EventRebelBossNode", "exploreMap"),
        binding = {
            _btnFight = {
				events = {{event = "touch", method = "_onFightClick"}}
			},
        }
	}
	EventRebelBossNode.super.ctor(self, resource)
end

function EventRebelBossNode:onCreate()
    self._iconDrops = {self._iconDrop1, self._iconDrop2, self._iconDrop3, self._iconDrop4}
    self._leftTimeLabel:setString(G_ServerTime:getLeftSecondsString(self._eventData:getEndTime(), "00:00:00"))
end

function EventRebelBossNode:onEnter()
    self:_setTalk()
    self:_setPriceInfo()
    self:_refreshHp()
    self:_refreshBtn()
    self:_refreshDrop()
    self._countDownScheduler = scheduler.scheduleGlobal(handler(self, self._onTimer), 0.5)
end

function EventRebelBossNode:onExit()
    scheduler.unscheduleGlobal(self._countDownScheduler)
    self._countDownScheduler = nil
end

function EventRebelBossNode:_setTalk()
    self._heroAvatar:updateUI(405)
    self._heroAvatar:setScale(1.35)

    self._talkString:setString(self._discoverData.description)
end

function EventRebelBossNode:_setPriceInfo()
    local ExploreConst  = require("app.const.ExploreConst")
    self._priceInfo:showResName(true, Lang.get("explore_rebel_cost"))
    self._priceInfo:setResNameFontSize(ExploreConst.COST_NAME_SIZE)
    self._priceInfo:updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_VIT, self._configData.cost)
    self._priceInfo:setTextColorToDTypeColor()
    self._priceInfo:setResNameColor(ExploreConst.COST_NAME_COLOR)
end

--刷新掉落
function EventRebelBossNode:_refreshDrop()
    local ExploreUIHelper = require("app.scene.view.exploreMap.ExploreUIHelper")
    local rewards = ExploreUIHelper.makeExploreRebelRewards(self._configData)

    for k, v in ipairs(self._iconDrops) do
        local reward = rewards[k]
        if reward then
            v:initUI(reward.type, reward.value, reward.size)
            v:setVisible(true)
        else
            v:setVisible(false)     
        end
       
    end
   
end

--刷新按钮状态
function EventRebelBossNode:_refreshBtn()
    local param = self._eventData:getParam()
    if param == 0 then
        self._btnFight:setString(Lang.get("explore_rebel_fight"))
    else
        self._btnFight:setEnabled(false)
        self._btnFight:setString(Lang.get("explore_rebel_beat"))
    end
end

--刷新血量
function EventRebelBossNode:_refreshHp()
    local nowHp =
    {
        self._eventData:getValue2(),
        self._eventData:getValue3(),
        self._eventData:getValue4(),
        self._eventData:getValue5(),
        self._eventData:getValue6(),
        self._eventData:getValue7(),
    }
    local nowTotalHp = 0
    for i, v in pairs(nowHp) do
        nowTotalHp = nowTotalHp + v
    end
    local totalHp = self._eventData:getValue8()
    self._textHpValue:setString(nowTotalHp.." / "..totalHp)
    self._hpPercent:setPercent(math.ceil(nowTotalHp/totalHp*100))
end

--攻打
function EventRebelBossNode:_onFightClick()
    local success = LogicCheckHelper.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_VIT, self._configData.cost)
    if success then
        G_UserData:getExplore():c2sExploreDoEvent(self._eventData:getEvent_id())
        -- G_NetworkManager:send(MessageIDConst.ID_C2S_ExploreDoEvent, {id = self._eventData:getEvent_id()})
    end
end

--获取背景id
function EventRebelBossNode:getBackground()
    return self._configData.in_res
end

--处理事件
function EventRebelBossNode:doEvent()
    -- self._eventData:setParam(1)
	G_UserData:getExplore():setEventParamById(self._eventData:getEvent_id(), 1)
end

function EventRebelBossNode:_onTimer()
    self._leftTimeLabel:setString(G_ServerTime:getLeftSecondsString(self._eventData:getEndTime(), "00:00:00"))
end

return EventRebelBossNode
