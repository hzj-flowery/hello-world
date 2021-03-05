local ListViewCellBase = class("ListViewCellBase", ccui.Widget)
local CSHelper = require("yoka.utils.CSHelper")

function ListViewCellBase:ctor(resource)
    --self:enableNodeEvents()
    -- check CSB resource file
    self._idx = 0
    if resource then
        CSHelper.createResourceNode(self, resource)
    end

    if self.onCreate then self:onCreate() end
end

--
function ListViewCellBase:getName()
    return self.__cname
end

--
function ListViewCellBase:getResourceNode()
    return self._resourceNode
end

--
function ListViewCellBase:setCustomCallback(customCallback)
    self._customCallback = customCallback
end

--
function ListViewCellBase:dispatchCustomCallback(...)
    if self._customCallback then
        self._customCallback(self:getTag(), ...)
    end
end

function ListViewCellBase:reset()

end

function ListViewCellBase:setIdx(id)
    self._idx = id
end

function ListViewCellBase:getIdx()
    return self._idx
end

return ListViewCellBase