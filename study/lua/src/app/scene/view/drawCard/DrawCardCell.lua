local DrawCardCell = class("DrawCardCell")
local Color = require("app.utils.Color")

local DrawCardResourceInfo = require("app.scene.view.drawCard.DrawCardResourceInfo")

function DrawCardCell:ctor(target)
	self._target = target

    self._imageBook = nil
    self._btnDraw = nil
    self._textFree = nil
    self._resource = nil
    self._redPoint = nil
    self._textCountDown =  nil

    self._touchFunc = nil

	self:_init()
end

function DrawCardCell:_init()
    self._imageBook = ccui.Helper:seekNodeByName(self._target, "ImageBook")
    self._imageBook:addClickEventListenerEx(handler(self, self._onDrawCardClick), true, nil, 0)
    self._btnDraw = ccui.Helper:seekNodeByName(self._target, "BtnDraw")
    self._btnDraw:addClickEventListenerEx(handler(self, self._onDrawCardClick), true, nil, 0)
    self._textFree = ccui.Helper:seekNodeByName(self._target, "TextFree")
    local resourceInfo = ccui.Helper:seekNodeByName(self._target, "Resource")
    self._resource = DrawCardResourceInfo.new(resourceInfo)
    self._redPoint = ccui.Helper:seekNodeByName(self._target, "RedPoint")
    self._textCountDown = ccui.Helper:seekNodeByName(self._target, "TextCountDown")
    self._textBanshuCount = ccui.Helper:seekNodeByName(self._target, "TextBanshuCount")
    self._textBanshuCount:setVisible(false)
    self._textGold = ccui.Helper:seekNodeByName(self._target, "TextGold")
    self._textGold:setVisible(false)
end

function DrawCardCell:addTouchFunc(func)
    self._touchFunc = func
end

function DrawCardCell:_onDrawCardClick()
    if self._touchFunc then
        self._touchFunc()
    end
end

function DrawCardCell:setRedPointVisible(v)
    self._redPoint:setVisible(v)
end

function DrawCardCell:setFreeVisible(v)
    self._textFree:setVisible(v)
end

function DrawCardCell:setResourceVisible(v)
    self._resource:setVisible(v)
end

-- function Color.getChapterTypeColor(type)
--     return Color.ChapterType[type].color
-- end

-- function Color.getChapterTypeOutline(type)
--     return Color.ChapterType[type].outlineColor
-- end

function DrawCardCell:updateResourceInfo(type, value, size)
    self._resource:updateUI(type, value, size)
end

function DrawCardCell:setTextCountDown(string)
    if not string then
        self._textCountDown:setVisible(false)
        return
    end
    self._textCountDown:setVisible(true)
    self._textCountDown:setString(string)
end

function DrawCardCell:refreshBanshuInfo(count1, count2, count3)
    self._textGold:setString(Lang.get("recruit_banshu_gold", {count = count1, countcount = count3}))
    self._textBanshuCount:setString(Lang.get("recruit_left_count", {count = count2}))
    self._textGold:setVisible(true)
    self._textBanshuCount:setVisible(true)
end

return DrawCardCell