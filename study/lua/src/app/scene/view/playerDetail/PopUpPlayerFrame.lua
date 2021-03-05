local PopupBase = require("app.ui.PopupBase")
local PopUpPlayerFrame = class("PopUpPlayerFrame", PopupBase)
local PopUpPlayerFrameItemCell = require("app.scene.view.playerDetail.PopUpPlayerFrameItemCell")
local PopUpPlayerFrameHelper = require("app.scene.view.playerDetail.PopUpPlayerFrameHelper")
local SchedulerHelper = require("app.utils.SchedulerHelper")

function PopUpPlayerFrame:ctor()
    self._title = Lang.get("honor_title_title")
    self._currentChooseFrameInfo = nil
    self._scheduler = nil

    local resource = {
        file = Path.getCSB("PopUpPlayerFrame", "playerDetail"),
        binding = {
        _btnEquip = {
                events = {{event = "touch", method = "onBtnEquipFrame"}}
            },
            _btnClose = {
                events = {{event = "touch", method = "onBtnClose"}}
            }
        }
    }
    PopUpPlayerFrame.super.ctor(self, resource, true)
end

function PopUpPlayerFrame:onCreate()
    self._descMyFrame:setString(Lang.get("my_frame"))
    self._descDetail:setString(Lang.get("frame_detail"))
    --由于尺寸特殊，不使用公共pop组件，自己单间
    -- self._commonNodeBg:addCloseEventListener(handler(self, self.onBtnClose))
    self._titleName:setString(Lang.get("change_role_frame"))
    -- self._commonNodeBg:setTitle()
    self._btnEquip:setString(Lang.get("role_frame_equip"))

    self._listItemSource:setTemplate(PopUpPlayerFrameItemCell)
    self._listItemSource:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
    self._listItemSource:setCustomCallback(handler(self, self._onItemTouch))

    local currentFrame = G_UserData:getHeadFrame():getCurrentFrame()
    self:updateDescView(currentFrame)
    if currentFrame ~= nil then
        PopUpPlayerFrameHelper.setCurrentTouchIndex(currentFrame:getId())
    else
        PopUpPlayerFrameHelper.setCurrentTouchIndex(0)
    end

    PopUpPlayerFrameItemCell:setItemTouchCallBack(handler(self,self.updateMainView))

    self._scheduler = SchedulerHelper.newSchedule(handler(self,self._updateFrameLeftTimeCountdown), 1)
end


function PopUpPlayerFrame:updateMainView( currentId )
    self:updateDescView(G_UserData:getHeadFrame():getFrameDataWithId(currentId))

    self._listItemSource:clearAll()
    self._listItemSource:resize(#self._listData)
end

function PopUpPlayerFrame:_updateFrameLeftTimeCountdown()
    if self._currentChooseFrameInfo ~= nil then
        local timeStr = ""
        if self._currentChooseFrameInfo:getTime_type() == 1 and self._currentChooseFrameInfo:getExpire_time() > 0 then
            if self._currentChooseFrameInfo:getExpire_time() > 0 then
                timeStr = PopUpPlayerFrameHelper.getExpireTimeString(self._currentChooseFrameInfo:getExpire_time(), self._currentChooseFrameInfo:getTime_value())
            end

            self._frameTime:setString(timeStr)
        end
    end
end

function PopUpPlayerFrame:updateDescView( frameInfo )
    self._currentChooseFrameInfo = frameInfo
    self._frameName:setVisible(frameInfo ~= nil)
    --self._descFrameNode:setVisible(frameInfo ~= nil)
    self._descHeroNode:setVisible(frameInfo ~= nil)

    if frameInfo ~= nil then
        local headName = frameInfo:getName()
        self._frameName:setString(headName)

        local timeStr = ""
        if frameInfo:getTime_type() == 2 then
            timeStr = Lang.get("frame_forever")
            self._frameTime:setColor(Colors.SYSTEM_TARGET)
        elseif frameInfo:getTime_type() == 1 then
            if frameInfo:getExpire_time() > 0 and frameInfo:getExpire_time() > G_ServerTime:getTime() then
                timeStr = PopUpPlayerFrameHelper.getExpireTimeString(frameInfo:getExpire_time(), frameInfo:getTime_value())
            else
                timeStr = string.format(Lang.get("frame_time"), frameInfo:getTime_value())
            end
            self._frameTime:setColor(Colors.SYSTEM_TARGET_RED)
        end
        self._frameTime:setString(timeStr)

        if frameInfo:isHave() then
            self._btnEquip:setVisible(true)
            self._descStr:setVisible(false)
            self._descStr2:setVisible(true)
            self._descStr2:setString(frameInfo:getDes())
        else
            self._btnEquip:setVisible(false)
            self._descStr:setVisible(true)
            self._descStr:setString(frameInfo:getDes())
            self._descStr2:setVisible(false)
        end

        self._descHeroNode:updateIcon(G_UserData:getBase():getPlayerShowInfo(), nil, frameInfo:getId())
        --local scale = self._descHeroNode:getScale()
        --self._descFrameNode:updateIcon(frameInfo,scale)
        --self._descHeroNode:updateHeadFrame(frameInfo)
    end
end


function PopUpPlayerFrame:onEnter()
    self:initFrameListData()

    	-- 监听user数据更新
	self._signalUserDataUpdate =
        G_SignalManager:add(SignalConst.EVENT_RECV_ROLE_INFO, handler(self, self._onUserDataUpdate))

    self._signalGetHeadFrameInfo =
        G_SignalManager:add(SignalConst.EVENT_HEAD_FRAME_INFO, handler(self, self._onGetHeadFrameInfo))
end

-- user数据更新
function PopUpPlayerFrame:_onUserDataUpdate(_, param)
end

function PopUpPlayerFrame:_onGetHeadFrameInfo()
    local currentFrame = G_UserData:getHeadFrame():getCurrentFrame()
    self:updateDescView(currentFrame)

    PopUpPlayerFrameHelper.setCurrentTouchIndex(currentFrame:getId())

    self:initFrameListData()
end

function PopUpPlayerFrame:initFrameListData( ... )
    self._listData = {}
    local frameListData = G_UserData:getHeadFrame():getFrameListData()

    for i=1,math.ceil(#frameListData/3) do
        local temp = {}
        for j=1,3 do
            local index = (i -1)*3+j
            if frameListData[index] ~= nil then
                table.insert(temp,frameListData[index])
            end
        end
        table.insert(self._listData,temp)
    end

    -- dump(self._listData,temp)
    self._listItemSource:clearAll()
    self._listItemSource:resize(#self._listData)
end


function PopUpPlayerFrame:_onItemUpdate( item,index )
    if self._listData[index + 1] then
        item:updateUI(self._listData[index + 1] )
    end
end

function PopUpPlayerFrame:_onItemSelected( item,index )
    -- body
end

function PopUpPlayerFrame:_onItemTouch( lineIndex,index )

end


function PopUpPlayerFrame:onBtnEquipFrame( sender,state )
    local currentId = PopUpPlayerFrameHelper:getCurrentTouchIndex()
    -- if currentId == 0 then
    --     G_Prompt:showTipOnTop("暂无头像框可以装备(╯︵╰)")
    -- else
        G_UserData:getHeadFrame():c2sChangeHeadFrame(currentId)
    -- end
end


function PopUpPlayerFrame:onBtnClose( ... )
    G_UserData:getHeadFrame():clearRedPointList() -- 清空小红点
    G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_HEAD_FRAME)
    self:close()
end


function PopUpPlayerFrame:onExit()
    if self._scheduler then
        SchedulerHelper.cancelSchedule(self._scheduler)
        self._scheduler = nil
    end

    self._signalUserDataUpdate:remove()
    self._signalUserDataUpdate = nil
    
    self._signalGetHeadFrameInfo:remove()
	self._signalGetHeadFrameInfo = nil
end

return PopUpPlayerFrame
