
local TowerCheck = {}

function TowerCheck.checkTowerCanChallenge(layerId,popHint)
    local success = true
    local popFunc = nil 

    if popHint == nil then
        popHint = true
    end

    local nextLayer =  G_UserData:getTowerData():getNextLayer()
    local nowLayer = G_UserData:getTowerData():getNow_layer()

    if layerId == nextLayer then
        if nextLayer == nowLayer then
            success = false
            popFunc = function()
                G_Prompt:showTip(Lang.get("challenge_tower_already"))
            end
            
        end
    elseif layerId > nextLayer then
        success = false
        popFunc = function()
            G_Prompt:showTip(Lang.get("challenge_tower_not_reach"))
        end
       
    elseif layerId < nextLayer then
         success = false
        popFunc = function()
            G_Prompt:showTip(Lang.get("challenge_tower_already"))
        end
        
    end


    if popHint and popFunc then
        popFunc()
    end
    return success,popFunc
end


return TowerCheck


