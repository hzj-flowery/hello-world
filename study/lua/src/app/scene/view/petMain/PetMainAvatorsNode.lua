
local CircleScroll = require("app.ui.CircleScroll")
local PetMainAvatorsNode = class("PetMainAvatorsNode", CircleScroll)
local FunctionConst = require("app.const.FunctionConst")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local RedPointHelper = require("app.data.RedPointHelper")
local DataConst = require("app.const.DataConst")
local AvatarDataHelper = require("app.utils.data.AvatarDataHelper")
local PetConst = require("app.const.PetConst")
function PetMainAvatorsNode:ctor(size, angles, startIndex, parentView, angleOffset, circle, scaleRange)
    PetMainAvatorsNode.super.ctor(self, size, angles, startIndex,angleOffset,circle,scaleRange)
    self._resourceNode = nil
    self._startIndex = startIndex
	self._parentView = parentView

    self:setName("PetMainAvatorsNode")
    self:onCreate()
	--PetMainAvatorsNode.super.ctor(self, resource)
end

--预创建移动小岛
function PetMainAvatorsNode:_preCreateAvatar( ... )
    -- body
    local CSHelper  = require("yoka.utils.CSHelper")
    local PetConst = require("app.const.PetConst")
    local showNum = G_UserData:getPet():getShowPetNum()

    local function createAvatar(index)
        -- body
        local petAvatar = CSHelper.loadResourceNode(Path.getCSB("CommonPetMainAvatar", "common"))    
        petAvatar:updateImageBk(Path.getPet("pet_taizi"..index))
       
        petAvatar:setName("_avatar"..index)
        self["_avatar"..index] = petAvatar
        return petAvatar
    end


    if showNum <= PetConst.SCROLL_AVATART_NUM then
        for i= 1, showNum do
            local petInfo = PetConst["PET_INFO"..showNum]
            local position = petInfo[i].position
            local scale = petInfo[i].scale
            local zorder = petInfo[i].zorder
            local imageScale = petInfo[i].imageScale

            local petAvatar = createAvatar(i)
            petAvatar:setPosition(position)
            petAvatar:setAvatarScale(scale)
            petAvatar:setImageScale(imageScale)
            petAvatar:setLocalZOrder(zorder)
            self:addMidLayer(petAvatar)
        end
    else
        for i= 1, showNum do
            local petAvatar = createAvatar(i)
            petAvatar:setAvatarScale(PetConst.SCROLL_AVATAR_SCALE)
            self:addNode(petAvatar, i)
        end
    end
end

function PetMainAvatorsNode:onCreate()
    local CSHelper  = require("yoka.utils.CSHelper")

    local PetConst = require("app.const.PetConst")

    self:_preCreateAvatar()

    --[[
    local petAvatar7 = CSHelper.loadResourceNode(Path.getCSB("CommonPetMainAvatar", "common"))
    petAvatar7:setName("_avatar7")
    self["_avatar7"] = petAvatar7

    petAvatar7:setScale(1.0)
    petAvatar7:updateScale(1.0)
    petAvatar7:setShadowScale(2.7) --神兽影子放大
    petAvatar7:setAvatarScale(PetConst.MID_AVATAR_SCALE)
    
    petAvatar7:updateImageBk(Path.getPet("pet_taizi7"))
    petAvatar7:setPosition(PetConst.MIDDLE_POSITION)
    self:addMidLayer(petAvatar7)
    --
	for i = 1, 6 do
        local petAvatar = CSHelper.loadResourceNode(Path.getCSB("CommonPetMainAvatar", "common"))
        self:addNode(petAvatar, i)

        petAvatar:setName("_avatar"..i)
        petAvatar:updateImageBk(Path.getPet("pet_taizi"..i))
        petAvatar:setAvatarScale(PetConst.SCROLL_AVATAR_SCALE)
        
        self["_avatar"..i] = petAvatar
	end
    ]]
     self:_playNodeEffect()

end

function PetMainAvatorsNode:updateAll()
    logWarn("PetMainAvatorsNode:updateAll")
    self:_updatePetAvatar()
end

function PetMainAvatorsNode:onEnter()
    self._signalPetLevelUpdate     = G_SignalManager:add(SignalConst.EVENT_PET_LEVEL_UP_SUCCESS, handler(self, self._onEventPetLevelUpdate))
	self._signalChangePetFormation = G_SignalManager:add(SignalConst.EVENT_PET_ON_TEAM_SUCCESS, handler(self, self._onEventUserPetChange))
    self._signalRedPointUpdate      = G_SignalManager:add(SignalConst.EVENT_RED_POINT_UPDATE, handler(self,self._onEventRedPointUpdate))


    self:updateAll()

    G_UserData:getAttr():recordPower()
	--抛出新手事件出新手事件
    G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, self.__cname)
end

function PetMainAvatorsNode:onExit()

    self._signalPetLevelUpdate:remove()
    self._signalPetLevelUpdate =nil

    self._signalChangePetFormation:remove()
    self._signalChangePetFormation =nil
  
    self._signalRedPointUpdate:remove()
    self._signalRedPointUpdate = nil

end

function PetMainAvatorsNode:_onClickPetAvatar(mainAvatar)

end


function PetMainAvatorsNode:getAvatarIndex(funcId)
    local funcIdList = self:_getFuncList()
    for i, value in ipairs(funcIdList) do
        if value == funcId then
            return i
        end
    end

    return 1
    -- body
end

function PetMainAvatorsNode:_getFuncList()
    local funcIdList = {}
     local showNum = G_UserData:getPet():getShowPetNum()
    if showNum <= 5 then
        funcIdList = {
            [1] = FunctionConst.FUNC_PET_HELP_SLOT1,
            [2] = FunctionConst.FUNC_PET_HELP_SLOT2,
            [3] = FunctionConst.FUNC_PET_HELP_SLOT3,
            [4] = FunctionConst.FUNC_PET_HELP_SLOT4,
            [5] = FunctionConst.FUNC_PET_HELP_SLOT5,
        }
    else
        funcIdList = {
            [1] = FunctionConst.FUNC_PET_HELP_SLOT1,
            [2] = FunctionConst.FUNC_PET_HELP_SLOT2,
            [3] = FunctionConst.FUNC_PET_HELP_SLOT3,
            [4] = FunctionConst.FUNC_PET_HELP_SLOT4,
            [5] = FunctionConst.FUNC_PET_HELP_SLOT5,
            [6] = FunctionConst.FUNC_PET_HELP_SLOT6,
            [7] = FunctionConst.FUNC_PET_HELP_SLOT7,
        }
    end
    return funcIdList
end

function PetMainAvatorsNode:getFuncIdByIndex(index)

    local funcIdList = self:_getFuncList()
    return funcIdList[index]
    -- body
end
function PetMainAvatorsNode:_playNodeEffect( ... )
    -- body
    for i =4 , 6 do
        local avatarNode = self["_avatar"..i]
        if avatarNode then
            avatarNode:playEffect("effect_shenshou_taizi"..i)
        end
    end
end
--更新上阵武将列表
function PetMainAvatorsNode:_updatePetAvatar()
    local petIdList = G_UserData:getTeam():getPetIdsInHelpWithZero()
    local startFuncId = FunctionConst.FUNC_PET_HELP_SLOT1

    local LogicCheckHelper = require("app.utils.LogicCheckHelper")

    for index= 1, 7 do
        local avatarNode = self["_avatar"..index]
        if avatarNode then
            local funcTeamSoltId= self:getFuncIdByIndex(index)
            avatarNode:setFuncId(funcTeamSoltId)
        end
    end
  
    --只解锁一个
    local function onlyUnlockOne()
        local unLockOne = 0
        local lockLevel = 0
        local retCanMove = true
        for index= FunctionConst.FUNC_PET_HELP_SLOT1, FunctionConst.FUNC_PET_HELP_SLOT7 do
            local avatarIndex = self:getAvatarIndex(index)
            local avatarNode = self["_avatar"..avatarIndex]
            if avatarNode then
                local funcTeamSoltId = self:getFuncIdByIndex(avatarIndex)
                local petId = petIdList[funcTeamSoltId - FunctionConst.FUNC_PET_HELP_SLOT1 + 1]
                local isOpen = LogicCheckHelper.funcIsOpened( funcTeamSoltId )
                local isShow = LogicCheckHelper.funcIsShow( funcTeamSoltId )
                avatarNode:setVisible(isShow)
                if isShow == false then
                    retCanMove = false
                end
                avatarNode:setLock(not isOpen)
                avatarNode:setAdd(isOpen)
              
                if isOpen == false and lockLevel == 0 and petId == 0 then
                    logWarn("avatarNode:showOpenLevel(true)")
                    avatarNode:showOpenLevel(true)
                    lockLevel = lockLevel + 1
                end
                
            end
        end
        return retCanMove
    end
    self:setMoveEnable(false)
    local moveEnable = onlyUnlockOne()
    self:setMoveEnable(moveEnable)
    
    for i, value in ipairs(petIdList) do
        local petUnit = G_UserData:getPet():getUnitDataWithId(value)
        local avatarIndex = self:getAvatarIndex(i + FunctionConst.FUNC_PET_HELP_SLOT1 -1)
        local funcTeamSoltId = self:getFuncIdByIndex(avatarIndex)
        local avatarNode = self["_avatar"..avatarIndex]
        if petUnit and avatarNode then
            avatarNode:updateUI(petUnit:getBase_id(), handler(self,self._onClickPetAvatar))
            avatarNode:updatePetName(petUnit:getBase_id(), petUnit:getStar(),petUnit:getLevel())
            avatarNode:setPetIndex(funcTeamSoltId - FunctionConst.FUNC_PET_HELP_SLOT1 + 1)
        end
    end
    self:_updatePetAvatarRedPoint()
end


function PetMainAvatorsNode:_updateRedPointByFuncId(funcId, param)
    if funcId and funcId > 0 then
        if self:_isInPetAvatarFuncList(funcId) then
            self:_updatePetAvatarRedPoint(funcId, param)
        end
    end
end


-- user数据更新
function PetMainAvatorsNode:_onEventUserDataUpdate(_, param)
    self:_updatePetAvatar()--改名
end

-- 角色升级，刷新按钮状态
function PetMainAvatorsNode:_onEventPetLevelUpdate(_, param)
end

-- 角色升级，刷新按钮状态
function PetMainAvatorsNode:_onEventUserPetChange(_, param)
    G_UserData:getAttr():recordPower()
    self:_updatePetAvatar()

    G_Prompt:playTotalPowerSummary()
end

function PetMainAvatorsNode:_onEventOfficialLevelUp(_, param)
    self:_updatePetAvatar()
end

--小红点刷新
function PetMainAvatorsNode:_onEventRedPointUpdate(id, funcId, param)
   self:_updateRedPointByFuncId(funcId, param)
end

--是否在Avatar红点检测列表中
function PetMainAvatorsNode:_isInPetAvatarFuncList(funcId)
    local list = {
    }
    for i, id in ipairs(list) do
        if id == funcId then
            return true
        end
    end
    return false
end


function PetMainAvatorsNode:_updatePetAvatarRedPoint(funcId, param)
   local function checkPetUpgrade(petId)
        local petUnitData = G_UserData:getPet():getUnitDataWithId(petId)
        if petUnitData == nil then
            return false
        end
        local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_PET_TRAIN_TYPE1, petUnitData)
        return reach
    end

    local function checkPetBreak(petId)
        local petUnitData = G_UserData:getPet():getUnitDataWithId(petId)
        if petUnitData == nil then
            return false
        end
        local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_PET_TRAIN_TYPE2, petUnitData)
        return reach
    end

    local function checkPetLimit(petId)
		local petUnitData = G_UserData:getPet():getUnitDataWithId(petId)
		local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_PET_TRAIN_TYPE3, petUnitData)
		return reach
	end

     local checkFuncs = {
        [FunctionConst.FUNC_PET_TRAIN_TYPE1] = checkPetUpgrade,
        [FunctionConst.FUNC_PET_TRAIN_TYPE2] = checkPetBreak,
        [FunctionConst.FUNC_PET_TRAIN_TYPE3] = checkPetLimit,
     }

     --红点相关的
    local redPointFuncId = {
        FunctionConst.FUNC_PET_TRAIN_TYPE1,
        FunctionConst.FUNC_PET_TRAIN_TYPE2,
        FunctionConst.FUNC_PET_TRAIN_TYPE3,
    }

    local petIdList = G_UserData:getTeam():getPetIdsInHelpWithZero()
    --护佑
    for index= FunctionConst.FUNC_PET_HELP_SLOT1, FunctionConst.FUNC_PET_HELP_SLOT7 do
        local avatarIndex = self:getAvatarIndex(index)
        local avatarNode = self["_avatar"..avatarIndex]
        if avatarNode then
            local funcTeamSoltId = self:getFuncIdByIndex(avatarIndex)
            local petId = petIdList[funcTeamSoltId - FunctionConst.FUNC_PET_HELP_SLOT1 + 1]
            if petId > 0 then
                local reachRedPoint = false
                for j, funcId in ipairs(redPointFuncId) do
                    local func = checkFuncs[funcId]
                    local reach = func(petId)
                    if reach then
                        reachRedPoint = true
                        break
                    end
                end
                avatarNode:showRedPoint(reachRedPoint)
            end
        end
    end

end


return PetMainAvatorsNode
