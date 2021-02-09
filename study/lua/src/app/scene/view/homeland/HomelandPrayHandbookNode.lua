local HomelandPrayHandbookNode = class("HomelandPrayHandbookNode")
local HomelandConst = require("app.const.HomelandConst")
local HomelandHelp = require("app.scene.view.homeland.HomelandHelp")

function HomelandPrayHandbookNode:ctor(target)
    self._target = target
    
    self._imageEmpty = ccui.Helper:seekNodeByName(self._target, "ImageEmpty")
    self._imageBg = ccui.Helper:seekNodeByName(self._target, "ImageBg")
    self._textColor = ccui.Helper:seekNodeByName(self._target, "TextColor")
    self._textName = ccui.Helper:seekNodeByName(self._target, "TextName")
    self._textTime = ccui.Helper:seekNodeByName(self._target, "TextTime")
    self._nodeDes = ccui.Helper:seekNodeByName(self._target, "NodeDes")
end

function HomelandPrayHandbookNode:updateUI(data)
    if data.isHave then
        self._imageEmpty:setVisible(false)
        self._imageBg:setVisible(true)
        local info = data.cfg
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
        richText:setAnchorPoint(cc.p(0, 1))
        richText:ignoreContentAdaptWithSize(false)
        richText:setContentSize(cc.size(200,0))
        richText:formatText()
        self._nodeDes:removeAllChildren()
        self._nodeDes:addChild(richText)
    else
        self._imageEmpty:setVisible(true)
        self._imageBg:setVisible(false)
    end
end

return HomelandPrayHandbookNode