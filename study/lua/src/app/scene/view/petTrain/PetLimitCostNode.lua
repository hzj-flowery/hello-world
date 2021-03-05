local CommonLimitCostNode = require("app.ui.component.CommonLimitCostNode")
local PetLimitCostNode = class("PetLimitCostNode", CommonLimitCostNode)
local LimitCostConst = require("app.const.LimitCostConst")

local RES_CONST = {
    [LimitCostConst.LIMIT_COST_KEY_1] = {
        imageButtom = "img_limit_shenshou01",
		imageFront = "img_limit_gold_hero01a",
		ripple = "green",
		imageName = "txt_limit_01e",
		effectBg = "effect_tujiegreen", --背景特效
		moving = "moving_tujieballgreen",
		effectReceive = "effect_tujiedianjigreen", --材料到达后的特效
		effectFull = "effect_tujie_mannenglianggreen", --材料满了的特效
		smoving = "smoving_tujiehuangreen"
    },
    [LimitCostConst.LIMIT_COST_KEY_2] = {
        imageButtom = "img_limit_shenshou02",
		imageFront = "img_limit_gold_hero02a",
		ripple = "blue",
		imageName = "txt_limit_02e",
		effectBg = "effect_tujieblue",
		moving = "moving_tujieballblue",
		effectReceive = "effect_tujiedianjiblue",
		effectFull = "effect_tujie_mannengliangblue",
		smoving = "smoving_tujiehuanblue"
    },
    [LimitCostConst.LIMIT_COST_KEY_3] = {
        imageButtom = "img_limit_shenshou03",
        imageFront = "img_limit_gold_hero05a",
        effectBg = "effect_tujiepurple",
        imageName = "txt_limit_03b",
        ripple = "purple",
        effectFull = "effect_tujie_mannengliangpurple",
        moving = "moving_tujieballpurple",
        effectReceive = "effect_tujiedianjipurple",
        smoving = "smoving_tujiehuanpurple"
    },
    [LimitCostConst.LIMIT_COST_KEY_4] = {
        imageButtom = "img_limit_shenshou04",
        imageFront = "img_limit_gold_hero06a",
        effectBg = "effect_tujieorange",
        imageName = "txt_limit_04b",
        ripple = "orange",
        effectFull = "effect_tujie_mannengliangorange",
        moving = "moving_tujieballorange",
        effectReceive = "effect_tujiedianjiorange",
        smoving = "smoving_tujiehuanorange"
    },
}

function PetLimitCostNode:ctor(target, costKey, callback)
    PetLimitCostNode.super.ctor(self, target, costKey, callback)
end

function PetLimitCostNode:changeImageName()
    self._imageName:loadTexture(Path.getTextLimit(RES_CONST[self._costKey].imageName))
end

function PetLimitCostNode:_check()
    if self._costKey == LimitCostConst.LIMIT_COST_KEY_3 or self._costKey == LimitCostConst.LIMIT_COST_KEY_4 then
		self._isShowCount = true
	else
		self._isShowCount = false
	end
end

function PetLimitCostNode:initImageFront()
    self:_initImageFront(RES_CONST[self._costKey].imageButtom, RES_CONST[self._costKey].imageFront)
    self._imageButtom:setContentSize(cc.size(86, 86))
    self._imageButtom:setPosition(cc.p(0, 0))
end

function PetLimitCostNode:initEffectBg()
    self:_initEffectBg(RES_CONST[self._costKey].effectBg)
end

function PetLimitCostNode:initRipple()
    self:_initRipple(RES_CONST[self._costKey].ripple)
end

function PetLimitCostNode:getFullEffectName()
    return RES_CONST[self._costKey].effectFull
end

function PetLimitCostNode:getMoving()
    return RES_CONST[self._costKey].moving
end

function PetLimitCostNode:getEffectReceiveName()
    return RES_CONST[self._costKey].effectReceive
end

function PetLimitCostNode:_calPercent(limitLevel, curCount)
    -- if self._costKey == LimitCostConst.LIMIT_COST_KEY_1 then
    --     return 100, 1
    -- end
    local PetTrainHelper = require("app.scene.view.petTrain.PetTrainHelper")
    local costInfo = PetTrainHelper.getCurLimitCostInfo()
    local size = costInfo["size_" .. self._costKey]
    local percent = math.floor(curCount / size * 100)
    return math.min(percent, 100), size
end

return PetLimitCostNode
