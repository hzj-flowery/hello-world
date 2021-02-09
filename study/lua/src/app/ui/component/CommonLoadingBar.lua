-- @Author panhoa
-- @Date 9.10.2019
-- @Role dyn's bloodbar

local CommonLoadingBar = class("CommonLoadingBar")
local scheduler = require("cocos.framework.scheduler")

local EXPORTED_METHODS = {
    "startProgress",
    "isLoading",
}


function CommonLoadingBar:ctor()
    self._target = nil
    self._progressScheduler = nil
    self._isLoading = false
end

function CommonLoadingBar:_init()
    self._loadingbar1 = ccui.Helper:seekNodeByName(self._target, "loadingbar1")
    self._loadingbar2 = ccui.Helper:seekNodeByName(self._target, "loadingbar2")
    self._loadingbar3 = ccui.Helper:seekNodeByName(self._target, "loadingbar3")
    self._percentText = ccui.Helper:seekNodeByName(self._target, "percentText")
end

-- @Role    bind
function CommonLoadingBar:bind(target)
    self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

-- @Role    unbind
function CommonLoadingBar:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

-- @Role    Isloading
function CommonLoadingBar:isLoading( ... )
    return self._isLoading
end

-- @Role    StartProgress Animation
function CommonLoadingBar:startProgress(cumstomData)
    if not cumstomData then
        return
    end

    local greenV, yellowV, redV = 60, 30, 0     -- 自定义阶段颜色
    if cumstomData.color then
        greenV, yellowV, redV = cumstomData.color.greenV, cumstomData.color.yellowV, cumstomData.color.redV
    end

    
    local preHp = cumstomData.preHp or 100
    local curHp = cumstomData.curHp or 0
    local maxHp = cumstomData.maxHp or 100
    local frameRate = cumstomData.frameRate or 1/30    -- 自定义刷新频率
    local acceleration = cumstomData.acceleration or 10-- 加速度
    local isPercent = cumstomData.isPercent or false   -- 是否百分比显示
    local prePercentNum = string.format("%.2f", (100 * preHp / maxHp))
    local curPercentNum = string.format("%.2f", (100 * curHp / maxHp))
    local prePercent, curPercent = tonumber(prePercentNum), tonumber(curPercentNum)
    

    self:_endPorgress()
    self._isLoading = true
    self._progressScheduler = scheduler.scheduleGlobal(function(dt)
        -- body
        prePercent = (prePercent - dt*acceleration)
        if prePercent >= curPercent then
            if self._loadingbar1 and self._loadingbar2 then
                self._loadingbar1:setVisible(prePercent > greenV)
                self._loadingbar2:setVisible(prePercent <= greenV and prePercent > yellowV)
                self._loadingbar3:setVisible(prePercent <= yellowV and prePercent > redV)        
                self._loadingbar1:setPercent(prePercent)
                self._loadingbar2:setPercent(prePercent)
                self._loadingbar3:setPercent(prePercent)

                -- Show Txt
                if isPercent then
                    self._percentText:setString(math.floor(prePercent) .."/100")
                else
                    self._percentText:setString(math.floor(prePercent * maxHp/100) .."/" ..maxHp)
                end
            end
        else
            self:_endPorgress()
        end
    end, frameRate)
end

function CommonLoadingBar:_endPorgress()
    if self._progressScheduler then
        scheduler.unscheduleGlobal(self._progressScheduler)
        self._progressScheduler = nil
        self._isLoading = false
    end
end



return CommonLoadingBar