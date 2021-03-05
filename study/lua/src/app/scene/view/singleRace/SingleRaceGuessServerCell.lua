
local ListViewCellBase = require("app.ui.ListViewCellBase")
local SingleRaceGuessServerCell = class("SingleRaceGuessServerCell", ListViewCellBase)
local UserDataHelper = require("app.utils.UserDataHelper")
local TextHelper = require("app.utils.TextHelper")
local SingleRaceConst = require("app.const.SingleRaceConst")

function SingleRaceGuessServerCell:ctor()
	local resource = {
		file = Path.getCSB("SingleRaceGuessServerCell", "singleRace"),
		binding = {
			_buttonVote = {
				events = {{event = "touch", method = "_onButtonVoteClicked"}}
			},
		}
	}
	SingleRaceGuessServerCell.super.ctor(self, resource)
end

function SingleRaceGuessServerCell:onCreate()
	self._data = nil
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
	for i = 1, 4 do
		self["_nodeIcon"..i]:setTouchEnabled(true)
		self["_nodeIcon"..i]:setCallBack(handler(self, self["_onClickIcon"..i]))
		self["_imageOfficial"..i]:ignoreContentAdaptWithSize(true)
	end
end

function SingleRaceGuessServerCell:update(data, index, mySupportId, supportNum, markRes, textButton)
	self._data = data
	self._textServer:setString(data:getServer_name())
	self._textPower:setString(TextHelper.getAmountText1(data:getPower()))
	self:updateCount(supportNum)
	self:updateVote(mySupportId)
	local users = data:getUserDatas()
	for i = 1, 4 do
		local user = users[i]
		if user then
			self["_node"..i]:setVisible(true)
			local coverId, limitLevel, limitRedLevel = user:getCovertIdAndLimitLevel()
			local officialName, officialColor,officialInfo = UserDataHelper.getOfficialInfo(user:getOfficer_level())
			self["_nodeIcon"..i]:updateUI(coverId, nil, limitLevel, limitRedLevel)
			self["_imageOfficial"..i]:loadTexture(Path.getTextHero(officialInfo.picture))
			self["_textName"..i]:setString(user:getUser_name())
			self["_textName"..i]:setColor(officialColor)
			require("yoka.utils.UIHelper").updateTextOfficialOutline(self["_textName"..i], user:getOfficer_level())
			self["_textPlayerPower"..i]:setString(TextHelper.getAmountText1(user:getPower()))
		else
			self["_node"..i]:setVisible(false)
		end
	end
	self._imageMark:loadTexture(markRes)
	self._buttonVote:setString(textButton)
end

function SingleRaceGuessServerCell:updateVote(mySupportId)
	local status = G_UserData:getSingleRace():getStatus()
	local isInStatus = status == SingleRaceConst.RACE_STATE_PRE
	local isVoted = mySupportId > 0 --投过了
	local thisVoted = self._data:getServer_id() == mySupportId --此项已投
	self._buttonVote:setVisible(not isVoted and isInStatus)
	self._imageVoted:setVisible(thisVoted)
end

function SingleRaceGuessServerCell:updateCount(supportNum)
	self._textCount:setString(supportNum)
end

function SingleRaceGuessServerCell:_onButtonVoteClicked()
	self:dispatchCustomCallback(1)
end

function SingleRaceGuessServerCell:getDataId()
	return self._data:getServer_id()
end

function SingleRaceGuessServerCell:_onClickIcon1()
	if self._data then
		local users = self._data:getUserDatas()
		local user = users[1]
		if user then
			self:_popupDetailInfo(user)
		end
	end
end

function SingleRaceGuessServerCell:_onClickIcon2()
	if self._data then
		local users = self._data:getUserDatas()
		local user = users[2]
		if user then
			self:_popupDetailInfo(user)
		end
	end
end

function SingleRaceGuessServerCell:_onClickIcon3()
	if self._data then
		local users = self._data:getUserDatas()
		local user = users[3]
		if user then
			self:_popupDetailInfo(user)
		end
	end
end

function SingleRaceGuessServerCell:_onClickIcon4()
	if self._data then
		local users = self._data:getUserDatas()
		local user = users[4]
		if user then
			self:_popupDetailInfo(user)
		end
	end
end

function SingleRaceGuessServerCell:_popupDetailInfo(user)
	local userId = user:getUser_id()
	local userDetailData = G_UserData:getSingleRace():getUserDetailInfoWithId(userId)
	local power = user:getPower()
	if userDetailData then
		local popup = require("app.ui.PopupUserDetailInfo").new(userDetailData, power)
	    popup:setName("PopupUserDetailInfo")
	    popup:openWithAction()
	else
		local pos = G_UserData:getSingleRace():getPosWithUserIdForGuess(userId)
		G_UserData:getSingleRace():c2sGetSingleRacePositionInfo(pos)
	end
end

return SingleRaceGuessServerCell