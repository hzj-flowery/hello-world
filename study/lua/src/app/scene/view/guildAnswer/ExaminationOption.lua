
-- Author: nieming
-- Date:2018-01-30 10:12:01
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local ExaminationOption = class("ExaminationOption", ViewBase)


function ExaminationOption:ctor(index, selectOptionCallback)

	--csb bind var name
	self._btnSelect = nil  --Button
	self._imageRight = nil  --ImageView
	self._imageSelect = nil  --ImageView
	self._imageWrong = nil  --ImageView
	self._optionABCD = nil  --Text
	self._optionText = nil  --Text
	self._index = index
	self._selectOptionCallback = selectOptionCallback

	local resource = {
		file = Path.getCSB("ExaminationOption", "guildAnswer"),
		binding = {
			_btnSelect = {
				events = {{event = "touch", method = "_onBtnSelect"}}
			},
		},
	}
	ExaminationOption.super.ctor(self, resource)
end

-- Describle：
function ExaminationOption:onCreate()
	local abcd = {"A.","B.","C.","D."}
	self._optionABCD:setString(abcd[self._index])

end

-- Describle：
function ExaminationOption:onEnter()

end

-- Describle：
function ExaminationOption:onExit()

end
-- Describle：
function ExaminationOption:_onBtnSelect()
	-- body
	if self._selectOptionCallback then
		self._selectOptionCallback(self._index)
	end
end

function ExaminationOption:updateUI(string, isNeedShowRight, isSelect, isRight, isNeedShowWrong)
	self._optionText:setString(string)
	self._imageSelect:setVisible(isSelect)

	if isSelect then
		self._btnSelect:loadTextures(Path.getCommonImage("img_com_board04c"),Path.getCommonImage("img_com_board04c"))
	else
		self._btnSelect:loadTextures(Path.getCommonImage("img_com_board04"),Path.getCommonImage("img_com_board04"))
	end
	self._btnSelect:setCapInsets(cc.rect(18,18,6,6))
	if isNeedShowRight then
		self._imageRight:setVisible(isRight)
		if isSelect and not isRight then
			self._imageWrong:setVisible(true)
		else
			self._imageWrong:setVisible(false)
		end
	else
		self._imageRight:setVisible(false)
		self._imageWrong:setVisible(false)
	end

	if isNeedShowWrong then
		if not isRight then
			self._imageWrong:setVisible(true)
		end
	end
end

return ExaminationOption
