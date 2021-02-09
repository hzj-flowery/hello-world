-- 
-- Author: JerryHe
-- Date: 2019-02-20
-- Desc: 战报使用，语言文本替换

local ReportLang = {}

local _templates = import(".ReportLangTemplate")

-- 获取文本
function ReportLang.get(key, values)

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
function ReportLang.getTxt(str,values)
    local tmpl = str;

    if values ~= nil then
        --replace vars in tmpl
        for k,v in pairs(values) do
            tmpl = string.gsub(tmpl, "#" .. k .. "#", v)            
        end
    end

    return tmpl
end

function ReportLang.getTxtWithMark(str,values,mark)
    local tmpl = str;

    if values ~= nil then
        --replace vars in tmpl
        for k,v in pairs(values) do
            tmpl = string.gsub(tmpl, mark .. k .. mark, v)            
        end
    end

    return tmpl
end

return ReportLang

