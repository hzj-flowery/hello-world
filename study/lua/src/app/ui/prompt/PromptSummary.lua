--提示文字
local PromptSummary = class("PromptSummary")
local PromptAction  = require("app.ui.prompt.PromptAction")
local TEXT_LINE_INTERVAL = 35 --40
function PromptSummary:ctor()

end

function PromptSummary:show(params)
    if #params == 0 then return end

    local richTexts = {}

    for i=1, #params do

        local param = params[i]
        local richText = ccui.RichText:create()
        if param.content then
            richText:setRichTextWithJson(param.content)
        else
            richText:setRichText(param)
        end
        -- 添加进总容器
        richTexts[#richTexts + 1] = richText
    end

    -- 统一显示
    local nums = #richTexts
    local runningScene = G_SceneManager:getRunningScene()
	local width = G_ResolutionManager:getDesignWidth()
	local height = G_ResolutionManager:getDesignHeight()
    local endY = height*0.5 + nums/2*40
    for i=1, nums do

        local index = (i-1) - nums/2 + 0.5

        local richText = richTexts[i]

        runningScene:addTextSummary(richText)

        local anchorPoint = params[i].anchorPoint or cc.p(0.5, 0.5)
        richText:setAnchorPoint(anchorPoint)

        local offsetX = params[i].startPosition and params[i].startPosition.x or 0
        local offsetY = params[i].startPosition and params[i].startPosition.y or 0


        richText:setPosition(cc.p(width/2+offsetX, height/2 + offsetY - TEXT_LINE_INTERVAL * index)) -- 40表示间隙

 
        local flyTime = params[i].flyTime and params[i].flyTime or 0.5
        richText:setScale(0.5)
        richText:runAction(cc.Sequence:create(
            -- 显示弹出动画
            PromptAction.PopupAction(),
            -- 然后延迟一秒
            cc.DelayTime:create(1),
            -- 如果有目标地址，则直接飞去目标地址，并调用回调函数
            params[i].dstPosition
                and cc.Sequence:create(
                    cc.Spawn:create(
                        cc.MoveTo:create(flyTime, params[i].dstPosition),
                        cc.ScaleTo:create(flyTime, 0.8)
                    ),
                    cc.CallFunc:create(function()
                        if params[i].finishCallback then
                            params[i].finishCallback(i)
                        end
                    end),
                    cc.RemoveSelf:create()
                )
                -- 没有就直接移除了，不加动画
                or cc.Sequence:create(
                    cc.Spawn:create(
                        cc.FadeOut:create(0.5),
                        cc.MoveBy:create(0.7, cc.p(0, 80))
                    ),
                    cc.CallFunc:create(function()
                        if params[i].finishCallback then
                            params[i].finishCallback(i)
                        end
                    end),
                    cc.RemoveSelf:create()
                )
            )
        )
    end

    return endY
end



function PromptSummary:_getRunAction(index, dstPosition,finishCallback)

    local runningAction = nil

    


    if dstPosition then
        local dstPos = dstPosition
        dstPos.y = dstPos.y - TEXT_LINE_INTERVAL * index
        local spawnAction = cc.Spawn:create(cc.MoveTo:create(0.5, dstPosition), cc.ScaleTo:create(0.5, 0.3))
        local callAction = cc.CallFunc:create(function() 
                        if finishCallback then 
                             finishCallback()
                        end
        end)
        runningAction = cc.Sequence:create(spawnAction,callAction,cc.RemoveSelf:create())
    else
        cc.Sequence:create(
                    cc.Spawn:create(
                        cc.FadeOut:create(0.5),
                        cc.MoveBy:create(0.7, cc.p(0, 80))
                    ),
                    cc.RemoveSelf:create()
                )
    end

    return runningAction
end

return PromptSummary