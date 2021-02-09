--玩家信息弹框

local PopupBase = require("app.ui.PopupBase")
local PopupPlayerDetail = class("PopupPlayerDetail", PopupBase)
local Path = require("app.utils.Path")
local MailConst = require("app.const.MailConst")
local DataConst = require("app.const.DataConst")
local PopupHonorTitleHelper = require("app.scene.view.playerDetail.PopupHonorTitleHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local PopupPlayerSoundSlider = require("app.scene.view.playerDetail.PopupPlayerSoundSlider")
local PopUpPlayerFrame = require("app.scene.view.playerDetail.PopUpPlayerFrame")

local Path = require("app.utils.Path")
local USER_SETTING = "userSetting"

function PopupPlayerDetail:ctor(title, callback)
	--
	self._title = title or Lang.get("player_detail_title")
	self._callback = callback
	self._commonHeroIcon = nil --玩家头像
	self._textPlayerLevel = nil --玩家等级
	self._commonVipNode = nil --VIP等级
	self._textPlayerName = nil --玩家名称
	self._btnModifyName = nil --修改名称按钮
	self._btnSwitchAccount = nil --切换账号
	self._btnGameAnnounce = nil --玩家公告
	self._btnGameMaker = nil --制作人员
	self._btnGameReward = nil --礼品码
	self._textPlayerId = nil --玩家编号
	self._textServerName = nil --服务器名称
	self._imageMidBk = nil --中间背景图
	self._resRecover1 = nil --回复资源1
	self._resRecover2 = nil --回复资源2
	self._resRecover3 = nil --回复资源3
	self._loadingbarProcess = nil --进度条
	self._textExp = nil --进度条经验值
	self._checkBox1 = nil --选中框
	self._checkBox2 = nil
	self._checkBox3 = nil
	self._sliderMic = nil
	self._sliderSpeaker = nil
	self._textMic = nil
	self._textSpeaker = nil
	self._textMicValue = nil
	self._textSpeakerValue = nil
	self._btnChangeTitle = nil --修改称号按钮
	self._titleImage = nil -- 称号图片
	self._titleTipText = nil
	self._redPoint = nil
	self._btnFrame = nil
	---

	self._vitCountKey = nil --体力恢复倒数key
	self._spirteCountKey = nil --精力恢复倒数key
	self._intervalTime = 0
	self._restoreTime = {}
	self._refreshHandler = nil
	self._commonVipNode = nil

	for i = 1, 3 do
		self._restoreTime[i] = 0
	end

	local resource = {
		file = Path.getCSB("PopupPlayerDetail", "playerDetail"),
		binding = {
			_btnModifyName = {
				events = {{event = "touch", method = "onBtnModifyName"}}
			},
			_btnGameReward = {
				events = {{event = "touch", method = "_onBtnGiftCode"}}
			},
			_btnSwitchAccount = {
				events = {{event = "touch", method = "_onSwidthAccount"}}
			},
			_btnGameAnnounce = {
				events = {{event = "touch", method = "_onGameAnnounce"}}
			},
			_btnGameMaker = {
				events = {{event = "touch", method = "_onGameMaker"}}
			},
			_btnBind = {
				events = {{event = "touch", method = "_onClickBtnBind"}}
			},
			_btnChangeTitle = {
				events = {{event = "touch", method = "_onClickChangeTitle"}} -- 修改称号
			},
			_btnFrame = {
				events = {{event = "touch", method = "_onClickBtnFrame"}}
			}
		}
	}
	PopupPlayerDetail.super.ctor(self, resource, true)
end

--
function PopupPlayerDetail:onCreate()
	self:_initSound()

	self._commonNodeBk:addCloseEventListener(handler(self, self.onBtnCancel))
	self._commonNodeBk:setTitle(self._title)
	self._settingTitle:setFontSize(30)
	self._settingTitle:setTitleAndAdjustBgSize(Lang.get("system_setting_title"))
	self._settingTitle:showTextBg(false)
	self:_onLoadSetting()
	self:_updatePlayerInfo()

	self._btnFrame:setTitleText(Lang.get("change_role_frame"))
	-- self._btnFrameTxt:setString(Lang.get("change_role_frame"))
	-- self._btnFrame:setVisible(false)

	self:_initMicTest()
	self:_initTitle()
end

function PopupPlayerDetail:_onClickBtnFrame()
	local popup = PopUpPlayerFrame.new()
	popup:openWithAction()
end

function PopupPlayerDetail:_initSound()
	local function updateSound(_control, _name)
		local soundControl = PopupPlayerSoundSlider.new(_control)
		local volume = G_UserData:getUserSetting():getSettingValue(_name) or 1
		soundControl:updateUI(volume * 100)
		G_UserData:getUserSetting():updateMusic()

		soundControl:setCallBack(
			function(_value, _event)
				if _event == "on" then
					if _name == "mus_volume" then
						if _value > 0 then
							G_AudioManager:setMusicEnabled(true)
						end
						G_AudioManager:setMusicVolume(_value / 100)
					elseif _name == "sou_volume" then
						if _value > 0 then
							G_AudioManager:setSoundEnabled(true)
						end
						G_AudioManager:setSoundVolume(_value / 100)
					end
				elseif _event == "up" then
					local index = _value > 0 and 1 or 0
					if _name == "mus_volume" then
						G_UserData:getUserSetting():setSettingValue("musicEnabled", index)
					elseif _name == "sou_volume" then
						G_UserData:getUserSetting():setSettingValue("soundEnabled", index)
					end
					G_UserData:getUserSetting():setSettingValue(_name, _value / 100)
					G_UserData:getUserSetting():updateMusic()
				end
			end
		)
	end

	updateSound(self._bgSlider, "mus_volume")
	updateSound(self._effectSlider, "sou_volume")
end

-- 初始化称号信息
function PopupPlayerDetail:_initTitle()
	self._btnChangeTitle:setTitleText(Lang.get("honor_title_title_btn"))
	self:_changeTitle()

	local FunctionCheck = require("app.utils.logic.FunctionCheck")
	local FunctionConst = require("app.const.FunctionConst")
	local isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_TITLE)
	self._btnChangeTitle:setVisible(isOpen)
	if not isOpen then
		self._titleImage:setVisible(false)
		self._titleTipText:setVisible(false)
	end
end

-- 改变称号
function PopupPlayerDetail:_changeTitle()
	local titleItem = PopupHonorTitleHelper.getEquipedTitle() -- 获取已经装备的称号
	local titleId = titleItem and titleItem:getId() or 0
	UserDataHelper.appendNodeTitle(self._titleImage, titleId, self.__cname)
	self._titleTipText:setVisible(titleId == 0)
end

--
function PopupPlayerDetail:_initMicTest()
	if APP_DEVELOP_MODE then
		self._sliderMic:addEventListener(handler(self, self.onMicSlider))
		self._sliderSpeaker:addEventListener(handler(self, self.onSpeakerSlider))

		local mic_volume = G_UserData:getUserSetting():getSettingValue("mic_volume") or 0
		local speaker_volume = G_UserData:getUserSetting():getSettingValue("speaker_volume") or 0
		self._sliderMic:setPercent(mic_volume / 8)
		self._textMicValue:setString(mic_volume)
		self._sliderSpeaker:setPercent(speaker_volume / 8)
		self._textSpeakerValue:setString(speaker_volume)
	else
		self._sliderMic:setVisible(false)
		self._sliderSpeaker:setVisible(false)
		self._textMic:setVisible(false)
		self._textSpeaker:setVisible(false)
		self._textMicValue:setVisible(false)
		self._textSpeakerValue:setVisible(false)
	end
end

--
function PopupPlayerDetail:onMicSlider(sender, event)
	local value = checkint(self._sliderMic:getPercent() * 8)
	if event == ccui.SliderEventType.percentChanged then
		self._textMicValue:setString(value)
	elseif event == ccui.SliderEventType.slideBallUp then
		G_VoiceAgent:setMicVolume(value)
		G_UserData:getUserSetting():setSettingValue("mic_volume", value)
	end
end

--
function PopupPlayerDetail:onSpeakerSlider(sender, event)
	local value = checkint(self._sliderSpeaker:getPercent() * 8)
	if event == ccui.SliderEventType.percentChanged then
		self._textSpeakerValue:setString(value)
	elseif event == ccui.SliderEventType.slideBallUp then
		G_VoiceAgent:setSpeakerVolume(value)
		G_UserData:getUserSetting():setSettingValue("speaker_volume", value)
	end
end

function PopupPlayerDetail:_onLoadSetting()
	local checkList = {}
	checkList[1] = G_UserData:getUserSetting():getSettingValue("musicEnabled")
	checkList[2] = G_UserData:getUserSetting():getSettingValue("soundEnabled")
	checkList[3] = G_UserData:getUserSetting():getSettingValue("gfxEnabled")

	for i = 1, 3 do
		local checkWidget = self["_checkBox" .. i]
		local checkValue = checkList[i] or 0

		if checkValue == 1 then
			checkWidget:setSelected(true)
		else
			checkWidget:setSelected(false)
		end
	end
end

--玩家等级上限处理逻辑
function PopupPlayerDetail:prcoLimitLevel(...)
	-- body
	local nowDay = G_UserData:getBase():getOpenServerDayNum()

	local UserCheck = require("app.utils.logic.UserCheck")
	local ParameterIDConst = require("app.const.ParameterIDConst")
	local paramMax = require("app.config.parameter").get(ParameterIDConst.PLAYER_DETAIL_LEVEL_MAX).content

	local nextPendStr = " "
	local currLevelStar = " "

	if nowDay < tonumber(paramMax) then
		self._levelLimit:setString(currLevelStar)
		self._levelLimitDesc:setString(nextPendStr)
		self._nodeLevelLimit:setVisible(false)
		return
	end
	self._nodeLevelLimit:setVisible(true)
	local paramContent = require("app.config.parameter").get(ParameterIDConst.PLAYER_DETAIL_LEVEL_LIMIT).content
	local valueList = string.split(paramContent, ",")

	for i, value in ipairs(valueList) do
		local day, level = unpack(string.split(value, "|"))
		local currLevel = tonumber(level)
		local currDay = tonumber(day)
		if UserCheck.enoughOpenDay(currDay) then
			currLevelStar = Lang.get("common_player_detail_level_limit", {num = currLevel})
		else
			nextPendStr = Lang.get("common_player_detail_level_limit1", {level = currLevel, day = currDay - nowDay})
		end
	end

	self._levelLimit:setString(currLevelStar)
	self._levelLimitDesc:setString(nextPendStr)
end

--顶部玩家信息更新
function PopupPlayerDetail:_updatePlayerInfo()
	local baseData = G_UserData:getBase()

	self._textPlayerLevel:setString(tostring(baseData:getLevel()))
	self._textPlayerName:setString(baseData:getName())
	local hexstr = string.format("%x", baseData:getId())
	self._textPlayerId:setString(hexstr)
	--玩家经验
	local currExp = G_UserData:getBase():getExp()
	local level = G_UserData:getBase():getLevel()
	if level == 0 then
		return
	end

	local roleConfig = require("app.config.role").get(level)
	assert(roleConfig, "can not find role Config by level is " .. level)

	local levelUpExp = roleConfig.exp
	self._textExp:setString(currExp .. "/" .. levelUpExp)
	local percent = math.ceil(currExp / levelUpExp * 100)
	if percent > 100 then
		percent = 100
	end

	self:prcoLimitLevel()
	self._loadingbarProcess:setPercent(percent)

	--vip等级
	local vipLevel = G_UserData:getVip():getLevel()
	self._commonVipNode:setVip(vipLevel)
	--serverId
	--local serverId = G_ServerListManager:getServer()
	local serverName = G_UserData:getBase():getServer_name()
	self._textServerName:setString(serverName)

	self._btnSwitchAccount:setString(Lang.get("system_setting_switch_acount"))
	self._btnGameAnnounce:setString(Lang.get("system_setting_game_announce"))
	self._btnGameMaker:setString(Lang.get("system_setting_game_marker"))
	self._btnGameReward:setString(Lang.get("system_setting_game_reward"))
	self._btnBind:setString(Lang.get("system_setting_bind"))

	self:_updateRecoverInfo(1)
	self:_updateRecoverInfo(2)
	self:_updateRecoverInfo(3)

	local officialInfo, officialLevel = G_UserData:getBase():getOfficialInfo()
	if officialLevel == 0 then
		self:updateImageView("Image_player_title", {visible = false})
	else
		self:updateImageView("Image_player_title", {texture = Path.getTextHero(officialInfo.picture), visible = true})
	end
	--[[
	local baseId = G_UserData:getBase():getPlayerBaseId()
	if G_UserData:getBase():isEquipAvatar() then
		local avatarBaseId = G_UserData:getBase():getAvatar_base_id()
		baseId = require("app.utils.data.AvatarDataHelper").getAvatarConfig(avatarBaseId).hero_id
	end
	self._commonHeroIcon:updateUI(baseId)
]]
	self._commonHeroIcon:updateIcon(G_UserData:getBase():getPlayerShowInfo(), nil, G_UserData:getHeadFrame():getCurrentFrame():getId())
	--self._commonHeroIcon:updateHeadFrame(G_UserData:getHeadFrame():getCurrentFrame())
	--self._commonHeadFrame:updateIcon(G_UserData:getHeadFrame():getCurrentFrame(),self._commonHeroIcon:getScale())


	self._textPlayerName:setColor(Colors.getOfficialColor(officialLevel))
	require("yoka.utils.UIHelper").updateTextOfficialOutline(self._textPlayerName, officialLevel)

	for i = 1, 3 do
		local checkBox = self["_checkBox" .. i]
		checkBox:setTag(i)
		checkBox:addEventListener(handler(self, self._onCheckBoxClick))
	end
end

function PopupPlayerDetail:_onCheckBoxClick(sender)
	local index = sender:isSelected() and 1 or 0

	if sender:getName() == "_checkBox1" then
		local index = sender:isSelected() and 1 or 0
		G_UserData:getUserSetting():setSettingValue("musicEnabled", index)
	end
	if sender:getName() == "_checkBox2" then
		local index = sender:isSelected() and 1 or 0
		G_UserData:getUserSetting():setSettingValue("soundEnabled", index)
	end
	if sender:getName() == "_checkBox3" then
		local index = sender:isSelected() and 1 or 0
		G_UserData:getUserSetting():setSettingValue("gfxEnabled", index)
	end

	G_UserData:getUserSetting():updateMusic()
	--G_NetworkManager:send(MessageIDConst.ID_C2S_SystemSet, message)
end

--更新回复信息
function PopupPlayerDetail:_updateRecoverInfo(index)
	local unitIds = {1, 2, 4}
	local unitInfo = G_RecoverMgr:getRecoverUnit(unitIds[index])
	local serverTime = G_ServerTime:getTime()
	local resId = unitInfo:getResId()
	local recoverCfg = unitInfo:getConfig()

	--[[
	local currValue = G_UserData:getBase():getResValue(resId)
	local recoverCfg = unitInfo:getConfig()
	local needRestore = unitInfo:getMaxLimit() - currValue
	needRestore = needRestore >= 0 and needRestore or 0

	dump(recoverCfg)
	if needRestore > 0 then
		if self._restoreTime[index] == 0 then
			self._restoreTime[index] = recoverCfg.recover_time
		end
	else
		self._restoreTime[index] = 0
	end

	local restoreFullTime =  self._restoreTime[index] + (needRestore - 1) / recoverCfg.recover_num * recoverCfg.recover_time
	restoreFullTime = restoreFullTime >= 0 and restoreFullTime or 0

	local UIHelper = require("yoka.utils.UIHelper")
	local serverTime = G_ServerTime:getTime()
	local currentHour = os.date("%H", serverTime)
	local currentMinute = os.date("%M", serverTime)
	local currentSeconed = os.date("%S", serverTime)
	local totalSeconds = currentHour * 3600 + currentMinute * 60 + currentSeconed
	local blankSeconds = 24 * 3600 - totalSeconds 		--还差多少秒到达第二天
	local totalRestoreDesc = nil ---全部恢复的描述，要根据今天还是明天，做差异化
	local totalTimeStr = nil
	if blankSeconds - restoreFullTime >= 0 then
		totalTimeStr = UIHelper.fromatHHMMSS(restoreFullTime + totalSeconds)
		totalTimeStr = string.sub(totalTimeStr, 1, -4)
		totalRestoreDesc = Lang.get("player_detail_today", {value = totalTimeStr})
	else
		local tomorrowSeconds = restoreFullTime - blankSeconds
		totalTimeStr = UIHelper.fromatHHMMSS(tomorrowSeconds)
		totalTimeStr = string.sub(totalTimeStr, 1, -4)
		totalRestoreDesc = Lang.get("player_detail_tomorrow", {value = totalTimeStr})
	end
]]
	local recoverWidget = self["_resRecover" .. index]
	recoverWidget:updateLabel("Text_titile", Lang.get("player_detail_restore_desc", {value = recoverCfg.name}))

	--[[
	recoverWidget:updateLabel("Text_value",  {
		text = restoreFullTime == 0 and Lang.get("player_detail_restore_full") or totalRestoreDesc,
		color = restoreFullTime == 0 and Colors.COLOR_POPUP_ADD_PROPERTY or Colors.COLOR_POPUP_DESC_NOTE
	})
]]
	local miniIcon = Path.getCommonIcon("resourcemini", resId)

	recoverWidget:updateImageView("Image_icon", {texture = miniIcon})

	self:_updateRecoverTime(index)
end

function PopupPlayerDetail:_updateRecoverTime(index)
	local unitIds = {1, 2, 4}
	local unitInfo = G_RecoverMgr:getRecoverUnit(unitIds[index])
	local currValue = G_UserData:getBase():getResValue(unitInfo:getResId())
	local recoverCfg = unitInfo:getConfig()
	local needRestore = unitInfo:getMaxLimit() - currValue
	needRestore = needRestore >= 0 and needRestore or 0

	local restoreFullTime = 0
	local totalRestoreDesc = ""
	if needRestore > 0 then
		local time1 = UserDataHelper.getRefreshTime(unitInfo:getResId())
		--logWarn("xxxxxxxxxxxxxxxxx "..time1.."   "..G_ServerTime:getTime())
		--local time = ( time1- G_ServerTime:getTime() ) % recoverCfg.recover_time
		--restoreFullTime  =  time + (needRestore - 1) / recoverCfg.recover_num * recoverCfg.recover_time
		restoreFullTime = time1 - G_ServerTime:getTime()
		totalRestoreDesc = G_ServerTime:_secondToString(restoreFullTime)
	end
	local recoverWidget = self["_resRecover" .. index]
	recoverWidget:updateLabel(
		"Text_value",
		{
			text = restoreFullTime == 0 and Lang.get("player_detail_restore_full") or totalRestoreDesc,
			color = restoreFullTime == 0 and Colors.COLOR_POPUP_ADD_PROPERTY or Colors.COLOR_POPUP_DESC_NOTE
		}
	)
end

--点击领取按钮
function PopupPlayerDetail:_onItemTouch(index, postIndex)
	local itemIndex = postIndex
	local mailInfo = self._dataList[itemIndex]
	if mailInfo then
		local message = {
			id = mailInfo.id
		}
		G_NetworkManager:send(MessageIDConst.ID_C2S_ProcessMail, message)
	end
end

function PopupPlayerDetail:_onItemUpdate(item, index)
	local mailInfo = self._dataList[index + 1]
	if mailInfo then
		item:updateUI(index, mailInfo)
	end
end

function PopupPlayerDetail:_onItemSelected()
end

function PopupPlayerDetail:_onInit()
end

function PopupPlayerDetail:onEnter()
	self:scheduleUpdateWithPriorityLua(handler(self, self._onUpdate), 0)

	-- 监听user数据更新
	self._signalUserDataUpdate =
		G_SignalManager:add(SignalConst.EVENT_RECV_ROLE_INFO, handler(self, self._onUserDataUpdate))

	self._signalEquipTitle = G_SignalManager:add(SignalConst.EVENT_EQUIP_TITLE, handler(self, self._onEventTitleChange)) -- 称号装备
	self._signalUnloadTitle = G_SignalManager:add(SignalConst.EVENT_UNLOAD_TITLE, handler(self, self._onEventTitleChange)) -- 称号卸下
	self._signalRedPoint = G_SignalManager:add(SignalConst.EVENT_RED_POINT_UPDATE, handler(self, self._onEventRedUpdate))
	self._signalUpdateTitleInfo =
		G_SignalManager:add(SignalConst.EVENT_UPDATE_TITLE_INFO, handler(self, self._onEventTitleChange)) -- 称号更新
	self:_formatBtns()

	-- 是否打开礼品码
	if G_ConfigManager:isGiftcode() == false then
		self._btnGameReward:setVisible(false)
	end
	if G_ConfigManager:isAppstore() then
		self._btnBind:setVisible(false)
		self._btnGameReward:setVisible(false)
		self._btnGameMaker:setVisible(false)
	end
	self._btnGameMaker:setVisible(false)
	self:_resetRedPoint()
	self:_resetHeadFramePoint()
end

function PopupPlayerDetail:onExit()
	self:unscheduleUpdate()
	self._signalUserDataUpdate:remove()
	self._signalUserDataUpdate = nil
	self._signalEquipTitle:remove()
	self._signalEquipTitle = nil
	self._signalUnloadTitle:remove()
	self._signalUnloadTitle = nil
	self._signalRedPoint:remove()
	self._signalRedPoint = nil
	self._signalUpdateTitleInfo:remove()
	self._signalUpdateTitleInfo = nil
end

function PopupPlayerDetail:_onUpdate(dt)
	self._intervalTime = self._intervalTime + dt
	if self._intervalTime >= 1 then
		self:_updateRecoverTime(1)
		self:_updateRecoverTime(2)
		self:_updateRecoverTime(3)
		self._intervalTime = 0
	end
end

function PopupPlayerDetail:_onEventRedUpdate()
	self:_resetRedPoint()
	self:_resetHeadFramePoint()
end

function PopupPlayerDetail:_resetRedPoint()
	local hasRed = G_UserData:getTitles():isHasRedPoint()
	self._redPoint:setVisible(hasRed)
end

function PopupPlayerDetail:_resetHeadFramePoint( )
	local frameRed = G_UserData:getHeadFrame():hasRedPoint()
	self._redPointFrame:setVisible(frameRed)
end



function PopupPlayerDetail:_updateListView()
	local listView = self._listView
	--获得奖励邮件数据列表
	self._dataList = G_UserData:getMails():getEmailListByType(MailConst.MAIL_TYPE_AWARD)
	local itemList = self._dataList
	if itemList then
		local lineCount = #itemList
		dump(lineCount)
		listView:clearAll()
		listView:resize(lineCount)
	end
end

function PopupPlayerDetail:onBtnOk()
	local isBreak
	if self._callback then
		isBreak = self._callback(self._buyItemId)
	end

	if not isBreak then
		self:close()
	end
end

function PopupPlayerDetail:onBtnCancel()
	if not isBreak then
		self:close()
	end
end

function PopupPlayerDetail:onBtnModifyName(sender)
	local PopupPlayerModifyName = require("app.scene.view.playerDetail.PopupPlayerModifyName").new()
	PopupPlayerModifyName:openWithAction()
end

-- user数据更新
function PopupPlayerDetail:_onUserDataUpdate(_, param)
	--dump(param)
	self:_updatePlayerInfo()
end

-- 称号装备和卸下事件处理
function PopupPlayerDetail:_onEventTitleChange()
	self:_changeTitle()
end

function PopupPlayerDetail:_onBtnGiftCode(sender)
	local popupGiftCode = require("app.ui.PopupGiftCode").new()
	popupGiftCode:openWithAction()
end

function PopupPlayerDetail:_onSwidthAccount(sender)
	-- 切换账号
	G_GameAgent:logoutPlatform()
end

function PopupPlayerDetail:_onGameAnnounce(sender)
	-- 打开游戏公告
	if ccexp.WebView then
		local url = G_ConfigManager:getPopupUrl()
		if url ~= nil and url ~= "" then
			local PopupNotice = require("app.ui.PopupNotice")
			PopupNotice:create(url, nil)
		end
	end
end

function PopupPlayerDetail:_onGameMaker()
	-- G_SceneManager:showScene("producer")
end

function PopupPlayerDetail:_onClickBtnBind()
	local popup = require("app.ui.PopupBindPublicAccount").new()
	popup:openWithAction()
end

function PopupPlayerDetail:_onClickChangeTitle() -- 弹出修改称号框
	local PopupHonorTitle = require("app.scene.view.playerDetail.PopupHonorTitle").new()
	PopupHonorTitle:openWithAction()
	local hasRed = G_UserData:getTitles():isHasRedPoint()
	if hasRed then
		G_UserData:getTitles():c2sClearTitles()
	end
end

function PopupPlayerDetail:_formatBtns()
	local type2Pos = {
		[1] = {{233, 80}, {455, 80}, {679, 80}, {901, 80}}, --901
		[2] = {{198, 80}, {383, 80}, {568, 80}, {753, 80}, {938, 80}}
	}

	--self._btnGameMaker,
	self._btnGameMaker:setVisible(false)
	self._btnBind:setVisible(false)
	local btns = {self._btnSwitchAccount, self._btnGameAnnounce, self._btnGameReward, self._btnBind}

	local isShowBindWeChat = G_ConfigManager:isShowBindWeChat()
	local isBinded = G_UserData:getBase():isBindedWeChat()
	if isShowBindWeChat and isBinded == false then
		self._btnBind:setVisible(true)
	end

	local type = 1
	local posList = type2Pos[type]
	for i, btn in ipairs(btns) do
		local pos = posList[i]
		if pos then
			btn:setPosition(pos[1], pos[2])
		end
	end
end

return PopupPlayerDetail
