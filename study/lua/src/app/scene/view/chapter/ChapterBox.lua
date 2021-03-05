
-- Author: nieming
-- Date:2017-12-22 21:03:05
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local ChapterBox = class("ChapterBox", ViewBase)


function ChapterBox:ctor()

	--csb bind var name
	self._btnBox = nil  --Button
	self._chapterName = nil  --Text
	self._loadingBarProgress = nil  --LoadingBar
	self._textProgress = nil  --Text
	self._btnBg = nil
	self._redPoint = nil

	local resource = {
		file = Path.getCSB("ChapterBox", "chapter"),
		binding = {
			_btnBg = {
				events = {{event = "touch", method = "_onBtnBox"}}
			},
			_btnBox = {
				events = {{event = "touch", method = "_onBtnBox"}}
			},
		},
	}
	ChapterBox.super.ctor(self, resource)
end

-- Describle：
function ChapterBox:onCreate()
	self._redPoint:setVisible(false)
	self:updateUI()
end

function ChapterBox:updateUI()

	self._boxInfo = G_UserData:getChapterBox():getCurBoxInfo()
	if self._boxInfo then
		local lastChapterID = G_UserData:getChapter():getLastOpenChapterId()
		self._chapterName:setString(self._boxInfo.config.title)
		if G_UserData:getChapterBox():isCurBoxAwardsCanGet() then
			self._loadingBarProgress:setPercent(100)
			self._textProgress:setString(string.format("%d/%d", self._boxInfo.config.chapter, self._boxInfo.config.chapter))
			-- self._btnBox:loadTextures(Path.getChapterBox("img_mapbox_kai"), "", "", 0)
			self:_createBoxEffect()
		else
			-- local firstNum = lastChapterID - (self._boxInfo.config.chapter - self._boxInfo.length) - 1
			self._textProgress:setString(string.format("%d / %d", lastChapterID -1, self._boxInfo.config.chapter))
			self._loadingBarProgress:setPercent( (lastChapterID -1) / self._boxInfo.config.chapter * 100)
			-- self._btnBox:loadTextures(Path.getChapterBox("img_mapbox_kai"), "", "", 0)
			self:_removeEffect()
		end

	else
		self:setVisible(false)
	end
end

-- Describle：
function ChapterBox:onEnter()

end

function ChapterBox:setChapterBoxVisible(trueOrFalse)
	if self._boxInfo and trueOrFalse then
		self:setVisible(true)
	else
		self:setVisible(false)
	end
end

-- Describle：
function ChapterBox:onExit()


end

function ChapterBox:_createBoxEffect()
	if self._effect then
		return
	end
	self._btnBox:setVisible(false)
	local EffectGfxNode = require("app.effect.EffectGfxNode")
	local function effectFunction(effect)
		if effect == "effect_boxjump"then
			local subEffect = EffectGfxNode.new("effect_boxjump")
			subEffect:play()
			return subEffect
		end
	end
	self._effect = G_EffectGfxMgr:createPlayMovingGfx( self._boxNode, "moving_boxjump", effectFunction, nil, false )
	-- local size = self._btnBox:getContentSize()
	-- self._effect:setPosition(size.width*0.5, size.height*0.5)

 	-- local EffectGfxNode = require("app.effect.EffectGfxNode")
	-- local function effectFunction(effect)
    --     if effect == "effect_boxflash_xingxing"then
    --         local subEffect = EffectGfxNode.new("effect_boxflash_xingxing")
    --         subEffect:play()
    --         return subEffect
    --     end
    -- end
    -- self._effect = G_EffectGfxMgr:createPlayMovingGfx( self._btnBox, "moving_boxflash", effectFunction, nil, false )
    self._redPoint:setVisible(true)
end

function ChapterBox:_removeEffect()
	if self._effect then
		self._effect:removeFromParent()
		self._effect = nil
	end
	self._btnBox:setVisible(true)

	self._redPoint:setVisible(false)
end


function ChapterBox:_getAward()
	G_UserData:getChapterBox():c2sGetPeriodBoxAward(self._boxInfo.config.id)
end
-- Describle：
function ChapterBox:_onBtnBox(sender)
	-- body
	if not self._boxInfo then
		return
	end
	local popupBoxReward = require("app.ui.PopupBoxReward").new(Lang.get("chapter_box_pop_title"), handler(self, self._getAward),false, true)
	local rewards = {
		{
			type = self._boxInfo.config.type,
			value = self._boxInfo.config.value,
			size = self._boxInfo.config.size,
		}
	}
	popupBoxReward:updateUI(rewards)
	popupBoxReward:setBtnText(Lang.get("get_box_reward"))

	local chapterData = G_UserData:getChapter():getChapterDataById(self._boxInfo.config.chapter)
	assert(chapterData ~= nil, string.format("chapterData is nil chapterID = %s", self._boxInfo.config.chapter or "nil"))
	local configData = chapterData:getConfigData()

	local label = ccui.RichText:createWithContent(Lang.get("chapter_box_pop_detail", {chapter = string.format("%s %s", configData.chapter, configData.name)}))
	popupBoxReward:addRichTextDetail(label)

	if G_UserData:getChapterBox():isCurBoxAwardsCanGet() then
		popupBoxReward:setDetailTextVisible(false)
	else
		popupBoxReward:setBtnEnable(false)
		local lastChapterID = G_UserData:getChapter():getLastOpenChapterId()
		local leftNum = self._boxInfo.config.chapter + 1 - lastChapterID
		popupBoxReward:setDetailTextString(Lang.get("chapter_box_pop_detail2", {num = leftNum}))
		popupBoxReward:setDetailTextToBottom()
		popupBoxReward:setDetailTextVisible(true)
	end
	popupBoxReward:openWithTarget(sender)
end

return ChapterBox
