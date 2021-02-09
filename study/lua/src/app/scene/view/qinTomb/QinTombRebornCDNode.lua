--秦皇陵重生 倒计时界面
local ViewBase = require("app.ui.ViewBase")
local QinTombRebornCDNode = class("QinTombRebornCDNode", ViewBase)
local QinTombConst = require("app.const.QinTombConst")
function QinTombRebornCDNode:ctor()
    self._panelShadow = nil
    self._textTime = nil

	local resource = {
		file = Path.getCSB("QinTombRebornCDNode", "qinTomb"),

	}
	QinTombRebornCDNode.super.ctor(self, resource)
end

function QinTombRebornCDNode:onCreate()
    local size = G_ResolutionManager:getDesignSize()
    self._panelShadow:setContentSize(cc.size(size[1],size[2]))
end

function QinTombRebornCDNode:onEnter()
end

function QinTombRebornCDNode:onExit()
end


function QinTombRebornCDNode:startCD( ... )
    -- body
    self:setVisible(true)
end


function QinTombRebornCDNode:refreshCdTimeView( finishCall) 

    local selfTeam = G_UserData:getQinTomb():getSelfTeam()
    if selfTeam then
        local rebornTime = selfTeam:getReborn_time()
        local curTime = G_ServerTime:getTime()
        if curTime <= rebornTime  then
            local leftTime = rebornTime-curTime
            self._textTime:setString(Lang.get("qin_tomb_reborn",{num = leftTime}))
        else
            self._textTime:setString(" ")
            self:setVisible(false)
            if finishCall then
                finishCall()
            end
        end
    end

    return true

end

function QinTombRebornCDNode:updateVisible() 
    local selfTeam = G_UserData:getQinTomb():getSelfTeam()
    if selfTeam then
        local isInBorn = selfTeam:getCurrState() == QinTombConst.TEAM_STATE_DEATH
        self:setVisible(isInBorn)
       
    end
end

return QinTombRebornCDNode