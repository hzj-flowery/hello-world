-- Author: liangxu
-- Date:2018-9-11
-- Describle：相马活动

local ViewBase = require("app.ui.ViewBase")
local CustomActivityHorseJudgeView = class("CustomActivityHorseJudgeView", ViewBase)
local SchedulerHelper = require("app.utils.SchedulerHelper")
local CustomActivityUIHelper = require("app.scene.view.customactivity.CustomActivityUIHelper")
local CustomActivityConst = require("app.const.CustomActivityConst")
local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")

function CustomActivityHorseJudgeView:ctor(parentView)
	self._parentView = parentView

	local resource = {
		size = G_ResolutionManager:getDesignSize(),
		file = Path.getCSB("CustomActivityHorseJudgeView", "customactivity"),
		binding = {
			_buttonToRecharge = {
				events = {{event = "touch", method = "_onBtnToRecharge"}}
			},
		},
	}
	CustomActivityHorseJudgeView.super.ctor(self, resource)
end

function CustomActivityHorseJudgeView:onCreate()
	self._buttonToRecharge:setString(Lang.get("customactivity_horse_judge_btn_torecharge"))

	local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_HORSE_CLASSICS)
	local content = Lang.get("customactivity_horse_judge_tip", {name = param.name, fontName = Path.getFontW8()})
	local richText = ccui.RichText:createWithContent(content)
	richText:setAnchorPoint(cc.p(0.5, 0.5))
	self._nodeTip:addChild(richText)

	G_EffectGfxMgr:createPlayMovingGfx(self._nodeEffect, "moving_zhanmahuodong", nil, nil , false)
end

function CustomActivityHorseJudgeView:onEnter()
	self:_startCountDown()
end

function CustomActivityHorseJudgeView:onExit()
	self:_stopCountDown()
end

function CustomActivityHorseJudgeView:refreshView(customActUnitData, resetListData)
	local rechargeUnit = G_UserData:getCustomActivityRecharge():getUnitDataWithType(CustomActivityConst.CUSTOM_ACTIVITY_TYPE_HORSE_JUDGE)
	if rechargeUnit:isExpired() then
		G_UserData:getCustomActivityRecharge():c2sSpecialActInfo(CustomActivityConst.CUSTOM_ACTIVITY_TYPE_HORSE_JUDGE)
		return
	end
	self:_updateData()
	self:_updateView()
end

function CustomActivityHorseJudgeView:_updateData()
	
end

function CustomActivityHorseJudgeView:_updateView()
	
end

function CustomActivityHorseJudgeView:_startCountDown()
	self:_stopCountDown()
	self._countDownHandler = SchedulerHelper.newSchedule(handler(self, self._onCountDown), 1)
	self:_onCountDown()
end

function CustomActivityHorseJudgeView:_stopCountDown()
	if self._countDownHandler then
		SchedulerHelper.cancelSchedule(self._countDownHandler)
		self._countDownHandler = nil
	end
end

function CustomActivityHorseJudgeView:_onCountDown()
	local actUnitData = G_UserData:getCustomActivity():getHorseJudgeActivity()
	if actUnitData and actUnitData:isActInRunTime() then
		local timeStr = CustomActivityUIHelper.getLeftDHMSFormat(actUnitData:getEnd_time())
		self._textTime:setString(timeStr)
	else
		self._textTime:setString(Lang.get("customactivity_horse_judge_act_end"))
		self:_stopCountDown()
	end
end

-- function CustomActivityHorseJudgeView:_onBtnReadme()
-- 	local UIPopupHelper = require("app.utils.UIPopupHelper")
-- 	UIPopupHelper.popupHelpInfo(FunctionConst.FUNC_HORSE_JUDGE_ACTIVITY)
-- end


function CustomActivityHorseJudgeView:_onBtnToRecharge()
	WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_RECHARGE)
end

return CustomActivityHorseJudgeView