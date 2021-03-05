local ViewBase = require("app.ui.ViewBase")
local EventAnswerCell = class("EventAnswerCell", ViewBase)
local Hero = require("app.config.hero")
local HeroRes = require("app.config.hero_res")

EventAnswerCell.INDEX_CHAR_MAP = {"A", "B", "C", "D"}

function EventAnswerCell:ctor(answerData, index, callback)
    --问题详细
    self._index = index
    self._answerId = answerData["answer"..index.."_id"]
    self._answerPicId = answerData["answer"..index.."_picture"]
    self._description = answerData["answer"..index.."_description"]
    self._callback = callback

    dump(answerData)
    assert(self._callback, "call back should not be nil!!")
    --ui
    self._btnAnswer = nil   --底板&触摸相应按钮
    self._imageHighLight = nil  --选中高亮
    self._imageHero = nil   --英雄肖像
    self._textAnswer = nil  --答案
    self._imageRight = nil  --对勾
    self._imageWrong = nil  --xx

    local resource = {
		file = Path.getCSB("EventAnswerCell", "exploreMap"),
        binding = {
            _btnAnswer = {
				events = {{event = "touch", method = "_onBtnAnswerClick"}}
			},
        }
	}
    self:setName("EventAnswerCell"..self._index)
	EventAnswerCell.super.ctor(self, resource)
end

function EventAnswerCell:onCreate()
    self._imageHighLight:setVisible(false)
    self._imageRight:setVisible(false)
    self._imageWrong:setVisible(false)
    self._textAnswer:setString(self._description)
    self._btnAnswer:setString(Lang.get("explore_answer_btn_name", {index = EventAnswerCell.INDEX_CHAR_MAP[self._index]}))
    -- self._imageHero:ignoreContentAdaptWithSize(true)
    -- self._imageHero:setScale(0.35)
    self:_setAnswerImage()
end

function EventAnswerCell:onEnter()
end

function EventAnswerCell:onExit()
end

function EventAnswerCell:_setAnswerImage()
    local TypeConvertHelper = require("app.utils.TypeConvertHelper")
    self._imageHero:initUI( TypeConvertHelper.TYPE_HERO ,self._answerPicId)
    self._imageHero:setImageTemplateVisible(true)
    -- local heroResId = Hero.get(self._answerPicId).res_id
    -- local heroRes = HeroRes.get(heroResId).story_res
    -- self._imageHero:loadTexture(Path.getChatRoleRes(heroRes))
end

function EventAnswerCell:_onBtnAnswerClick()
    self._callback(self._index)
end

--设置是否正确
function EventAnswerCell:setRight(isRight)
    -- self._imageHighLight:setVisible(true)
    self._imageRight:setVisible(isRight)
    self._imageWrong:setVisible(not isRight)
end

function EventAnswerCell:disableAnswer()
    -- self._imageHighLight:setVisible(true)
    self._btnAnswer:setEnabled(false)
end

return EventAnswerCell
