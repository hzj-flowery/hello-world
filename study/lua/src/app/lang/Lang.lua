-- Lang
-- 用于定义游戏中显示用的文本

local Lang = {}

local _templates = import(".LangTemplate")

-- 获取文本
function Lang.get(key, values)

    local tmpl = _templates[key]
    if not tmpl then
        return key  -- 直接返回key作为默认值，目的是直接显示此key来表示这个key找不到值
    end

    if values ~= nil then
        --replace vars in tmpl
        for k,v in pairs(values) do
            v = string.gsub(v, "%%", "____")  ---先把%换成其他的。
            tmpl = string.gsub(tmpl, "#" .. k .. "#", v)
            tmpl = string.gsub(tmpl, "____", "%%")
	    end
    end
    
    return tmpl
end

--直接传入文字，获得格式化文本
function Lang.getTxt(str,values)
    local tmpl = str;

    if values ~= nil then
        --replace vars in tmpl
        for k,v in pairs(values) do
            tmpl = string.gsub(tmpl, "#" .. k .. "#", v)            
        end
    end

    return tmpl
end

function Lang.getTxtWithMark(str,values,mark)
    local tmpl = str;

    if values ~= nil then
        --replace vars in tmpl
        for k,v in pairs(values) do
            tmpl = string.gsub(tmpl, mark .. k .. mark, v)            
        end
    end

    return tmpl
end

--传入表结构的文字，获得表结构的格式化文本
function Lang.getTableTxt(table, values)
    local tmpl = table

    local function formatFunc(param)
        for k, v in pairs(param) do
            if type(v) == "string" then
                param[k] = Lang.getTxt(v, values)
            elseif type(v) == "table" then
                formatFunc(v)
            end
        end
    end

    if values ~= nil then
        formatFunc(tmpl)
    end

    return tmpl
end

return Lang

