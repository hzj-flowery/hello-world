local ViewBase = require("app.ui.ViewBase")
local SiegeChallengeBtns = class("SiegeChallengeBtns", ViewBase)

local DataConst = require("app.const.DataConst")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

SiegeChallengeBtns.NORMAL_COST = 1
SiegeChallengeBtns.POWER_COST = 2

SiegeChallengeBtns.FIGHT_TYPE_NORMAL = 1
SiegeChallengeBtns.FIGHT_TYPE_POWER = 2

function SiegeChallengeBtns:ctor(isHalfPrice, uId, bossId, isLeave)
    self._isHalfPrice = isHalfPrice
    self._uId = uId
    self._bossId = bossId

    self._btnNormalAttack = nil     --普通攻击
    self._btnPowerAttack = nil      --强力一击
    self._normalCost = nil          --消耗令牌
    self._powerCost = nil           --强力令牌  
    self._btnShare = nil            --分享按钮

    self._powerTokenCnt = SiegeChallengeBtns.POWER_COST
    self._normalTokenCnt = SiegeChallengeBtns.NORMAL_COST
    self._isLeave = isLeave
	local resource = {
		file = Path.getCSB("SiegeChallengeBtns", "siege"),
		binding = {
            _btnNormalAttack = {
				events = {{event = "touch", method = "_onNormalClick"}}
			},
            _btnPowerAttack = {
				events = {{event = "touch", method = "_onPowerClick"}}
            },
            _btnShare = {
                events = {{event = "touch", method = "_onShareClick"}}
            }
		}
	}
    self:setName("SiegeChallengeBtns")
	SiegeChallengeBtns.super.ctor(self, resource)
end

function SiegeChallengeBtns:onCreate()
    self._btnNormalAttack:setString(Lang.get("siege_normal_attack"))
    self._btnPowerAttack:setString(Lang.get("siege_power_attack"))
    self._btnShare:setString(Lang.get("siege_share"))
    self:_refreshPrice()
end


function SiegeChallengeBtns:_refreshPrice()
    self._normalCost:updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_TOKEN, SiegeChallengeBtns.NORMAL_COST)
    self._normalCost:setTextColorToDTypeColor()   

    self._powerTokenCnt = SiegeChallengeBtns.POWER_COST
    if self._isHalfPrice then
        self._powerTokenCnt = SiegeChallengeBtns.POWER_COST/2
    end
    self._powerCost:updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_TOKEN, self._powerTokenCnt)
    self._powerCost:setTextColorToDTypeColor()     
end


function SiegeChallengeBtns:_onNormalClick()
    self:_challengeBoss(SiegeChallengeBtns.FIGHT_TYPE_NORMAL)
end

function SiegeChallengeBtns:_onPowerClick()
    self:_challengeBoss(SiegeChallengeBtns.FIGHT_TYPE_POWER)
end

function SiegeChallengeBtns:_challengeBoss(type)
    if self._isLeave then
        G_Prompt:showTip(Lang.get("siege_has_left"))
        return
    end
    local needToken = self._normalTokenCnt
    if type == SiegeChallengeBtns.FIGHT_TYPE_POWER then
        needToken = self._powerTokenCnt
    end
    local LogicCheckHelper = require("app.utils.LogicCheckHelper")
    local success = LogicCheckHelper.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_TOKEN, needToken)
    if success then
        G_SignalManager:dispatch(SignalConst.EVENT_CLEAR_GUILD_INVITE_NOTICE)-- 规避演武场景切换的bug
        G_UserData:getSiegeData():c2sRebelArmyBattle(self._uId, self._bossId, type)
        G_UserData:getSiegeData():refreshRebelArmy()     --攻打之后请求刷新数据
    end
end

function SiegeChallengeBtns:setShareVisible(v)
    self._btnShare:setVisible(v)
end

function SiegeChallengeBtns:setShareFunc(func)
    self._shareFunc = func
end

function SiegeChallengeBtns:_onShareClick()
    if self._isLeave then
        G_Prompt:showTip(Lang.get("siege_has_left"))
        return
    end
    if not G_UserData:getGuild():isInGuild() then
        G_Prompt:showTip(Lang.get("siege_no_guild"))
        return
    end
    self._shareFunc()
end

return SiegeChallengeBtns