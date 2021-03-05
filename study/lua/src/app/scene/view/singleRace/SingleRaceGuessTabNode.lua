local SingleRaceGuessTabNode = class("SingleRaceGuessTabNode")

function SingleRaceGuessTabNode:ctor(target, index, callback)
	self._target = target
	self._index = index
	self._callback = callback

	self._imageBg = ccui.Helper:seekNodeByName(self._target, "ImageBg")
	self._imageBg:addClickEventListenerEx(handler(self, self._onClick))
	self._imagePoint = ccui.Helper:seekNodeByName(self._target, "ImagePoint")
	self._textTip = ccui.Helper:seekNodeByName(self._target, "TextTip")
	self._textTip:setString(Lang.get("single_race_guess_tab_title"..index))
	self._imageRP = ccui.Helper:seekNodeByName(self._target, "ImageRP")
end

function SingleRaceGuessTabNode:setSelected(selected)
	if selected then
		self._imageBg:loadTexture(Path.getIndividualCompetitiveImg("img_guessing_topic01"))
	else
		self._imageBg:loadTexture(Path.getIndividualCompetitiveImg("img_guessing_topic02"))
	end
end

function SingleRaceGuessTabNode:setVoted(voted)
	self._imagePoint:setVisible(voted)
end

function SingleRaceGuessTabNode:_onClick()
	if self._callback then
		self._callback(self._index)
	end
end

function SingleRaceGuessTabNode:showRP(show)
	self._imageRP:setVisible(show)
end

return SingleRaceGuessTabNode