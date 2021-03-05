local StageWidget = class("StageWidget", function()
    return cc.Node:create()
end)
local CountryBossHelper = require("app.scene.view.countryboss.CountryBossHelper")
local CountryBossConst = require("app.const.CountryBossConst")
function StageWidget:ctor(parent, callback)
    parent:addChild(self)

    self._curStage = CountryBossHelper.getStage()
    self._stageChangeCallback = callback

    self:_refreshCheckTime()

    --如果今日开发的话  开启update
    if CountryBossHelper.isTodayOpen() then
        self:scheduleUpdateWithPriorityLua(handler(self, self._update),0)
    end
end

function StageWidget:_update()
    if not self._curCheckTime then
        return
    end
    local curTime = G_ServerTime:getTime()
    if curTime >= self._curCheckTime then
        self:updateStage()
    end
end

function StageWidget:updateStage()
    local  oldStage = self._curStage
    self._curStage = CountryBossHelper.getStage()
    self:_refreshCheckTime()
    if oldStage ~= self._curStage then
        self:stageChange()
    end
    return self._curStage
end

function StageWidget:stageChange()
    if self._stageChangeCallback then
        self._stageChangeCallback(self._curStage)
    end
end

function StageWidget:_refreshCheckTime()
    local newTimes = {}
    local curTime = G_ServerTime:getTime()
    local stage1BeginTime, stage1EndTime, stage2BeginTime, stage2EndTime,
        stage3BeginTime, stage3EndTime = CountryBossHelper.getTimeByStage()
    local timesTables = {stage1BeginTime, stage2BeginTime, stage3BeginTime, stage3EndTime + 1}

    for k, v in ipairs(timesTables) do
        if curTime < v then
            table.insert(newTimes, v)
        end
    end
    self._times = newTimes
    self._curCheckTime = self._times[1]
    table.remove(self._times, 1)
end

return StageWidget
