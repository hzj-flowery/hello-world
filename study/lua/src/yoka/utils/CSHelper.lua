local CSHelper = {}

--
function CSHelper.createResourceNode(root, resourceFile)
    if root._resourceNode then
        root._resourceNode:removeSelf()
        root._resourceNode = nil
    end

    -- create
    -- dump(resourceFile.file)
    local nodes = cc.CSLoader:createNodeAndBind(resourceFile.file)
    for k,v in pairs(nodes) do
        local classData = v:getComponent("ComClassData")
        local className = classData:getClassName()
        --print(k .. " is " .. className)
        if cc.isRegister(className) then
            print(k .. " bind " .. className)
            cc.bind(v, className)
        end
        root[k] = v
    end

    assert(root._resourceNode, string.format("CSHelper.createResourceNode() - load resouce node from file \"%s\" failed", resourceFile.file))
    root:addChild(root._resourceNode)

    -- resize
    if resourceFile.size then
        root._resourceNode:setContentSize(resourceFile.size[1], resourceFile.size[2])
        G_ResolutionManager:doLayout(root._panelDesign)
        ccui.Helper:doLayout(root._resourceNode)
    end

    -- binding
    if resourceFile.binding then
        local binding = resourceFile.binding
        for varname, nodeBinding in pairs(binding) do
            local node = root[varname]
            for _, event in ipairs(nodeBinding.events or {}) do
                if event.event == "touch" then
                    node:addClickEventListenerEx(handler(root, root[event.method]))
                end
            end
        end
    end
end


--调用csb的加载接口，如果该node有对应的Component，则会自动绑定
function CSHelper.loadResourceNode( file )
      -- create
    local nodes = cc.CSLoader:createNodeAndBind(file)
    --注意，CommonNode里不能有“_”的变量名
    for k,v in pairs(nodes) do
        local classData = v:getComponent("ComClassData")
        local className = classData:getClassName()
        --print(k .. " is " .. className)
        if cc.isRegister(className) then
            cc.bind(v, className)
        end
    end

    assert(nodes._resourceNode, string.format("CSHelper.loadResourceNode() - load resouce node from file \"%s\" failed", file))
    return nodes._resourceNode
end

return CSHelper