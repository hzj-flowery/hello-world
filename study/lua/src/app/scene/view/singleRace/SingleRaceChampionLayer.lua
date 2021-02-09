--
-- Author: Liangxu
-- Date: 2018-11-26
-- 跨服个人竞技冠军界面

local ViewBase = require("app.ui.ViewBase")
local SingleRaceChampionLayer = class("SingleRaceChampionLayer", ViewBase)
local UIHelper = require("yoka.utils.UIHelper")
local CSHelper = require("yoka.utils.CSHelper")
local SingleRaceConst = require("app.const.SingleRaceConst")

function SingleRaceChampionLayer:ctor()
	local resource = {
		file = Path.getCSB("SingleRaceChampionLayer", "singleRace"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_buttonGoMap = {
                events = {{event = "touch", method = "_onClickGo"}}
            },
		},
	}
	SingleRaceChampionLayer.super.ctor(self, resource)
end

function SingleRaceChampionLayer:onCreate()
	self._userData = nil
    self._userDetailData = nil
end

function SingleRaceChampionLayer:onEnter()
	self._signalGetSingleRacePositionInfo = G_SignalManager:add(SignalConst.EVENT_SINGLE_RACE_GET_POSITION_INFO, handler(self, self._onEventGetSingleRacePositionInfo))
end

function SingleRaceChampionLayer:onExit()
	self._signalGetSingleRacePositionInfo:remove()
    self._signalGetSingleRacePositionInfo = nil
end

function SingleRaceChampionLayer:onShow()
    
end

function SingleRaceChampionLayer:onHide()
    
end

function SingleRaceChampionLayer:updateInfo()
    local matchData = G_UserData:getSingleRace():getMatchDataWithPosition(63)
    if matchData then
        local userId = matchData:getUser_id()
        local championUser = G_UserData:getSingleRace():getUserDataWithId(userId)
        local championDetail = G_UserData:getSingleRace():getUserDetailInfoWithId(userId)
        if championUser and championDetail then
            self._userData = championUser
            self._userDetailData = championDetail
            self:_updateView()
            return
        end
    end
    G_UserData:getSingleRace():c2sGetSingleRacePositionInfo(63) --63，冠军位置
end

function SingleRaceChampionLayer:_updateView()
    local heroList = self._userData:getHeroList()

    local function effectFunction(effect)
        local stc, edc = string.find(effect, "icon_tianxiawus_no")
        if stc then
            local index = string.sub(effect, edc+1, -1)
            local icon = CSHelper.loadResourceNode(Path.getCSB("CommonHeroIcon", "common"))
            local heroData = heroList[tonumber(index)]
            if heroData then
                local coverId = heroData:getCoverId()
                local limitLevel = heroData:getLimitLevel()
                local limitRedLevel = heroData:getLimitRedLevel()
                icon:updateUI(coverId, nil, limitLevel, limitRedLevel)
            end
            return icon
        elseif effect == "moving_tianxiawus_name" then
            local moving = self:_createNameMoving()
            return moving
        elseif effect == "routine_word_tianxiawus_zhanli" then
            local power = CSHelper.loadResourceNode(Path.getCSB("CommonHeroPower", "common"))
            power:updateUI(self._userData:getPower())
            return power
        elseif effect == "smoving_fdj" then
            local btn = ccui.Button:create()
            btn:loadTextureNormal(Path.getCampImg("img_camp_player03c"))
            btn:addClickEventListenerEx(handler(self, self._onButtonLookClicked))
            G_EffectGfxMgr:applySingleGfx(btn, "smoving_fdj", nil, nil, nil)
            return btn
        elseif effect == "routine_word_zhengrong_zi" then
            local params = {
                fontSize = 26,
                fontName = Path.getFontW8(),
                color = cc.c3b(0xff, 0xc6, 0x00),
                outlineColor = cc.c4b(0x86, 0x39, 0x01, 0xff),
                text = Lang.get("single_race_champion_text"),
            }
            local label = UIHelper.createLabel(params)
            return label
        elseif effect == "tianxiawus_spine" then
            local spine = CSHelper.loadResourceNode(Path.getCSB("CommonStoryAvatar", "common"))
            local  covertId, limitLevel, limitRedLevel = self._userData:getCovertIdAndLimitLevel()
            spine:updateUI(covertId, limitLevel, limitRedLevel)
            return spine
        end
            
        return cc.Node:create()
    end

    local function eventFunction(event)
        if event == "finish" then
            
        end
    end

    G_EffectGfxMgr:createPlayMovingGfx(self._nodeMoving, "moving_tianxiawus_dam", effectFunction, eventFunction , false)
end

function SingleRaceChampionLayer:_createNameMoving()
	local function effectFunction(effect)
        if effect == "routine_word_name_who" then
        	local params = {
				fontSize = 24,
				fontName = Path.getCommonFont(),
				color = Colors.COLOR_QUALITY[6],
				text = self._userData:getUser_name(),
        	}
            local label = UIHelper.createLabel(params)
            return label
        elseif effect == "routine_word_name_fuwuqi" then
        	local params = {
        		fontSize = 22,
				color = cc.c3b(0xff, 0xff, 0xff),
				outlineColor = cc.c4b(0x00, 0x00, 0x00, 0xff),
				text = self._userData:getServer_name(),
        	}
        	local label = UIHelper.createLabel(params)
            return label
        end
    		
        return cc.Node:create()
    end

    local function eventFunction(event)
        if event == "finish" then
        
        end
    end

    local node = cc.Node:create()
	local effect = G_EffectGfxMgr:createPlayMovingGfx(node, "moving_tianxiawus_name", effectFunction, eventFunction , false)
    return node
end

function SingleRaceChampionLayer:_onButtonLookClicked()
    if self._userDetailData == nil then
        return
    end
    local popup = require("app.ui.PopupUserDetailInfo").new(self._userDetailData, self._userData:getPower())
    popup:setName("PopupUserDetailInfo")
    popup:openWithAction()
end

function SingleRaceChampionLayer:_onClickGo()
    G_SignalManager:dispatch(SignalConst.EVENT_SINGLE_RACE_SWITCH_LAYER, SingleRaceConst.LAYER_STATE_MAP)
end

function SingleRaceChampionLayer:_onEventGetSingleRacePositionInfo(eventName, userData, userDetailData)
    self._userData = userData
    self._userDetailData = userDetailData
    self:_updateView()
end

return SingleRaceChampionLayer