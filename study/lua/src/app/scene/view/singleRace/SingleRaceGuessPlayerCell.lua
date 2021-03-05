
local ListViewCellBase = require("app.ui.ListViewCellBase")
local SingleRaceGuessPlayerCell = class("SingleRaceGuessPlayerCell", ListViewCellBase)
local UserDataHelper = require("app.utils.UserDataHelper")
local TextHelper = require("app.utils.TextHelper")
local SingleRaceConst = require("app.const.SingleRaceConst")

function SingleRaceGuessPlayerCell:ctor()
	local resource = {
		file = Path.getCSB("SingleRaceGuessPlayerCell", "singleRace"),
		binding = {
			_buttonVote = {
				events = {{event = "touch", method = "_onButtonVoteClicked"}}
			},
		}
	}
	SingleRaceGuessPlayerCell.super.ctor(self, resource)
end

function SingleRaceGuessPlayerCell:onCreate()
	self._data = 0
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
	self._nodeIcon:setTouchEnabled(true)
	self._nodeIcon:setCallBack(handler(self, self._onClickIcon))
	self._imageOfficial:ignoreContentAdaptWithSize(true)
end

function SingleRaceGuessPlayerCell:update(data, index, mySupportId, supportNum, markRes, textButton)
	self._data = data
	local coverId, limitLevel, limitRedLevel = data:getCovertIdAndLimitLevel()
	local officialName, officialColor,officialInfo = UserDataHelper.getOfficialInfo(data:getOfficer_level())
	self:updateCount(supportNum)
	self:updateVote(mySupportId)
	if index % 2 == 1 then
		self._imageBg:loadTexture(Path.getIndividualCompetitiveImg("img_guessing_03"))
	else
		self._imageBg:loadTexture(Path.getIndividualCompetitiveImg("img_guessing_02"))
	end
	self._imageBg:setScale9Enabled(true)	
	self._imageBg:setCapInsets(cc.rect(2,2,1,3))
	self._nodeIcon:updateUI(coverId, nil, limitLevel, limitRedLevel)
	self._textServer:setString(data:getServer_name())
	self._imageOfficial:loadTexture(Path.getTextHero(officialInfo.picture))
	self._textName:setString(data:getUser_name())
	self._textName:setColor(officialColor)
	require("yoka.utils.UIHelper").updateTextOfficialOutline(self._textName, data:getOfficer_level())
	self._textPower:setString(TextHelper.getAmountText1(data:getPower()))
	self._imageMark:loadTexture(markRes)
	self._buttonVote:setString(textButton)
end

function SingleRaceGuessPlayerCell:updateVote(mySupportId)
	local status = G_UserData:getSingleRace():getStatus()
	local isInStatus = status == SingleRaceConst.RACE_STATE_PRE
	local isVoted = mySupportId > 0 --投过了
	local thisVoted = self._data:getUser_id() == mySupportId --此项已投
	self._buttonVote:setVisible(not isVoted and isInStatus)
	self._imageVoted:setVisible(thisVoted)
end

function SingleRaceGuessPlayerCell:updateCount(supportNum)
	self._textCount:setString(supportNum)
end

function SingleRaceGuessPlayerCell:_onButtonVoteClicked()
	self:dispatchCustomCallback(1)
end

function SingleRaceGuessPlayerCell:getDataId()
	return self._data:getUser_id()
end

function SingleRaceGuessPlayerCell:_onClickIcon()
	if self._data then
		local userId = self._data:getUser_id()
		local userDetailData = G_UserData:getSingleRace():getUserDetailInfoWithId(userId)
		local power = self._data:getPower()
		if userDetailData then
			local popup = require("app.ui.PopupUserDetailInfo").new(userDetailData, power)
		    popup:setName("PopupUserDetailInfo")
		    popup:openWithAction()
		else
			local pos = G_UserData:getSingleRace():getPosWithUserIdForGuess(userId)
			G_UserData:getSingleRace():c2sGetSingleRacePositionInfo(pos)
		end
	end
end

return SingleRaceGuessPlayerCell