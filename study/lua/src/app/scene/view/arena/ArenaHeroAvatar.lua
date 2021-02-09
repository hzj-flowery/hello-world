--竞技场
--英雄avatar 展示
local ViewBase = require("app.ui.ViewBase")
local ArenaHeroAvatar = class("ArenaHeroAvatar", ViewBase)

local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local UIPopupHelper	 = require("app.utils.UIPopupHelper")
local ArenaHelper    = require("app.scene.view.arena.ArenaHelper")
local TextHelper = require("app.utils.TextHelper")
function ArenaHeroAvatar:ctor()
    
    self._commonHeroAvatar = nil
    self._textUserName     = nil
    self._textPowerValue   = nil
    self._btnSweep         = nil
    self._imageSelf        = nil

    local resource = {
        file = Path.getCSB("ArenaHeroAvatar", "arena"),
    }
    ArenaHeroAvatar.super.ctor(self, resource)
end

function ArenaHeroAvatar:onCreate()

    self._btnSweep:setVisible(false)
    self._imageSelf:setVisible(false)
    self._btnSweep:addClickEventListenerEx(handler(self,self._onButtonSweep))
end

function ArenaHeroAvatar:turnBack()
    self._commonHeroAvatar:turnBack()
end

function ArenaHeroAvatar:updateBaseId(baseId)
    self._commonHeroAvatar:updateUI(baseId)
end


function ArenaHeroAvatar:updateAnimation(baseId)
    self._commonHeroAvatar:updateUI(baseId)
    self:hideTopInfo()
    self:showShadow(false)
end

function ArenaHeroAvatar:getBaseId()
    return self._commonHeroAvatar:getBaseId()
end

--是否为玩家自己
function ArenaHeroAvatar:isSelf()

	if self._arenaPlayer.uid == G_UserData:getBase():getId() then
		return true
	end

	return false
end

function ArenaHeroAvatar:getUserId()
    return self._arenaPlayer.uid
end


function ArenaHeroAvatar:updateAvatar(arenaPlayer, callBackFunc)
    if arenaPlayer == nil then
        return
    end

    self._arenaPlayer = arenaPlayer

    self._commonHeroAvatar:setTouchEnabled(true)
    self._commonHeroAvatar:updateAvatar(arenaPlayer.baseTable)
    self._commonHeroAvatar:setUserData(arenaPlayer)
    self._commonHeroAvatar:setCallBack(callBackFunc)

    self:updateLabel("_textUserName",
	{
		text = arenaPlayer.name,
		color = Colors.getOfficialColor(arenaPlayer.officialLevel),
		outlineColor = Colors.getOfficialColorOutline(arenaPlayer.officialLevel)
	})

    self._textPowerValue:setString( TextHelper.getAmountText( arenaPlayer.power) )
    

    local myRank = G_UserData:getArenaData():getArenaRank()
    local arenaRank = arenaPlayer.rank
    if self:isSelf() then
        self:checkFristBattle()
    else
        local nodeRank = self:getSubNodeByName("Node_rank")
        if nodeRank then
            ArenaHelper.updateArenaRank(nodeRank,arenaRank)
        end
    end
    
    local LogicCheckHelper = require("app.utils.LogicCheckHelper")

    --扫荡功能是否开放
    --当前排行是否小于该单位排行
    if myRank < self._arenaPlayer.rank and LogicCheckHelper.funcIsShow(FunctionConst.FUNC_ARENA_SWEEP) then
        self._btnSweep:setVisible(true)
    end

   
    if self:isSelf() then
        self._imageSelf:setVisible(true)
        self._btnSweep:setVisible(false)
    else
        self._imageSelf:setVisible(false)
        self._callBackFunc = callBackFunc
    end
end

function ArenaHeroAvatar:doCallBackFunc()
    if self._callBackFunc and type(self._callBackFunc) == "function" then
        self._callBackFunc(self._arenaPlayer, false)
    end
end

function ArenaHeroAvatar:checkFristBattle()
    local myRank = G_UserData:getArenaData():getArenaRank()
    local isFirst = G_UserData:getArenaData():getArenaFirstBattle()
    if isFirst == 1 then
        myRank = 0
    end

    local nodeRank = self:getSubNodeByName("Node_rank")
    if nodeRank then
        ArenaHelper.updateArenaRank(nodeRank,myRank)
    end
end

function ArenaHeroAvatar:hideTopInfo()
    local topInfoPanel = self:getSubNodeByName("top_info_panel")
    topInfoPanel:setVisible(false)
end

function ArenaHeroAvatar:playAnimation(actionName,loop)
    self._commonHeroAvatar:setAction(actionName,loop)
end

function ArenaHeroAvatar:showShadow(needShow)
    self._commonHeroAvatar:showShadow(needShow)
end

function ArenaHeroAvatar:getArenaPlayer()
    return self._arenaPlayer
end

--
function ArenaHeroAvatar:onEnter()

end

function ArenaHeroAvatar:onExit()

end

function ArenaHeroAvatar:playJumpEffect()
   -- local parent = self:getParent()
  --  local gfxEffect = G_EffectGfxMgr:createPlayGfx(parent,"effect_jingjichang_yan")
   -- local worldPos = self._nodeEffect:convertToWorldSpace(cc.p(0,0))
--	local gfxPos = parent:convertToNodeSpace(worldPos)
 --   gfxEffect:setPosition(gfxPos)
end

function ArenaHeroAvatar:_onButtonSweep(sender)
    local LogicCheckHelper = require("app.utils.LogicCheckHelper")
    local isOpen, desc, funcInfo = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_ARENA_SWEEP)
	if not isOpen then
		G_Prompt:showTip(desc)
        return
	end
    if self._callBackFunc and type(self._callBackFunc) == "function" then
        self._callBackFunc(self._arenaPlayer, true)
    end
end

function  ArenaHeroAvatar:playWinEffect(callBack)
    -- body

    local AudioConst = require("app.const.AudioConst")
    G_AudioManager:playSoundWithId(AudioConst.SOUND_ARENA_WIN)
    
    logWarn("show win playWinEffect start")
    local function eventFunction(event)
        if event == "finish" then
            logWarn("show win playWinEffect finish")
            G_SignalManager:dispatch(SignalConst.EVENT_ARENA_WIN_POPUP_AWARD)
        end
    end
    
    --这里要取panelRoot 节点
    local parent = self:getParent():getParent()
    
    local worldPos = self._nodeEffect:convertToWorldSpace(cc.p(0,0))
    local gfxEffect = G_EffectGfxMgr:createPlayGfx(parent,"effect_fudaokaiqi_lihua",eventFunction)

    --只有男女主角播放胜利动作
    local baseId = self:getBaseId() 
    if baseId < 100 then
        self._commonHeroAvatar:setAction("win_pvp",false)
    end

	local gfxPos = parent:convertToNodeSpace(worldPos)
    gfxEffect:setPosition(gfxPos)
end

return ArenaHeroAvatar
