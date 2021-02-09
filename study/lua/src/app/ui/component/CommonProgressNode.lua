
local CommonProgressNode = class("CommonProgressNode")

local EXPORTED_METHODS = {
    "setPercent",
    "showDivider",
    "setProgressValue",
    "showLightLine",
}

CommonProgressNode.PROGRESS_TYPE_LOADBAR = 1
CommonProgressNode.PROGRESS_TYPE_IMG = 2


function CommonProgressNode:ctor()
    self._imgProgressSize = cc.size(0,0)
   
    self._dividerNodeArr = {}
end

function CommonProgressNode:_init()
	self._imageProgress = ccui.Helper:seekNodeByName(self._target, "ImageProgress")
    self._textProgress = ccui.Helper:seekNodeByName(self._target, "TextProgress")
    self._loadingBar = ccui.Helper:seekNodeByName(self._target, "LoadingBar")
    self._imageDivider = ccui.Helper:seekNodeByName(self._target, "ImageDivider")

    if self._textProgress then
          self._textProgress:setLocalZOrder(1)
    end
  
    
    if self._imageProgress then
        self._imgProgressSize = self._imageProgress:getContentSize()
    else
       self._imgProgressSize = self._loadingBar:getContentSize()     
    end

    self._dividerNodeArr[1] = self._imageDivider

    self:showDivider(false)
end

function CommonProgressNode:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonProgressNode:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonProgressNode:setPercent(currValue,maxValue,percentType)
    local percent = currValue >= maxValue and 1 or (currValue/ maxValue)
    percentType = percentType or CommonProgressNode.PROGRESS_TYPE_IMG
    if percentType == CommonProgressNode.PROGRESS_TYPE_LOADBAR and self._loadingBar then
        self._loadingBar:setPercent(math.floor(percent * 100))
    elseif percentType == CommonProgressNode.PROGRESS_TYPE_IMG and self._imageProgress then    
        local size = cc.size( self._imgProgressSize.width * percent ,  
            self._imgProgressSize.height)
        self._imageProgress:setContentSize(size)

        self:setProgressValue(currValue,maxValue)
    end
    

end

function CommonProgressNode:showDivider(needShow,maxDividerNum,currValue,maxValue)
    if not self._imageDivider then
        return    
    end
    for k,v in ipairs(self._dividerNodeArr) do
        v:setVisible(false)
    end

    if needShow == false or maxDividerNum <= 0 or maxValue <= 0  then
        return
    end

    local oldDiverNum = #self._dividerNodeArr
    local needDividerNum =  math.ceil(maxDividerNum * currValue / maxValue)-1
    if oldDiverNum < needDividerNum then
        for i = 1,needDividerNum - oldDiverNum,1 do
             local widget = self._imageDivider:clone()
             self._target:addChild(widget)
             table.insert( self._dividerNodeArr, widget)
        end
    end
    local dividerGap = self._imgProgressSize.width / maxDividerNum
    for i = 1 ,needDividerNum,1 do
        local node = self._dividerNodeArr[i]
        node:setVisible(true)
        node:setPositionX(dividerGap * i)
    end 
end

function CommonProgressNode:showLightLine(needShow,currValue,maxValue,minShowLightDis)
    if not self._imageDivider then
        return    
    end
    if maxValue <= 0 or not needShow then
        self._imageDivider:setVisible(false)
        return
    end
  
    local lightPos = self._imgProgressSize.width *  currValue / maxValue 
    local size = self._imageDivider:getContentSize()
    minShowLightDis = minShowLightDis or size.width * 0.8
    logWarn(lightPos.."_____________==="..minShowLightDis)
    if lightPos < minShowLightDis or lightPos > self._imgProgressSize.width - minShowLightDis then
         self._imageDivider:setVisible(false)
         return
    end
    logWarn("_____________==="..minShowLightDis)
    self._imageDivider:setVisible(needShow)
    self._imageDivider:setPositionX(lightPos)
end


function CommonProgressNode:setProgressValue(currValue,maxValue)
    if not self._textProgress then
        return
    end 
    self._textProgress:setVisible(true)
    self._textProgress:setString(Lang.get("common_progress",{curr = currValue, max = maxValue}))
end

return CommonProgressNode