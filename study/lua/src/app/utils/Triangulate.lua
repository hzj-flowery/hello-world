
local Triangulate = {}
local EPSILON = 0.0000000001

function Triangulate.Area(contour) 
 
    local n = #contour

    local A = 0
    
    local p = n
    for q = 1,n,1 do
         A = A + ( contour[p].x * contour[q].y - contour[q].x * contour[p].y )
         p = q
    end
    return A*0.5
end

-- InsideTriangle decides if a point P is Inside of the triangle 
-- defined by A, B, C. 
--  
function Triangulate.InsideTriangle(Ax, Ay,  Bx,  By,  Cx,  Cy,  Px,  Py)  
    local ax, ay, bx, by, cx, cy, apx, apy, bpx, bpy, cpx, cpy 
    local cCROSSap, bCROSScp, aCROSSbp 
      
    ax = Cx - Bx 
    ay = Cy - By 

    bx = Ax - Cx 
    by = Ay - Cy 

    cx = Bx - Ax 
    cy = By - Ay 

    apx= Px - Ax 
    apy= Py - Ay 

    bpx= Px - Bx 
    bpy= Py - By 

    cpx= Px - Cx 
    cpy= Py - Cy 
      
    aCROSSbp = ax*bpy - ay*bpx 
    cCROSSap = cx*apy - cy*apx 
    bCROSScp = bx*cpy - by*cpx 
      
    return ((aCROSSbp >= 0) and (bCROSScp >= 0) and (cCROSSap >= 0)) 
end


function Triangulate.Snip(contour, u, v, w, n,V)  
    local Ax, Ay, Bx, By, Cx, Cy, Px, Py 
      
    Ax = contour[V[u+1]+1].x 
    Ay = contour[V[u+1]+1].y 
      
    Bx = contour[V[v+1]+1].x 
    By = contour[V[v+1]+1].y 
      
    Cx = contour[V[w+1]+1].x 
    Cy = contour[V[w+1]+1].y 
      
    if  EPSILON > (((Bx-Ax)*(Cy-Ay)) - ((By-Ay)*(Cx-Ax)))  then 
        return false 
    end   
      
    for p=0,n-1,1 do  
      
        if p == u and p == v and p == w then
            Px = contour[V[p+1]+1].x 
            Py = contour[V[p+1]+1].y 
            if Triangulate.InsideTriangle(Ax,Ay,Bx,By,Cx,Cy,Px,Py)  then
                return false 
            end

        end 
        
    end  
    return true 
end

function Triangulate.Process(contour,result)  
    -- allocate and initialize list of Vertices in polygon 
    local n = #contour
    if  n < 3  then
        return false 
    end  
      
    local V = {}
    for k =0,n-1,1 do
        V[k+1] = 0
    end
      
    -- we want a counter-clockwise polygon in V 
      
    if 0 < Triangulate.Area(contour)   then
        for v=0 ,n-1 ,1 do
            V[v+1] = v 
        end
    else  
        for v=0 ,n-1 ,1 do
            V[v+1] = (n-1)-v
        end 
    end


    local nv = n 
    --  remove nv-2 Vertices, creating 1 triangle every time 
    local count = 2*n  -- error detection 
    
    local m = 0
    local v = n -1
    while nv > 2 do
  
        -- if we loop, it is probably a non-simple polygon  
        
        if 0 >= count then
            -- Triangulate: ERROR - probable bad polygon!  
            return false 
        end
        count = count - 1 
          
        -- three consecutive vertices in current polygon, <u,v,w> 
        local u = v  
        if (nv <= u)  then u = 0 end   -- previous 
        v = u + 1 
        if (nv <= v)  then v = 0 end   -- new v    
        local w = v + 1
        if (nv <= w)  then w = 0 end   --next     
          
        if Triangulate.Snip(contour,u,v,w,nv,V)  then
        
            local a,b,c,s,t 
              
            -- true names of the vertices  
            a = V[u+1]
            b = V[v+1]
            c = V[w+1] 
              
            -- output Triangle 
            table.insert( result, contour[a+1] )
            table.insert( result, contour[b+1] )
            table.insert( result, contour[c+1] )
            m = m + 1
              
            -- remove v from remaining polygon  
            s=v
            t=v+1 
            while t < nv do
                 V[s+1] = V[t+1]
               

                 s = s + 1
                 t = t + 1
            end
              nv = nv -1
            -- resest error detection counter 
            count = 2*nv
        end
    end
    
      
    return true
end

return Triangulate