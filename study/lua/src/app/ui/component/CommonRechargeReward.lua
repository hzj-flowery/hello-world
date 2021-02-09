-- Author: panhao
-- Date:2018-11-23 17:11:36
-- Describle：

local CommonRechargeReward = class("CommonRechargeReward")

local EXPORTED_METHODS = {
    "updateUI",
}

function CommonRechargeReward:ctor()
    self._target = nil
    self._nodeDesc = nil
    self._imageIcon = nil
end

function CommonRechargeReward:_init()
    self._nodeDesc = ccui.Helper:seekNodeByName(self._target, "Node_Text")
    self._imageIcon = ccui.Helper:seekNodeByName(self._target, "Image_Icon")
end

function CommonRechargeReward:bind(target)
	self._target = target
	self:_init()
	cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonRechargeReward:unbind(target)
	cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonRechargeReward:updateUI(type, value, money, count)
    local TypeConvertHelper = require("app.utils.TypeConvertHelper")
	local resParam = TypeConvertHelper.convert(type, value)
	local content = Lang.get("common_recharge_rewards", {
			money = money,
			count = count,
		})
	local richText = ccui.RichText:createWithContent(content)
    richText:setAnchorPoint(cc.p(0, 0))
    self._nodeDesc:addChild(richText)
    self._imageIcon:loadTexture(resParam.res_mini)
end


return CommonRechargeReward