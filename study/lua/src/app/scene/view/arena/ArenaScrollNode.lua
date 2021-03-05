--竞技场滚动面板
local ViewBase = require("app.ui.ViewBase")
local ArenaScrollNode = class("ArenaScrollNode", ViewBase)
local ArenaHeroAvatar = require("app.scene.view.arena.ArenaHeroAvatar")

local MAX_HERO_SIZE = 11 --最多11个

function ArenaScrollNode:ctor()
    self._scrollView = nil -- 滚动面板
    self._heroNode1  = nil -- 一共九个

    local resource = {
        file = Path.getCSB("ArenaScrollNode", "arena"),
        binding = {

		}
    }
    self:setName("ArenaScrollNode")
    ArenaScrollNode.super.ctor(self, resource)
end

function ArenaScrollNode:onCreate()
    self._scrollView:setScrollBarEnabled(false)
end

function ArenaScrollNode:getSelfNode()
    for i= 1 , MAX_HERO_SIZE do 
        local heroAvatar = self["_heroAvatar"..i]
        if heroAvatar and heroAvatar:isSelf() then
            return heroAvatar,i
        end
    end
    assert(false, "can not find self node ")
    return nil
end

--滚动到自己的节点
function ArenaScrollNode:jumpToSelfNode(needAnimation)
    if needAnimation == nil then
        needAnimation = false
    end
    local selfNode, index = self:getSelfNode()
    if selfNode then
        local parent = selfNode:getParent()
        local percent = math.floor( (index-1) / MAX_HERO_SIZE * 100) 

        if percent > 1 then
            percent = percent + 20
            percent = math.min( percent, 100 )
        end
        --if needAnimation == true or needAnimation == nil then
            self._scrollView:jumpToPercentVertical(percent)
       -- else
       --     self._scrollView:scrollToPercentVertical(percent,0.5, true)
      --  end
        
    end
end

function ArenaScrollNode:getHeroAvatar(index)
   local heroAvatar = self["_heroAvatar"..(index)]
   return heroAvatar
end

function ArenaScrollNode:getSelfTopNode()
    local selfNode, index = self:getSelfNode()
    if selfNode and index then
        local heroAvatar = self["_heroAvatar"..(index-1)]
        if heroAvatar then
            return heroAvatar
        end
    end
    return nil
end

function ArenaScrollNode:getAvatarNodeById(userId)
    for i= 1 , MAX_HERO_SIZE do 
        local heroAvatar = self["_heroAvatar"..i]
        if heroAvatar and heroAvatar:getUserId() == userId then
            return heroAvatar,i
        end
    end
    return nil
end
--更新英雄列表
function ArenaScrollNode:updateHeroList(playerList, callBack, needJump,needAnimation)
    self._scrollView:stopAutoScroll()

    local function createHeroAvatar(index,heroNode)
        local heroAvatar = ArenaHeroAvatar.new()
        heroNode:removeAllChildren()
        heroNode:addChild(heroAvatar)
        self["_heroAvatar"..index] = heroAvatar
        return heroAvatar
    end

    for i, player in ipairs(playerList) do
        local heroNode = self["_heroNode"..i]
        local heroNodeCfg = require("app.config.arena_list_position").get(i)
        assert(heroNodeCfg, "arena_list_position can not find by id :"..i)

        if heroNode then
            local heroAvatar = self["_heroAvatar"..i]
            if heroAvatar == nil then
                heroAvatar = createHeroAvatar(i, heroNode)
                heroAvatar:updateAvatar(player,callBack)
                heroAvatar:turnBack()
            end
            heroAvatar:updateAvatar(player,callBack)
            heroNode:setPosition(cc.p(heroNodeCfg.position_x, heroNodeCfg.position_y))
        end
    end
    if needJump == true then
        self:jumpToSelfNode(needAnimation)
    end
end

function ArenaScrollNode:getScrollContentSize( ... )
    -- body
    return self._scrollView:getContentSize()
end
--
function ArenaScrollNode:onEnter()

end

function ArenaScrollNode:onExit()

end



return ArenaScrollNode
