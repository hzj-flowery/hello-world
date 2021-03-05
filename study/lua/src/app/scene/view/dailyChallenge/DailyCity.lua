local ViewBase = require("app.ui.ViewBase")
local DailyCity = class("ChallengeView", ViewBase)

local PopupDailyChoose = require("app.scene.view.dailyChallenge.PopupDailyChoose")
local DailyDungeon = require("app.config.daily_dungeon")

function DailyCity:ctor(info)
    self._info = info
    self._btnCity = nil     --城市按钮
    -- self._textOpenDate = nil   --开启时间
   
    self._imageName = nil  --名字图片
    self._openDays = {}     --开放时间
    self._open = false      --今天是否开放
    self._tipString = ""    --关闭时候点击提示
    self._commonRedPointNum = nil--红点组件
    self._firstLevel = 0    --初次开放等级
    self._imageCloseBG = nil    --关闭背景
    self._textCloseTip = nil    --关闭提示
    self._bLevelEnough = false --是否够等级开放
	local resource = {
		file = Path.getCSB("DailyCity", "dailyChallenge"),
		size = {1136, 640},
		binding = {
            _btnCity = {
				events = {{event = "touch", method = "_onCityClick"}}
			},
		}
	}
    self:setName("DailyCity"..info.id)
	DailyCity.super.ctor(self, resource)
end

function DailyCity:onCreate()
    --self._textName:setString(self._info.name)
    local cityNameX = self._info.x_position
	local cityNameY = self._info.y_position
    self._imageName:loadTexture(Path.getChallengeText(self._info.pic))
    self._imageName:ignoreContentAdaptWithSize(true)

    local imageNameSize = self._imageName:getContentSize()
	local imageNameBgSize = self._imageNameBG:getContentSize()
	imageNameBgSize.height = imageNameSize.height + 40

    self._imageNameBG:setContentSize(imageNameBgSize)
	self._imageNameBG:setPosition(cityNameX,cityNameY)

    self._imageName:setPositionY(imageNameBgSize.height*0.5)
    self._commonRedPointNum:setPositionY(imageNameBgSize.height-6)

	self._openDays = {}
	for i = 1,string.len(self._info.week_open_queue) do
		self._openDays[i] = string.byte(self._info.week_open_queue,i) == 49
	end

    
end

function DailyCity:refreshData()
    local todayLevel = G_UserData:getBase():getToday_init_level()--登陆时等级
    local nowLevel = G_UserData:getBase():getLevel()--当前等级
    if not self:_isLevelEnough() then
        self._open = false
    else
        if self:_isOpenToday() then
            self._open = true
        elseif todayLevel < self._firstLevel and nowLevel >= self._firstLevel then
            --上线等级小于进入等级，升级后大于进入等级
            self._open = true
        else
            local days = self:_getOpenDays()
            local strDays = ""
            local strDays2 = ""
            for i = 1, #days-1 do
                strDays = strDays..Lang.get("open_days")[days[i]]..", "
                strDays2 = strDays..Lang.get("open_days")[days[i]]
            end
            strDays = strDays..Lang.get("open_days")[days[#days]]
            self._tipString = Lang.get("open_string", {str = strDays})
            self._open = false
        end
    end
    --self._imageCloseBG:setVisible(not self._open)
    self._textCloseTip:setString(self._tipString)
    --self._textCloseTip:setVisible(not self._open)

    self:_refreshState()

end

function DailyCity:_refreshState()
    -- self._imageRes:loadTexture(Path.getDailyChallengeIcon("build"..self._info.build))
    -- self._imageRes:ignoreContentAdaptWithSize(true)
       self._imageName:loadTexture(Path.getChallengeText(
		        self._open and self._info.pic or self._info.pic.."b" 
	   ))

    if self._open then

     
    elseif not self._open and not self._bLevelEnough then
       
    else
    
    end

end

--今天是否开放
function DailyCity:_isOpenToday()
    local TimeConst = require("app.const.TimeConst")
	local data = G_ServerTime:getDateObject(nil,TimeConst.RESET_TIME_SECOND)
	return self._openDays[data.wday]
end

-- 所有开放日期
function DailyCity:_getOpenDays( )
	local openDays = {}
	for i,open in ipairs(self._openDays) do
		if open then
			table.insert(openDays,i)
		end
	end
    local sortfunction = function(obj1,obj2)
        if obj1 == 1 or obj2 == 1 then
            return obj1 ~= 1
        end
        return obj1 < obj2
    end
    table.sort( openDays, sortfunction )
	return openDays
end

--等级是否到达
function DailyCity:_isLevelEnough()
    local myLevel = G_UserData:getBase():getLevel()
    local firstLevel = self:_getFirstLevel()
    self._tipString = Lang.get("daily_open_tips", {count = firstLevel, name = self._info.name})
    self._bLevelEnough = (myLevel >= firstLevel)
    return myLevel >= firstLevel
end

--获得第一个难度的等级
function DailyCity:_getFirstLevel()
    local DailyDungeonCount = DailyDungeon.length()
	for i = 1, DailyDungeonCount do
		local info = DailyDungeon.indexOf(i)
		if info.type == self._info.id and info.pre_id == 0 then
            self._firstLevel = info.level
            return self._firstLevel
		end
	end
end

--点击
function DailyCity:_onCityClick()
    if self._open then
        local popupDailyChoose = PopupDailyChoose.new(self._info)
        popupDailyChoose:openWithAction()
    else
        G_Prompt:showTip(self._tipString)
    end
end

function DailyCity:onEnter()
    self._signalRedPointUpdate = G_SignalManager:add(SignalConst.EVENT_RED_POINT_UPDATE, handler(self,self._onEventRedPointUpdate))
    self._signalDailyDungeonEnter = G_SignalManager:add(SignalConst.EVENT_DAILY_DUNGEON_ENTER, handler(self,self._onEventDailyDungeonEnter))
    
    self:refreshData()

    self:_refreshRedPoint()
end

function DailyCity:onExit()
    self._signalRedPointUpdate:remove()
    self._signalRedPointUpdate = nil

    self._signalDailyDungeonEnter:remove()
    self._signalDailyDungeonEnter  = nil
end


function DailyCity:_onEventRedPointUpdate(event,funcId,param)
	if funcId ==  FunctionConst.FUNC_DAILY_STAGE then	
		self:_refreshRedPoint()
    end
end

function DailyCity:_onEventDailyDungeonEnter(event)
    self:refreshData()

end

function DailyCity:_refreshRedPoint()
    local showRedPoint = G_UserData:getDailyDungeonData():dungeonIsHasRemainCountRedPoint(self._info.id)
    self._commonRedPointNum:setVisible(showRedPoint)
    self._commonRedPointNum:showNum(G_UserData:getDailyDungeonData():getRemainCount(self._info.id) )
end

return DailyCity