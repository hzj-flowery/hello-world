local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupDailyChooseCell = class("PopupDailyChooseCell", ListViewCellBase)

local Color = require("app.utils.Color")
local Path = require("app.utils.Path")
local DropHelper = require("app.utils.DropHelper")
local DailyDungeon = require("app.config.daily_dungeon")
local DailyDungeonConst = require("app.const.DailyDungeonConst")



function PopupDailyChooseCell:ctor(idx)
    self._info = nil
    self._isOpen = false
    self._isEntered = false
    self._drop = nil

    --ui
    self._nodeBG = nil      --node背景
    -- self._imageBG = nil     --难度背景
    self._textTitle = nil   --难度
    self._textReward = nil  --奖励两个字
    self._textDetail = nil  --通关xx开启
    self._reward = nil      --掉落
    self._imageDiff = nil   --难度图标
    self._btnFight = nil    --攻打按钮
    -- self._imageCover = nil  --黑色遮罩
    self._nodeLock = nil    --锁的节点
    self._imageLock = nil   --锁图案
    self._btnSweep = nil --扫荡按钮
	local resource = {
		file = Path.getCSB("PopupDailyChooseCell", "dailyChallenge"),
		binding = {
            _btnFight = {
				events = {{event = "touch", method = "_fightClick"}}
			},
            _btnSweep = {
				events = {{event = "touch", method = "_onSweepBtnClick"}}
			},
		}
	}
    self:setName("PopupDailyChooseCell"..idx)
	PopupDailyChooseCell.super.ctor(self, resource)
end

function PopupDailyChooseCell:onCreate()
    local size = self._nodeBG:getContentSize()
    self:setContentSize(size)
    self._imageDiff:setVisible(false)
    self._textDetail:setVisible(false)
    self._btnFight:setTxtVisible(false)
    self._btnFight:setString(Lang.get("challenge_button"))
    self._btnSweep:setString(Lang.get("challenge_daily_sweep"))
end

--是否进入过？
function PopupDailyChooseCell:isEntered()
    return G_UserData:getDailyDungeonData():isDungeonEntered(self._info.type, self._info.id)
end

function PopupDailyChooseCell:refreshData(info)
    if info then
        self._info = info  
    end
    self._isEntered = G_UserData:getDailyDungeonData():isDungeonEntered(self._info.type, self._info.id)
    self:_refreshCell()
    self:_refreshTitleAndSword()
    self:_refreshDrop()
end

--刷新title以及sword图案
function PopupDailyChooseCell:_refreshTitleAndSword()
    -- print("难度 ===="..self._info.difficulty )
    self._textTitle:setString(self._info.difficulty)
    local colorInfo = Colors.getDailyChooseColor(self._info.color)
    self._textTitle:setColor(colorInfo.color)
	self._textTitle:enableOutline(colorInfo.outlineColor, 2)
    local titleColor = self._info.color
    -- local swordBG = Path.getDailyChallengeIcon("img_difficulty0"..titleColor.."b")
    -- self._imageDiff:loadTexture(swordBG)
    -- self._imageDiff:ignoreContentAdaptWithSize(true)
end

--刷新按钮以及锁的状态
function PopupDailyChooseCell:_refreshCell()
    --这里color相同不能用来做key
    local bg = Path.getDailyChallengeIcon("img_difficulty0"..self._info.color)
    if self._info.difficulty == "傲世" then
        bg = Path.getDailyChallengeIcon("img_difficulty07")
    elseif self._info.difficulty == "至尊" then
        bg = Path.getDailyChallengeIcon("img_difficulty08")
    end
    self._nodeBG:loadTexture(bg)

	local myLevel = G_UserData:getBase():getLevel()
    if self._info.pre_id ~= 0 and self._info.pre_id > G_UserData:getDailyDungeonData():getMaxIdByType(self._info.type) then
        self._isOpen = false
        local preInfo = DailyDungeon.get(self._info.pre_id)
        local strDiff = preInfo.difficulty
        self._btnFight:setEnabled(true) 
        self._btnFight:setTouchEnabled(false)
        self._textReward:setVisible(false)
        self._reward:setVisible(false)
        self._textDetail:setVisible(true)
        self._textDetail:setString(Lang.get("challenge_open_pre", {str = strDiff}))
        -- self._imageDiff:setVisible(false)
    elseif myLevel < self._info.level then
        self._isOpen = false    
        self._btnFight:setEnabled(true) 
        self._btnFight:setTouchEnabled(false)
        self._textReward:setVisible(false)
        self._reward:setVisible(false)
        self._textDetail:setVisible(true)
        self._textDetail:setString(Lang.get("challenge_open_level", {count = self._info.level}))         
        -- self._imageDiff:setVisible(false)
        
    elseif self._isEntered then
        self._isOpen = true
        self._btnFight:setEnabled(true) 
        self._btnFight:setTouchEnabled(true)
        self._textReward:setVisible(true)
        self._reward:setVisible(true)
        self._textDetail:setVisible(false)
        -- self._imageDiff:setVisible(true)
        self:_showLock(false)
        self._btnFight:setTxtVisible(true)
	end

    local pass = self._info.id <= G_UserData:getDailyDungeonData():getMaxIdByType(self._info.type)
    local LogicCheckHelper = require("app.utils.LogicCheckHelper")
    local isSweepOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_DAILY_STAGE_SWEEP)
    if pass and isSweepOpen then
        self._btnSweep:setVisible(true)
        self._btnFight:setVisible(false)  
    else
        self._btnSweep:setVisible(false)
        self._btnFight:setVisible(true)  
    end


end

function PopupDailyChooseCell:_showLock(s)
    self._imageLock:setVisible(s)
   
end

--刷新掉落
function PopupDailyChooseCell:_refreshDrop()
    local drop = DropHelper.getDailyDrop(self._info)
    self._reward:updateUI(drop.type, drop.value, drop.size)
    self._reward:setTextColorToDTypeColor()
    self._drop = drop
end

function PopupDailyChooseCell:isOpen()
    return self._isOpen
end

function PopupDailyChooseCell:_fightClick(sender, event)
    -- if event == 2 then
        local offsetX = math.abs(sender:getTouchEndPosition().x - sender:getTouchBeganPosition().x)
        local offsetY = math.abs(sender:getTouchEndPosition().y - sender:getTouchBeganPosition().y)
        if offsetX < 20 and offsetY < 20  then
            self:_executeStage()
        end
    -- end
end

function PopupDailyChooseCell:_onSweepBtnClick(sender, event)
    -- if event == 2 then
        local offsetX = math.abs(sender:getTouchEndPosition().x - sender:getTouchBeganPosition().x)
        local offsetY = math.abs(sender:getTouchEndPosition().y - sender:getTouchBeganPosition().y)
        if offsetX < 20 and offsetY < 20  then
            self:_executeSweep()
        end
    -- end
end

function PopupDailyChooseCell:_executeStage()
    local LogicCheckHelper = require("app.utils.LogicCheckHelper")
    local bagFull = LogicCheckHelper.isPackFull(self._drop.type, self._drop.value)
    if bagFull then
        return
    end

    local DailyDungeonCheck = require("app.utils.logic.DailyDungeonCheck")
    local success,popFunc = DailyDungeonCheck.isDailyDungeonCanFight(self._info.type,true)
    if not success then
        return 
    end
    G_SignalManager:dispatch(SignalConst.EVENT_TOPBAR_PAUSE)
    G_UserData:getDailyDungeonData():c2sExecuteDailyDungeon(self._info.id, DailyDungeonConst.OP_TYPE_CHALLENGE )
end

function PopupDailyChooseCell:_executeSweep()
    local LogicCheckHelper = require("app.utils.LogicCheckHelper")
    local bagFull = LogicCheckHelper.isPackFull(self._drop.type, self._drop.value)
    if bagFull then
        return
    end

    local DailyDungeonCheck = require("app.utils.logic.DailyDungeonCheck")
    local success,popFunc = DailyDungeonCheck.isDailyDungeonCanFight(self._info.type,true)
    if not success then
        return 
    end
    G_SignalManager:dispatch(SignalConst.EVENT_TOPBAR_PAUSE)
    G_UserData:getDailyDungeonData():c2sExecuteDailyDungeon(self._info.id, DailyDungeonConst.OP_TYPE_SWEEP )
end

--播放开锁动画
function PopupDailyChooseCell:playOpenEft()
    self._imageLock:setVisible(false)
    self._btnFight:setTxtVisible(true)
    --self:refreshData()
    --G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, self.__cname) 	
    self:refreshData()

    local SchedulerHelper = require ("app.utils.SchedulerHelper")
    SchedulerHelper.newScheduleOnce(function()
        G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, self.__cname) 
    end, 0.5)
    -- local EffectGfxNode = require("app.effect.EffectGfxNode")
	-- local function effectFunction(effect)
    --     if effect == "effect_jiesuo"then
    --         local subEffect = EffectGfxNode.new(effect)
    --         subEffect:play()
    --         return subEffect 
    --     end
    -- end
	-- local function eventFunction(event)
    --     if event == "finish" then

    --         self:refreshData()
    --         --抛出新手事件出新手事件
    --         G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, self.__cname) 	
	-- 	end
    -- end
    --local AudioConst = require("app.const.AudioConst")
    --G_AudioManager:playSoundWithId(AudioConst.SOUND_DAILY_UNLOCK)
    --local effect = G_EffectGfxMgr:createPlayMovingGfx( self._nodeLock, "moving_jiesuo", effectFunction, eventFunction, true )
end

--获得对应副本id
function PopupDailyChooseCell:getDungeonId()
    return self._info.id
end




return PopupDailyChooseCell