local ViewBase = require("app.ui.ViewBase")
local EventRebelNode = class("EventRebelNode", ViewBase)

local ExploreDiscover = require("app.config.explore_discover")
local ExploreRebel = require("app.config.explore_rebel")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local scheduler = require("cocos.framework.scheduler")
local ExploreConst  = require("app.const.ExploreConst")

function EventRebelNode:ctor(eventData)
    self._eventData = eventData
    self._discoverData = ExploreDiscover.get(eventData:getEvent_type())
    self._configData = ExploreRebel.get(eventData:getValue1())

    --ui
    self._textRebelTitle = nil  --讨逆状
    self._textRebelContent = nil    --逆贼说明
    self._iconDrop1 = nil       --掉落1
    self._iconDrop2 = nil       --掉落2
    self._iconDrop3 = nil       --掉落3
    self._iconDrops = {}        --掉落组
    self._btnFight = nil        --讨伐按钮
    self._costInfo = nil       --消耗
    self._heroAvatar1 = nil
    self._heroAvatar2 = nil
    self._heroAvatar3 = nil
    self._leftTimeLabel = nil   -- 倒计时

    -- self._textCost = nil        --消耗体力
    -- self._textDrop = nil        --征讨后必定掉落
    local resource = {
		file = Path.getCSB("EventRebelNode", "exploreMap"),
        binding = {
            _btnFight = {
				events = {{event = "touch", method = "_onFightClick"}}
			},
        }
	}
	EventRebelNode.super.ctor(self, resource)
end

function EventRebelNode:onCreate()
    self._textRebelContent:setString(self._discoverData.description)
    local UIHelper = require("yoka.utils.UIHelper")
    UIHelper.setTextLineSpacing(self._textRebelContent, 6)

    self._iconDrops = {self._iconDrop1, self._iconDrop2, self._iconDrop3}
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

    --[[--目前就一个掉落
    self._iconDrops[1]:initUI(self._configData.kill_type, self._configData.kill_resource, self._configData.kill_size)
    self._iconDrops[1]:setVisible(true)
    ]]

    self:_refreshBtn()
    self._costInfo:showResName(true, Lang.get("explore_rebel_cost"))
    self._costInfo:setResNameFontSize(ExploreConst.COST_NAME_SIZE)
    self._costInfo:updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_VIT, self._configData.cost)
    self._costInfo:setTextColorToDTypeColor()
    self._costInfo:setResNameColor(ExploreConst.COST_NAME_COLOR)
    -- self._textCost:setString(Lang.get("explore_stamina_cost", {count = self._configData.cost}))
    self._heroAvatar1:updateUI(6021)
    self._heroAvatar2:updateUI(6011)
    self._heroAvatar3:updateUI(6041)
    self._leftTimeLabel:setString(G_ServerTime:getLeftSecondsString(self._eventData:getEndTime(), "00:00:00"))

end

function EventRebelNode:onEnter()
    self._countDownScheduler = scheduler.scheduleGlobal(handler(self, self._onTimer), 0.5)
end

function EventRebelNode:onExit()
    scheduler.unscheduleGlobal(self._countDownScheduler)
    self._countDownScheduler = nil
end

function EventRebelNode:_refreshBtn()
    local param = self._eventData:getParam()
    if param == 0 then
        self._btnFight:setString(Lang.get("explore_rebel_fight"))
    else
        self._btnFight:setEnabled(false)
        self._btnFight:setString(Lang.get("explore_rebel_beat"))
    end
end

--攻打
function EventRebelNode:_onFightClick()
    local success = LogicCheckHelper.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_VIT, self._configData.cost)
    if success then
        G_UserData:getExplore():c2sExploreDoEvent(self._eventData:getEvent_id())
    end
end

--获取背景id
function EventRebelNode:getBackground()
    return self._configData.in_res
end

--处理事件
function EventRebelNode:doEvent()
    -- self._eventData:setParam(1)
	G_UserData:getExplore():setEventParamById(self._eventData:getEvent_id(), 1)
    self:_refreshBtn()
end

function EventRebelNode:_onTimer()
    self._leftTimeLabel:setString(G_ServerTime:getLeftSecondsString(self._eventData:getEndTime(), "00:00:00"))
end

return EventRebelNode
