-- 神树祈福福签
-- Author: Liangxu
-- Date: 2019-8-2
local ViewBase = require("app.ui.ViewBase")
local HomelandPraySignNode = class("HomelandPraySignNode", ViewBase)
local HomelandConst = require("app.const.HomelandConst")
local HomelandHelp = require("app.scene.view.homeland.HomelandHelp")

local EFFECT_COLOR = {
    [3] = "effect_shenshu_chouqian_languang",
    [4] = "effect_shenshu_chouqian_ziguang",
    [5] = "effect_shenshu_chouqian_huangguang",
}

function HomelandPraySignNode:ctor(pos, callback)
    self._pos = pos
    self._callback = callback
    self._canClick = true
	local resource = {
		file = Path.getCSB("HomelandPraySignNode", "homeland"),
		binding = {
			_imageBack = {
				events = {{event = "touch", method = "_onClick"}}
			},
		}
	}

	HomelandPraySignNode.super.ctor(self, resource)
end

function HomelandPraySignNode:onCreate()
	self._imageMid:setVisible(false)
end

function HomelandPraySignNode:updateUI(data)
    self._data = data
    if data then
        self._imageBack:setVisible(false)
        self._imageFront:setVisible(true)
        local info = data:getConfig()
        self._textColor:setString(info.color_text)
        self._textName:setString(info.name)
        local strTime = ""
        if info.type == HomelandConst.TREE_BUFF_TYPE_3 then
            strTime = Lang.get("homeland_buff_duration")
        end
        self._textTime:setString(strTime)

        local template = string.gsub(info.description, "#%w+#", "$c103_%1$")
        local value = HomelandHelp.getValueOfBuff(info.value, info.equation)
	    local times = HomelandHelp.getTimesOfBuff(info.times, info.type)
        local formatStr = Lang.getTxt(template, {value = value, times = times})
		local params = {defaultColor = Colors.NORMAL_BG_ONE, defaultSize = 20}
        local richText = ccui.RichText:createRichTextByFormatString(formatStr, params)
        richText:setAnchorPoint(cc.p(0.5, 1))
        richText:ignoreContentAdaptWithSize(false)
        richText:setContentSize(cc.size(160,0))
        richText:formatText()
        self._nodeDes:removeAllChildren()
        self._nodeDes:addChild(richText)
    else
        self._imageBack:setVisible(true)
        self._imageFront:setVisible(false)
        G_EffectGfxMgr:createPlayGfx(self._nodeEffectBack, "effect_shenshu_chouqian_xiaoxingxing", nil, nil, nil)
    end
end

--进场特效
function HomelandPraySignNode:playEnterEffect()
    G_EffectGfxMgr:createPlayGfx(self._nodeEffectFront, "effect_shenshu_chouqianfaguang", nil, nil, nil)
end

--抽时的特效
function HomelandPraySignNode:playDrawEffect()
    G_EffectGfxMgr:createPlayGfx(self._nodeEffectFront, "effect_shenshu_chouqian_shanbai", nil, nil, nil)
    self._nodeEffectMid:setVisible(true)
    self._imageMid:setVisible(true)
    local color = self._data:getConfig().color
    local midEffectName = EFFECT_COLOR[color]
    if midEffectName then
        G_EffectGfxMgr:createPlayGfx(self._nodeEffectMid, midEffectName, nil, nil, nil)
    end
end

function HomelandPraySignNode:stopDrawEffect()
    self._nodeEffectMid:setVisible(false)
    self._imageMid:setVisible(false)
end

function HomelandPraySignNode:_onClick()
    if self._canClick and self._callback then
        self._callback(self._pos)
    end
end

function HomelandPraySignNode:setClickEnable(enable)
    self._canClick = enable
end

return HomelandPraySignNode