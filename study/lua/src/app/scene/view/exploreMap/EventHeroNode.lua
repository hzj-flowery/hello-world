local ViewBase = require("app.ui.ViewBase")
local EventHeroNode = class("EventHeroNode", ViewBase)

local ExploreDiscover = require("app.config.explore_discover")
local ExploreHero = require("app.config.explore_hero")
local Hero = require("app.config.hero")
local HeroRes = require("app.config.hero_res")
local Path = require("app.utils.Path")
local Color = require("app.utils.Color")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local HeroDataHelper = require("app.utils.data.HeroDataHelper")
local scheduler = require("cocos.framework.scheduler")
local UIHelper = require("yoka.utils.UIHelper")

function EventHeroNode:ctor(eventData)
    self._eventData = eventData
    self._configData = ExploreDiscover.get(eventData:getEvent_type())   --探索表data
    local heroId = eventData:getValue2()
    self._heroData = Hero.get(heroId)
    self._heroResData = HeroRes.get(self._heroData.res_id)
    self._tableData = ExploreHero.get(eventData:getValue1())    --招募表data
    self._price = {}

    --ui
    -- self._textTalk = nil            --talk
    -- self._imageHero = nil           --英雄立绘
    self._priceInfo = nil           --价格信息
    self._iconHero = nil            --英雄icon
    self._textHeroName = nil        --英雄名字
    self._btnBuy = nil              --购买按钮
    self._yuanPanel1 = nil           --缘分1面板
    self._yuanPanel2 = nil           --缘分2面板
    self._yuanPanels = {}            --缘分板子
    self._textYuanTitle = nil        --
    self._leftTimeLabel = nil --倒计时

    local resource = {
		file = Path.getCSB("EventHeroNode", "exploreMap"),
        binding = {
            _btnBuy = {
				events = {{event = "touch", method = "_onBuyClick"}}
			},
        }
	}
	EventHeroNode.super.ctor(self, resource)
end

function EventHeroNode:onCreate()
    self._yuanPanel1:setVisible(false)
    self._yuanPanel2:setVisible(false)
    self._heroDesScrollView:setVisible(false)
    self._yuanPanels = {self._yuanPanel1, self._yuanPanel2}
    -- self._imageHero:ignoreContentAdaptWithSize(true)

    self._titleStartPosY = self._textYuanTitle:getPositionY()

    self._leftTimeLabel:setString(G_ServerTime:getLeftSecondsString(self._eventData:getEndTime(), "00:00:00"))

end

function EventHeroNode:onEnter()
    self:_setTalk()
    self:_refreshHeroInfo()
    self:_refreshBtn()
    self:_refreshYuan()
    self._countDownScheduler = scheduler.scheduleGlobal(handler(self, self._onTimer), 0.5)
end

function EventHeroNode:onExit()
    scheduler.unscheduleGlobal(self._countDownScheduler)
    self._countDownScheduler = nil
end

function EventHeroNode:_setTalk()
    -- local textTalk = self._configData.description
    -- self._textTalk:setText(textTalk, 300, true)
end

function EventHeroNode:_refreshHeroInfo()
    -- self._imageHero:loadTexture(Path.getChatRoleRes(self._heroResData.story_res))
    self._heroAvatar:updateUI(self._heroData.id)
    self._heroAvatar:setScale(1.35)

    local TypeConvertHelper = require("app.utils.TypeConvertHelper")
	local heroData = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, self._heroData.id)
    self._country:loadTexture(heroData.country_text)
    local heroColor = self._heroData.color
    for i = 1, 2 do
        if self._tableData["hero"..i.."_color"] == heroColor then
            self._price =
            {
                type = self._tableData["hero"..i.."_type"],
                value = self._tableData["hero"..i.."_resource"],
                size = self._tableData["hero"..i.."_size"],
            }
            self._priceInfo:updateUI(self._price.type, self._price.value, self._price.size)
        end
    end

    local ExploreConst  = require("app.const.ExploreConst")
    self._priceInfo:showResName(true, Lang.get("explore_get_hero_cost"))
    self._priceInfo:setResNameFontSize(ExploreConst.COST_NAME_SIZE)
    self._priceInfo:setTextColorToDTypeColor()
    self._priceInfo:setResNameColor(ExploreConst.COST_NAME_COLOR)
    self._iconHero:initUI(TypeConvertHelper.TYPE_HERO, self._heroData.id)
	self._iconHero:setTouchEnabled(true)
    self._textHeroName:setString(self._heroData.name)
    self._textHeroName:setColor(Color.getColor(heroColor))
    self._textHeroName:enableOutline(Color.getColorOutline(heroColor), 2)
end

--刷新按钮
function EventHeroNode:_refreshBtn()
    local param = self._eventData:getParam()
    if param == 0 then
        self._btnBuy:setString(Lang.get("explore_get_hero"))
    else
        self._btnBuy:setEnabled(false)
        self._btnBuy:setString(Lang.get("explore_got_hero"))
    end
end

--判断是否就差该武将 即可激活缘分
function EventHeroNode:_isCanActiveKarma(herosID, curHeroID)
    assert(type(herosID) == "table", "herosID is not table")
    dump(herosID)
    for _, v in pairs(herosID) do
        if v ~= curHeroID then
            if not G_UserData:getKarma():isHaveHero(v) then
                return false
            end
        end
    end
    return true
end

function EventHeroNode:_showHeroDes()
	self._heroDesScrollView:setVisible(true)
	local label = UIHelper.createLabel({text = self._heroData.description or "",fontSize = 18, color = Colors.DARK_BG_ONE})
	label:setAnchorPoint(cc.p(0,0))
	local render = label:getVirtualRenderer()
	render:setWidth(self._heroDesScrollView:getContentSize().width)
	render:setLineSpacing(3)
	self._heroDesScrollView:addChild(label)
	self._heroDesScrollView:setInnerContainerSize(label:getContentSize())
end

--刷新缘分
function EventHeroNode:_refreshYuan()
    local yuanTbl = HeroDataHelper.getActivateKarmaInfoWithHeroBaseId(self._heroData.id)
    local isActiveKarma = #yuanTbl ~= 0
    if isActiveKarma then
        -- self._textYuanTitle:setVisible(true)
        local isCanActivate = false
        for _, v in pairs(yuanTbl) do
            if self:_isCanActiveKarma(v.karmaData.heroIds, self._heroData.id) then
                isCanActivate = true
                break
            end
        end
        -- isCanActivate true 招募该武将可激活缘分 false 招募该武将可用于激活缘分
        if not isCanActivate  then
            self._textYuanTitle:setString(Lang.get("explore_hero_karma"))
		else
			self._textYuanTitle:setString(Lang.get("explore_hero_karma2"))
        end
    else
        local isInBattle =  G_UserData:getTeam():isInBattleWithBaseId(self._heroData.id)
        if isInBattle then
            self._textYuanTitle:setString(Lang.get("explore_hero_break"))
        	self:_showHeroDes()
        else

            self._textYuanTitle:setString(Lang.get("explore_hero_des"))
			self:_showHeroDes()
        end
    end

    for i = 1, 2 do
        if yuanTbl[i] then
            local textName = self._yuanPanels[i]:getSubNodeByName("_textName")
            local textYuanTitle = self._yuanPanels[i]:getSubNodeByName("_textYuanTitle")
            local textYuanContent = self._yuanPanels[i]:getSubNodeByName("_textYuanContent")
            local karmaData = yuanTbl[i].karmaData
            local mainHeroConfig = Hero.get(yuanTbl[i].heroId)

            textName:setString(mainHeroConfig.name)
            textName:setColor(Color.getColor(mainHeroConfig.color))
            textName:enableOutline(Color.getColorOutline(mainHeroConfig.color), 2)
            local nameWidth = textName:getContentSize().width

            textYuanTitle:setPositionX(nameWidth+10)
            textYuanTitle:setString(karmaData.karmaName)
            nameWidth = nameWidth + textYuanTitle:getContentSize().width + 10
            textYuanContent:setPositionX(nameWidth+10)
            textYuanContent:setString(karmaData.attrName.."+"..karmaData.attrValue.."%")
            self._yuanPanels[i]:setVisible(true)
        end
    end
end

--点击购买
function EventHeroNode:_onBuyClick()
    local endTime = self._eventData:getEndTime()
    local curTime =  G_ServerTime:getTime()
    if curTime > endTime then
        G_Prompt:showTip(Lang.get("explore_event_time_over"))
        return
    end

    local success = LogicCheckHelper.enoughValue(self._price.type, self._price.value, self._price.size)
    if success then
        G_UserData:getExplore():c2sExploreDoEvent(self._eventData:getEvent_id())
    end
end

--处理事件
function EventHeroNode:doEvent()
    -- self._eventData:setParam(1)
	G_UserData:getExplore():setEventParamById(self._eventData:getEvent_id(), 1)
    self:_refreshBtn()
end

function EventHeroNode:_onTimer()
    self._leftTimeLabel:setString(G_ServerTime:getLeftSecondsString(self._eventData:getEndTime(), "00:00:00"))
end


return EventHeroNode
