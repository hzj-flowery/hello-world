
local ViewBase = require("app.ui.ViewBase")
local GuildWarNoticeNode = class("GuildWarNoticeNode", ViewBase)

local ATTACT_NOTICE_IDS =  {{ [1] = true ,[2] = true,[7] = true,[8] = true,  [9] = true ,[10] = true  },
                            { [1] = true ,[2] = true,[5] = true,[7] = true,  [8] = true}}

-- type 1:军团战
-- type 2:跨服军团战
function GuildWarNoticeNode:ctor(type)
    self._textList = nil
    self._dataList = nil
    self._dataIndex = 1
    self._nodeTipsParent = nil
    self._type = type

    local resource = {
        file = Path.getCSB("GuildWarNoticeNode", "guildwarbattle"),
        binding = {
		}
    }
    GuildWarNoticeNode.super.ctor(self, resource)
end

function GuildWarNoticeNode:onCreate()
    self._textList = {
        self._text1,self._text2,self._text3
    }

    for i, value in ipairs(self._textList) do
        value:setOpacity(0)
    end

    self:clear()
end

function GuildWarNoticeNode:_getNoticeContent()
    -- body
    local content = ""
    if self._type == 2 then
        content = Lang.get("guildcrosswar_notice_msg")
    else
        content = Lang.get("guildwar_notice_msg")
    end
    return content
end

function GuildWarNoticeNode:_updateText( unit, textNode )
    local id = unit:getId()
    local values = unit:getMap2()

    local source = self:_getNoticeContent()[id]  
    local str = Lang.getTxt(source,values)

    if textNode == nil then
        return
    end

    textNode:setString(str)
    if ATTACT_NOTICE_IDS[self._type][id] then
        textNode:setColor(Colors.GUILD_WAR_NOTICE_ATTACK_COLOR)
        textNode:enableOutline(Colors.GUILD_WAR_NOTICE_ATTACK_COLOR_OUTLINE, 2)
    else
        textNode:setColor( Colors.GUILD_WAR_NOTICE_BE_ATTACK_COLOR)
        textNode:enableOutline(Colors.GUILD_WAR_NOTICE_BE_ATTACK_COLOR_OUTLINE, 2)
    end
   
    textNode:setOpacity(255)

    local tipActionFunc = function()
        return cc.Sequence:create(
            cc.DelayTime:create(5), cc.FadeOut:create(0.5)
        )
    end
    textNode:runAction(tipActionFunc())
end
function GuildWarNoticeNode:_refreshList()
    for k,unit in ipairs(self._dataList) do
        local id = unit:getId()
        local values = unit:getMap2()
        local source = self:_getNoticeContent()[id]  
        local str = Lang.getTxt(source,values)
        self._textList[k]:setString(str)
      
         if ATTACT_NOTICE_IDS[self._type][id] then
             self._textList[k]:setColor(Colors.GUILD_WAR_NOTICE_ATTACK_COLOR)
	         self._textList[k]:enableOutline(Colors.GUILD_WAR_NOTICE_ATTACK_COLOR_OUTLINE, 2)
         else
             self._textList[k]:setColor( Colors.GUILD_WAR_NOTICE_BE_ATTACK_COLOR)
	         self._textList[k]:enableOutline(Colors.GUILD_WAR_NOTICE_BE_ATTACK_COLOR_OUTLINE, 2)
         end
       
    end
end

function GuildWarNoticeNode:showMsg(unit)

    local function getFreeText( ... )
        -- body
        for i, value in ipairs(self._textList) do
            if value:getOpacity() == 0 then
               return value
            end
        end
        return nil
    end

    local textNode = getFreeText()
    if textNode then
        self:_updateText(unit,textNode)
    else
        self:_showTips(unit)
    end

    --self:_refreshList()

end

function GuildWarNoticeNode:clear()
    self._dataList = {}
    for k,v in ipairs(self._textList) do
        v:setString("")
    end
    self._nodeTipsParent:removeAllChildren()
end




function GuildWarNoticeNode:_showTips(unit)

    local tipActionFunc = function()
        return cc.Sequence:create(
            --cc.Spawn:create(cc.MoveBy:create(0.15, cc.p(0, 40)),  cc.FadeIn:create(0.15)),
            --cc.DelayTime:create(1.8),
            cc.Spawn:create(cc.MoveBy:create(0.4, cc.p(0, 60)), cc.FadeOut:create(0.4))
        )
    end
    local id = unit:getId()
    local content = unit:getMap()
    local source = self:_getNoticeContent()[id]  
    local RichTextHelper = require("app.utils.RichTextHelper")
    local richContent = nil
    if ATTACT_NOTICE_IDS[self._type][id] then
       richContent = RichTextHelper.convertRichTextByNoticePairs(source,content,18,
            Colors.GUILD_WAR_NOTICE_ATTACK_COLOR,Colors.GUILD_WAR_NOTICE_ATTACK_COLOR_OUTLINE,2 )
    else
       richContent = RichTextHelper.convertRichTextByNoticePairs(source,content,18,
            Colors.GUILD_WAR_NOTICE_BE_ATTACK_COLOR,Colors.GUILD_WAR_NOTICE_BE_ATTACK_COLOR_OUTLINE,2 )
    end 
      

    local node = ccui.RichText:create()
	node:setRichText(richContent)
    node:setVerticalSpace(5)
    node:runAction(cc.Sequence:create(tipActionFunc(), cc.RemoveSelf:create()))
    self._nodeTipsParent:addChild(node)
end

return GuildWarNoticeNode
