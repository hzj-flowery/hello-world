
-- Author: hedili
-- Date:2018-04-19 14:10:17
-- Describle：

local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupRunningManCell = class("PopupRunningManCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local RunningManHelp = require("app.scene.view.runningMan.RunningManHelp")
local RunningManConst = require("app.const.RunningManConst")

local UserDataHelper = require("app.utils.UserDataHelper")

function PopupRunningManCell:ctor()

	--csb bind var name
	self._commonBuy = nil  --CommonButtonHighLight
	self._commonIcon = nil  --CommonIconTemplate
	self._textDesc1 = nil  --Text
	self._textDesc2 = nil  --Text
	self._textDesc3 = nil  --Text
	self._textDesc3_0 = nil  --Text
	self._textDesc4 = nil  --Text
	self._textPlayerName = nil  --Text
	self._imageTake = nil --Image

	local resource = {
		file = Path.getCSB("PopupRunningManCell", "runningMan"),
		binding = {
			_commonBuy = {
				events = {{event = "touch", method = "_onCommonBuy"}}
			},
		},
	}
	PopupRunningManCell.super.ctor(self, resource)
end

function PopupRunningManCell:onCreate()
	-- body
	self._size = self._resourceNode:getContentSize()
	self:setContentSize(self._size.width, self._size.height)

	self._commonBuy:setString(Lang.get(" "))

	
end


--[[
	message PlayHorseHero {
	optional uint32 hero_id = 1;		// 英雄id
	optional uint32 hero_win_rate = 2;	// 英雄胜率
	optional uint32 hero_bet_rate = 3;	// 英雄投注率
	optional uint32 hero_odds = 4; // 英雄赔率
}
]]

function PopupRunningManCell:_procPlayerIcon( heroData )
	--dump(heroData, "heroData1")
	local isPlayer = heroData.isPlayer
	if isPlayer == nil or isPlayer == 0 then
		return
	end
	local simpleUser = heroData.user
	self:updateLabel("_textPlayerName",
	{
		text = simpleUser.name,
		color = Colors.getOfficialColor(simpleUser.office_level),
		outlineColor = Colors.getOfficialColorOutline(simpleUser.office_level)
	})
	
	local baseId,avatarTable = UserDataHelper.convertAvatarId(simpleUser)
	--self._commonIcon:unInitUI()
	--self._commonIcon:initUI(TypeConvertHelper.TYPE_HERO, baseId)
	--local iconTemplate = self._commonIcon:getIconTemplate()
	--dump(avatarTable)
	self._commonIcon:updateIcon(avatarTable, nil, simpleUser.head_frame_id)
	-- body
end

function PopupRunningManCell:_procHeroIcon( heroData )
	--dump(heroData, "heroData")
	-- body
	local typeHeroInfo = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroData.heroId)
	--self._commonIcon:unInitUI()
	--self._commonIcon:initUI(TypeConvertHelper.TYPE_HERO, heroData.heroId)
	--local simpleUser = heroData.user
	--local baseId,avatarTable = UserDataHelper.convertAvatarId(simpleUser)
	--dump(baseId)
	--dump(avatarTable)
	self._commonIcon:updateUI(heroData.heroId);

	self:updateLabel("_textPlayerName",
	{
		text = typeHeroInfo.name,
		color = typeHeroInfo.icon_color,
		outlineColor = typeHeroInfo.icon_color_outline,
	})
end

function PopupRunningManCell:updateUI(heroData,index)
	self._imageTake:setVisible(false)
	
	if heroData.roadNum % 2 == 0 then
        self._imageBk:loadTexture(Path.getCommonRankUI("img_com_board_list01b"))
	else
        self._imageBk:loadTexture(Path.getCommonRankUI("img_com_board_list01a"))
	end

    self._imageBk:setCapInsets(cc.rect(2, 2, 2, 2))
    self._imageBk:setScale9Enabled(true)
    self._imageBk:setContentSize(self._size)
	self._commonBuy:switchToNormal()
	self._commonBuy:setString(Lang.get("runningman_btn_desc1"))

	
	local heroId = heroData.heroId

	local heroBetRate = heroData.heroBetRate
	local heroOdds = heroData.heroOdds
	-- body
	self._heroData = heroData

	if heroData.isPlayer == 1 then
		self:_procPlayerIcon(heroData)
	else
		self:_procHeroIcon(heroData)
	end
	
	--self._commonHeadFrame:updateUI(heroData.user.head_frame_id,self._commonIcon:getScale())

	local betPrice = G_UserData:getRunningMan():getRunningCostValue()


	local image = self._imageIcon
	if image then
		local imageParam = TypeConvertHelper.convert(betPrice.type,betPrice.value,betPrice.size)
		image:loadTexture(imageParam.res_mini)
	end

	self._textPrice:setString(0)
	self._textPrice:setColor(Colors.BRIGHT_BG_ONE)
	self._textDesc1:setString(heroData.roadNum)

	self._imagePriceBk:loadTexture(Path.getComplexRankUI("img_com_zhichibg01"))

	--self._textDesc2:setString(heroWinRate..'%') --胜率
	self._textDesc4:setString(heroBetRate..'%') --投注率.

	if math.floor(heroOdds) >= heroOdds then
		self._textDesc3:setString(heroOdds.."") --赔率
	else
		self._textDesc3:setString(heroOdds) --赔率
	end


	local userBet = G_UserData:getRunningMan():getUser_bet()

	if userBet == nil or #userBet == 0 then
		self._commonBuy:setEnabled(true)
	end

	local costValue = G_UserData:getRunningMan():getRunningCostValue()
	if userBet and #userBet == costValue.playerMax then
		self._commonBuy:setEnabled(false)
	end

	local betNum = G_UserData:getRunningMan():getHeroBetNum(heroId)
	if betNum > 0 then
		self._commonBuy:setEnabled(true)
		self._commonBuy:setString(Lang.get("runningman_btn_desc2"))
		self._commonBuy:switchToHightLight() 
		self._textPrice:setString(betNum)
		self._textPrice:setColor(Colors.BRIGHT_BG_GREEN)
		self._imagePriceBk:loadTexture(Path.getComplexRankUI("img_com_zhichibg02"))
	end

	--主要在等待阶段，则投注就不能进行了，按钮变灰
	local runningState = RunningManHelp.getRunningState()
	if runningState >= RunningManConst.RUNNING_STATE_WAIT then 
		self._commonBuy:setEnabled(false)
	end
end

-- Describle：
function PopupRunningManCell:_onCommonBuy()
	-- body

	self:dispatchCustomCallback(self._heroData)
end





return PopupRunningManCell