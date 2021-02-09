local ViewBase = require("app.ui.ViewBase")
local CampRaceSignin = class("CampRaceSignin", ViewBase)
local CampRaceHelper = require("app.scene.view.campRace.CampRaceHelper")
local FunctionConst = require("app.const.FunctionConst")
local CampRaceConst = require("app.const.CampRaceConst")
local SchedulerHelper = require ("app.utils.SchedulerHelper")

function CampRaceSignin:ctor()
	local resource = {
		file = Path.getCSB("CampRaceSignin", "campRace"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_btnSignIn = {
				events = {{event = "touch", method = "_onSigninClick"}}
			},
			_btnBest8 = {
				events = {{event = "touch", method = "_onBest8Click"}}
			},
		}
	}
    CampRaceSignin.super.ctor(self, resource)
end

function CampRaceSignin:onCreate()
	self:_initData()
	self:_initView()
end

function CampRaceSignin:_initData()
	self._scheduleHandler = nil
	self._openState = 0
	self._countDownTime = 0
end

function CampRaceSignin:_initView()
	self._btnBest8:updateUI(FunctionConst.FUNC_CAMP_RACE_DATE)
	self._btnSignIn:setString(Lang.get("camp_race_signin"))
	self._btnRule:updateUI(FunctionConst.FUNC_CAMP_RACE)
end

function CampRaceSignin:onEnter()
	self._signalGetBaseInfo = G_SignalManager:add(SignalConst.EVENT_GET_CAMP_BASE_INFO, handler(self, self._onEventBaseInfo)) --获得基本信息，主要是状态
	self._signalSignUp = G_SignalManager:add(SignalConst.EVENT_CAMP_SIGN_UP, handler(self, self._onEventCampSignUp)) --报名
	self._signalGetChampion = G_SignalManager:add(SignalConst.EVENT_CAMP_GET_CHAMPION, handler(self, self._onEventGetChampion)) 
end

function CampRaceSignin:onExit()
	self:_stopCountDown()
	
	self._signalGetBaseInfo:remove()
    self._signalGetBaseInfo = nil
    self._signalSignUp:remove()
	self._signalSignUp = nil
	self._signalGetChampion:remove()
	self._signalGetChampion = nil
end

function CampRaceSignin:onShow()
	self:_startCountDown()
end

function CampRaceSignin:onHide()
	self:_stopCountDown()
end

function CampRaceSignin:updateInfo()
	self:_updateData()
	self:_checkShowWinnerView()
	self:_updateBtnState()
	self:_updateCamp()
end

function CampRaceSignin:_updateData()
	self._openState, self._countDownTime = CampRaceHelper.getSigninState()
end

function CampRaceSignin:_checkShowWinnerView()
	if self._openState == CampRaceConst.SIGNIN_NOT_OPEN then 
		G_UserData:getCampRaceData():c2sGetCampRaceChampion()
	else
		self._nodeWinner:setVisible(false)
	end
end

function CampRaceSignin:_updateBtnState()
	local isSignUp = G_UserData:getCampRaceData():isSignUp()
	self._btnSignIn:setVisible(not isSignUp)
	self._imageSignin:setVisible(isSignUp)
end

function CampRaceSignin:_startCountDown()
	self:_stopCountDown()
	self._scheduleHandler = SchedulerHelper.newSchedule(handler(self, self._updateCountDown), 1)
	self:_updateCountDown()
end

function CampRaceSignin:_stopCountDown()
	if self._scheduleHandler ~= nil then
		SchedulerHelper.cancelSchedule(self._scheduleHandler)
		self._scheduleHandler = nil
	end
end

function CampRaceSignin:_updateStateText()
	local state = G_UserData:getCampRaceData():getStatus()
	if state == CampRaceConst.STATE_PRE_MATCH then
		self._textCountTitle:setString(Lang.get("camp_pre_matching"))
		self._textCount:setVisible(false)
	else
		if self._openState == CampRaceConst.SIGNIN_NOT_OPEN then 
			self._textCountTitle:setString(Lang.get("camp_pre_signin_open"))
		elseif self._openState == CampRaceConst.SIGNIN_OPEN then
			if G_UserData:getCampRaceData():isSignUp() then
				self._textCountTitle:setString(Lang.get("camp_pre_match_open"))
			else
				self._textCountTitle:setString(Lang.get("camp_pre_signin"))
			end
			self._nodeWinner:setVisible(false)
		end
		self._textCount:setVisible(true)
	end
end

function CampRaceSignin:_updateCountDown()
	local function getLeftDHMSFormat()
		local day,hour,min,second = G_ServerTime:convertSecondToDayHourMinSecond(self._countDownTime)
		if day >= 1 then
			return string.format(Lang.get("common_time_D"), day, hour)
		end
		local time = string.format(Lang.get("common_time_DHM"), hour, min,second)
		return time		
	end

	if self._countDownTime > 0 then
		self._textCount:setVisible(true)
		self._textCount:setString(getLeftDHMSFormat()) 
		self._textWinCountDown:setString(getLeftDHMSFormat())
		self._countDownTime = self._countDownTime - 1
	else
		self:_updateData()
	end
	self:_updateStateText()
end

function CampRaceSignin:_updateCamp()
	local showCamp = G_UserData:getCampRaceData():getMyCamp()
	local bg = Path.getCampJpg("img_camp_bg"..showCamp)
	self._imageBG:loadTexture(bg)

	local smallCamps = {8,5,7,6}
	local campSmall = Path.getTextSignet("img_com_camp0"..smallCamps[showCamp])
	self._imageCampSmall:loadTexture(campSmall)
	self._textDetail:setString(Lang.get("camp_sign")[showCamp])

	local campImg = Path.getCampImg("img_camp_com"..showCamp)
	self._imageCampBig:loadTexture(campImg)
end

function CampRaceSignin:_onSigninClick()
	if G_UserData:getCampRaceData():getStatus() == CampRaceConst.STATE_PRE_MATCH then 
		G_Prompt:showTip(Lang.get("camp_already_open"))
		return
	end
	if self._openState ~= CampRaceConst.SIGNIN_OPEN then
		G_Prompt:showTip(Lang.get("camp_not_signin_open"))
		return 
	end
	G_UserData:getCampRaceData():c2sCampRaceSignUp()
end

function CampRaceSignin:_onBest8Click()
	local state = G_UserData:getCampRaceData():getStatus()
	if state == CampRaceConst.STATE_PRE_MATCH then 
		G_Prompt:showTip(Lang.get("camp_map_notice"))
		return 
	end
    local showCamp = G_UserData:getCampRaceData():getMyCamp()
    G_SceneManager:showDialog("app.scene.view.campRace.PopupCampMap", nil, showCamp, true)
end

function CampRaceSignin:_onEventBaseInfo()
	self:_updateBtnState()
	self:_updateCamp()
end

function CampRaceSignin:_onEventCampSignUp(eventName)
	self:_updateBtnState()
	self:_updateData()
end

function CampRaceSignin:_onEventGetChampion()
	local champions = G_UserData:getCampRaceData():getChampion()
	local count = 0
	for camp, user in pairs(champions) do
		count = count + 1
	end
	if count == 0 then
		self._nodeWinner:setVisible(false)
	else
		self._nodeWinner:setVisible(true)
		for i = 1, 4 do
			local data = champions[i]
			self:_updateWinner(i, data)
		end
	end
end

function CampRaceSignin:_updateWinner(index, winnerData)
	local node = self["_nodeWinner"..index]
	local imageBg2 = node:getSubNodeByName("ImageBG2")
	local imageCamp = node:getSubNodeByName("ImageCamp")
	local smallCamps = {8,5,7,6}
	local campSmall = Path.getTextSignet("img_com_camp0"..smallCamps[index])
	local textName = node:getSubNodeByName("TextName")
	local avatar = self["_avatarWinner"..index]
    local heroPower = self["_heroPower"..index]
    local imgPower = self["_imagePower"..index]
	if winnerData then
		imageBg2:setVisible(true)
		imageCamp:setVisible(true)
		textName:setVisible(true)
		avatar:setVisible(true)
		heroPower:setVisible(true)
		imageCamp:loadTexture(campSmall)
		textName:setString(winnerData:getName())
		textName:setColor(Colors.getOfficialColor(winnerData:getOfficer_level()))
		avatar:updateUI(winnerData:getCoverId(), nil, nil, winnerData:getLimitLevel(), nil, nil, winnerData:getLimitRedLevel())
        heroPower:updateUI(winnerData:getPower())
        imgPower:setVisible(true)
	else
		imageBg2:setVisible(false)
		imageCamp:setVisible(false)
		textName:setVisible(false)
		avatar:setVisible(false)
        heroPower:setVisible(false)
        imgPower:setVisible(false)
	end
end

return CampRaceSignin
