local RankTabButton = class("RankTabButton")

local COLOR_SELECT = cc.c3b(0xff, 0xb4, 0x6a)
local COLOR_NORMAL = cc.c3b(0xa9, 0x6a, 0x2a)

function RankTabButton:ctor(target)
    self._target = target

    self._button = ccui.Helper:seekNodeByName(self._target, "Button")
    self._text = ccui.Helper:seekNodeByName(self._target, "Text")
end

function RankTabButton:addClickEventListenerEx(callback)
    self._button:addClickEventListenerEx(callback, true, nil, 0)
end

function RankTabButton:setString(text)
    self._text:setString(text)
end

function RankTabButton:setSelected(isSelected)
    if isSelected then
        self._button:loadTextures(
            Path.getAnswerImg("img_server_answer_01a"),
            Path.getAnswerImg("img_server_answer_01a"),
            Path.getAnswerImg("img_server_answer_01a")
        )
        self._text:setColor(COLOR_SELECT)
    else
        self._button:loadTextures(
            Path.getAnswerImg("img_server_answer_01b"),
            Path.getAnswerImg("img_server_answer_01b"),
            Path.getAnswerImg("img_server_answer_01b")
        )
        self._text:setColor(COLOR_NORMAL)
    end
end

return RankTabButton
