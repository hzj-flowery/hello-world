-- Author: Liangxu
-- Date: 2017-07-12 14:59:05
-- 总战力飘字
local CommonPowerPrompt = class("CommonPowerPrompt")
local PromptAction  = require("app.ui.prompt.PromptAction")
local scheduler=require("cocos.framework.scheduler")
local AudioConst = require("app.const.AudioConst")

local EXPORTED_METHODS = {
    "updateUI",
    "play",
	"playEffect",
	"setNumberValue",
	"getNumberValue",
}

function CommonPowerPrompt:ctor()
	self._target = nil
	self._label1 = nil
	self._label2 = nil
end

function CommonPowerPrompt:_init()
	self._label1 = ccui.Helper:seekNodeByName(self._target, "Label1")
	self._label2 = ccui.Helper:seekNodeByName(self._target, "Label2")
	if cc.isRegister("CommonRollNumber") then
        cc.bind(self._label1, "CommonRollNumber")
        cc.bind(self._label2, "CommonRollNumber")
    end
    self._label1:setRollListener(self)
    self._label2:setRollListener(self)
	self._imageArrow = ccui.Helper:seekNodeByName(self._target, "ImageArrow")
end

function CommonPowerPrompt:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonPowerPrompt:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonPowerPrompt:updateUI(totalPower, diffValue)
	self._totalPower = totalPower
	self._diffValue = diffValue
	
    --获取 最大宽度 用来调整diffValue 位置
    self._label1:setString(tostring(totalPower))
    local maxWidth = self._label1:getContentSize().width;
    local defaultGap = 120
    -- 120 为 csd 文件中 箭头距离 	self._label1 的间隙  当最大宽度 大于120 需要动态调整箭头位置 避免遮挡
    if maxWidth > defaultGap then
        self._imageArrow:setPositionX(self._imageArrow:getPositionX() + maxWidth - defaultGap)
        self._label2:setPositionX(self._label2:getPositionX() + maxWidth - defaultGap)
    end

	self._label1:setString(tostring(totalPower - diffValue))

	local arrowRes = diffValue > 0 and Path.getUICommon("img_battle_arrow_up") or Path.getUICommon("img_battle_arrow09")
	self._imageArrow:loadTexture(arrowRes)
	self._imageArrow:setVisible(diffValue ~= 0)
end

function CommonPowerPrompt:setNumberValue(value)
	if value then
    	self._label1:setString(value)
	end
end

function CommonPowerPrompt:getNumberValue()
    return self._totalPower - self._diffValue
end

function CommonPowerPrompt:playEffect(needRemove)
	if self._diffValue == 0	then
		return
	end

	self._label1:updateTxtValue(self._totalPower)
	local charMapFile = self._diffValue > 0 and Path.getTextTeam("txt_zhanli02") or Path.getTextTeam("txt_zhanli03")
	self._label2:setProperty(math.abs(self._diffValue), charMapFile, 18, 23, "0")
    
	self._target:runAction(cc.Sequence:create(
	        -- 显示弹出动画
	        PromptAction.PopupAction()
        )
    )

end

function CommonPowerPrompt:play(offsetX, offsetY)
	if self._diffValue == 0	then
		return
	end

	local offsetX = offsetX or 0
	local offsetY = offsetY or 0

	local runningScene = G_SceneManager:getRunningScene()
	runningScene:addTextSummary(self._target)
	local width = G_ResolutionManager:getDesignWidth()
	local height = G_ResolutionManager:getDesignHeight()
	
	self._target:setPosition(cc.p(width/2 + offsetX, height/2 + offsetY - 45 * 4))

	self._label1:updateTxtValue(self._totalPower, nil, nil, true)
	local charMapFile = self._diffValue > 0 and Path.getTextTeam("txt_zhanli02") or Path.getTextTeam("txt_zhanli03")
	self._label2:setProperty(math.abs(self._diffValue), charMapFile, 18, 23, "0")
	G_AudioManager:playSoundWithId(AudioConst.SOUND_NUM) --播音效
	self._target:runAction(cc.Sequence:create(
	        -- 显示弹出动画
	        PromptAction.PopupAction(),
	        -- 然后延迟一秒
	        cc.DelayTime:create(1.5),
	        -- 没有就直接移除了，不加动画
	        cc.Sequence:create(
	            cc.FadeOut:create(0.5),
				cc.RemoveSelf:create()
	        )
        )
    )
end

return CommonPowerPrompt
