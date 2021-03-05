-- @Author panhoa
-- @Date 4.3.2020

local bout_base = require("app.config.bout_base")
local bout_info = require("app.config.bout_info")
local BoutConst = require("app.const.BoutConst")
local UIHelper = require("yoka.utils.UIHelper")
local Color = require("app.utils.Color")
local BoutHelper = {}


--@Role     getBout_Info
function BoutHelper.initBoutInfo( ... )
    -- body
    local boutInfo = {}
    for i = 1, bout_info.length() do
        local indexData = bout_info.indexOf(i)
        if not boutInfo[indexData.id] then
            boutInfo[indexData.id] = {}
        end
        boutInfo[indexData.id][indexData.point] = indexData
    end
    return boutInfo
end

--@Role     getBout_base Item
--@Param    id  阵法Id
function BoutHelper.getBoutBaseItem(id)
    -- body
    local indexData = bout_base.indexOf(id)
    if indexData then
        return indexData
    end
    assert(false, "can't find the bout's id(%d) config of bout_base", id)
end

--@Role     getBout_info Item
--@Param    id  阵法Id
--@Param    pos 阵法位
function BoutHelper.getBoutInfoItem(id, pos)
    -- body
    local indexData = bout_info.get(id, pos)
    if indexData then
        return indexData
    end
    assert(false, "can't find the bout's id-pos(%d-%d) config of bout_info", id, pos)
end

-----------------------------------------------------------------------------------------------------
--@Role     is can unlock special
function BoutHelper.isCanUnlockSBoutPoint(pos)
    -- body
    local curBoutId = G_UserData:getBout():getCurBoutId()
    local curBoutList = G_UserData:getBout():getBoutList()
    if not curBoutList or not curBoutList[curBoutId] then
        return false
    end

    local data = G_UserData:getBout():getBoutInfo()[curBoutId][pos]
    if not BoutHelper.isEnoughJade2(data.cost_yubi) then
        return false
    end

    local boutInfo = G_UserData:getBout():getBoutInfo()
    return rawequal(table.nums(curBoutList[curBoutId]), (table.nums(boutInfo[curBoutId]) - 1))
end

--@Role     is can unlock special
function BoutHelper.isSpecialBoutPoint(id, pos)
    -- body
    local info = BoutHelper.getBoutInfoItem(id, pos)
    if not info then
        return false
    end
    return rawequal(info.point_type, 2)
end

-------------------------------------------------------------------------------------------------------
--@Role     update RedPoint
function BoutHelper.checkRedPoint(node, pos)
    -- body
    local curBoutId = G_UserData:getBout():getCurBoutId()
    local isLocked = G_UserData:getBout():checkUnlocked(curBoutId, pos)
    if not isLocked then
        node:setVisible(false)
    else
        local isRed,__ = BoutHelper.isEnoughConsume({id = curBoutId, pos = pos})
        local isSpecial = BoutHelper.isSpecialBoutPoint(curBoutId, pos)
        if isSpecial then
            node:setVisible(BoutHelper.isCanUnlockSBoutPoint(pos))
        else
            node:setVisible(isRed)
        end
    end
end

--@Role     update Texture
function BoutHelper.checkTexture(pointNode, isEnabled)
    local curBoutId = G_UserData:getBout():getCurBoutId()
    local isSpecial = BoutHelper.isSpecialBoutPoint(curBoutId, pointNode:getTag())
    local texture = Path.getBoutPath("img_bout_kaiqi02")
    if isSpecial then
        local isLock = G_UserData:getBout():checkUnlocked(curBoutId, pointNode:getTag())
        texture = isLock and Path.getBoutPath("img_bout_kaiqi02b") or Path.getBoutPath("img_bout_kaiqi01b")
    else
        texture = isEnabled and Path.getBoutPath("img_bout_kaiqi02") or Path.getBoutPath("img_bout_kaiqi01")    
    end
    pointNode:loadTextureNormal(texture)
    pointNode:loadTexturePressed(texture)    
end

--@Role     update PointName
function BoutHelper.checkNameColor(label, index)
    local outLineSize = index == 3 and 1 or 2
    local fontSize = index == 3 and 20 or 22

    if index == 3 and label:getTag() ~= 3 then
        BoutHelper.createEffect(label, 1, nil, false, cc.p(21, 0))
    end
    label:setTag(index)
    label:setColor(Color.BOUT_POINTNAME_COLOR[index][1])
    label:enableOutline(Color.BOUT_POINTNAME_COLOR[index][2], outLineSize)
    label:setBMFontSize(fontSize)
end

function BoutHelper.createAddOn(callBack)
    -- body
    local texture = Path.getBoutPath("img_bout_jiacheng01")
    local btn = ccui.Button:create(texture, texture)
    btn:addClickEventListenerEx(callBack)
    btn:setPosition(cc.p(207, 74))
    return btn
end

function BoutHelper.createBottom(rootNode, boutPos)
    -- body
    local curBoutId = G_UserData:getBout():getCurBoutId()
    local bottom = UIHelper.createImage({texture = Path.getBoutBottomPath("img_bout_0"..curBoutId.."_0"..boutPos, curBoutId)})
    bottom:setName(BoutConst.BOUT_BOTTOM_NAMEKEY..boutPos)
    bottom:setAnchorPoint(cc.p(0.5, 0.5))
    bottom:setSwallowTouches(false)
    bottom:setOpacity(80)
    rootNode:addChild(bottom, 1)
    return bottom
end

function BoutHelper.createRedPoint(isSpecial)
    -- body
    local pos = isSpecial and cc.p(70, 85) or cc.p(62, 82)
    local UIHelper  = require("yoka.utils.UIHelper")
    local redImg = UIHelper.createImage({texture = Path.getUICommon("img_redpoint") })
    redImg:setName("RedPoint")
    redImg:setPosition(pos)
    return redImg
end

--@Role     create BoutPoint
function BoutHelper.createBoutPoint(rootNode, boutPos, callBack)
    -- body
    local curBoutId = G_UserData:getBout():getCurBoutId()
    local isSpecial = BoutHelper.isSpecialBoutPoint(curBoutId, boutPos)
    local texture = isSpecial and Path.getBoutPath("img_bout_kaiqi02b") or Path.getBoutPath("img_bout_kaiqi02")

    local pos = isSpecial and cc.p(65, 64) or cc.p(42, 64)
    local btn = ccui.Button:create(texture, texture)
    btn:addClickEventListenerEx(callBack)
    btn:setTag(boutPos)
    btn:setPosition(pos)
    btn:setName(BoutConst.BOUT_POINT_NAMEKEY..boutPos)

    local pos2 = isSpecial and cc.p(50, 63) or cc.p(40, 63)
    local selectImg = UIHelper.createImage({})
    selectImg:setName("selected")
    selectImg:setVisible(false)
    selectImg:setAnchorPoint(cc.p(0.5, 0.5))
    selectImg:setPosition(pos2)
    selectImg:setSwallowTouches(false)
    BoutHelper.createEffect(selectImg, 3, nil, false, cc.p(-2, -1))

    local pos3 = isSpecial and cc.p(50, 61) or cc.p(40, 61)
    local labelName = cc.Label:createWithTTF("XXXXXXX", Path.getCommonFont(), 22)
    labelName:setName("pointName")
    labelName:setTag(1)
    local isLocked = G_UserData:getBout():checkUnlocked(curBoutId, boutPos)
    local colorIdx = isLocked and 1 or 3
    BoutHelper.checkNameColor(labelName, colorIdx)
    labelName:setAnchorPoint(cc.p(0.5, 0.5))
    labelName:setPosition(pos3)
   
    --RedPoint
    local redImg = BoutHelper.createRedPoint(isSpecial)
    BoutHelper.checkRedPoint(redImg, boutPos)
    local effectActive = cc.Node:create()
    effectActive:setName("EffectActive")

    btn:addChild(selectImg)
    btn:addChild(labelName)
    btn:addChild(effectActive)
    btn:addChild(redImg, 10)
    rootNode:addChild(btn, 2)
    return btn
end

-------------------------------------------------------------------------------------------------------
--@Role     Get Consumes's item
function BoutHelper.getConsumeItems(id, pos)
    -- body
    local consumeItems = {}
    local TypeConvertHelper = require("app.utils.TypeConvertHelper")
    local info = BoutHelper.getBoutInfoItem(id, pos)
    for index = 1, BoutConst.CONSUME_HERO_MAXNUM do
        if info["cost_hero"..index] > 0 then
            table.insert(consumeItems, {type = TypeConvertHelper.TYPE_HERO,
                                        value = info["cost_hero"..index],
                                        size = info["cost_hero"..index.."_num"]})
        end
    end
    return consumeItems, info.cost_yubi
end

--@Role     Get Attrbute's item
function BoutHelper.getAttrbute(id, pos)
    -- body
    local attrs = {}
    local info = BoutHelper.getBoutInfoItem(id, pos)
    for index = 1, BoutConst.CONSUME_HERO_ATTRS do
        if info["attribute_value_"..index] > 0 then
            if not attrs[info["attribute_type_"..index]] then
                attrs[info["attribute_type_"..index]] = 0
            end
            attrs[info["attribute_type_"..index]] = (attrs[info["attribute_type_"..index]] + info["attribute_value_"..index])
        end
    end
    return attrs
end

--@Role     check OfficerLevel
function BoutHelper.checkOfficerLevel(v)
    -- body
    local curOfficiallevel = G_UserData:getBase():getOfficialLevel()
    local boutData = BoutHelper.getBoutBaseItem(v.id)
    return curOfficiallevel >= boutData.need_office, boutData.need_office
end

--@Role     Is Enough Jade2
function BoutHelper.isEnoughJade2(curNum)
    -- body
    local DataConst = require("app.const.DataConst")
    local UserDataHelper = require("app.utils.UserDataHelper")
    local TypeConvertHelper = require("app.utils.TypeConvertHelper")
    local myJadeNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2)
    if curNum > myJadeNum then
        return false
    end
    return true
end

--@Role     Is Enough Consume
function BoutHelper.isEnoughConsume(v)
    -- body
    local isEnoughOffi,_ = BoutHelper.checkOfficerLevel(v)
    if not isEnoughOffi then
        return false, nil
    end

    local data = G_UserData:getBout():getBoutInfo()[v.id][v.pos]
    if not BoutHelper.isEnoughJade2(data.cost_yubi) then
        return false, nil
    end

    local function isEnoughUniqueIds(consumeHeroIds, sameCards, costNum)
        -- body
        local count = 0
        for k, card in pairs(sameCards) do
            if count >= costNum then
                break
            end
            table.insert(consumeHeroIds, card:getId())
            count = count + 1
        end
        return count >= costNum
    end

    local hero = G_UserData:getHero()
    local consumeHeroIds = {}
    for index = 1, BoutConst.CONSUME_HERO_MAXNUM do
        if data["cost_hero"..index] and data["cost_hero"..index] > 0 then            
            local sameCards = hero:getSameCardCountWithBaseId(data["cost_hero"..index])
            if not sameCards then
                return false, nil
            end

            if not isEnoughUniqueIds(consumeHeroIds, sameCards, data["cost_hero"..index.."_num"]) then
                local info = require("app.utils.data.HeroDataHelper").getHeroConfig(data["cost_hero"..index])
                return false, consumeHeroIds
            end
        end
    end
    return true, consumeHeroIds
end

-------------------------------------------------------------------------------------------------------------
--@Role     play EffectMusic
function BoutHelper.playEffectMusic(id, pos)
    local AudioConst = require("app.const.AudioConst")
    if BoutHelper.isSpecialBoutPoint(id, pos) then
        G_AudioManager:playSoundWithId(AudioConst.SOUND_BOUT_SPECIALACTIVE)
    else
        G_AudioManager:playSoundWithId(AudioConst.SOUND_BOUT_NORMALACTIVE)
    end
end

--@Role     play ActiveSummary
function BoutHelper.playActiveSummary(id, pos)
    local info = BoutHelper.getBoutBaseItem(id)
    local boutData = BoutHelper.getBoutInfoItem(id, pos)

    local summary = {}
    local content = Lang.get("bout_active", {
        boutName = info.name,
        boutColor= Colors.colorToNumber(Colors.COLOR_QUALITY[info.color]),
        boutOutline = Colors.colorToNumber(Colors.COLOR_QUALITY_OUTLINE[info.color]),
        pointName = boutData.point_name
    })
    local param = {
        content = content,
    } 
    table.insert(summary, param)
    
    BoutHelper.addBaseAttrPromptSummary(summary, id, pos)
    G_Prompt:showSummary(summary)
end

--@Role     Add Attr
function BoutHelper.addBaseAttrPromptSummary(summary, id, pos)
    local UIConst = require("app.const.UIConst")
    local AttrDataHelper = require("app.utils.data.AttrDataHelper")
    local result = BoutHelper.getAttrbute(id, pos)

    for k,v in pairs(result) do
        if v ~= 0 then
            local param = {
                content = AttrDataHelper.getPromptContent(k, v),
                anchorPoint = cc.p(0, 0.5),
                startPosition = {x = UIConst.SUMMARY_OFFSET_X_ATTR},
            }
            table.insert(summary, param)
        end
    end
    return summary
end

--@Role     play ReverttoSpecial
function BoutHelper.playRevertoSpecialEffect(rootNode, pointNodes, callBack)
    -- body
    if not pointNodes or table.nums(pointNodes) <= 0 then
        return
    end

    local UIHelper = require("yoka.utils.UIHelper")
    local function playEffect(rootNode, startPos, endPos)
        -- body
        local emitter = cc.ParticleSystemQuad:create("particle/zhenfalizi.plist")
        if emitter then
            emitter:setPosition(startPos)
            emitter:resetSystem()
        end

        rootNode:addChild(emitter)
        local pointPos1 = cc.p(startPos.x, startPos.y + 200)
        local pointPos2 = cc.p((startPos.x + endPos.x) / 2, startPos.y + 100)
        local bezier = {
            pointPos1,
            pointPos2,
            endPos,
        }
        local action1 = cc.BezierTo:create(2.0, bezier)
        local action2 = cc.EaseSineIn:create(action1)
        emitter:runAction(cc.Sequence:create(
                action2,
                cc.DelayTime:create(0.8),
                cc.CallFunc:create(function()
                    if callBack then
                        callBack()
                    end
                end),
                cc.RemoveSelf:create()
            )
        )
    end

    local max = #pointNodes
    local size = pointNodes[1]:getContentSize()
    local endPos = UIHelper.convertSpaceFromNodeToNode(pointNodes[max], rootNode, cc.p(size.width/2+5, size.height/2+10))

    for k, v in pairs(pointNodes) do
        if k ~= max then
            local startPos = UIHelper.convertSpaceFromNodeToNode(pointNodes[k], rootNode, cc.p(size.width/2, size.height/2+10))
            playEffect(rootNode, startPos, endPos)
        end
    end
end

--@Role     play active's effect
function BoutHelper.createEffect(node, idx, callBack, isAudoRelease, pos)
    -- body
    G_EffectGfxMgr:createPlayGfx(node, "effect_zhenfagu_jihuo"..idx, callBack, isAudoRelease, pos)
end


return BoutHelper