export class Triangulate {
    public static readonly EPSILON = 1e-10;
    public static Area = function (contour) {
        var n = contour.length;
        var A = 0;
        var p = n-1;
        for (var q = 0; q < n; q += 1) {
            A = A + (contour[p].x * contour[q].y - contour[q].x * contour[p].y);
            p = q;
        }
        return A * 0.5;
    };
    public static InsideTriangle = function (Ax, Ay, Bx, By, Cx, Cy, Px, Py) {
        var ax, ay, bx, by, cx, cy, apx, apy, bpx, bpy, cpx, cpy;
        var cCROSSap, bCROSScp, aCROSSbp;
        ax = Cx - Bx;
        ay = Cy - By;
        bx = Ax - Cx;
        by = Ay - Cy;
        cx = Bx - Ax;
        cy = By - Ay;
        apx = Px - Ax;
        apy = Py - Ay;
        bpx = Px - Bx;
        bpy = Py - By;
        cpx = Px - Cx;
        cpy = Py - Cy;
        aCROSSbp = ax * bpy - ay * bpx;
        cCROSSap = cx * apy - cy * apx;
        bCROSScp = bx * cpy - by * cpx;
        return aCROSSbp >= 0 && bCROSScp >= 0 && cCROSSap >= 0;
    };
    public static Snip = function (contour, u, v, w, n, V) {
        var Ax, Ay, Bx, By, Cx, Cy, Px, Py;
        Ax = contour[V[u]].x;
        Ay = contour[V[u]].y;
        Bx = contour[V[v]].x;
        By = contour[V[v]].y;
        Cx = contour[V[w]].x;
        Cy = contour[V[w]].y;
        if (Triangulate.EPSILON > (Bx - Ax) * (Cy - Ay) - (By - Ay) * (Cx - Ax)) {
            return false;
        }
        for (var p = 0; p <= n - 1; p += 1) {
            if (p == u && p == v && p == w) {
                Px = contour[V[p]].x;
                Py = contour[V[p]].y;
                if (Triangulate.InsideTriangle(Ax, Ay, Bx, By, Cx, Cy, Px, Py)) {
                    return false;
                }
            }
        }
        return true;
    };
    public static Process = function (contour, result) {
        var n = contour.length;
        if (n < 3) {
            return false;
        }
        var V = {};
        for (var k = 0; k <= n - 1; k += 1) {
            V[k] = 0;
        }
        if (0 < Triangulate.Area(contour)) {
            for (var v = 0; v <= n - 1; v += 1) {
                V[v] = v;
            }
        } else {
            for (var v = 0; v <= n - 1; v += 1) {
                V[v] = n - 1 - v;
            }
        }
        var nv = n;
        var count = 2 * n;
        var m = 0;
        var v = n - 1;
        while (nv > 2) {
            if (0 >= count) {
                return false;
            }
            count = count - 1;
            var u = v;
            if (nv <= u) {
                u = 0;
            }
            v = u + 1;
            if (nv <= v) {
                v = 0;
            }
            var w = v + 1;
            if (nv <= w) {
                w = 0;
            }
            if (Triangulate.Snip(contour, u, v, w, nv, V)) {
                var a, b, c, s, t;
                a = V[u];
                b = V[v];
                c = V[w];
                result.push(contour[a]);
                result.push(contour[b]);
                result.push(contour[c]);
                m = m;
                s = v;
                t = v;
                while (t < nv) {
                    V[s + 1] = V[t + 1];
                    s = s + 1;
                    t = t + 1;
                }
                nv = nv - 1;
                count = 2 * nv;
            }
        }
        return true;
    };
}