--提示文字效果
local PromptManager = class("PromptManager")
local CSHelper = require("yoka.utils.CSHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local TextHelper = require("app.utils.TextHelper")

function PromptManager:ctor()

end
--[[
    通用tip消息弹框
    @params可以直接是一个字符串，也可以是一个富文本json格式
    local params = "xxx"
    local params = '[{"type":"text", "msg":"随便#name#", "color":16777215, "opacity":"255"}]'
	-- string 文本格式（参考 ParseRichTextStringHelp） "您已经购买过礼包，暂时不能一键购买|请$c104_凌晨4点$后再尝试"
	-- | 分行
	local params = {str = Lang.get("xxxxx"), fontSize = 22, defaultColor = Colors.OBVIOUS_YELLOW}

]]

function PromptManager:showTipDelay(params, callback, delayTime)
    if params ~= nil then
        local PromptTip = require("app.ui.prompt.PromptTip").new(callback)
        return PromptTip:show(params,delayTime)
    end
end

function PromptManager:showTip(params, callback)
    if params ~= nil then
        local PromptTip = require("app.ui.prompt.PromptTip").new(callback)
        return PromptTip:show(params)
    end
end

function PromptManager:showTipOnTop(params, callback)
    if params ~= nil then
        local PromptTip = require("app.ui.prompt.PromptTip").new(callback)
        return PromptTip:showOnTop(params)
        -- return PromptTip:show(params)
    end
end

function PromptManager:clearTips()
     local scene = G_SceneManager:getRunningScene()
     scene:removeAllTips()
end

---====
---获取奖励弹窗，但以类似提示的样式弹出
---@awards 奖励列表
---====
function PromptManager:showAwards(awards)
    if not self._promptReward then
        self._promptReward = require("app.ui.prompt.PromptRewards").new()
    end
    if #awards > 0 then
        self._promptReward:show(awards)
    end
end

--[[
    摘要性质的提示文字
    比如 "攻击力 + 100", "防御力 + 200", "恭喜xxx获得xxx装备！"这样类型的文字提示

    @params可以是一个表，也可以是一个json格式串
    如果是表，则采用二维数组，第一维表示摘要的数据条数，第二维表示一条摘要的每个字段的参数
    如果是json格式串，则可以采用如下格式
    local params = {
        {
            content = '[{"type":"text", "msg":"随便#name#", "color":16777215, "opacity":"255"}]'
            group = 0, 分组
        },
        {
            ...
        }
    }
    local extParams = {
        startPosition = "相对屏幕中心点偏移 cc.p"
        dstPosition = "要移动到的位置，世界坐标，cc.p",
        finishCallback = "移动到后的回调函数，function，回传参数为哪一行文本的索引值"
        allOffsetY = 100,
        showDuration = 0.3,
        moveDuration = 0.3,
        stayDuration = 0.3,
        outDuration = 0.3,
    }

]]
function PromptManager:showTextSummary( params,extParams )
    local PromptTextSummary = require("app.ui.prompt.PromptTextSummary").new()

    PromptTextSummary:show(params,extParams)
end


--[[
    摘要性质的提示文字
    比如 "攻击力 + 100", "防御力 + 200", "恭喜xxx获得xxx装备！"这样类型的文字提示

    @params可以是一个表，也可以是一个json格式串

    如果是表，则采用二维数组，第一维表示摘要的数据条数，第二维表示一条摘要的每个字段的参数
    local params = {
        {
            -- 第一条数据，比如“生命 + xxx”
            {
                -- 生命
                -- 一组表示一个RichElement，可以有多组
                type = "RichElement类型，目前支持text, image, custom, string类型"
                msg = "要显示的文本内容，string",
                color = "颜色，cc.c3b",
                opacity = "透明度，number",
                fontName = "字体名称，string，Text用",
                fontSize = "字体大小，number，Text用",
                filePath = "文件路径，string，Image用",
                outlineColor = "描边颜色，cc.c4b",
                outlineSize = "描边粗细，number"
                customNode = "自定义节点，cc.Node，customNode用"
            },
            {
                -- + xxx
                type = "RichElementText",
                ...
            }
            dstPosition = "要移动到的位置，世界坐标，cc.p",
            finishCallback = "移动到后的回调函数，function，回传参数为哪一行文本的索引值"
        },
        {
            -- 第二条数据，比如“防御 + xxx”
            ...
        }
    }

    如果是json格式串，则可以采用如下格式
    local params = {
        {
            content = '[{"type":"text", "msg":"随便#name#", "color":16777215, "opacity":"255"}]'
            startPosition = "相对屏幕中心点偏移 cc.p"
            dstPosition = "要移动到的位置，世界坐标，cc.p",
            finishCallback = "移动到后的回调函数，function，回传参数为哪一行文本的索引值"
        },
        {
            ...
        }
    }

]]

function PromptManager:showSummary(params)
    local PromptSummary = require("app.ui.prompt.PromptSummary").new()

    PromptSummary:show(params)
end

function PromptManager:showPower()

end

--播总战力飘字
function PromptManager:playTotalPowerSummary(offsetX, offsetY)
    offsetX = offsetX or 0
    offsetY = offsetY or 0
    local curPower = G_UserData:getAttr():getCurPower()
    local node = CSHelper.loadResourceNode(Path.getCSB("CommonPowerPrompt", "common"))
    local diffPower = G_UserData:getAttr():getPowerDiffValue()
    dump(diffPower)
    node:updateUI(curPower, diffPower)
    node:play(offsetX, offsetY)
end

function PromptManager:playTotalPowerSummaryWithKey(key, offsetX, offsetY)
    offsetX = offsetX or 0
    offsetY = offsetY or 0
    local curPower = G_UserData:getAttr():getCurPowerWithKey(key)
    local node = CSHelper.loadResourceNode(Path.getCSB("CommonPowerPrompt", "common"))
    local diffPower = G_UserData:getAttr():getPowerDiffValueWithKey(key)
    dump(diffPower)
    node:updateUI(curPower, diffPower)
    node:play(offsetX, offsetY)
end

--仿游历奖励播放模式
--只能播1个奖励内容
function PromptManager:showAwardsExploreMode(rootNode, awards)
    local function createResNode(award)
        local gainNode = CSHelper.loadResourceNode(Path.getCSB("CommonAwardTip", "common"))
        local textValue = ccui.Helper:seekNodeByName(gainNode, "TextValue")
        local imageRes = ccui.Helper:seekNodeByName(gainNode, "ImageRes")
        local textRes = ccui.Helper:seekNodeByName(gainNode, "TextRes")
        local itemParams = TypeConvertHelper.convert(award.type, award.value)
        imageRes:loadTexture(itemParams.icon)
        local name = TextHelper.expandTextByLen(itemParams.name, 3)
        textRes:setString(name)
        textRes:setColor(itemParams.icon_color)
        textRes:enableOutline(itemParams.icon_color_outline, 2)
        textValue:setString("+"..award.size)
        return gainNode
    end

    local function effectFunction(effect)
        if effect == "exp" then
            if awards[1] then
                return createResNode(awards[1])
            end
        end
        return cc.Node:create()
    end
    G_EffectGfxMgr:createPlayMovingGfx(rootNode, "moving_dangao_txt", effectFunction, nil, true)
end

return PromptManager
