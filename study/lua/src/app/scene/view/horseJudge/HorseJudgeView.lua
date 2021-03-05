-- 相马
local ViewBase = require("app.ui.ViewBase")
local HorseJudgeView = class("HorseJudgeView", ViewBase)
local RedPointHelper = require("app.data.RedPointHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local UserDataHelper = require("app.utils.UserDataHelper")
local HorseConst = require("app.const.HorseConst")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local AudioConst = require("app.const.AudioConst")

local COST_COUNT1 = HorseConst.JUDGE_COST_COUNT_1
local COST_COUNT2 = HorseConst.JUDGE_COST_COUNT_2

function HorseJudgeView:ctor()
    local resource = {
		file = Path.getCSB("HorseJudgeView", "horse"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_button1 = {
				events = {{event = "touch", method = "_onClick1"}}
			},
			_button2 = {
				events = {{event = "touch", method = "_onClick2"}}
			},
		}
	}
	HorseJudgeView.super.ctor(self, resource, 114)
end

function HorseJudgeView:onCreate()
	self._topBar:setImageTitle("txt_sys_com_xiangma")
	local TopBarStyleConst = require("app.const.TopBarStyleConst")
	self._topBar:updateUI(TopBarStyleConst.STYLE_HORSE)

	self._buttonHelp:updateUI(FunctionConst.FUNC_HORSE_JUDGE)

	local content = Lang.get("horse_judge_tip_des")
	local richText = ccui.RichText:createWithContent(content)
	richText:setAnchorPoint(cc.p(0.5, 0.5))
	self._nodeTip:addChild(richText)

	self._button1:setString(Lang.get("horse_judge_btn_1"))
	self._button2:setString(Lang.get("horse_judge_btn_2"))

	self._nodeCost1:updateUI(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_HORSE_CLASSICS, COST_COUNT1)
	self._nodeCost2:updateUI(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_HORSE_CLASSICS, COST_COUNT2)
	self._nodeCost1:showResName(true, Lang.get("horse_judge_cost_des"))
	self._nodeCost2:showResName(true, Lang.get("horse_judge_cost_des"))
	-- self._nodeCost1:setTextColorToDRevisionTypeColor()
    -- self._nodeCost2:setTextColorToDRevisionTypeColor()
    self._nodeCost1:setTextColor(Colors.NUMBER_WHITE)
    self._nodeCost2:setTextColor(Colors.NUMBER_WHITE)

	self:_initEffectBg()
end

function HorseJudgeView:onEnter()
	self._signalHorseJudgeSuccess = G_SignalManager:add(SignalConst.EVENT_HORSE_JUDGE_SUCCESS, handler(self, self._horseJudgeSuccess))
	self:_playIdle()
	self:_updateData()
	self:_updateView()
end

function HorseJudgeView:onExit()
	self._signalHorseJudgeSuccess:remove()
	self._signalHorseJudgeSuccess = nil
end

function HorseJudgeView:_updateData()
	
end

function HorseJudgeView:_updateView()
	self:_updateRP()
end

function HorseJudgeView:_updateRP()
	local reach1 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HORSE_JUDGE, "type1")
	local reach2 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HORSE_JUDGE, "type2")
	self._button1:showRedPoint(reach1)
	self._button2:showRedPoint(reach2)
end

function HorseJudgeView:_checkCost(index)
	local myCount = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_HORSE_CLASSICS)
	local needCount = COST_COUNT1
	if index == 2 then
		needCount = COST_COUNT2
	end
	
	if myCount >= needCount then
		return true
	else
		local popup = require("app.ui.PopupItemGuider").new()
		popup:updateUI(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_HORSE_CLASSICS)
		popup:openWithAction()
		return false
	end
end

function HorseJudgeView:_onClick1()
	if LogicCheckHelper.isPackFull(TypeConvertHelper.TYPE_HORSE) == true then
		return
	end
	if self:_checkCost(1) == false then
		return
	end
	self:_setBtnEnable(false)
	G_UserData:getHorse():c2sWarHorseDraw(COST_COUNT1)
end

function HorseJudgeView:_onClick2()
	if LogicCheckHelper.isPackFull(TypeConvertHelper.TYPE_HORSE) == true then
		return
	end
	if self:_checkCost(2) == false then
		return
	end
	self:_setBtnEnable(false)
	G_UserData:getHorse():c2sWarHorseDraw(COST_COUNT2)
end

function HorseJudgeView:_setBtnEnable(enable)
	self._button1:setEnabled(enable)
	self._button2:setEnabled(enable)
end

function HorseJudgeView:_horseJudgeSuccess(eventName, awards)
	self:_updateRP()
	self:_playLasso(awards)
end

function HorseJudgeView:_initEffectBg()
	G_EffectGfxMgr:createPlayMovingGfx(self._nodeEffectBg, "moving_xiangma_chuansongmen", nil, nil, false)
end

function HorseJudgeView:_playIdle()
	self:_resetIdle()
	self._idle = G_EffectGfxMgr:createPlayMovingGfx(self._nodeEffect, "moving_xiangma_idle", nil, nil, false)
end

function HorseJudgeView:_playLasso(awards)
	local function eventFunction(event)
        if event == "huode" then
            local popup = require("app.ui.PopupGetRewards").new()
			popup:showRewards(awards)
		elseif event == "finish" then
			if self._playIdle then
                self:_playIdle()
            end
			self:_setBtnEnable(true)
			self._lasso:runAction(cc.RemoveSelf:create())
			self._lasso = nil
        end
    end

    self:_resetIdle()
    self:_resetLasso()
	self._lasso = G_EffectGfxMgr:createPlayMovingGfx(self._nodeEffect, "moving_xiangma_huodedaoju", nil, eventFunction, false)
	G_AudioManager:playSoundWithId(AudioConst.SOUND_HORSE_JUDGE)
end

function HorseJudgeView:_resetIdle()
	if self._idle then
		self._idle:removeFromParent()
		self._idle = nil
	end
end

function HorseJudgeView:_resetLasso()
	if self._lasso then
		self._lasso:removeFromParent()
		self._lasso = nil
	end
end

return HorseJudgeView