(function() {
    'use strict';
    var $ = Math.sin,
    ee = Math.cos,
    te = Math.PI,
    re = Math.sqrt;
    function e(e, t, r) {
        var i = new le(3);
        return e && (i[0] = e),
        t && (i[1] = t),
        r && (i[2] = r),
        i
    }
    function t(e, t, r) {
        return r = r || new le(3),
        r[0] = e[0] - t[0],
        r[1] = e[1] - t[1],
        r[2] = e[2] - t[2],
        r
    }
    function r(e, t, r) {
        return r = r || new le(3),
        r[0] = e[0] * t,
        r[1] = e[1] * t,
        r[2] = e[2] * t,
        r
    }
    function i(e, t, r) {
        r = r || new le(3);
        var i = e[2] * t[0] - e[0] * t[2],
        a = e[0] * t[1] - e[1] * t[0];
        return r[0] = e[1] * t[2] - e[2] * t[1],
        r[1] = i,
        r[2] = a,
        r
    }
    function a(e, t) {
        return e[0] * t[0] + e[1] * t[1] + e[2] * t[2]
    }
    function o(e) {
        return re(e[0] * e[0] + e[1] * e[1] + e[2] * e[2])
    }
    function n(e, t) {
        t = t || new le(3);
        var r = e[0] * e[0] + e[1] * e[1] + e[2] * e[2],
        i = re(r);
        return 1e-5 < i ? (t[0] = e[0] / i, t[1] = e[1] / i, t[2] = e[2] / i) : (t[0] = 0, t[1] = 0, t[2] = 0),
        t
    }
    function s(e, t) {
        return t = t || new le(3),
        t[0] = e[0],
        t[1] = e[1],
        t[2] = e[2],
        t
    }
    function d(e) {
        return e = e || new fe(16),
        e[0] = 1,
        e[1] = 0,
        e[2] = 0,
        e[3] = 0,
        e[4] = 0,
        e[5] = 1,
        e[6] = 0,
        e[7] = 0,
        e[8] = 0,
        e[9] = 0,
        e[10] = 1,
        e[11] = 0,
        e[12] = 0,
        e[13] = 0,
        e[14] = 0,
        e[15] = 1,
        e
    }
    function l(e, r) {
        if (r = r || new fe(16), r === e) {
            var i;
            return i = e[1],
            e[1] = e[4],
            e[4] = i,
            i = e[2],
            e[2] = e[8],
            e[8] = i,
            i = e[3],
            e[3] = e[12],
            e[12] = i,
            i = e[6],
            e[6] = e[9],
            e[9] = i,
            i = e[7],
            e[7] = e[13],
            e[13] = i,
            i = e[11],
            e[11] = e[14],
            e[14] = i,
            r
        }
        var a = e[0],
        o = e[1],
        n = e[2],
        s = e[3],
        d = e[4],
        l = e[5],
        f = e[6],
        u = e[7],
        m = e[8],
        c = e[9],
        v = e[10],
        h = e[11],
        g = e[12],
        x = e[13],
        b = e[14],
        p = e[15];
        return r[0] = a,
        r[1] = d,
        r[2] = m,
        r[3] = g,
        r[4] = o,
        r[5] = l,
        r[6] = c,
        r[7] = x,
        r[8] = n,
        r[9] = f,
        r[10] = v,
        r[11] = b,
        r[12] = s,
        r[13] = u,
        r[14] = h,
        r[15] = p,
        r
    }
    function f(e, t) {
        t = t || new fe(16);
        var r = e[0],
        i = e[1],
        a = e[2],
        o = e[3],
        n = e[4],
        s = e[5],
        l = e[6],
        f = e[7],
        u = e[8],
        m = e[9],
        c = e[10],
        v = e[11],
        h = e[12],
        g = e[13],
        x = e[14],
        b = e[15],
        p = c * b,
        y = x * v,
        _ = l * b,
        T = x * f,
        z = l * v,
        w = c * f,
        E = a * b,
        S = x * o,
        P = a * v,
        A = c * o,
        L = a * f,
        M = l * o,
        D = u * g,
        B = h * m,
        F = n * g,
        C = h * s,
        I = n * m,
        k = u * s,
        R = r * g,
        O = h * i,
        G = r * m,
        W = u * i,
        V = r * s,
        X = n * i,
        H = p * s + T * m + z * g - (y * s + _ * m + w * g),
        N = y * i + E * m + A * g - (p * i + S * m + P * g),
        j = _ * i + S * s + L * g - (T * i + E * s + M * g),
        U = w * i + P * s + M * m - (z * i + A * s + L * m),
        Y = 1 / (r * H + n * N + u * j + h * U);
        return t[0] = Y * H,
        t[1] = Y * N,
        t[2] = Y * j,
        t[3] = Y * U,
        t[4] = Y * (y * n + _ * u + w * h - (p * n + T * u + z * h)),
        t[5] = Y * (p * r + S * u + P * h - (y * r + E * u + A * h)),
        t[6] = Y * (T * r + E * n + M * h - (_ * r + S * n + L * h)),
        t[7] = Y * (z * r + A * n + L * u - (w * r + P * n + M * u)),
        t[8] = Y * (D * f + C * v + I * b - (B * f + F * v + k * b)),
        t[9] = Y * (B * o + R * v + W * b - (D * o + O * v + G * b)),
        t[10] = Y * (F * o + O * f + V * b - (C * o + R * f + X * b)),
        t[11] = Y * (k * o + G * f + X * v - (I * o + W * f + V * v)),
        t[12] = Y * (F * c + k * x + B * l - (I * x + D * l + C * c)),
        t[13] = Y * (G * x + D * a + O * c - (R * c + W * x + B * a)),
        t[14] = Y * (R * l + X * x + C * a - (V * x + F * a + O * l)),
        t[15] = Y * (V * c + I * a + W * l - (G * l + X * c + k * a)),
        t
    }
    function u(e, t, r) {
        r = r || new fe(16);
        var i = e[0],
        a = e[1],
        o = e[2],
        n = e[3],
        s = e[4],
        d = e[5],
        l = e[6],
        f = e[7],
        u = e[8],
        m = e[9],
        c = e[10],
        v = e[11],
        h = e[12],
        g = e[13],
        x = e[14],
        b = e[15],
        p = t[0],
        y = t[1],
        _ = t[2],
        T = t[3],
        z = t[4],
        w = t[5],
        E = t[6],
        S = t[7],
        P = t[8],
        A = t[9],
        L = t[10],
        M = t[11],
        D = t[12],
        B = t[13],
        F = t[14],
        C = t[15];
        return r[0] = i * p + s * y + u * _ + h * T,
        r[1] = a * p + d * y + m * _ + g * T,
        r[2] = o * p + l * y + c * _ + x * T,
        r[3] = n * p + f * y + v * _ + b * T,
        r[4] = i * z + s * w + u * E + h * S,
        r[5] = a * z + d * w + m * E + g * S,
        r[6] = o * z + l * w + c * E + x * S,
        r[7] = n * z + f * w + v * E + b * S,
        r[8] = i * P + s * A + u * L + h * M,
        r[9] = a * P + d * A + m * L + g * M,
        r[10] = o * P + l * A + c * L + x * M,
        r[11] = n * P + f * A + v * L + b * M,
        r[12] = i * D + s * B + u * F + h * C,
        r[13] = a * D + d * B + m * F + g * C,
        r[14] = o * D + l * B + c * F + x * C,
        r[15] = n * D + f * B + v * F + b * C,
        r
    }
    function m(e, t, r, i, a) {
        var o = Math.tan;
        a = a || new fe(16);
        var n = o(.5 * te - .5 * e),
        s = 1 / (r - i);
        return a[0] = n / t,
        a[1] = 0,
        a[2] = 0,
        a[3] = 0,
        a[4] = 0,
        a[5] = n,
        a[6] = 0,
        a[7] = 0,
        a[8] = 0,
        a[9] = 0,
        a[10] = (r + i) * s,
        a[11] = -1,
        a[12] = 0,
        a[13] = 0,
        a[14] = 2 * (r * i * s),
        a[15] = 0,
        a
    }
    function c(r, a, o, s) {
        return s = s || new fe(16),
        ie = ie || e(),
        ae = ae || e(),
        oe = oe || e(),
        n(t(r, a, oe), oe),
        n(i(o, oe, ie), ie),
        n(i(oe, ie, ae), ae),
        s[0] = ie[0],
        s[1] = ie[1],
        s[2] = ie[2],
        s[3] = 0,
        s[4] = ae[0],
        s[5] = ae[1],
        s[6] = ae[2],
        s[7] = 0,
        s[8] = oe[0],
        s[9] = oe[1],
        s[10] = oe[2],
        s[11] = 0,
        s[12] = r[0],
        s[13] = r[1],
        s[14] = r[2],
        s[15] = 1,
        s
    }
    function v(e, t) {
        return t = t || new fe(16),
        t[0] = 1,
        t[1] = 0,
        t[2] = 0,
        t[3] = 0,
        t[4] = 0,
        t[5] = 1,
        t[6] = 0,
        t[7] = 0,
        t[8] = 0,
        t[9] = 0,
        t[10] = 1,
        t[11] = 0,
        t[12] = e[0],
        t[13] = e[1],
        t[14] = e[2],
        t[15] = 1,
        t
    }
    function h(e, t) {
        t = t || new fe(16);
        var r = ee(e),
        i = $(e);
        return t[0] = 1,
        t[1] = 0,
        t[2] = 0,
        t[3] = 0,
        t[4] = 0,
        t[5] = r,
        t[6] = i,
        t[7] = 0,
        t[8] = 0,
        t[9] = -i,
        t[10] = r,
        t[11] = 0,
        t[12] = 0,
        t[13] = 0,
        t[14] = 0,
        t[15] = 1,
        t
    }
    function g(e, t) {
        t = t || new fe(16);
        var r = ee(e),
        i = $(e);
        return t[0] = r,
        t[1] = 0,
        t[2] = -i,
        t[3] = 0,
        t[4] = 0,
        t[5] = 1,
        t[6] = 0,
        t[7] = 0,
        t[8] = i,
        t[9] = 0,
        t[10] = r,
        t[11] = 0,
        t[12] = 0,
        t[13] = 0,
        t[14] = 0,
        t[15] = 1,
        t
    }
    function x(e, t, r) {
        r = r || new fe(16);
        var i = e[0],
        a = e[1],
        o = e[2],
        n = e[3],
        d = e[8],
        l = e[9],
        f = e[10],
        u = e[11],
        m = ee(t),
        c = $(t);
        return r[0] = m * i - c * d,
        r[1] = m * a - c * l,
        r[2] = m * o - c * f,
        r[3] = m * n - c * u,
        r[8] = m * d + c * i,
        r[9] = m * l + c * a,
        r[10] = m * f + c * o,
        r[11] = m * u + c * n,
        e !== r && (r[4] = e[4], r[5] = e[5], r[6] = e[6], r[7] = e[7], r[12] = e[12], r[13] = e[13], r[14] = e[14], r[15] = e[15]),
        r
    }
    function b(e, t, r, i) {
        i = i || new fe(16);
        var a = t[0],
        o = t[1],
        d = t[2],
        l = re(a * a + o * o + d * d);
        a /= l,
        o /= l,
        d /= l;
        var n = a * a,
        f = o * o,
        u = d * d,
        m = ee(r),
        c = $(r),
        s = 1 - m,
        v = n + (1 - n) * m,
        h = a * o * s + d * c,
        g = a * d * s - o * c,
        b = a * o * s - d * c,
        p = f + (1 - f) * m,
        _ = o * d * s + a * c,
        T = a * d * s + o * c,
        w = o * d * s - a * c,
        E = u + (1 - u) * m,
        S = e[0],
        P = e[1],
        A = e[2],
        L = e[3],
        M = e[4],
        D = e[5],
        B = e[6],
        F = e[7],
        C = e[8],
        I = e[9],
        k = e[10],
        R = e[11];
        return i[0] = v * S + h * M + g * C,
        i[1] = v * P + h * D + g * I,
        i[2] = v * A + h * B + g * k,
        i[3] = v * L + h * F + g * R,
        i[4] = b * S + p * M + _ * C,
        i[5] = b * P + p * D + _ * I,
        i[6] = b * A + p * B + _ * k,
        i[7] = b * L + p * F + _ * R,
        i[8] = T * S + w * M + E * C,
        i[9] = T * P + w * D + E * I,
        i[10] = T * A + w * B + E * k,
        i[11] = T * L + w * F + E * R,
        e !== i && (i[12] = e[12], i[13] = e[13], i[14] = e[14], i[15] = e[15]),
        i
    }
    function p(t, r, i) {
        i = i || e();
        var a = r[0],
        o = r[1],
        n = r[2],
        s = a * t[3] + o * t[7] + n * t[11] + t[15];
        return i[0] = (a * t[0] + o * t[4] + n * t[8] + t[12]) / s,
        i[1] = (a * t[1] + o * t[5] + n * t[9] + t[13]) / s,
        i[2] = (a * t[2] + o * t[6] + n * t[10] + t[14]) / s,
        i
    }
    function _(t, r, i) {
        i = i || e();
        var a = r[0],
        o = r[1],
        n = r[2];
        return i[0] = a * t[0] + o * t[4] + n * t[8],
        i[1] = a * t[1] + o * t[5] + n * t[9],
        i[2] = a * t[2] + o * t[6] + n * t[10],
        i
    }
    function T(e, t, r) {
        if (!e) throw new Error("canvas not exist");
        var i = e.getBoundingClientRect();
        return {
            x: (t - i.left) * (e.width / i.width),
            y: (r - i.top) * (e.height / i.height)
        }
    }
    function z(e, t) {
        var r = "mousewheel";
        try {
            document.createEvent("MouseScrollEvents"),
            r = "DOMMouseScroll"
        } catch(t) {}
        e.addEventListener(r,
        function(r) {
            if ("wheelDelta" in r) {
                var e = r.wheelDelta;
                window.opera && 10 > opera.version() && (e = -e),
                r.delta = Math.round(e) / 120
            } else "detail" in r && (r.wheelDelta = 40 * -r.detail, r.delta = r.wheelDelta / 120);
            t(r)
        },
        !1)
    }
    function w(e, t, r) {
        return t in e ? Object.defineProperty(e, t, {
            value: r,
            enumerable: !0,
            configurable: !0,
            writable: !0
        }) : e[t] = r,
        e
    }
    function E(e, r) {
        return de || (de = e.createTexture()),
        r instanceof de.constructor
    }
    function S(e) {
        return !! e.texStorage2D
    }
    function P(e) {
        var t = e.name;
        return t.startsWith("gl_") || t.startsWith("webgl_")
    }
    function A(e, t) {
        Ze(e, 0);
        var r = e.getExtension(t);
        if (r) {
            var i = {},
            a = $e.exec(t)[1];
            for (var o in r) {
                var n = r[o],
                s = "function" == typeof n,
                d = s ? a: "_" + a,
                l = o;
                o.endsWith(d) && (l = o.substring(0, o.length - d.length)),
                e[l] === void 0 ? s ? e[l] = function(e) {
                    return function() {
                        return e.apply(r, arguments)
                    }
                } (n) : (e[l] = n, i[l] = n) : !s && e[l] !== n && console.warn(l, e[l], n, o)
            }
            i.constructor = {
                name: r.constructor.name
            },
            Ze(i, 0)
        }
        return r
    }
    function L(e, t) {
        for (var r = 0; r < t.length; r++) A(e, t[r])
    }
    function M(e) {
        for (var t = arguments.length,
        r = Array(1 < t ? t - 1 : 0), i = 1; i < t; i++) r[i - 1] = arguments[i];
        var a = D(r);
        return B(e, a)
    }
    function D() {
        for (var e, t, r, i, a = [], o = arguments.length, n = Array(o), s = 0; s < o; s++) n[s] = arguments[s]; (n + "").replace(/[^\,\s]+/g,
        function(e) {
            e && a.push(e)
        });
        for (var d, l = 0,
        f = a; l < f.length; l++) {
            if (d = f[l], r = document.getElementById(d), !r) throw new Error("Can't find script element " + d);
            if (i = r.type, !i) throw new Error("Script element type undefined");
            0 <= i.indexOf("vert") && (e = r.text),
            0 <= i.indexOf("frag") && (t = r.text)
        }
        if (!e) throw new Error("VERTEX_SHADER String not exist");
        if (!t) throw new Error("FRAGMENT_SHADER String not exist");
        return [e, t]
    }
    function B(e) {
        for (var t = arguments.length,
        r = Array(1 < t ? t - 1 : 0), i = 1; i < t; i++) r[i - 1] = arguments[i];
        Array.isArray(r[0]) && (r = r[0]);
        var a = F(e, 35633, r[0]),
        o = F(e, 35632, r[1]);
        if (!a) throw new Error("VERTEX_SHADER not exist");
        if (!o) throw new Error("FRAGMENT_SHADER not exist");
        var n = e.createProgram();
        if (!n) throw new Error("Program not exist");
        e.attachShader(n, a),
        e.attachShader(n, o),
        e.linkProgram(n);
        var s = e.getProgramParameter(n, 35714);
        if (!s) {
            var d = e.getProgramInfoLog(n);
            throw e.deleteProgram(n),
            e.deleteShader(o),
            e.deleteShader(a),
            new Error("Failed to link program: " + d.toString())
        }
        return n
    }
    function F(e, t, r) {
        var i = e.createShader(t);
        if (!i) throw new Error("Unable to create shader");
        e.shaderSource(i, r),
        e.compileShader(i);
        var a = e.getShaderParameter(i, 35713);
        if (!a) {
            var o = e.getShaderInfoLog(i);
            throw e.deleteShader(i),
            new Error("Failed to compile shader: " + o.toString())
        }
        return i
    }
    function C(e) {
        for (var t = arguments.length,
        r = Array(1 < t ? t - 1 : 0), i = 1; i < t; i++) r[i - 1] = arguments[i];
        Array.isArray(r[0]) && (r = r[0]);
        var a = 0 < r[0].indexOf("{") ? B(e, r) : M(e, r),
        o = k(e, a),
        n = I(e, a);
        return {
            program: a,
            uniformSetters: o,
            attribSetters: n
        }
    }
    function I(e, t) {
        for (var r, a = {},
        o = e.getProgramParameter(t, 35721), n = 0; n < o; n++) if (r = e.getActiveAttrib(t, n), !P(r)) {
            var s = e.getAttribLocation(t, r.name),
            d = Ue[r.type],
            l = d.setter(e, s, d);
            l.location = s,
            a[r.name] = l
        }
        return a
    }
    function k(e, t) {
        function r(t, r) {
            var i = e.getUniformLocation(t, r.name),
            a = 1 < r.size && "[0]" === r.name.substr( - 3),
            n = r.type,
            s = Ve[n];
            if (!s) throw new Error("unknown type: 0x" + n.toString(16));
            var d;
            if (s.bindPoint) {
                var l = o;
                o += r.size,
                d = a ? s.arraySetter(e, n, l, i, r.size) : s.setter(e, n, l, i, r.size)
            } else d = s.arraySetter && a ? s.arraySetter(e, i) : s.setter(e, i);
            return d.location = i,
            d
        }
        for (var a, o = 0,
        n = {},
        s = e.getProgramParameter(t, 35718), d = 0; d < s; d++) if (a = e.getActiveUniform(t, d), !P(a)) {
            var l = a.name;
            "[0]" === l.substr( - 3) && (l = l.substr(0, l.length - 3));
            var f = r(t, a);
            n[l] = f
        }
        return n
    }
    function R(e, t) {
        for (var r in e = e.uniformSetters || e,
        t) {
            var i = e[r];
            i && i(t[r])
        }
    }
    function O(e, t, r) {
        t.vertexArrayObject ? e.bindVertexArray(t.vertexArrayObject) : (G(r.attribSetters || r, t.attribs), t.indices && e.bindBuffer(34963, t.indices))
    }
    function G(e, t) {
        for (var r in e = e.attribSetters || e,
        t) {
            var i = e[r];
            i && i(t[r])
        }
    }
    function W(e, t) {
        var r = {
            attribs: V(e, t)
        },
        i = t.indices;
        if (i) {
            var a = U(i, Uint16Array);
            r.indices = X(e, a, 34963),
            r.count = i.count || a.length,
            r.indexType = i.type || 5123
        } else r.count = j(t);
        return r
    }
    function V(e, t) {
        var r = {};
        for (var i in t) if (!Je(i)) {
            var a = t[i],
            o = U(a),
            n = a.name || a.attrName || qe(i);
            r[n] = {
                buffer: X(e, o, void 0, a.drawType),
                size: a.size || N(n),
                type: a.type,
                normalize: Y(o),
                stride: a.stride || 0,
                offset: a.offset || 0,
                divisor: a.divisor,
                drawType: a.drawType || 35044
            }
        }
        return e.bindBuffer(34962, null),
        r
    }
    function X(e, t, r, i) {
        r = r || 34962;
        var a = e.createBuffer();
        return e.bindBuffer(r, a),
        e.bufferData(r, t, i || 35044),
        a
    }
    function H(e, t, r) {
        var i = e.createVertexArray();
        return e.bindVertexArray(i),
        t.length || (t = [t]),
        t.forEach(function(t) {
            O(e, r, t)
        }),
        e.bindVertexArray(null),
        {
            count: r.count,
            indexType: r.indexType,
            vertexArrayObject: i
        }
    }
    function N(e, t) {
        var r;
        if (r = et.test(e) ? 2 : tt.test(e) ? 4 : 3, 0 < t % r) throw new Error("Can not guess size for attribute ".concat(e, ". Tried ").concat(r, " but ").concat(t, " values is not evenly divisible by ").concat(r, ". You should specify it."));
        return r
    }
    function j(e) {
        for (var t, r = Object.keys(e), i = r[0], a = 0, o = r; a < o.length; a++) if (t = o[a], rt.test(t)) {
            i = t;
            break
        }
        var n = e[i],
        s = n.count || (n.data ? n.data: n).length,
        d = n.size || N(i, s);
        if (0 < s % d) throw new Error("numComponents ".concat(d, " not correct for length ").concat(s));
        return s / d
    }
    function U(e, t) {
        if (Ke(e)) return e;
        if (Ke(e.data)) return e.data;
        Array.isArray(e) && (e = {
            data: e
        });
        var r = e.type || t || Float32Array;
        return new r(e.data)
    }
    function Y(e) {
        return !! (e instanceof Int8Array) || !!(e instanceof Uint8Array)
    }
    function q(e, t, r, i, a) {
        r = r || 4,
        i = i || t.count,
        a = a || 0;
        var o = t.indexType;
        o ? e.drawElements(r, i, o, a) : e.drawArrays(r, a, i)
    }
    function J(e, t, r) {
        r = r || 36160,
        t ? (e.bindFramebuffer(r, t.framebuffer), e.viewport(0, 0, t.width, t.height)) : (e.bindFramebuffer(r, null), e.viewport(0, 0, e.drawingBufferWidth, e.drawingBufferHeight))
    }
    function K(e, t, r, i) {
        var a = e.createTexture();
        if (!a) throw new Error("Failed to create texture object");
        var o = t.target || 3553,
        n = t.format || 6408,
        s = t.informat || n,
        d = t.type || 5121;
        return e.bindTexture(o, a),
        r && i && e.texImage2D(o, 0, s, r, i, 0, n, d, null),
        e.texParameteri(o, 10241, t.min || 9729),
        e.texParameteri(o, 10240, t.mag || 9729),
        e.texParameteri(o, 10243, t.wrapT || 10497),
        e.texParameteri(o, 10242, t.wrapS || 10497),
        a
    }
    function Q(e) {
        var t = v([0, 2, 2]);
        x(t, Lt, t);
        var r = l(f(t));
        e == ht ? (R(e, {
            vpMatrix: Pt,
            modelMatrix: t
        }), O(vt, _t), q(vt, _t)) : (R(e, {
            color: [.9, .3, .3],
            vpMatrix: At,
            vpMatrixFromLight: Pt,
            modelMatrix: t,
            normalMatrix: r
        }), O(vt, zt), q(vt, zt))
    }
    function Z(e) {
        var t = v([0, 5, 0]),
        r = l(f(t));
        e == ht ? (R(e, {
            vpMatrix: Pt,
            modelMatrix: t
        }), O(vt, yt), q(vt, yt)) : (R(e, {
            color: [.6, .6, .6],
            vpMatrix: At,
            vpMatrixFromLight: Pt,
            modelMatrix: t,
            normalMatrix: r
        }), O(vt, Tt), q(vt, Tt))
    }
    var ie, ae, oe, ne, se, de, le = Float32Array,
    fe = Float32Array,
    ue = w,
    me = 33984,
    ce = 34962,
    ve = 5126,
    he = 35664,
    ge = 35665,
    xe = 35666,
    be = 5124,
    pe = 35667,
    ye = 35668,
    _e = 35669,
    Te = 35670,
    ze = 35671,
    we = 35672,
    Ee = 35673,
    Se = 35674,
    Pe = 35675,
    Ae = 35676,
    Le = 5125,
    Me = 36294,
    De = 36295,
    Be = 36296,
    Fe = function(e, t) {
        return function(r) {
            e.uniform1i(t, r)
        }
    },
    Ce = function(e, t) {
        return function(r) {
            e.uniform1iv(t, r)
        }
    },
    Ie = function(e, t) {
        return function(r) {
            e.uniform2iv(t, r)
        }
    },
    ke = function(e, t) {
        return function(r) {
            e.uniform3iv(t, r)
        }
    },
    Re = function(e, t) {
        return function(r) {
            e.uniform4iv(t, r)
        }
    },
    Oe = function(e) {
        return Ve[e].bindPoint
    },
    Ge = function(e, t, r, i) {
        var a = Oe(t);
        return S(e) ?
        function(t) {
            var o, n;
            E(e, t) ? (o = t, n = null) : (o = t.texture, n = t.sampler),
            e.uniform1i(i, r),
            e.activeTexture(me + r),
            e.bindTexture(a, o),
            e.bindSampler(r, n)
        }: function(t) {
            e.uniform1i(i, r),
            e.activeTexture(me + r),
            e.bindTexture(a, t)
        }
    },
    We = function(e, t, r, a, o) {
        for (var n = Oe(t), s = new Int32Array(o), d = 0; d < o; d++) s[d] = r + d;
        return S(e) ?
        function(t) {
            e.uniform1iv(a, s),
            t.forEach(function(t, i) {
                e.activeTexture(me + s[i]);
                var a, o;
                E(e, t) ? (a = t, o = null) : (a = t.texture, o = t.sampler),
                e.bindSampler(r, o),
                e.bindTexture(n, a)
            })
        }: function(t) {
            e.uniform1iv(a, s),
            t.forEach(function(t, r) {
                e.activeTexture(me + s[r]),
                e.bindTexture(n, t)
            })
        }
    },
    Ve = (ne = {},
    ue(ne, ve, {
        Type: Float32Array,
        size: 4,
        setter: function(e, t) {
            return function(r) {
                e.uniform1f(t, r)
            }
        },
        arraySetter: function(e, t) {
            return function(r) {
                e.uniform1fv(t, r)
            }
        }
    }), ue(ne, he, {
        Type: Float32Array,
        size: 8,
        setter: function(e, t) {
            return function(r) {
                e.uniform2fv(t, r)
            }
        }
    }), ue(ne, ge, {
        Type: Float32Array,
        size: 12,
        setter: function(e, t) {
            return function(r) {
                e.uniform3fv(t, r)
            }
        }
    }), ue(ne, xe, {
        Type: Float32Array,
        size: 16,
        setter: function(e, t) {
            return function(r) {
                e.uniform4fv(t, r)
            }
        }
    }), ue(ne, be, {
        Type: Int32Array,
        size: 4,
        setter: Fe,
        arraySetter: Ce
    }), ue(ne, pe, {
        Type: Int32Array,
        size: 8,
        setter: Ie
    }), ue(ne, ye, {
        Type: Int32Array,
        size: 12,
        setter: ke
    }), ue(ne, _e, {
        Type: Int32Array,
        size: 16,
        setter: Re
    }), ue(ne, Le, {
        Type: Uint32Array,
        size: 4,
        setter: function(e, t) {
            return function(r) {
                e.uniform1ui(t, r)
            }
        },
        arraySetter: function(e, t) {
            return function(r) {
                e.uniform1uiv(t, r)
            }
        }
    }), ue(ne, Me, {
        Type: Uint32Array,
        size: 8,
        setter: function(e, t) {
            return function(r) {
                e.uniform2uiv(t, r)
            }
        }
    }), ue(ne, De, {
        Type: Uint32Array,
        size: 12,
        setter: function(e, t) {
            return function(r) {
                e.uniform3uiv(t, r)
            }
        }
    }), ue(ne, Be, {
        Type: Uint32Array,
        size: 16,
        setter: function(e, t) {
            return function(r) {
                e.uniform4uiv(t, r)
            }
        }
    }), ue(ne, Te, {
        Type: Uint32Array,
        size: 4,
        setter: Fe,
        arraySetter: Ce
    }), ue(ne, ze, {
        Type: Uint32Array,
        size: 8,
        setter: Ie
    }), ue(ne, we, {
        Type: Uint32Array,
        size: 12,
        setter: ke
    }), ue(ne, Ee, {
        Type: Uint32Array,
        size: 16,
        setter: Re
    }), ue(ne, Se, {
        Type: Float32Array,
        size: 16,
        setter: function(e, t) {
            return function(r) {
                e.uniformMatrix2fv(t, !1, r)
            }
        }
    }), ue(ne, Pe, {
        Type: Float32Array,
        size: 36,
        setter: function(e, t) {
            return function(r) {
                e.uniformMatrix3fv(t, !1, r)
            }
        }
    }), ue(ne, Ae, {
        Type: Float32Array,
        size: 64,
        setter: function(e, t) {
            return function(r) {
                e.uniformMatrix4fv(t, !1, r)
            }
        }
    }), ue(ne, 35685, {
        Type: Float32Array,
        size: 24,
        setter: function(e, t) {
            return function(r) {
                e.uniformMatrix2x3fv(t, !1, r)
            }
        }
    }), ue(ne, 35686, {
        Type: Float32Array,
        size: 32,
        setter: function(e, t) {
            return function(r) {
                e.uniformMatrix2x4fv(t, !1, r)
            }
        }
    }), ue(ne, 35687, {
        Type: Float32Array,
        size: 24,
        setter: function(e, t) {
            return function(r) {
                e.uniformMatrix3x2fv(t, !1, r)
            }
        }
    }), ue(ne, 35688, {
        Type: Float32Array,
        size: 48,
        setter: function(e, t) {
            return function(r) {
                e.uniformMatrix3x4fv(t, !1, r)
            }
        }
    }), ue(ne, 35689, {
        Type: Float32Array,
        size: 32,
        setter: function(e, t) {
            return function(r) {
                e.uniformMatrix4x2fv(t, !1, r)
            }
        }
    }), ue(ne, 35690, {
        Type: Float32Array,
        size: 48,
        setter: function(e, t) {
            return function(r) {
                e.uniformMatrix4x3fv(t, !1, r)
            }
        }
    }), ue(ne, 35678, {
        Type: null,
        size: 0,
        setter: Ge,
        arraySetter: We,
        bindPoint: 3553
    }), ue(ne, 35680, {
        Type: null,
        size: 0,
        setter: Ge,
        arraySetter: We,
        bindPoint: 34067
    }), ue(ne, 35679, {
        Type: null,
        size: 0,
        setter: Ge,
        arraySetter: We,
        bindPoint: 32879
    }), ue(ne, 36289, {
        Type: null,
        size: 0,
        setter: Ge,
        arraySetter: We,
        bindPoint: 35866
    }), ne),
    Xe = function(e, t) {
        return function(r) {
            if (r.value) switch (e.disableVertexAttribArray(t), r.value.length) {
            case 4:
                e.vertexAttrib4fv(t, r.value);
                break;
            case 3:
                e.vertexAttrib3fv(t, r.value);
                break;
            case 2:
                e.vertexAttrib2fv(t, r.value);
                break;
            case 1:
                e.vertexAttrib1fv(t, r.value);
                break;
            default:
                throw new Error("the length of a float constant value must be between 1 and 4!");
            } else e.bindBuffer(ce, r.buffer),
            e.enableVertexAttribArray(t),
            e.vertexAttribPointer(t, r.size, r.type || ve, r.normalize || !1, r.stride || 0, r.offset || 0),
            void 0 !== r.divisor && e.vertexAttribDivisor(t, r.divisor)
        }
    },
    He = function(e, t) {
        return function(r) {
            if (!r.value) e.bindBuffer(ce, r.buffer),
            e.enableVertexAttribArray(t),
            e.vertexAttribIPointer(t, r.size, r.type || be, r.stride || 0, r.offset || 0),
            void 0 !== r.divisor && e.vertexAttribDivisor(t, r.divisor);
            else if (e.disableVertexAttribArray(t), 4 === r.value.length) e.vertexAttrib4iv(t, r.value);
            else throw new Error("The length of an integer constant value must be 4!")
        }
    },
    Ne = function(e, t) {
        return function(r) {
            if (!r.value) e.bindBuffer(ce, r.buffer),
            e.enableVertexAttribArray(t),
            e.vertexAttribIPointer(t, r.size, r.type || Le, r.stride || 0, r.offset || 0),
            void 0 !== r.divisor && e.vertexAttribDivisor(t, r.divisor);
            else if (e.disableVertexAttribArray(t), 4 === r.value.length) e.vertexAttrib4uiv(t, r.value);
            else throw new Error("The length of an unsigned integer constant value must be 4!")
        }
    },
    je = function(e, t, r) {
        return function(a) {
            var o = a.count || r.size,
            n = r.count;
            e.bindBuffer(ce, a.buffer);
            for (var s = a.type || ve,
            d = Ve[s].size * o, l = a.normalize || !1, f = a.offset || 0, u = 0; u < n; u++) e.enableVertexAttribArray(t + u),
            e.vertexAttribPointer(t + u, o / n, s, l, d, f + d / n * u),
            void 0 !== a.divisor && e.vertexAttribDivisor(t + u, a.divisor)
        }
    },
    Ue = (se = {},
    ue(se, ve, {
        size: 4,
        setter: Xe
    }), ue(se, he, {
        size: 8,
        setter: Xe
    }), ue(se, ge, {
        size: 12,
        setter: Xe
    }), ue(se, xe, {
        size: 16,
        setter: Xe
    }), ue(se, be, {
        size: 4,
        setter: He
    }), ue(se, pe, {
        size: 8,
        setter: He
    }), ue(se, ye, {
        size: 12,
        setter: He
    }), ue(se, _e, {
        size: 16,
        setter: He
    }), ue(se, Le, {
        size: 4,
        setter: Ne
    }), ue(se, Me, {
        size: 8,
        setter: Ne
    }), ue(se, De, {
        size: 12,
        setter: Ne
    }), ue(se, Be, {
        size: 16,
        setter: Ne
    }), ue(se, Te, {
        size: 4,
        setter: He
    }), ue(se, ze, {
        size: 8,
        setter: He
    }), ue(se, we, {
        size: 12,
        setter: He
    }), ue(se, Ee, {
        size: 16,
        setter: He
    }), ue(se, Se, {
        size: 4,
        setter: je,
        count: 2
    }), ue(se, Pe, {
        size: 9,
        setter: je,
        count: 3
    }), ue(se, Ae, {
        size: 16,
        setter: je,
        count: 4
    }), se),
    Ye = {
        addExtensionsToContext: !0
    },
    qe = function(e) {
        return "a" + e[0].toUpperCase() + e.substr(1)
    },
    Je = function(e) {
        return "indices" === e
    },
    Ke = "undefined" == typeof SharedArrayBuffer ?
    function(e) {
        return e && e.buffer && e.buffer instanceof ArrayBuffer
    }: function(e) {
        return e && e.buffer && (e.buffer instanceof ArrayBuffer || e.buffer instanceof SharedArrayBuffer)
    },
    Qe = ["ANGLE_instanced_arrays", "EXT_blend_minmax", "EXT_color_buffer_float", "EXT_color_buffer_half_float", "EXT_disjoint_timer_query", "EXT_disjoint_timer_query_webgl2", "EXT_frag_depth", "EXT_sRGB", "EXT_shader_texture_lod", "EXT_texture_filter_anisotropic", "OES_element_index_uint", "OES_standard_derivatives", "OES_texture_float", "OES_texture_float_linear", "OES_texture_half_float", "OES_texture_half_float_linear", "OES_vertex_array_object", "WEBGL_color_buffer_float", "WEBGL_compressed_texture_atc", "WEBGL_compressed_texture_etc1", "WEBGL_compressed_texture_pvrtc", "WEBGL_compressed_texture_s3tc", "WEBGL_compressed_texture_s3tc_srgb", "WEBGL_depth_texture", "WEBGL_draw_buffers"],
    Ze = function() {
        function e(e) {
            var i = e.constructor.name;
            if (!t[i]) {
                for (var a in e) if ("number" == typeof e[a]) {
                    var o = r[e[a]];
                    r[e[a]] = o ? "".concat(o, " | ").concat(a) : a
                }
                t[i] = !0
            }
        }
        var t = {},
        r = {};
        return function(t, i) {
            return e(t),
            r[i] || "0x" + i.toString(16)
        }
    } (),
    $e = /^(.*?)_/,
    et = /coord|texture/i,
    tt = /color|colour/i,
    rt = /position/i,
    it = document.getElementById("canvas"),
    at = document.getElementById("xt"),
    y = document.getElementById("yt"),
    ot = document.getElementById("xat"),
    nt = document.getElementById("yat"),
    st = 2048,
    dt = 2048,
    lt = [0, 3, 12],
    ft = [0, 3, 6],
    ut = [0, 3, 6],
    mt = 0,
    ct = 0,
    vt = function(e, t) {
        for (var r, i = ["webgl", "experimental-webgl"], a = null, o = 0, n = i; o < n.length; o++) if (r = n[o], a = e.getContext(r, t), a) {
            "webgl" === r && Ye.addExtensionsToContext && L(a, Qe);
            break
        }
        return a
    } (it, !0),
    ht = C(vt, "#define GLSLIFY 1\nattribute vec4 aPosition; \nuniform mat4 vpMatrix; \nuniform mat4 modelMatrix; \n\nvoid main() { \n\tgl_Position = vpMatrix * modelMatrix * aPosition; \n}", "precision highp float;\n#define GLSLIFY 1\nconst vec4 bitShift = vec4(1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0);//\u4F7F\u7528rgba 4\u5B57\u8282\u517132\u4F4D\u6765\u5B58\u50A8z\u503C,1\u4E2A\u5B57\u8282\u7CBE\u5EA6\u4E3A1/256\nconst vec4 bitMask = vec4(1.0/256.0, 1.0/256.0, 1.0/256.0, 0.0);\nvec4 packDepth (float depth) {\n\t//gl_FragCoord:\u7247\u5143\u7684\u5750\u6807,fract():\u8FD4\u56DE\u6570\u503C\u7684\u5C0F\u6570\u90E8\u5206\n\t//\u8BE5\u7247\u5143\u7740\u8272\u5668\u76EE\u7684\u662F\u8BA1\u7B97\u6BCF\u4E2A\u7247\u5143\u7684\u6DF1\u5EA6\u503Cz,\u5E76\u628Az\u503C\u4FDD\u5B58\u5230gl_FragColor\u4E2D,\u53EF\u4EE5\u628A\u8BE5\u7EB9\u7406\u770B\u6210\u662F\u6DF1\u5EA6\u503Cz\u7684\u5BB9\u5668,\u56E0\u4E3A\u5B83\u5E76\u4E0D\u4F1A\u6E32\u67D3\u51FA\u6765\n\tvec4 rgbaDepth = fract(depth * bitShift); //\u8BA1\u7B97\u6BCF\u4E2A\u70B9\u7684z\u503C \n\trgbaDepth -= rgbaDepth.gbaa * bitMask; //Cut off the value which do not fit in 8 bits\n\treturn rgbaDepth;\n}\n\nvoid main() {\n\tgl_FragColor = packDepth(gl_FragCoord.z);//\u5C06z\u503C\u5206\u5F00\u5B58\u50A8\u5230rgba\u5206\u91CF\u4E2D,\u9634\u5F71\u989C\u8272\u53D8\u91CF\u5B58\u50A8\u7684\u4E0D\u518D\u662F\u989C\u8272\u800C\u53EA\u662F\u6DF1\u5EA6\u503Cz\n}"),
    gt = C(vt, "#define GLSLIFY 1\nattribute vec4 aPosition;\nattribute vec4 aNormal;\nuniform mat4 modelMatrix;//\u7B49\u6BD4\u4F8B\u53D8\u6362,\u53EF\u4EE5\u7528\u6A21\u578B\u77E9\u9635\u4EE3\u66FF\u9006\u8F6C\u7F6E\u77E9\u9635\nuniform mat4 vpMatrix;//\u5F53\u524D\u89C6\u70B9\u89C2\u6D4B\u7684\u6A21\u578B\u89C6\u56FE\u6295\u5F71\u77E9\u9635\nuniform mat4 vpMatrixFromLight;//\u5149\u6E90\u5904\u89C2\u5BDF\u7684\u6A21\u578B\u89C6\u56FE\u6295\u5F71\u77E9\u9635\nuniform mat4 normalMatrix;\nvarying vec4 vShadowCoord;\nvarying vec4 vPosition;\nvarying vec3 vNormal;\n\nvoid main() {\n\tgl_Position = vpMatrix * modelMatrix * aPosition; // \u5F53\u524D\u89C6\u70B9\u89C2\u5BDF\u5230\u7684\u5750\u6807\n\tvShadowCoord = vpMatrixFromLight * modelMatrix * aPosition;// \u5149\u6E90\u5904\u89C2\u5BDF\u5230\u7684\u5750\u6807,\u7528\u4E8E\u540E\u7EED\u5206\u89E3\u51FAz\u503C\n\tvPosition = modelMatrix * aPosition;// \u9876\u70B9\u5728\u4E16\u754C\u5750\u6807\u7CFB\u4E2D\u7684\u4F4D\u7F6E\n\tvNormal = vec3(normalMatrix * aNormal);\n}", "precision highp float;\n#define GLSLIFY 1\nuniform vec3 viewPosition;\nuniform vec3 lightPosition;//\u5149\u6E90\u4F4D\u7F6E\nuniform vec3 lightDirection;//\u5149\u6E90\u65B9\u5411(\u805A\u5149\u706F\u671D\u5411)\nuniform vec3 lightColor;\nuniform vec3 ambientColor;\nuniform vec3 color;\nuniform sampler2D shadowMap;\nvarying vec4 vShadowCoord;\nvarying vec4 vPosition;\nvarying vec3 vNormal;\nconst float outerLimit = cos(radians(25.0));//\u7167\u5C04\u8303\u56F4\u89D2\u5EA6|\u6A21\u7CCA\u5916\u5F84\u89D2\u5EA6\nconst float innerLimit = cos(radians(20.0));//\u6A21\u7CCA\u5185\u5F84\u89D2\u5EA6\nconst float shininess = 50.0;\nconst\tfloat resolution = 2048.0;\nconst vec3 specularColor = vec3(1.0, 1.0, 1.0);\nconst vec4 bitShift = vec4(1.0, 1.0 / 256.0, 1.0 / (256.0 * 256.0), 1.0 / (256.0 * 256.0 * 256.0));\n\nfloat getShadow(sampler2D shadowMap, float cosTheta, vec4 shadowCoord) {\n\t// \u6839\u636E\u5149\u7EBF\u4E0E\u8868\u9762\u7684\u5939\u89D2\u8BA1\u7B97\u504F\u79FB\u91CF,\u7528\u4E8E\u6D88\u9664\u9A6C\u8D6B\u5E26\n\tfloat bias = clamp(0.005 * tan(acos(cosTheta)), 0.0015, 0.01);\n\t// xy\u5206\u91CF\u662F\u5C06\u5750\u6807\u533A\u95F4\u4ECE[-1,1]\u8F6C\u6362\u4E3Agl_FragCoord\u7684\u533A\u95F4[0,1],z\u5206\u91CF\u5219\u662F\u6C42\u51FAgl_FragCoord\u7684\u6DF1\u5EA6\u503Cz\n\tvec3 coord = (shadowCoord.xyz / shadowCoord.w) / 2.0 + 0.5;\n\t//\u6839\u636E\u9634\u5F71xy\u5750\u6807,\u83B7\u53D6\u7EB9\u7406\u4E2D\u5BF9\u5E94\u7684\u70B9,z\u503C\u5DF2\u7ECF\u88AB\u4E4B\u524D\u7684\u9634\u5F71\u7740\u8272\u5668\u5B58\u653E\u5728\u8BE5\u70B9\u7684r\u5206\u91CF\u4E2D\u4E86,\u76F4\u63A5\u4F7F\u7528\u5373\u53EF\n\tvec4 rgbaDepth = texture2D(shadowMap, coord.xy); // \u83B7\u53D6\u6307\u5B9A\u7EB9\u7406\u5750\u6807\u5904\u7684\u50CF\u7D20\u989C\u8272rgba\n\tfloat unpack = dot(rgbaDepth, bitShift); //\u89E3\u6790\u51FA\u8D34\u56FE\u4E2D\u7684z\u503C\n\tfloat shadow = step(coord.z - bias, unpack);//\u5927\u4E8E\u9634\u5F71\u8D34\u56FE\u4E2D\u7684z,\u8BF4\u660E\u5728\u9634\u5F71\u4E2D(0.0),\u5426\u5219\u4E3A\u6B63\u5E38\u989C\u8272(1.0)\n\treturn min(0.4 + shadow, 1.0);\n}\n\nvoid main() {\n\tvec3 normal = normalize(vNormal);// \u5BF9\u6CD5\u7EBF\u5F52\u4E00\u5316\uFF0C\u56E0\u4E3A\u5176\u5185\u63D2\u4E4B\u540E\u957F\u5EA6\u4E0D\u4E00\u5B9A\u662F1\n\tvec3 lightDir = normalize(lightDirection);// \u805A\u5149\u706F\u671D\u5411\n\tvec3 surfaceToLightDirection = normalize(lightPosition - vPosition.xyz);// \u5149\u7EBF\u65B9\u5411 \u5149\u6E90\u4F4D\u7F6E-\u9876\u70B9\u4F4D\u7F6E\n\tfloat cosTheta = max(dot(surfaceToLightDirection, normal), 0.0);// \u5149\u7EBF\u65B9\u5411\u548C\u6CD5\u5411\u91CF\u7684\u5939\u89D2\uFF0C\u5B83\u4EEC\u7684\u70B9\u79EF\u5373\u53EF\u6C42\u51FA\u5939\u89D2\u4F59\u5F26\u503C(\u8303\u56F40-90\u5EA6)\n\t\n\t// \u73AF\u5883\u5149\n\tvec3 ambient = ambientColor * color;\n\t\n\t// \u805A\u5149\u706F\n\tfloat dotFromDirection = dot(surfaceToLightDirection, lightDir);// \u5149\u6E90\u65B9\u5411\u4E0E\u5149\u7EBF\u65B9\u5411\u7684\u5939\u89D2\n\tfloat inlightBloom = smoothstep(outerLimit, innerLimit, dotFromDirection);// \u805A\u5149\u706F\u8303\u56F4 + \u8FB9\u7F18\u6A21\u7CCA\uFF0C\u7528\u4E8E\u5149\u7167\u90E8\u5206\n\tfloat inLight = step(outerLimit, dotFromDirection);// \u805A\u5149\u706F\u8303\u56F4, \u6CA1\u6709\u8FB9\u7F18\u6A21\u7CCA\uFF0C\u7528\u4E8E\u9634\u5F71\u90E8\u5206\n\n\t// \u6F2B\u53CD\u5C04\n\tvec3 diffuse = lightColor * color * cosTheta * inlightBloom;\n\t\n\t// \u9AD8\u5149\n\tvec3 viewDirection = normalize(viewPosition - vPosition.xyz);// \u53CD\u5C04\u65B9\u5411\n\tvec3 halfwayDir = normalize(surfaceToLightDirection + viewDirection);\n\tfloat specularIntensity = pow(max(dot(normal, halfwayDir), 0.0), shininess);\n\tvec3 specular = specularColor * specularIntensity * inlightBloom;\n\n\t// \u9634\u5F71(\u805A\u5149\u706F\u8303\u56F4\u5916\u65E0\u9634\u5F71)\n\tfloat shadow = min(inLight, getShadow(shadowMap, cosTheta, vShadowCoord));\n\t// float shadow = min(inLight, getShadow(shadowMap, vec2(2048.0), dot(lightDir, normal), vShadowCoord));\n\n\tvec3 lighting = (diffuse + specular) * shadow;\n\t\n\tgl_FragColor = vec4(ambient + lighting, 1.0);\n}"),
    xt = function(t, r, a, o) {
        a = a || t.drawingBufferWidth,
        o = o || t.drawingBufferHeight;
        var n = t.createFramebuffer();
        if (!n) throw new Error("Failed to create frame buffer object");
        t.bindFramebuffer(36160, n);
        var s = {
            framebuffer: n,
            textures: [],
            width: a,
            height: o
        },
        d = r.texs || 1,
        l = !!r.depth;
        r.wrapT = r.wrapS = 33071;
        for (var f, u = 0; u < d; u++) f = K(t, r, a, o),
        t.generateMipmap(3553),
        s.textures.push(f),
        t.framebufferTexture2D(36160, 36064 + u, 3553, f, 0);
        if (l) {
            var m = t.createRenderbuffer();
            if (!m) throw new Error("Failed to create renderbuffer object");
            t.bindRenderbuffer(36161, m),
            t.renderbufferStorage(36161, 33189, a, o),
            t.framebufferRenderbuffer(36160, 36096, 36161, m)
        }
        var c = t.checkFramebufferStatus(36160);
        if (36053 !== c) throw new Error("Frame buffer object is incomplete: " + c.toString());
        return t.bindFramebuffer(36160, null),
        t.bindTexture(3553, null),
        l && t.bindRenderbuffer(36161, null),
        s
    } (vt, {
        depth: !0
    },
    st, dt),
    bt = W(vt,
    function() {
        var e = 0 < arguments.length && arguments[0] !== void 0 ? arguments[0] : 1;
        return {
            position: [ - e, -e, -e, -e, -e, e, e, -e, -e, e, -e, -e, -e, -e, e, e, -e, e, e, -e, -e, -e, -e, e, -e, -e, -e, e, -e, e, -e, -e, e, e, -e, -e],
            normal: [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0]
        }
    } (5)),
    pt = W(vt,
    function() {
        var e = 0 < arguments.length && arguments[0] !== void 0 ? arguments[0] : 1;
        return {
            position: [ - e, -e, -e, -e, e, -e, e, -e, -e, -e, e, -e, e, e, -e, e, -e, -e, -e, -e, e, e, -e, e, -e, e, e, -e, e, e, e, -e, e, e, e, e, -e, e, -e, -e, e, e, e, e, -e, -e, e, e, e, e, e, e, e, -e, -e, -e, -e, e, -e, -e, -e, -e, e, -e, -e, e, e, -e, -e, e, -e, e, -e, -e, -e, -e, -e, e, -e, e, -e, -e, -e, e, -e, e, e, -e, e, -e, e, -e, -e, e, e, -e, e, -e, e, e, -e, e, e, e, -e, e, e, e],
            normal: [0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0]
        }
    } (1)),
    yt = H(vt, ht, bt),
    _t = H(vt, ht, pt),
    Tt = H(vt, gt, bt),
    zt = H(vt, gt, pt),
    wt = function(t) {
        function i(r) {
            var e = Math.acos,
            i = T(t, r.clientX, r.clientY),
            o = 2 * ((x.y > h.y ? x.x - i.x: i.x - x.x) / c * te),
            d = (x.y - i.y) / v * te,
            l = E[1],
            f = e(a(n(E), n([0, l, 0]))),
            u = g(o);
            f + d < te / 90 && 0 < l && 0 > d && (d = te / 180 - f),
            f - d < te / 90 && 0 > l && 0 < d && (d = f - te / 180);
            var m = _(g( - te / 2), [E[0], 0, E[2]]),
            y = b(u, m, -d);
            w = s(p(y, E))
        }
        function d() {
            E = s(w),
            t.removeEventListener("mouseup", d, !1),
            t.removeEventListener("mousemove", i, !1),
            t.removeEventListener("mouseout", d, !1)
        }
        var l = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : [0, 5, 5],
        f = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : 1,
        u = 3 < arguments.length && void 0 !== arguments[3] ? arguments[3] : 50;
        if (!t) throw new Error("canvas not exist");
        var m, c = t.clientWidth,
        v = t.clientHeight,
        h = {
            x: c / 2,
            y: v / 2
        },
        x = h,
        y = 1,
        w = l,
        E = l;
        return z(t,
        function(t) {
            var e = o(E);
            e < f + 1 && 0 > t.delta || e > u - 1 && 0 < t.delta || (y += .05 * t.delta, w = r(E, y), clearTimeout(m), m = setTimeout(function() {
                y = 1,
                E = s(w)
            },
            20))
        }),
        t.addEventListener("mousedown",
        function(r) {
            x = T(t, r.clientX, r.clientY),
            t.addEventListener("mousemove", i, !1),
            t.addEventListener("mouseup", d, !1),
            t.addEventListener("mouseout", d, !1)
        },
        !1),
        function() {
            return w
        }
    } (it, lt, 1, 100),
    Et = m(te / 2, st / dt, 1, 100),
    St = m(te / 6, it.width / it.height, 1, 100),
    Pt = d(),
    At = d(),
    Lt = 0; (function(e, t) {
        var r = Math.floor;
        t = t || window.devicePixelRatio;
        var i = e.width,
        a = e.height,
        o = r(e.clientWidth * t),
        n = r(e.clientHeight * t); (i !== o || a !== n) && (e.width = o, e.height = n, e.style.width = i + "px", e.style.height = a + "px")
    })(it),
    vt.clearColor(0, 0, 0, 1),
    vt.enable(vt.DEPTH_TEST),
    vt.enable(vt.CULL_FACE),
    function e() {
        lt = wt();
        var t = c(ft, [0, 0, 0], [0, 1, 0]);
        u(Et, f(t), Pt);
        var r = c(lt, [0, 0, 0], [0, 1, 0]);
        u(St, f(r), At),
        Lt = (Lt + .01) % (2 * te),
        J(vt, xt),
        vt.clear(vt.COLOR_BUFFER_BIT | vt.DEPTH_BUFFER_BIT),
        vt.useProgram(ht.program),
        Q(ht),
        Z(ht),
        J(vt),
        vt.clear(vt.COLOR_BUFFER_BIT | vt.DEPTH_BUFFER_BIT),
        vt.useProgram(gt.program),
        R(gt, {
            shadowMap: xt.textures[0],
            lightColor: [1, 1, 1],
            lightPosition: ft,
            lightDirection: ut,
            ambientColor: [.2, .2, .2],
            viewPosition: lt
        }),
        Q(gt),
        Z(gt),
        requestAnimationFrame(e)
    } (),
    document.getElementById("x").oninput = function() {
        at.innerText = ft[0] = +this.value
    },
    document.getElementById("y").oninput = function() {
        y.innerText = ft[1] = +this.value
    },
    document.getElementById("xan").oninput = function() {
        ot.innerText = this.value,
        mt = +this.value * te / 180,
        Mt()
    },
    document.getElementById("yan").oninput = function() {
        nt.innerText = this.value,
        ct = +this.value * te / 180,
        Mt()
    };
    var Mt = function() {
        var e = h( - mt);
        x(e, -ct, e),
        ut = n(_(e, ft))
    };
    Mt()
})();