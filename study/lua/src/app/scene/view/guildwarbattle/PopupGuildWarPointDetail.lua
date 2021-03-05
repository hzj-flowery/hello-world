local PopupBase = require("app.ui.PopupBase")
local PopupGuildWarPointDetail = class("PopupGuildWarPointDetail", PopupBase)
local GuildWarAvatarItem = require("app.scene.view.guildwarbattle.GuildWarAvatarItem")
 local GuildWarDataHelper = require("app.utils.data.GuildWarDataHelper")

PopupGuildWarPointDetail.MY_AVATAR_NUM = 3--我方显示avatar数量
PopupGuildWarPointDetail.AVATAR_NUM_PER_PAGE = 8--一页的avatar数量
PopupGuildWarPointDetail.AVATAR_COLUMN = 4
PopupGuildWarPointDetail.AVATAR_POSITION_INFO = {gapW = 132,gapH = 166}


function PopupGuildWarPointDetail:ctor(cityId,pointId)
    self._cityId = cityId
    self._pointId = pointId
    self._sameGuildWarUserList = {}
    self._otherGuildWarUserList = {}
    self._currPageIndex = 0
    self._pageNum = 0

    self._pageView = nil
    self._commonPageViewIndicator = nil
    self._buttomLeftPage = nil
    self._buttomRightPage = nil
    self._textLeftPage = nil
    self._textRightPage = nil

    self._textMyNum = nil
    self._textOtherNum = nil
    self._imageProgressBg = nil
    self._textPercent = nil
    self._textBuildHpTitle = nil
    self._nodeOtherAvatarParent = nil

    self._myAvatarNodeList = {}
    self._otherAvatarNodeList = {}
    self._reportInfo = nil

	local resource = {
		file = Path.getCSB("PopupGuildWarPointDetail", "guildwarbattle"),
		binding = {
            _buttomLeftPage = {
				events = {{event = "touch", method = "_onBtnLeftPage"}}
			},
			_buttomRightPage = {
				events = {{event = "touch", method = "_onBtnRightPage"}}
			},

		}
	}
	PopupGuildWarPointDetail.super.ctor(self, resource)
end

function PopupGuildWarPointDetail:onCreate()
    local config = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(self._cityId,self._pointId )
    local name =  config.name
    self._popBase:setTitle(Lang.get(name))
    self._popBase:addCloseEventListener(handler(self, self._onCloseClick))

    self:_createMyAvatars()
    self:_createOtherAvatars()
end

function PopupGuildWarPointDetail:onEnter()
    self:_refreshView()
    self._signalGuildWarBattleInfoSyn = G_SignalManager:add(SignalConst.EVENT_GUILD_WAR_BATTLE_INFO_SYN, handler(self, self._onEventGuildWarBattleInfoSyn))
    self._signalGuildWarReportNotice = G_SignalManager:add(SignalConst.EVENT_GUILD_WAR_REPORT_NOTICE, handler(self, self._onEventGuildWarReportNotice ))
    
end

function PopupGuildWarPointDetail:_onEventGuildWarBattleInfoSyn(event)
    self:_refreshView()
end

function PopupGuildWarPointDetail:_onEventGuildWarReportNotice(event,message)
    --[[
    local ReportParser = require("app.fight.report.ReportParser")
    local reportData = ReportParser.parse(message.report)
    if not self._reportInfo then
        return 
    end
    local battleData = require("app.utils.BattleDataHelper").parseGuildWar(message, 
        self._reportInfo.attackUser,
        self._reportInfo.beAttackUser
    )
    G_SceneManager:showScene("fight", reportData, battleData)
    ]]
end


function PopupGuildWarPointDetail:onExit()
    if self._signalGuildWarBattleInfoSyn then
        self._signalGuildWarBattleInfoSyn:remove()
        self._signalGuildWarBattleInfoSyn = nil
    end
   
    if self._signalGuildWarReportNotice then
         self._signalGuildWarReportNotice:remove()
         self._signalGuildWarReportNotice = nil
    end
end


function PopupGuildWarPointDetail:_onCloseClick()
    self:closeWithAction()
end


function PopupGuildWarPointDetail:_refreshView()
    self:_refreshOtherAvatars()
    self:_refreshMyAvatars()
    self:_refreshPopulation()
    self:_refreshBuildHp()
end

function PopupGuildWarPointDetail:_onBtnLeftPage(render)
    if self._currPageIndex > 1 then
        self._currPageIndex = self._currPageIndex - 1
        self._commonPageViewIndicator:setCurrentPageIndex(self._currPageIndex-1)
        self:_refreshPageBtn()  
        self:_updatePageView()
    end
end


function PopupGuildWarPointDetail:_onBtnRightPage(render)
    if self._currPageIndex < self._pageNum then
        self._currPageIndex  = self._currPageIndex  + 1
        self._commonPageViewIndicator:setCurrentPageIndex(self._currPageIndex-1)
        self:_refreshPageBtn()
        self:_updatePageView()
    end
end 

function PopupGuildWarPointDetail:_onHeroClick(warUserData)
    local GuildWarCheck = require("app.utils.logic.GuildWarCheck")
    local success = GuildWarCheck.guildWarCanAttackUser(self._cityId,warUserData,true)
    if success then
        local myGuildWarUser = G_UserData:getGuildWar():getMyWarUser(self._cityId)
        self._reportInfo = {attackUser = clone(myGuildWarUser),beAttackUser = clone(warUserData) }
        local userId = warUserData:getUser_id()
        G_UserData:getGuildWar():c2sGuildWarBattleUser(userId)
    end
end

function PopupGuildWarPointDetail:_createOtherAvatars()
    for i = 1,PopupGuildWarPointDetail.AVATAR_NUM_PER_PAGE ,1 do
        local node = GuildWarAvatarItem.new()
        node:setHeroClickCallback(handler(self,self._onHeroClick))
        local col = (i-1)  % PopupGuildWarPointDetail.AVATAR_COLUMN  + 1
        local row = math.ceil(i / PopupGuildWarPointDetail.AVATAR_COLUMN )
        local x =  (col -1) *  PopupGuildWarPointDetail.AVATAR_POSITION_INFO.gapW 
        local y = -(row -1) *  PopupGuildWarPointDetail.AVATAR_POSITION_INFO.gapH 
        node:setPosition(x,y)
        self._nodeOtherAvatarParent:addChild(node)
        table.insert(self._otherAvatarNodeList,node)
     end
end

function PopupGuildWarPointDetail:_refreshOtherAvatars()
    self._otherGuildWarUserList = G_UserData:getGuildWar():getOtherGuildWarUserList( self._cityId,self._pointId)
    local pageNum = math.ceil(#self._otherGuildWarUserList/PopupGuildWarPointDetail.AVATAR_NUM_PER_PAGE )
    pageNum = math.max(pageNum,1)
    if self._currPageIndex == 0 then
         self._currPageIndex = 1
    elseif self._currPageIndex > pageNum then
        self._currPageIndex = 1
    end

	self._commonPageViewIndicator:refreshPageData(nil,pageNum,self._currPageIndex-1,14)
    self._pageNum = pageNum
    self._commonPageViewIndicator:setCurrentPageIndex(self._currPageIndex-1)
    self:_updatePageView()
    self:_refreshPageBtn()
end

function PopupGuildWarPointDetail:_updatePageView()
    local startIndex = (self._currPageIndex -1 )* PopupGuildWarPointDetail.AVATAR_NUM_PER_PAGE  + 1
    for k,v in ipairs(self._otherAvatarNodeList) do
        local data = self._otherGuildWarUserList[startIndex + k -1 ]
      --  logWarn("PopupGuildWarPointDetail -------------  "..(startIndex + k -1))
        if data then
            v:setVisible(true)
            v:updateInfo(data)
        else
            v:setVisible(false)
        end
    end

end

function PopupGuildWarPointDetail:_refreshPageBtn()
    self._buttomLeftPage:setVisible(self._currPageIndex >  1)
    self._buttomRightPage:setVisible(self._currPageIndex <  self._pageNum )

    self._textLeftPage:setVisible(self._currPageIndex >  1)
    self._textRightPage:setVisible(self._currPageIndex <  self._pageNum )

end


function PopupGuildWarPointDetail:_createMyAvatars()
     for i = 1,PopupGuildWarPointDetail.MY_AVATAR_NUM ,1 do
        local node = GuildWarAvatarItem.new()
        local parentNode = self["_myAvatarNode"..i]
        parentNode:addChild(node)
        table.insert(self._myAvatarNodeList,node)
     end
end

function PopupGuildWarPointDetail:_refreshMyAvatars()
    self._sameGuildWarUserList = G_UserData:getGuildWar():getSameGuildWarUserList( self._cityId,self._pointId)
 
    for i = 1,PopupGuildWarPointDetail.MY_AVATAR_NUM ,1 do
        local myAvatarNode = self._myAvatarNodeList[i]
        local data = self._sameGuildWarUserList[i]
        if myAvatarNode then
            if data then
                myAvatarNode:setVisible(true)
                myAvatarNode:updateInfo(data)
                myAvatarNode:turnBack(false)
            else
                myAvatarNode:setVisible(false)
            end
           
        end
    end
    
end

function PopupGuildWarPointDetail:_refreshPopulation()
    local num1,num2 = GuildWarDataHelper.calculatePopulation(self._cityId,self._pointId)
    self._textMyNum:setString(tostring(num1))
    self._textOtherNum:setString(tostring(num2))
end


function PopupGuildWarPointDetail:_refreshBuildHp()
   
    local config = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(self._cityId,self._pointId)

    local showHp = config.build_hp > 0
    self._textBuildHpTitle:setVisible(showHp)
    self._imageProgressBg:setVisible(showHp)

    if not showHp then
        return
    end


	local maxHp = config.build_hp
	local hp = maxHp
	
    local nowWarWatch = G_UserData:getGuildWar():getWarWatchById(self._cityId,self._pointId)
	if nowWarWatch  then
		hp = nowWarWatch:getWatch_value() 
	end
    self._textBuildHpTitle:setString(Lang.get("guildwar_build_hp_title",{ name =config.name}) )
    self._imageProgressBg:setPercent(hp * 100/maxHp)
    self._textPercent:setString(Lang.get("guildwar_building_hp",{
            min = hp,
            max  = maxHp,
    }))
end


return PopupGuildWarPointDetail

