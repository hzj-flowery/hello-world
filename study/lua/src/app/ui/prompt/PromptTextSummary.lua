--提示文字
--有弹出复杂效果
local PromptTextSummary = class("PromptTextSummary")
local TEXT_LINE_INTERVAL = 40

function PromptTextSummary:ctor()
    self._lastIndex = 0
    self._index = 1

    self._allOffsetY = 100
    self._showDuration = 0.3
    self._moveDuration = 0.3
    self._stayDuration = 0.5
    self._outDuration = 0.35 
end


function PromptTextSummary:_getRichText(params)
    local richTexts = {}
    for i=1, #params do
        local param = params[i]
        local richTextObj = nil
        if param.content then
            logWarn("content !!!!!!!")
            richTextObj = ccui.RichText:create()
            richTextObj:setRichTextWithJson(param.content)
        end

        local group = param.group or 0

        -- 添加进总容器
        richTexts[#richTexts + 1] = {
            text = richTextObj,
            group = group,
            id = i,
        }
    end
    table.sort(richTexts,function(a,b)
        if a.group ~= b.group then
            return a.group < b.group
        end
        return a.id < b.id
    end)

    return richTexts
end

function PromptTextSummary:_arrageTexts(richTexts)
    local groups = {}

    dump(richTexts)
    local nums = #richTexts
    local conH = nums * 40
    local tempGroup = nil
    local runningScene = G_SceneManager:getRunningScene()
	local width = G_ResolutionManager:getDesignWidth()
	local height = G_ResolutionManager:getDesignHeight()
    for i=1, nums do
        local index = (i-1) - nums/2 + 0.5
        local richTextObj = richTexts[i].text

        local group = richTexts[i].group
        runningScene:addTextSummary(richTextObj)
        local offsetX = self._startPos.x
        local offsetY = self._startPos.y

        local dstPos = cc.p(width/2+offsetX, height/2 + offsetY - TEXT_LINE_INTERVAL * index) -- 40表示间隙
        dstPos.y = dstPos.y + self._allOffsetY
        local startPos = cc.p(dstPos.x,dstPos.y - conH)

        richTextObj:setPosition(startPos)
        richTextObj:setScale(0.3)
        richTextObj:setOpacity(0)
        richTextObj:setVisible(false)

        if(group ~= tempGroup)then
            groups[#groups + 1] = {}
            tempGroup = group
        end
        table.insert(groups[#groups],{text=richTextObj,dstPos = dstPos})
    end
    return groups
end


function PromptTextSummary:_doTextOutAnimations(richTexts,callback)
    for i=1,#richTexts do
        local text = richTexts[i].text
        local endPos = self._endPos
        local finishCallback = richTexts[i].finishCallback
        local spawn = nil
        local action1 = nil
        local action2 = nil
        local action3 = nil
        if(endPos ~= nil)then
            endPos.y = endPos.y - self._index*TEXT_LINE_INTERVAL
            action1 = cc.ScaleTo:create(self._outDuration,0.3)
            action2 = cc.MoveTo:create(self._outDuration,endPos)
            action3 = cc.FadeOut:create(self._outDuration)
            spawn = cc.Spawn:create(action1,action2,action3)
        else
            action1 = cc.ScaleTo:create(self._outDuration,0.3)
            action2 = cc.FadeOut:create(self._outDuration)
            spawn = cc.Spawn:create(action1,action2)
        end

        local finishCallback = nil
        if i == #richTexts then
            finishCallback = self._finishCallback
        end

        local seq = cc.Sequence:create(cc.DelayTime:create(self._stayDuration),spawn,cc.CallFunc:create(function(node,params)
            if(callback ~= nil and type(callback) == "function")then
                callback()
            end
            node:removeFromParent(true)
        end),cc.CallFunc:create( function() 
                if finishCallback then 
                    finishCallback() 
                end 
            end ))
        text:runAction(seq)
    end
end


function PromptTextSummary:_doTextInAnimations(richTexts,groups)

    local groupItems = groups[self._index]
    local len = #groupItems
    for i=1,len do
        local text = groupItems[i].text
        local dstPos = groupItems[i].dstPos

        local action1 = cc.ScaleTo:create(self._showDuration,1)
        local action2 = cc.FadeTo:create(self._showDuration,255)
        local spawn = cc.Spawn:create(action1,action2)
        spawn = cc.EaseExponentialOut:create(spawn)

        local move = nil
        if(self._lastIndex > 1)then
            move = cc.MoveTo:create(self._moveDuration,dstPos)
            move = cc.EaseExponentialOut:create(move)
        else
            move = cc.CallFunc:create(function()end)
        end

        local seq = cc.Sequence:create(spawn,move,cc.CallFunc:create(function()
            if(i == len and self._index < self._lastIndex)then
                self._index = self._index + 1
                self:_doTextInAnimations(richTexts,groups)
            elseif(i == len and self._index >= self._lastIndex)then
                self:_doTextOutAnimations(richTexts)
            end
        end))
        text:runAction(seq)
        text:setVisible(true)
    end

end




function PromptTextSummary:show( params,  extParams)
    local height = math.min(640, display.height)
    local endY = height*0.5
    if params == nil or #params == 0 then return endY end
    extParams = extParams or {}
    self._allOffsetY = (extParams ~= nil and extParams.allOffsetY ~= nil) and extParams.allOffsetY or 100
    self._showDuration = (extParams ~= nil and extParams.showDuration ~= nil) and extParams.showDuration or 0.3
    self._moveDuration = (extParams ~= nil and extParams.moveDuration ~= nil) and extParams.moveDuration or 0.3
    self._stayDuration = (extParams ~= nil and extParams.stayDuration ~= nil) and extParams.stayDuration or 0.5
    self._outDuration = (extParams ~= nil and extParams.outDuration ~= nil) and extParams.outDuration or 0.35 
    
    self._startPos = extParams.startPosition or cc.p(0,0)
    self._endPos  = extParams.dstPosition or nil
    self._finishCallback = extParams.finishCallback or nil

    local richTexts = self:_getRichText(params)

    local nums = #richTexts
    endY = height*0.5 + nums*40/2 + self._allOffsetY

    --分组
    local groups = self:_arrageTexts(richTexts)
    dump(groups)
    -- 统一显示
    
    ----进入效果

    local index = 1
    self._lastIndex = #groups
   

    self:_doTextInAnimations(richTexts,groups)
    
    return endY
end


return PromptTextSummary