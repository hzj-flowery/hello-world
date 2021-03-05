local ViewBase = require("app.ui.ViewBase")
local SiegeChallengeInfo = class("SiegeChallengeInfo", ViewBase)

local DataConst = require("app.const.DataConst")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

local SiegeHelper = require("app.scene.view.siege.SiegeHelper")
local TextHelper = require("app.utils.TextHelper")

function SiegeChallengeInfo:ctor()
    self._textBoss = nil        --boss名字
    self._textLevel = nil       --等级
    self._progressHp = nil      --生命条
    self._nowHp = nil           --现在血量
    self._textMaxHp = nil       --最大血量
    self._textHpPercent = nil   --血量百分比
    self._textCountdown = nil   --逃离时间倒计时
    self._tokenInfo = nil       --剿匪令信息
    self._nodeActivityTime = nil    --活动时间节点
    self._textRecoverTime = nil     --恢复时间

    self._leaveTime = 0     --boss逃跑时间
    self._recoverUnit = G_RecoverMgr:getRecoverUnit(G_RecoverMgr.INDEX_TOKEN)  --恢复类资源
    self._needUpdateToken = false
    self._isHalfTime = false
    self._isLeave = false   --boss已经离开
    self._nodeProgress = nil

	local resource = {
		file = Path.getCSB("SiegeChallengeInfo", "siege"),
		binding = {
		}
	}
	SiegeChallengeInfo.super.ctor(self, resource)
end

function SiegeChallengeInfo:onCreate()
end

function SiegeChallengeInfo:onEnter()
    self._signalUseItemMsg = G_SignalManager:add(SignalConst.EVNET_USE_ITEM_SUCCESS, handler(self, self._onEventUseItem))
end

function SiegeChallengeInfo:onExit()
    self._signalUseItemMsg:remove()
    self._signalUseItemMsg = nil
end

function SiegeChallengeInfo:updateUI(config, data)
	if not data then
		assert(false, "SiegeChallengeInfo:updateUI data is nil")
		return
	end

    self._textBoss:setString(config.name)
	self._textBoss:setColor(Colors.getColor(config.color))
	self._textBoss:enableOutline(Colors.getColorOutline(config.color), 2)

    local level = data:getBoss_level()
    self._textLevel:setString(Lang.get("siege_come_level", {count = level}))


    local nowHp = TextHelper.getAmountText3(data:getHp_now())
    self._nowHp:setString(nowHp)

    local maxHp = TextHelper.getAmountText3(data:getHp_max())
    self._textMaxHp:setString("/"..maxHp)

    local hpPercent = math.ceil(data:getHp_now()  / data:getHp_max() * 100)
    self._textHpPercent:setString("( "..hpPercent.."% )")
    self._progressHp:setPercent(hpPercent)

    self._leaveTime = data:getEnd_time()

    self:_refreshActivityTime()
    self:_refreshTokenInfo()
    self:_refreshRunTime()

    local hpProgressTxt = Lang.get("siege_challengeinfo_hp_progress",{
        min = nowHp,
        max = maxHp,
        percent = hpPercent, 
    })
    print(hpProgressTxt)
    self:_createProgressRichText(hpProgressTxt)
end

function SiegeChallengeInfo:_createProgressRichText(richText)
	self._nodeProgress:removeAllChildren()
    local widget = ccui.RichText:createWithContent(richText)
    widget:setAnchorPoint(cc.p(0.5,0.5))
    self._nodeProgress:addChild(widget)
end

function SiegeChallengeInfo:_refreshActivityTime()
    local timeText = nil
    self._isHalfTime, timeText = SiegeHelper.getHalfTimeString()
    self._nodeActivityTime:addChild(timeText)
end

--刷新逃离时间
function SiegeChallengeInfo:_refreshRunTime()
    local timeDiff = self._leaveTime - G_ServerTime:getTime()
    if timeDiff > 0 then
        self._textCountdown:setString(G_ServerTime:_secondToString(timeDiff))
    else
        self._textCountdown:setString(Lang.get("siege_has_left"))
        self._isLeave = true
    end
end

--刷新令牌
function SiegeChallengeInfo:_refreshTokenInfo()
    local maxCount = self._recoverUnit:getMaxLimit()
    local myToken = G_UserData:getBase():getResValue(DataConst.RES_TOKEN)
    self._tokenInfo:updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_TOKEN, myToken)
    self._tokenInfo:setCount(myToken, maxCount)
    self._tokenInfo:setTextColorToDTypeColor()

    if myToken < maxCount then
        self._tokenInfo:showImageAdd(true,true)
        self._textRecoverTime:setVisible(true)
        self._needUpdateToken = true
        local remainTime = self._recoverUnit:getRemainCount()
        local timeString = G_ServerTime:_secondToString(remainTime)
        self._textRecoverTime:setString(Lang.get("siege_token_countdown", {time = timeString}))
    else
        self._tokenInfo:showImageAdd(false)
        self._textRecoverTime:setVisible(false)
        self._needUpdateToken = false
    end
end

--更新
function SiegeChallengeInfo:update()
    self:_refreshRunTime()
    if self._needUpdateToken then
        self:_refreshTokenInfo()
    end
end

--是否是半价时间
function SiegeChallengeInfo:isHalfTime()
    return self._isHalfTime
end

--是否已经离开
function SiegeChallengeInfo:isLeave()
    return self._isLeave
end

function SiegeChallengeInfo:_onEventUseItem(eventName)
    self:_refreshTokenInfo()
end

return SiegeChallengeInfo
