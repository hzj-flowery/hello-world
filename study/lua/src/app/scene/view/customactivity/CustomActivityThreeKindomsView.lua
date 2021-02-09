-- @Author panhoa
-- @Date 11.28.2018
-- @Role 

local ViewBase = require("app.ui.ViewBase")
local CustomActivityThreeKindomsView = class("CustomActivityThreeKindomsView", ViewBase)
local CustomActivityThreeKindomsItem = require("app.scene.view.customactivity.CustomActivityThreeKindomsItem")
local CustomActivityConst = require("app.const.CustomActivityConst")


function CustomActivityThreeKindomsView:ctor()
    self._signUP        = nil -- 立即报名
    self._panelRewards  = nil -- 奖励展示

    local resource = {
        file = Path.getCSB("CustomActivityThreeKindomsView", "customactivity"),
        size = G_ResolutionManager:getDesignSize(),
      	binding = {
			_signUP = {
				events = {{event = "touch", method = "_onSignUP"}}
            },
            _textDetails = {
                events = {{event = "touch", method = "_onDetails"}}
            }
		},
    }
    CustomActivityThreeKindomsView.super.ctor(self, resource)
end

function CustomActivityThreeKindomsView:onCreate()
    self:_getSgsAwardsConfig()
    local state = G_UserData:getCustomActivity():getThreeKindomsData():getStatus()
    if state == 1 then
        self._signUP:setString(Lang.get("activity_linkage_signup"))
    elseif state > 1 and state <= 4 then
        self._signUP:setString(Lang.get("activity_linkage_forward"))
    elseif state == 10177 then 
        self._signUP:setString(Lang.get("activity_linkage_signup"))
    end
end

function CustomActivityThreeKindomsView:onEnter()
    self._threeKindomsSignUP = G_NetworkManager:add(MessageIDConst.ID_S2C_MJZ2SS_CombineTaskSignUp, handler(self, self._onThreeKindomsSignUP))	 -- 立即报名
    self._threeKindomsRewards = G_NetworkManager:add(MessageIDConst.ID_S2C_MJZ2SS_CombineTaskAward, handler(self, self._onThreeKindomsRewards))	 -- 领取奖励
end

function CustomActivityThreeKindomsView:onExit()
    self._threeKindomsSignUP:remove()
    self._threeKindomsRewards:remove()

    self._threeKindomsSignUP  = nil
    self._threeKindomsRewards = nil
end

-- @Role     前往下载
function CustomActivityThreeKindomsView:_goDownLoadThreeKindoms()
    local deviceId = G_NativeAgent:getDeviceId()
    local platform = G_NativeAgent:getNativeType()
    local account = ""
    local platformId = 2 -- PC 
    if platform == "ios" then
        platformId = 1   -- IOS
        account = G_GameAgent:getSdkUserName() ~= nil and G_GameAgent:getSdkUserName() or ""
    elseif platform == "android" then
        platformId = 0   -- Android
    end
    local channel = G_NativeAgent:getOpId()
    local areaId = G_GameAgent:getLoginServer():getServer()
    
    local userName = G_UserData:getBase():getName()
    local url = G_ConfigManager:getDownloadThreeKindomsUrl()
    local linkAddress = ""
    linkAddress = (linkAddress ..url)
    linkAddress = (linkAddress ..("/download?device_id="..string.urlencode(deviceId)))
    linkAddress = (linkAddress .."&client_type=" ..string.urlencode(platformId))
    linkAddress = (linkAddress .."&channel=" ..string.urlencode(channel))
    linkAddress = (linkAddress .."&area_id=" ..string.urlencode(areaId))
    linkAddress = (linkAddress .."&account=" ..string.urlencode(account))
    linkAddress = (linkAddress .."&username=" ..string.urlencode(userName))
    G_NativeAgent:openURL(linkAddress)
end

-------------------------------------------------------------------
function CustomActivityThreeKindomsView:_onDetails()
    local UIPopupHelper = require("app.utils.UIPopupHelper")
	UIPopupHelper.popupHelpInfo(FunctionConst.FUNC_THREEKINDOMS_LINKED)
end

function CustomActivityThreeKindomsView:_onSignUP()
    local state = G_UserData:getCustomActivity():getThreeKindomsData():getStatus()
    if state > 1 and state <= 4 then
        self:_goDownLoadThreeKindoms()
        return
    elseif state == 1 then
        G_UserData:getCustomActivity():c2sCombineTaskSignUp(G_ConfigManager:getAppVersion())
    end
end

--------------------------------------------------------------------
-- @Role    Response（立即报名
function CustomActivityThreeKindomsView:_onThreeKindomsSignUP(id, message)
    if message == nil then return end
    if rawget(message, "status") == nil then  -- 0: 没资格 1: 未报名 2： 已报名 3： 进行中 4: 已结束
        return
    end

    if message.status > 1 and message.status <= 4 then
        self._signUP:setString(Lang.get("activity_linkage_forward"))
        if message.status == 2 then
            G_Prompt:showTip(Lang.get("activity_linkage_success"))
        end
        G_UserData:getCustomActivity():getThreeKindomsData():updateStatus(message.status)
    elseif message.status == 10177 then 
        self._signUP:setString(Lang.get("activity_linkage_signup"))
    end
end

-- @Role    Response（奖励领取
function CustomActivityThreeKindomsView:_onThreeKindomsRewards(id, message)
    if message == nil then return end
    if rawget(message, "task_id") == nil or rawget(message, "task_status") == nil then -- 0:不可领取  1: 可领取 2： 已领取
        return
    end

    local combineTaskQueryTask = G_UserData:getCustomActivity():getThreeKindomsData():getCombineTaskQueryTask()
    for key, value in pairs(combineTaskQueryTask) do
        if value.task_id == message.task_id then
            value.task_status = message.task_status
            break
        end
    end

    G_UserData:getCustomActivity():getThreeKindomsData():updateCombineTaskQueryTask(combineTaskQueryTask)
    -- Show Rewards
    for index, value in ipairs(self._linkedList) do
        if rawget(message, "task_id") == index then
            local award = {
                [1] = {type = value.reward_type, value = value.reward_value, size = value.reward_size}
            }
            G_Prompt:showAwards(award)
        end
    end

    -- 刷新
    self:_refreshAwards()
end

----------------------------------------------------------------------
-- @Role     刷新
function CustomActivityThreeKindomsView:refreshView(customActUnitData)
    self:_refreshAwards()
end

-- @Role    相应领取
function CustomActivityThreeKindomsView:_touchItem(pos)
    G_UserData:getCustomActivity():c2sCombineTaskAward(pos)
end

-- @Role    初始化奖励
function CustomActivityThreeKindomsView:_refreshAwards()
    local function createAwardItem(index, data)
        local item = CustomActivityThreeKindomsItem.new(handler(self, self._touchItem))
        item:setPositionX((index -  1) * CustomActivityConst.THREEKINDOMS_LINKED_AWARDSWIDTH)
        item:setName("award"..index)
        item:updateUI(index, data)
        self._panelRewards:addChild(item, index * 10)
    end
    
    local function searchtaskStatus(index)
        local combineTaskQueryTask = G_UserData:getCustomActivity():getThreeKindomsData():getCombineTaskQueryTask()
        if combineTaskQueryTask == nil then
            return nil
        end
        for key, value in pairs(combineTaskQueryTask) do
            if value.task_id == index then
                return value.task_status
            end
        end
        return nil
    end

    for index, value in ipairs(self._linkedList) do
        local taskStatus = searchtaskStatus(index)
        value.taskStatus = taskStatus ~= nil and taskStatus or 0
        local award = self._panelRewards:getChildByName("award"..index)
        if award == nil then
            createAwardItem(index, value)
        else
            award:updateUI(index, value)
        end
    end    
end

-------------------------------------------------------------
function CustomActivityThreeKindomsView:_getSgsAwardsConfig()
    local sgsLinkedData = require("app.config.sgs_linkage_2")
    self._linkedList = {}
    for index = 1, sgsLinkedData.length()  do
        local cellData = sgsLinkedData.indexOf(index)
        table.insert(self._linkedList, cellData)
    end
end



return CustomActivityThreeKindomsView