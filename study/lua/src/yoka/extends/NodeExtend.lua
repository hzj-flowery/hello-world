--[====================[

	针对 cc.Node 的扩展

	主要提供一些通用的updateXXX类型的方法，用来更新各种类型的数据

]====================]

local c = cc
local Node = c.Node

local UIHelper = ccui.Helper

--local AudioWrapper = require "app.audio.AudioWrapper"
--local SoundButtonWrapper = AudioWrapper.SoundButtonWrapper

-- 工具方法，用来unpack可变参数

local function _unpack(params, index)

	if #params == 0 then return end

	index = index or 0
	index = index + 1
	if index == #params then
		return params[index]
	else
		return params[index], _unpack(params, index)
	end
end

--[====================[

	根据名字获取组件

]====================]

function Node:getSubNodeByName(name)
    
	assert(type(name) == "string", "Error: node name must be string !")

	local node = UIHelper:seekNodeByName(self, name)
	assert(node, "Could not find the node with name: "..name)

	return node
end

function Node:updateNodeByName(name, params)

	return self:updateNode(self:getSubNodeByName(name), params)

end

function Node:updateNode(node, params)

	-- -- 以函数名为键直接设置内容，比定向指向要更新的内容要方便
	-- for i=1, #params do

	-- 	local param = params[i]

	-- 	assert(node[param.func], "Could not find the key ("..tostring(param.func)..") with node named: "..node:getName())

	-- 	if type(node[param.func]) == "function" and param.value ~= nil then
	-- 		if type(param.value) == "table" then
	-- 			node[param.func](node, _unpack(param.value))
	-- 		else
	-- 			node[param.func](node, param.value)
	-- 		end
	-- 	else
	-- 		print("Warning: function "..param.func.." is not a function and "..type(node[param.func]))
	-- 	end
	-- end

	if params.visible ~= nil then
		node:setVisible(params.visible)
	end

	return node

end

--[====================[

	通用指定名字name更新Label

	@params可以是单个文本（string），或者一个参数列表（指定更新具体内容）

]====================]

function Node:updateLabel(name, params)
    
    assert(params, string.format("Invalid params: %s with name: %s", tostring(params), name))

    local label = self:getSubNodeByName(name)

    -- 兼容直接设置文本内容
    if type(params) == "string" or type(params) == "number" then
    	label:setString(params)
    	return label
    end
    
    if params.position ~= nil then
    	label:setPosition(params.position)
    end

    if params.outlineColor ~= nil then
        label:enableOutline(params.outlineColor, params.outlineSize or 2)
    else
        if label.disableEffect then
            label:disableEffect(cc.LabelEffect.OUTLINE)
        end
    end
    
    if params.color ~= nil then
        label:setColor(params.color)
    end

    if params.textColor ~= nil then
        label:setTextColor(params.textColor)
    end
    
    if params.text ~= nil then
        label:setString(params.text)
    end
    
    if params.fontSize and type(params.fontSize) == "number" then
        label:setFontSize(params.fontSize)
    end

    if params.visible ~= nil then
        label:setVisible(checkbool(params.visible))
    end

    if params.ignoreContentSize ~= nil then
    	label:ignoreContentAdaptWithSize(params.ignoreContentSize)
    end

    if params.enableShadow ~= nil then
        label:enableShadow(params.enableShadow)
    end

    return label

end

--[====================[

	通用指定名字name更新fnt label

	@params可以是单个文本（string），或者一个参数列表（指定更新具体内容）

]====================]

function Node:updateFntLabel(name, params)
    
    assert(params, string.format("Invalid params: %s with name: %s", tostring(params), name))

    local label = self:getSubNodeByName(name)

    -- 兼容直接设置文本内容
    if type(params) == "string" or type(params) == "number" then
    	label:setString(params)
    	return label
    end

    if params.color ~= nil then
        label:setColor(params.color)
    end
    
    if params.text ~= nil then
        label:setString(params.text)
    end
    
    if params.visible ~= nil then
        label:setVisible(checkbool(params.visible))
    end

    return label

end

--[====================[

	通用指定名字name更新Image

	@params是一个参数列表（指定更新具体内容）

]====================]

function Node:updateImageView(name, params)

    assert(params, string.format("Invalid params: %s with name: %s", tostring(params), name))

    local img = self:getSubNodeByName(name)

    if type(params) == "string" then
    	img:ignoreContentAdaptWithSize(true)
    	img:loadTexture(params, ccui.TextureResType.localType)
    	return img
    end

    local boolIgnore = params.ignoreContentAdaptWithSize ~= false
    if params.texture ~= nil then
        local capInsets = img:getCapInsets()
    	img:ignoreContentAdaptWithSize(boolIgnore)
        img:loadTexture(params.texture, params.texType or ccui.TextureResType.localType)
        img:setCapInsets(capInsets)
    end
    
    if params.visible ~= nil then
        img:setVisible(checkbool(params.visible))
    end

    -- if params.ignoreContentAdaptWithSize ~= nil then
    -- 	img:ignoreContentAdaptWithSize()
    -- end
    
    if params.position ~= nil then
    	img:setPosition(params.position)
    end

    if params.callback ~= nil then
    	img:setTouchEnabled(true)
    	img:addClickEventListener(function(...)
    		params.callback(...)
    	end)
    end

    if params.scale ~= nil then
    	img:setScale(params.scale)
    end

    if params.color ~= nil then
        img:setColor(params.color)
    end

    if params.opacity ~= nil then
        img:setOpacity(params.opacity)
    end

    if params.size ~= nil then
        img:setContentSize(params.size)
    end

    return img

end

--[====================[

	通用指定名字name更新Panel

	@params是一个参数列表（指定更新具体内容）

]====================]

function Node:updatePanel(name, params)
    
    assert(params, string.format("Invalid params: %s with name: %s", tostring(params), name))

    local panel = self:getSubNodeByName(name)

    if params.visible ~= nil then
        panel:setVisible(checkbool(params.visible))
    end

    return panel
    
end

--[====================[

	通用指定名字name更新Button

	@params可以是function, 或者一个参数列表（指定更新具体内容）

]====================]

function Node:updateButton(name, params ,delay)

    assert(params, string.format("Invalid params: %s with name: %s", tostring(params), name))

	local button = self:getSubNodeByName(name)

	-- 兼容直接绑定按钮响应
	if type(params) == "function" then
        if delay and delay < 0 then
	        button:addClickEventListener(function(sender)
                params(sender)
            end)
        else
            button:addClickEventListenerEx(function(sender)
                params(sender)
            end,true,nil,delay)
        end

        return button

    elseif type(params) == "string" or type(params) == "number" then
    	button:setTitleText(params)
    	return button
	end
	
	if params.text ~= nil and type(params.text) == "string" or type(params.text) == "number" then
		button:setTitleText(params.text)
	end

	if params.enabled ~= nil then
		button:setTouchEnabled(params.enabled)
        --setBright(false) 会有内存泄露问题 这里也不需要用到这个方法
		-- button:setBright(params.enabled)
	end

	if params.outlineColor ~= nil then
		button:getTitleRenderer():enableOutline(params.outlineColor, params.outlineSize or 1)
	end

    if params.titleColor ~= nil then
        button:getTitleRenderer():setColor(params.titleColor)
    end

	if params.callback ~= nil then
        if delay and delay < 0 then
	        button:addClickEventListener(function(sender)
                params(sender)
            end)
        else
            button:addClickEventListenerEx(function(sender)
                params(sender)
            end,true,nil,delay)
        end
	end

	if params.visible ~= nil then
		button:setVisible(checkbool(params.visible))
	end

	if params.pressedActionEnabled ~= nil then
		button:setPressedActionEnabled(params.pressedActionEnabled)
	end

    if params.normalTexture ~= nil then
        button:loadTextureNormal(params.normalTexture)
    end

	return button

end

--[====================[

	通用指定名字name更新CheckBox

	@params可以是function, 或者一个参数列表（指定更新具体内容）

]====================]

function Node:updateCheckBox(name, params)

    assert(params, string.format("Invalid params: %s with name: %s", tostring(params), name))
    
	local checkBox = self:getSubNodeByName(name)

	if type(params) == "function" then
		checkBox:addEventListener((params))
		return checkBox
	end

	if params.callback ~= nil then
		checkBox:addEventListener((params.callback))
	end

    if params.selected ~= nil then
        checkBox:setSelected(checkbool(params.selected))
    end
	
	return checkBox

end
