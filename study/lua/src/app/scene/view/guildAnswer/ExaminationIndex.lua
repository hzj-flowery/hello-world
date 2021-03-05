
-- Author: nieming
-- Date:2018-01-30 10:11:59
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local ExaminationIndex = class("ExaminationIndex", ViewBase)


function ExaminationIndex:ctor(index)

	--csb bind var name
	self._imageGray = nil  --ImageView
	self._imageLight = nil  --ImageView
	self._imageRight = nil  --ImageView
	self._imageWrong = nil  --ImageView
	self._num = nil  --Text
	self._index = index
	local resource = {
		file = Path.getCSB("ExaminationIndex", "guildAnswer"),

	}
	ExaminationIndex.super.ctor(self, resource)
end


-- Describle：
function ExaminationIndex:onCreate()
	self._num:setString(tostring(self._index))
end

function ExaminationIndex:updateUI(curIndex, isRight, isAnswer)
	if curIndex > self._index and isAnswer then
		self._imageGray:setVisible(false)
		self._imageLight:setVisible(true)
		self._num:setVisible(false)
		if isRight then
			self._imageRight:setVisible(true)
			self._imageWrong:setVisible(false)
		else
			self._imageRight:setVisible(false)
			self._imageWrong:setVisible(true)
		end
	elseif curIndex == self._index then
		self._imageGray:setVisible(false)
		self._imageLight:setVisible(true)
		self._imageRight:setVisible(false)
		self._imageWrong:setVisible(false)
		self._num:setVisible(true)
		self._num:setColor(cc.c3b(0xff, 0x7a, 0x16))
		self._num:enableOutline(cc.c3b(0xff, 0xf3, 0xdb), 2)
	else
		self._imageGray:setVisible(true)
		self._imageLight:setVisible(false)
		self._imageRight:setVisible(false)
		self._imageWrong:setVisible(false)
		self._num:setVisible(true)
		self._num:setColor(cc.c3b(0x9e, 0x87, 0x76))
		self._num:enableOutline(cc.c3b(0xed, 0xea, 0xe5), 2)
	end
end

-- Describle：
function ExaminationIndex:onEnter()

end

-- Describle：
function ExaminationIndex:onExit()

end

return ExaminationIndex
