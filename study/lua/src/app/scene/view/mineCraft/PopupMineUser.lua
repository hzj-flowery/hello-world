local PopupBase = require("app.ui.PopupBase")
local PopupMineUser = class("PopupMineUser", PopupBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local MineCraftHelper = require("app.scene.view.mineCraft.MineCraftHelper")
local MineBarNode = require("app.scene.view.mineCraft.MineBarNode")
local TextHelper = require("app.utils.TextHelper")

PopupMineUser.SWEEP_MAX = 5
PopupMineUser.SWEEP_INFINITE = 10000

function PopupMineUser:ctor(userId, mineData)
    self._mineData = mineData
    self._userId = userId
    self._mineConfig = mineData:getConfigData()

    -- self._signalEnterMine = nil
    self._signalMineRespond = nil
    self._signalBattleMine = nil
    self._singalFastBattle = nil
    self._signalBuyItem = nil

	local resource = {
		file = Path.getCSB("PopupMineUser", "mineCraft"),
		binding = {
			_btnCancel = {
				events = {{event = "touch", method = "_onFastBattleClick"}}
			},
            _btnFight = {
                events = {{event = "touch", method = "_onFightClick"}}
            },
            _btnLook = {
                events = {{event = "touch", method = "_onBtnLookClick"}}
            }
		}
    }
    self:setName("PopupMineUser")
    PopupMineUser.super.ctor(self, resource)
end

function PopupMineUser:onCreate()
    self._barArmy = MineBarNode.new(self._armyBar)
    self._barArmy:showIcon(true)
    --填充一下名字，战力等不会改变的东西
    local userData = self._mineData:getUserById(self._userId)
    if not userData then 
        self:closeWithAction()
        G_Prompt:showTip(Lang.get("mine_already_leave"))
        return
    end
    self._popBG:addCloseEventListener(handler(self, self.closeWithAction))
    self._popBG:setTitle(Lang.get("mine_target_info"))

    self._textUserName:setString(userData:getUser_name())
    local officerLevel = userData:getOfficer_level()
    self._textUserName:setColor(Colors.getOfficialColor(officerLevel))
    require("yoka.utils.UIHelper").updateTextOfficialOutline(self._textUserName, officerLevel)

    if userData:getGuild_id() == 0 then 
        self._textGuildName:setString(Lang.get("mine_user_no_guild"))
    else
        self._textGuildName:setString(userData:getGuild_name())
    end
    self._textGuildName:setColor(Colors.getMineGuildColor(2))

    local sameGuild = false
    local myGuildId = G_UserData:getGuild():getMyGuildId()
    if userData:getGuild_id() ~= 0 and myGuildId == userData:getGuild_id() then
        sameGuild = true
        self._textGuildName:setColor(Colors.getMineGuildColor(1))
    end


    self._textPeace:setVisible(false)
    self._textTip:setVisible(false)
    self._btnCancel:setVisible(not sameGuild)
    self._btnFight:setVisible(not sameGuild)
    self._textSameGuild:setVisible(sameGuild)

    local id = userData:getAvatar_base_id()
    local limit = require("app.utils.data.AvatarDataHelper").getAvatarConfig(id).limit == 1 and 3 
    local avatarId = require("app.utils.UserDataHelper").convertToBaseIdByAvatarBaseId(userData:getAvatar_base_id(), userData:getBase_id())
    self._heroAvatar:updateUI(avatarId, nil, nil, limit)
    self._textArmyValue:setString(TextHelper.getAmountText3(userData:getPower()))

    self._btnFight:setString(Lang.get("mine_fight"))
    self:_refreshBtnFastBattle()

   
end

function PopupMineUser:onEnter()
    self:_refreshInfo()
    -- self._signalEnterMine = G_SignalManager:add(SignalConst.EVENT_ENTER_MINE, handler(self, self._enterMine))
    self._signalBattleMine = G_SignalManager:add(SignalConst.EVENT_BATTLE_MINE, handler(self, self._onEventBattleMine))
    self._signalMineRespond = G_SignalManager:add(SignalConst.EVENT_GET_MINE_RESPOND, handler(self, self._onEventMineRespond))
    self._singalFastBattle = G_SignalManager:add(SignalConst.EVENT_FAST_BATTLE, handler(self, self._onFastBattle))
    self._signalBuyItem = G_SignalManager:add(SignalConst.EVENT_BUY_ITEM, handler(self, self._refreshBtnFastBattle))
end

function PopupMineUser:onExit()
    -- self._signalEnterMine:remove()
    -- self._signalEnterMine = nil
    if self._signalBattleMine then
        self._signalBattleMine:remove()
        self._signalBattleMine = nil
    end

    if self._signalMineRespond then 
        self._signalMineRespond:remove()
        self._signalMineRespond = nil
    end

    if self._singalFastBattle then
        self._singalFastBattle:remove()
        self._singalFastBattle = nil
    end

    if self._signalBuyItem then 
        self._signalBuyItem:remove()
        self._signalBuyItem = nil
    end
end

function PopupMineUser:_onFastBattleClick() 
    if self._mineConfig.is_battle == 0 then 
        G_Prompt:showTip(Lang.get("mine_cannont_fight"))
        return
    end
    local userData = self._mineData:getUserById(self._userId)
    if self._mineData:getId() ~= G_UserData:getMineCraftData():getSelfMineId() then      --不在自己区域
        G_Prompt:showTip(Lang.get("mine_diff_mine"))
        return    
    elseif not self._mineData:isUserInList(userData:getUser_id()) then            --该玩家已经不在本区域
        G_Prompt:showTip(Lang.get("mine_not_in_same_mine"))
        self:closeWithAction()
        return            
    end
    
    if self._sweepCount ~= PopupMineUser.SWEEP_INFINITE then
        local success = LogicCheckHelper.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_MINE_TOKEN, self._sweepCount)
        if not success then
            return  --令牌不足
        end
    else
        self._sweepCount = PopupMineUser.SWEEP_MAX
    end
    
    
    G_UserData:getMineCraftData():c2sBattleMineFast(self._userId, self._sweepCount)
end

function PopupMineUser:_refreshBtnFastBattle()
    local targetInfameValue = 0
    local userData = self._mineData:getUserById(self._userId)
    if userData then
        targetInfameValue = userData:getInfam_value()
    end
    self:_updateIconInfame(targetInfameValue)

    local strBtn = ""
    local tokenNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_MINE_TOKEN)
    if self:_isHighPower() then
        strBtn = Lang.get("mine_fast_battle", {count = PopupMineUser.SWEEP_MAX})
        self._sweepCount = PopupMineUser.SWEEP_INFINITE
    else
        if tokenNum >= PopupMineUser.SWEEP_MAX or tokenNum == 0  then
            local isPeace = self._mineData:isPeace()
            if isPeace then
                --和平矿
                local remainInfame = self:_getRemainInfameValue()
                if remainInfame < PopupMineUser.SWEEP_MAX and targetInfameValue == 0 then
                    --剩余次数不到5 且 对手不是恶名玩家
                    strBtn = Lang.get("mine_fast_battle", {count = remainInfame})
                    self._sweepCount = remainInfame
                else
                    strBtn = Lang.get("mine_fast_battle", {count = PopupMineUser.SWEEP_MAX})
                    self._sweepCount = PopupMineUser.SWEEP_MAX
                end
            else
                strBtn = Lang.get("mine_fast_battle", {count = PopupMineUser.SWEEP_MAX})
                self._sweepCount = PopupMineUser.SWEEP_MAX
            end
        else
            local isPeace = self._mineData:isPeace()
            if isPeace then
                local remainInfame = self:_getRemainInfameValue()
                if remainInfame < tokenNum and targetInfameValue == 0 then
                    --剩余次数不到tokenNum 且 对手不是恶名玩家
                    strBtn = Lang.get("mine_fast_battle", {count = remainInfame})
                    self._sweepCount = remainInfame
                else
                    strBtn = Lang.get("mine_fast_battle", {count = tokenNum})
                    self._sweepCount = tokenNum
                end
            else
                strBtn = Lang.get("mine_fast_battle", {count = tokenNum})
                self._sweepCount = tokenNum
            end
        end
    end
    
    self._btnCancel:setString(strBtn)

    local userData = self._mineData:getUserById(self._userId)
    if not userData then
        self._textPeace:setString(Lang.get("mine_in_city")) --当前在主城，无法发起攻击
        self._textPeace:setVisible(true)
        self._textTip:setVisible(false)
        self._btnCancel:setVisible(false)
        self._btnFight:setVisible(false)
        return
    end
    local sameGuild = false
    local myGuildId = G_UserData:getGuild():getMyGuildId()
    if userData:getGuild_id() ~= 0 and myGuildId == userData:getGuild_id() then
        sameGuild = true
        self._textGuildName:setColor(Colors.getMineGuildColor(1))
    end
    local isPeace = self._mineData:isPeace()
    self:updatePowerTip()
    if isPeace and self:_isSelfInfameValueMax() and targetInfameValue == 0 then --恶名值满且对方恶名为0 不能攻击
        self._textPeace:setString(Lang.get("mine_peace_max_infame"))
        self._textPeace:setVisible(true)
        self._btnCancel:setVisible(false)
        self._btnFight:setVisible(false)
        self._textSameGuild:setVisible(false)
    else
        self._textPeace:setVisible(false)
        if sameGuild then
            self._textTip:setVisible(false)
        end
        self._btnCancel:setVisible(not sameGuild)
        self._btnFight:setVisible(not sameGuild)
        self._textSameGuild:setVisible(sameGuild)
    end
end

function PopupMineUser:updateOfficialTip()
    local userData = self._mineData:getUserById(self._userId)
    local officerLevel = userData:getOfficer_level()
    local mineOfficeLevel = G_UserData:getBase():getOfficer_level()
    
    local config = require("app.config.official_rank")
    local baseLevel = math.max(officerLevel, mineOfficeLevel)
    local info = config.get(baseLevel)
    assert(info, "official_rank wrong level=" .. baseLevel)
    local delta = info.mine_parameter
    -- logDebug("updateOfficialTip mine=" .. mineOfficeLevel .. ", other=" .. officerLevel .. ", delta=" .. delta)
    if mineOfficeLevel-officerLevel>=delta then
        self._textTip:setVisible(true)
        self._textTip:setString(Lang.get("mine_fight_tip_official_high"))
    elseif officerLevel-mineOfficeLevel>=delta then
        self._textTip:setVisible(true)
        self._textTip:setString(Lang.get("mine_fight_tip_official_low"))
    else
        self._textTip:setVisible(false)
    end
end

--战力不碾压才看官衔
function PopupMineUser:updatePowerTip()
    local userData = self._mineData:getUserById(self._userId)
    local enemyPower = userData:getPower()
    local myPower = G_UserData:getBase():getPower()
    
    local Parameter = require("app.config.parameter")
    local ParameterIDConst = require("app.const.ParameterIDConst")
    local powerGap = tonumber(Parameter.get(ParameterIDConst.POWER_GAP).content)

    if (myPower / enemyPower < powerGap / 1000) then
        --不如对手10%
        self._textTip:setVisible(true)
        self._textTip:setString(Lang.get("mine_power_low"))
        self._textTip:setColor(Colors.SYSTEM_TARGET_RED)
    elseif (myPower / enemyPower > 1000 / powerGap) then
        --超过对手10倍
        self._textTip:setVisible(true)
        self._textTip:setString(Lang.get("mine_power_high"))
        self._textTip:setColor(Colors.BRIGHT_BG_GREEN)
    else
        self:updateOfficialTip()
        self._textTip:setColor(Colors.SYSTEM_TARGET_RED)
    end
end

--高于对手的10倍
function PopupMineUser:_isHighPower()
    local userData = self._mineData:getUserById(self._userId)
    if not userData then
        return false
    end
    local enemyPower = userData:getPower()
    local myPower = G_UserData:getBase():getPower()
    
    local Parameter = require("app.config.parameter")
    local ParameterIDConst = require("app.const.ParameterIDConst")
    local powerGap = tonumber(Parameter.get(ParameterIDConst.POWER_GAP).content)
    
    if (myPower / enemyPower < powerGap / 1000) then
        return false
    elseif (myPower / enemyPower > 1000 / powerGap) then
        return true
    end
    return false
end

function PopupMineUser:_onCancelClick()
    self:closeWithAction()
end

function PopupMineUser:_onFightClick()
    if self._mineConfig.is_battle == 0 then 
        G_Prompt:showTip(Lang.get("mine_cannont_fight"))
        return
    end
    local myGuildId = G_UserData:getGuild():getMyGuildId()
    local userData = self._mineData:getUserById(self._userId)
    -- if userData:getUser_id() == G_UserData:getBase():getId() then         --自己
    --     G_Prompt:showTip(Lang.get("mine_fight_self"))
    --     return
    -- elseif userData:getGuild_id() == myGuildId and myGuildId ~= 0 then      --自己工会
    --     G_Prompt:showTip(Lang.get("mine_fight_guild"))
    --     return
    if self._mineData:getId() ~= G_UserData:getMineCraftData():getSelfMineId() then      --不在自己区域
        G_Prompt:showTip(Lang.get("mine_diff_mine"))
        return    
    elseif not self._mineData:isUserInList(userData:getUser_id()) then            --该玩家已经不在本区域
        G_Prompt:showTip(Lang.get("mine_not_in_same_mine"))
        self:closeWithAction()
        return            
    end

    local success = LogicCheckHelper.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_MINE_TOKEN, 1)
    if not success then
        return  --令牌不足
    end

    G_UserData:getMineCraftData():c2sBattleMine(self._userId)
end

function PopupMineUser:_onEventMineRespond()
    self:_refreshInfo()
end

function PopupMineUser:_onFastBattle()
    self:_refreshBtnFastBattle()
    self:_refreshInfo()
    if G_UserData:getMineCraftData():getSelfMineId() ~= self._mineData:getId() then 
        self:closeWithAction()
    end
end

function PopupMineUser:_refreshInfo()
    local userData = self._mineData:getUserById(self._userId)
    if userData then
        self._barArmy:setPercent(userData:getArmy_value(), true, G_ServerTime:getLeftSeconds(userData:getPrivilege_time()) > 0)
    else 
        self:closeWithAction()
    end

    self:_refreshBtnFastBattle()
end

-- 更新恶名图标
function PopupMineUser:_updateIconInfame(targetInfameValue)
    self._iconInfame:setVisible(targetInfameValue > 0)
end

-- 获取剩下还有多少恶名值就满了
function PopupMineUser:_getRemainInfameValue()
    local ivAddPerAttack = MineCraftHelper.getInfameValueAddPerAttack()
    local infameValue = G_UserData:getMineCraftData():getSelfInfamValue()
    local infameRefreshTime = G_UserData:getMineCraftData():getSelfRefreshTime()
    local privilegeTime = G_UserData:getMineCraftData():getPrivilegeTime()
    local bIsVip = G_ServerTime:getLeftSeconds(privilegeTime) > 0
    local maxInfameValue = MineCraftHelper.getMaxInfameValue(bIsVip)

    --计算当前实际恶名值
    local REFRESH_TIME, NUM_PERCHANGE = MineCraftHelper.getInfameCfg(bIsVip) --每隔多少秒变化一次,每次变化数量
    local countChange = math.floor((G_ServerTime:getTime() - infameRefreshTime) / REFRESH_TIME)
    local curInfameValue = infameValue - NUM_PERCHANGE * countChange
    curInfameValue = math.max(curInfameValue, 0)
    return maxInfameValue - curInfameValue
end

-- 自己恶名值满了没
function PopupMineUser:_isSelfInfameValueMax()
    local isPeace = self._mineData:isPeace()
    local infameValue = G_UserData:getMineCraftData():getSelfInfamValue()
    local infameRefreshTime = G_UserData:getMineCraftData():getSelfRefreshTime()
    local privilegeTime = G_UserData:getMineCraftData():getPrivilegeTime()
    local bIsVip = G_ServerTime:getLeftSeconds(privilegeTime) > 0
    local maxInfameValue = MineCraftHelper.getMaxInfameValue(bIsVip)
    return infameValue >= maxInfameValue
end

--攻击
function PopupMineUser:_onEventBattleMine(eventName, message)
    local myEndArmy = message.self_begin_army - message.self_red_army
    if myEndArmy <= 0 then 
        self:close()
        return
    end

    local enemyEndArmy = message.tar_begin_army - message.tar_red_army
    if enemyEndArmy <= 0 then 
        self:close()
        return
    end
end

function PopupMineUser:_onBtnLookClick()
    G_UserData:getBase():c2sGetUserDetailInfo(self._userId)
end

return PopupMineUser

