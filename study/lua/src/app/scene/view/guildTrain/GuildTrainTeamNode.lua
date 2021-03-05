local GuildTrainTeamNode = class("GuildTrainTeamNode")
local UserDataHelper = require("app.utils.UserDataHelper")
local scheduler = require("cocos.framework.scheduler")
function GuildTrainTeamNode:ctor(target,data)
    self._target = target
    
    self._flashObj1 = nil
    self._flashObj2 = nil
    self:_init()
end

function GuildTrainTeamNode:_init()

    self._heroNode1 = ccui.Helper:seekNodeByName(self._target, "HeroNode1")
    self._heroNode2 = ccui.Helper:seekNodeByName(self._target, "HeroNode2")
    cc.bind(self._heroNode1, "CommonHeroAvatar")
    cc.bind(self._heroNode2, "CommonHeroAvatar")

    self._constNodePosX1 = self._heroNode1:getPositionX()

    self._heroName1 = ccui.Helper:seekNodeByName(self._target, "HeroName1")
    self._heroName2 = ccui.Helper:seekNodeByName(self._target, "HeroName2")
    self._constNamePoxX1 = self._heroName1:getPositionX()

    self._timeLabel = ccui.Helper:seekNodeByName(self._target, "TimeLabel")
    self._expGap1 = ccui.Helper:seekNodeByName(self._target, "ExpGap1")
    self._expGap2 = ccui.Helper:seekNodeByName(self._target, "ExpGap2")
   
    self._expGap1PosX1 = self._expGap1:getPositionX()
    self._constGapPosX1 = self._expGap1PosX1
    -- self._constNodePosX1 = self._heroNodePosX1
    -- self._constNamePoxX1 = self._heroName1PosX1

    self:setTeamNodeVisible(1,false)
    self:setTeamNodeVisible(2,false)

end


-- function GuildTrainTeamNode:_initPos( ... )
--     self._heroNode1:setPositionX(self._heroNodePosX1)
--     self._heroName1:setPositionX(self._heroName1PosX1)
--     self._expGap1:setPositionX(self._expGap1PosX1)
-- end

function GuildTrainTeamNode:updateUI( data )
    self._trainInfo = data
    local trainNum = self:_getTeamNodeNum()
    self:setTeamNodeVisible(1,false)
    self:setTeamNodeVisible(2,false)

    if trainNum == 1 then
        self._heroNode1:setPositionX(0)
        self._heroName1:setPositionX(0)
        self._expGap1:setPositionX(0)
    else
        self._heroNode1:setPositionX(self._constNodePosX1)
        self._heroName1:setPositionX(self._constNamePoxX1)
        self._expGap1:setPositionX(self._constGapPosX1)
    end

    local posX1,posY1 = self._expGap1:getPosition()
    self._expGapPos1 = cc.p(posX1,posY1)
    local posX2,posY2 = self._expGap2:getPosition()
    self._expGapPos2 = cc.p(posX2,posY2)
    self:_updateUI()
end




-- 获取训练的人数
function GuildTrainTeamNode:_getTeamNodeNum( ... )
    if self._trainInfo.first == nil or self._trainInfo.second == nil then 
        return 1
    elseif self._trainInfo.first ~= nil and self._trainInfo.second ~= nil then
        return 2
    end
    return 0
end

function GuildTrainTeamNode:_updateUI( )
    self:_updateHeroNode(1)
    local trainNum = self:_getTeamNodeNum()
    self:_performWithDelay(function ( ... )
        self:_updateHeroNode(2)
    end,0.5)

    local trainType = G_UserData:getGuild():getGuildTrainType()
    if trainType == 1 then -- 自修
        self._timeLabel:getSubNodeByName("text1"):setString(Lang.get("guild_training_type_mm"))
    elseif trainType == 2 then -- 传武
        self._timeLabel:getSubNodeByName("text1"):setString(Lang.get("guild_training_type_mo"))
    elseif trainType == 3 then -- 习武
        self._timeLabel:getSubNodeByName("text1"):setString(Lang.get("guild_training_type_om"))
    end
end

function GuildTrainTeamNode:_updateHeroNode( index )
    local heroInfo = nil
    local isTurn = true
    local heroNode = self["_heroNode"..index]
    local nameControl = self["_heroName"..index]
    if index == 1 then 
        heroInfo = self._trainInfo.first
        isTurn = false
    elseif index == 2 then 
        heroInfo = self._trainInfo.second
        isTurn = true
    end

    if heroInfo ~= nil then 
        if heroInfo:getLevel() ~= nil then 
            local percentExp = G_UserData:getGuild():getGuildPercentExp(heroInfo:getLevel(),index)
            self["_expGap"..index]:setString(string.format(Lang.get("guild_prompt_exp"),percentExp))
        end

        heroNode:setVisible(true)
        nameControl:setVisible(true)
        heroNode:showTitle(heroInfo:getTitle(),self.__cname)

        nameControl:getSubNodeByName("text"):setString(heroInfo:getName())

        local limit = require("app.utils.data.AvatarDataHelper").getAvatarConfig(heroInfo:getAvatar_base_id()).limit == 1 and 3 
        -- local avatarId = UserDataHelper.convertToBaseIdByAvatarBaseId(heroInfo:getAvatar_base_id(), heroInfo:getLeader())
        local avatarId = UserDataHelper.convertAvatarId({ base_id = heroInfo:getLeader(),avatar_base_id = heroInfo:getAvatar_base_id() })
        heroNode:updateUI(avatarId,nil, nil, limit)
        heroNode:setScale(0.6)
        heroNode:turnBack(isTurn)

        self:playAniAndSound(heroNode,index)
        self:_updateHeroName(nameControl,heroInfo)
    else
        self:setTeamNodeVisible(index,false)
    end
end


function GuildTrainTeamNode:_updateHeroName( nameControl,heroInfo )
    local official = heroInfo:getOfficer_level()
    local officialName, officialColor,officialInfo = UserDataHelper.getOfficialInfo(official)
    nameControl:getSubNodeByName("text"):setColor(officialColor)
end

function GuildTrainTeamNode:playExpAnimation( )
    self:_playNodeExpAnimation(1)
    local trainNum = self:_getTeamNodeNum()
    if trainNum== 2 then
        self:_playNodeExpAnimation(2)
    end
end

function GuildTrainTeamNode:_playNodeExpAnimation( index )
    local flyTime = 0.9
    self["_expGap"..index]:setVisible(true)
    self["_expGap"..index]:setOpacity(255)

    local action1 = cc.MoveBy:create(flyTime, cc.p(0, 100))
    local action2 = cc.FadeOut:create(flyTime)

    local actionSpawn = cc.Spawn:create(action1, action2)
    local callFunc = cc.CallFunc:create(function ()
        self["_expGap"..index]:setPosition(self["_expGapPos"..index])
    end)
    local action = cc.Sequence:create(actionSpawn,callFunc)
    self["_expGap"..index]:runAction(action)
end

function GuildTrainTeamNode:stopAniAndSound( ... )
    self:stopFlash(self._flashObj1)
    self._heroNode1:stopAllActions()

    local trainNum = self:_getTeamNodeNum()
    if trainNum == 2 then 
        self:stopFlash(self._flashObj2)
        self._heroNode2:stopAllActions()
    end
end

function GuildTrainTeamNode:myTeamExit( index )
    self:stopFlash(self["_flashObj"..index])
    self["_heroNode"..index]:stopAllActions()
    self["_heroNode"..index]:setVisible(false)
    self["_heroName"..index]:setVisible(false)
end

function GuildTrainTeamNode:playAniAndSound(heroNode,index)
    local FlashPlayer = require("app.flash.FlashPlayer")
    local hero, shadow = heroNode:getFlashEntity()
    -- local attackId = getAttackAction()
    local attackId = 11001
    local hero_skill_play = require("app.config.hero_skill_play")
    local skillData = hero_skill_play.get(attackId)
    if skillData then
        if self["_flashObj"..index] then
            self["_flashObj"..index]:finish()
            self["_flashObj"..index] = nil
        end
        local ani = Path.getAttackerAction(skillData.atk_action)
        self["_flashObj"..index] = FlashPlayer.new(hero, shadow, ani, index == 1 and 1 or -1, heroNode, true )
        self["_flashObj"..index]:start()
        self["_heroNode"..index]:showShadow(false)
    end
end


function GuildTrainTeamNode:setTimeLabelVisible( visible )
    self._timeLabel:setVisible(visible)
end

function GuildTrainTeamNode:setTimeLabelString( string )
    self._timeLabel:getSubNodeByName("text2"):setString(string)
end

function GuildTrainTeamNode:stopFlash(flashObj )
    if flashObj then
        flashObj:finish()
        flashObj = nil
    end
end

function GuildTrainTeamNode:_performWithDelay( callback,delay )
    local delay = cc.DelayTime:create(delay)
    local sequence = cc.Sequence:create(delay, cc.CallFunc:create(callback))
    self._target:runAction(sequence)
    return sequence
end

function GuildTrainTeamNode:setVisible( visible )
    self:setTeamNodeVisible(1,visible)
    self:setTeamNodeVisible(2,visible)

    if not visible then 
        self:stopFlash(self._flashObj1)
        self:stopFlash(self._flashObj2) 
    end
end


function GuildTrainTeamNode:setTeamNodeVisible( index,visible )
    self["_heroNode"..index]:setVisible(visible)
    self["_heroName"..index]:setVisible(visible)
end


return GuildTrainTeamNode