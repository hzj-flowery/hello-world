(function () {
	'use strict';
	var le = Math.round,
		ue = Math.floor,
		ce = Math.sin,
		fe = Math.cos,
		de = Math.PI,
		he = Math.sqrt;
	function e(e, t, i) {
		var r = new _e(3);
		return e && (r[0] = e),
			t && (r[1] = t),
			i && (r[2] = i),
			r
	}
	function t(e, t, i) {
		return i = i || new _e(3),
			i[0] = e[0] - t[0],
			i[1] = e[1] - t[1],
			i[2] = e[2] - t[2],
			i
	}
	function i(e, t, i) {
		return i = i || new _e(3),
			i[0] = e[0] * t,
			i[1] = e[1] * t,
			i[2] = e[2] * t,
			i
	}
	function r(e, t, i) {
		i = i || new _e(3);
		var r = e[2] * t[0] - e[0] * t[2],
			o = e[0] * t[1] - e[1] * t[0];
		return i[0] = e[1] * t[2] - e[2] * t[1],
			i[1] = r,
			i[2] = o,
			i
	}
	function o(e, t) {
		return e[0] * t[0] + e[1] * t[1] + e[2] * t[2]
	}
	function n(e) {
		return he(e[0] * e[0] + e[1] * e[1] + e[2] * e[2])
	}
	function a(e, t) {
		t = t || new _e(3);
		var i = e[0] * e[0] + e[1] * e[1] + e[2] * e[2],
			r = he(i);
		return 1e-5 < r ? { return t = t || new _e(3), t[0]= e[0], t[1]= e[1], t[2]= e[2], t } function l(e) {
			return e = e || new
				ye(16), e[0] = 1, e[1] = 0, e[2] = 0, e[3] = 0, e[4] = 0, e[5] = 1, e[6] = 0, e[7] = 0, e[8] = 0, e[9] = 0, e[10] = 1, e[11] = 0, e[12] = 0,
				e[13] = 0, e[14] = 0, e[15] = 1, e
		} function u(e, t) {
			t = t || new ye(16); var i = e[0], r = e[1], o = e[2], n = e[3], a = e[4],
				s = e[5], l = e[6], u = e[7], c = e[8], f = e[9], h = e[10], m = e[11], g = e[12], v = e[13], p = e[14], x = e[15], b = h * x, _ = p * m, y = l
					* x, T = p * u, E = l * m, L = h * u, z = o * x, P = p * n, S = o * m, w = h * n, A = o * u, D = l * n, B = c * v, C = g * f, R = a * v, F = g
						* s, M = a * f, O = c * s, G = i * v, q = g * r, I = i * f, W = c * r, N = i * s, X = a * r, k = b * s + T * f + E * v - (_ * s + y *
							f + L * v), V = _ * r + z * f + w * v - (b * r + P * f + S * v), H = y * r + P * s + A * v - (T * r + z * s + D * v),
				j = L * r + S * s + D * f - (E * r + w * s + A * f), U = 1 / (i * k + a * V + c * H + g * j); return t[0] = U * k, t[1] = U
					* V, t[2] = U * H, t[3] = U * j, t[4] = U * (_ * a + y * c + L * g - (b * a + T * c + E * g)), t[5] = U * (b * i + P * c + S
						* g - (_ * i + z * c + w * g)), t[6] = U * (T * i + z * a + D * g - (y * i + P * a + A * g)), t[7] = U * (E * i + w * a
							+ A * c - (L * i + S * a + D * c)), t[8] = U * (B * u + F * m + M * x - (C * u + R * m + O * x)), t[9] = U * (C * n + G
								* m + W * x - (B * n + q * m + I * x)), t[10] = U * (R * n + q * u + N * x - (F * n + G * u + X * x)), t[11] = U * (O *
									n + I * u + X * m - (M * n + W * u + N * m)), t[12] = U * (R * h + O * p + C * l - (M * p + B * l + F * h)), t[13] = U *
									(I * p + B * o + q * h - (G * h + W * p + C * o)), t[14] = U * (G * l + X * p + F * o - (N * p + R * o + q * l)),
					t[15] = U * (N * h + M * o + W * l - (I * l + X * h + O * o)), t
		} function c(e, t, i) {
			i = i || new ye(16); var
				r = e[0], o = e[1], n = e[2], a = e[3], s = e[4], l = e[5], u = e[6], c = e[7], f = e[8], d = e[9], h = e[10], m = e[11], g = e[12], v = e[13],
				p = e[14], x = e[15], b = t[0], _ = t[1], y = t[2], T = t[3], E = t[4], L = t[5], z = t[6], P = t[7], S = t[8], w = t[9], A = t[10], D = t[11],
				B = t[12], C = t[13], R = t[14], F = t[15]; return i[0] = r * b + s * _ + f * y + g * T, i[1] = o * b + l * _ + d * y + v * T,
					i[2] = n * b + u * _ + h * y + p * T, i[3] = a * b + c * _ + m * y + x * T, i[4] = r * E + s * L + f * z + g * P, i[5] = o *
					E + l * L + d * z + v * P, i[6] = n * E + u * L + h * z + p * P, i[7] = a * E + c * L + m * z + x * P, i[8] = r * S + s *
					w + f * A + g * D, i[9] = o * S + l * w + d * A + v * D, i[10] = n * S + u * w + h * A + p * D, i[11] = a * S + c * w + m
					* A + x * D, i[12] = r * B + s * C + f * R + g * F, i[13] = o * B + l * C + d * R + v * F, i[14] = n * B + u * C + h * R +
					p * F, i[15] = a * B + c * C + m * R + x * F, i
		} function f(e, t, i, r, o) {
			var n = Math.tan; o = o || new ye(16); var
				a = n(.5 * de - .5 * e), s = 1 / (i - r); return o[0] = a / t, o[1] = 0, o[2] = 0, o[3] = 0, o[4] = 0, o[5] = a, o[6] = 0, o[7] = 0,
					o[8] = 0, o[9] = 0, o[10] = (i + r) * s, o[11] = -1, o[12] = 0, o[13] = 0, o[14] = 2 * (i * r * s), o[15] = 0, o
		} function d(i, o,
			n, s) {
				return s = s || new ye(16), me = me || e(), ge = ge || e(), ve = ve || e(), a(t(i, o, ve), ve), a(r(n, ve, me), me),
					a(r(ve, me, ge), ge), s[0] = me[0], s[1] = me[1], s[2] = me[2], s[3] = 0, s[4] = ge[0], s[5] = ge[1], s[6] = ge[2], s[7] = 0,
					s[8] = ve[0], s[9] = ve[1], s[10] = ve[2], s[11] = 0, s[12] = i[0], s[13] = i[1], s[14] = i[2], s[15] = 1, s
		} function h(e, t, i) {
			i = i || new ye(16); var r = t[0], o = t[1], n = t[2], a = e[0], s = e[1], l = e[2], u = e[3], c = e[4], f = e[5], d = e[6], h = e[7],
				m = e[8], g = e[9], v = e[10], p = e[11], x = e[12], b = e[13], _ = e[14], y = e[15]; return e !== i && (i[0] = a, i[1] = s, i[2] = l,
					i[3] = u, i[4] = c, i[5] = f, i[6] = d, i[7] = h, i[8] = m, i[9] = g, i[10] = v, i[11] = p), i[12] = a * r + c * o + m * n + x, i[13] = s
					* r + f * o + g * n + b, i[14] = l * r + d * o + v * n + _, i[15] = u * r + h * o + p * n + y, i
		} function m(e, t) {
			t = t || new ye(16); var i = fe(e), r = ce(e); return t[0] = i, t[1] = 0, t[2] = -r, t[3] = 0, t[4] = 0, t[5] = 1, t[6] = 0, t[7] = 0,
				t[8] = r, t[9] = 0, t[10] = i, t[11] = 0, t[12] = 0, t[13] = 0, t[14] = 0, t[15] = 1, t
		} function g(e, t, i, r) {
			r = r || new
				ye(16); var o = t[0], a = t[1], l = t[2], u = he(o * o + a * a + l * l); o /= u, a /= u, l /= u; var n = o * o, f = a * a, d = l * l,
					h = fe(i), c = ce(i), s = 1 - h, m = n + (1 - n) * h, g = o * a * s + l * c, v = o * l * s - a * c, p = o * a * s - l * c, b = f +
						(1 - f) * h, _ = a * l * s + o * c, T = o * l * s + a * c, E = a * l * s - o * c, L = d + (1 - d) * h, P = e[0], S = e[1],
					w = e[2], A = e[3], D = e[4], B = e[5], C = e[6], R = e[7], F = e[8], M = e[9], O = e[10], G = e[11]; return r[0] = m * P + g * D + v * F,
						r[1] = m * S + g * B + v * M, r[2] = m * w + g * C + v * O, r[3] = m * A + g * R + v * G, r[4] = p * P + b * D + _ * F,
						r[5] = p * S + b * B + _ * M, r[6] = p * w + b * C + _ * O, r[7] = p * A + b * R + _ * G, r[8] = T * P + E * D + L * F,
						r[9] = T * S + E * B + L * M, r[10] = T * w + E * C + L * O, r[11] = T * A + E * R + L * G, e !== r && (r[12] = e[12],
							r[13] = e[13], r[14] = e[14], r[15] = e[15]), r
		} function v(t, i, r) {
			r = r || e(); var o = i[0], n = i[1], a = i[2], s = o * t[3]
				+ n * t[7] + a * t[11] + t[15]; return r[0] = (o * t[0] + n * t[4] + a * t[8] + t[12]) / s, r[1] = (o * t[1] + n * t[5]
					+ a * t[9] + t[13]) / s, r[2] = (o * t[2] + n * t[6] + a * t[10] + t[14]) / s, r
		} function p(t, i, r) {
			r = r || e();
			var o = i[0], n = i[1], a = i[2]; return r[0] = o * t[0] + n * t[4] + a * t[8], r[1] = o * t[1] + n * t[5] + a * t[9], r[2] = o
				* t[2] + n * t[6] + a * t[10], r
		} function x() {
			var e = ue(360 * Math.random()), t = ue(50 * Math.random() + 50),
			i = ue(20 * Math.random() + 40); return [e, t, i]
		} function b(e) {
			var r = Math.ceil, o = parseFloat(e[0] / 360, 10),
			n = parseFloat(e[1] / 100, 10), a = parseFloat(e[2] / 100, 10); if (0 == n) { var s = r(255 * a); return [s, s, s] } for
				(var l, u = .5 <= a ? a + n - a * n : a * (1 + n), c = 2 * a - u, f = [1 / 3, 0, -1 / 3], d = 0; 3 > d; d++) l = o + f[d],
					0 > l && (l += 1),
					1 < l && (l -= 1), l = 1 > 6 * l ? c + 6 * (u - c) * l : 1 > 2 * l ? u : 2 > 3 * l ? c + 6 * ((u - c) * (2 / 3 - l)) : c,
					f[d] = r(255 * l);
			return f
		}
		function _(e) {
			return [le(100 * (e[0] / 255)) / 100, le(100 * (e[1] / 255)) / 100, le(100 * (e[2] / 255)) / 100, e[3] || 1]
		}
		function y(e) {
			return _(b(e))
		}
		function T(e, t, i) {
			if (!e) throw new Error("canvas not exist");
			var r = e.getBoundingClientRect();
			return {
				x: (t - r.left) * (e.width / r.width),
				y: (i - r.top) * (e.height / r.height)
			}
		}
		function E(e, t) {
			t = t || window.devicePixelRatio;
			var i = e.width,
				r = e.height,
				o = ue(e.clientWidth * t),
				n = ue(e.clientHeight * t); (i !== o || r !== n) && (e.width = o, e.height = n, e.style.width = i + "px",
					e.style.height = r + "px")
		}
		function L(e, t) {
			var i = "mousewheel";
			try {
				document.createEvent("MouseScrollEvents"),
					i = "DOMMouseScroll"
			} catch (t) { }
			e.addEventListener(i,
				function (i) {
					if ("wheelDelta" in i) {
						var e = i.wheelDelta;
						window.opera && 10 > opera.version() && (e = -e),
							i.delta = le(e) / 120
					} else "detail" in i && (i.wheelDelta = 40 * -i.detail, i.delta = i.wheelDelta / 120);
					t(i)
				},
				!1)
		}
		function z(t) {
			function r(i) {
				var e = Math.acos,
					r = T(t, i.clientX, i.clientY),
					n = 2 * ((_.y > b.y ? _.x - r.x : r.x - _.x) / h * de),
					l = (_.y - r.y) / x * de,
					u = z[1],
					c = e(o(a(z), a([0, u, 0]))),
					f = m(n);
				c + l < de / 90 && 0 < u && 0 > l && (l = de / 180 - c),
					c - l < de / 90 && 0 > u && 0 < l && (l = c - de / 180); var d = p(m(- de / 2), [z[0], 0, z[2]]), y = g(f, d, -l);
				E = s(v(y, z))
			} function l() {
				z = s(E), t.removeEventListener("mouseup", l, !1),
				t.removeEventListener("mousemove", r, !1), t.removeEventListener("mouseout", l, !1)
			} var u = 1 <
				arguments.length && void 0 !== arguments[1] ? arguments[1] : [0, 5, 5], c = 2 < arguments.length &&
					void 0 !== arguments[2] ? arguments[2] : 1, f = 3 < arguments.length && void 0 !== arguments[3] ?
						arguments[3] : 50; if (!t) throw new Error("canvas not exist"); var d, h = t.clientWidth,
							x = t.clientHeight, b = { x: h / 2, y: x / 2 }, _ = b, y = 1, E = u, z = u; return L(t, function (t) {
								var
								e = n(z); e < c + 1 && 0 > t.delta || e > f - 1 && 0 < t.delta || (y += .05 * t.delta, E = i(z, y),
									clearTimeout(d), d = setTimeout(function () { y = 1, z = s(E) }, 20))
							}),
								t.addEventListener("mousedown", function (i) {
									_ = T(t, i.clientX, i.clientY),
									t.addEventListener("mousemove", r, !1), t.addEventListener("mouseup", l, !1),
									t.addEventListener("mouseout", l, !1)
								}, !1), function () { return E }
		} function P(e) {
			var
			t = [7, 13, 20, 32, 50, 65, 100, 160, 200, 325], r = [{ l: .7, q: 1.8 }, { l: .35, q: .44 }, {
				l:
					.22, q: .2
			}, { l: .14, q: .07 }, { l: .09, q: .032 }, { l: .07, q: .017 }, {
				l: .045, q: .0075
			}, { l: .027, q: .0028 }, { l: .022, q: .0019 }, { l: .014, q: 7e-4 }], o = t.length - 1, n = {}; if
				(e <= t[0]) return r[0]; if (e >= t[o]) return r[o];
			for (var a = 0; a < o; { if(e== t[a]) {
				n = r[a] < t[{
					var s = (t[a] - e) / (t[a] - t[a - 1]), l=r[a
						- 1].l - r[a].l, u=r[a - 1].q - r[a].q; n={
							l: ue(r[a].l + 1e4 * (l * s)) / 1e4, q:
								ue(r[a].q + 1e4 * (u * s)) / 1e4
						}; break } } return n
		} function S() {
			var e = 0 <
				arguments.length && arguments[0] !== void 0 ? arguments[0] : 1; return {
					position: [- e, -e,
					-e, -e, -e, e, e, -e, -e, e, -e, -e, -e, -e, e, e, -e, e, -e, -e, -e, -e, e, -e, -e, e, e,
					-e, e, e, -e, -e, e, -e, -e, -e, e, -e, -e, e, -e, e, e, e, e, e, e, e, e, e, -e, e, -e, -e,
					-e, -e, -e, e, -e, -e, e, e, -e, e, e, -e, -e, e, -e, -e, -e, -e, -e, -e, e, -e, e, e, e, e,
						e, e, e, e, e, -e, e, -e, -e, e, -e, e, -e, e, e, -e, e, e, e, e, e, e, -e, e, e, -e, e,
					-e], normal: [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0,
						0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0,
						0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
						0, 0, -1, 0, 0, -1, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0]
				}
		} function
			w() {
				var e = 0 < arguments.length && arguments[0] !== void 0 ? arguments[0] : 1; return {
					position: [- e, -e, -e, -e, e, -e, e, -e, -e, -e, e, -e, e, e, -e, e, -e, -e, -e, -e, e, e,
					-e, e, -e, e, e, -e, e, e, e, -e, e, e, e, e, -e, e, -e, -e, e, e, e, e, -e, -e, e, e, e, e,
						e, e, e, -e, -e, -e, -e, e, -e, -e, -e, -e, e, -e, -e, e, e, -e, -e, e, -e, e, -e, -e, -e,
					-e, -e, e, -e, e, -e, -e, -e, e, -e, e, e, -e, e, -e, e, -e, -e, e, e, -e, e, -e, e, e, -e,
						e, e, e, -e, e, e, e], normal: [0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
							0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
							1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, -1, 0, 0, -1, 0,
							0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
							0, 0]
				}
		} function A() {
			for (var e = 0 < arguments.length && void 0 !== arguments[0] ?
				arguments[0] : 1, t = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : 1, r = 2 <
					arguments.length && void 0 !== arguments[2] ? arguments[2] : 3, o = [], n = [], a = [], s = 2 * de /
						r, l = 0, u = 0, c = 6, f = 0; f < r; < h; { var m=(d + 6) % h, g = (d + 7) % h, v = (d + 8) % h, p = (d +
							9) % h, b = (d + 10) % h, _ = (d + 11) % h; n.push(0, t / 2, 0), n.push(o[m], o[g], o[v]),
								n.push(o[d], o[d + 1], o[d + 2]), a.push(0, 1, 0, 0, 1, 0, 0, 1, 0), n.push(o[d], o[d + 1],
									o[d + 2]), n.push(o[m], o[g], o[v]), n.push(o[d + 3], o[d + 4], o[d + 5]),
								a = a.concat(R([o[d], t / 2, o[d + 2]])), a = a.concat(R([o[m], t / 2, o[v]])),
								a = a.concat(R([o[d + 3], -t / 2, o[d + 5]])), n.push(o[d + 3], o[d + 4], o[d + 5]),
								n.push(o[m], o[g], o[v]), n.push(o[p], o[b], o[_]), a = a.concat(R([o[d + 3], -t / 2, o[d +
									5]])), a = a.concat(R([o[m], t / 2, o[v]])), a = a.concat(R([o[p], -t / 2, o[_]])), n.push(0, -t
										/ 2, 0), n.push(o[d + 3], o[d + 4], o[d + 5]), n.push(o[p], o[b], o[_]), a.push(0, -1, 0, 0,
											-1, 0, 0, -1, 0)
		} return o = null, { position: n, normal: a }
	} function D() {
		for (var e = 0 <
			arguments.length && void 0 !== arguments[0] ? arguments[0] : 1, t = 1 < arguments.length &&
				void 0 !== arguments[1] ? arguments[1] : 1, r = 2 < arguments.length && void 0 !== arguments[2]
					? arguments[2] : 3, o = [], n = [], a = [], s = 2 * de / r, l = 0, u = e * e / t, c = 0, f = 3, d = 0; d < r;
			< m; { var g=(h + 3) % m, v = (h + 4) % m, p = (h + 5) % m; n.push(0, t / 2, 0), n.push(o[g],
				o[v], o[p]), n.push(o[h], o[h + 1], o[h + 2]), a.push(0, 1, 0), a = a.concat(R([o[g], u,
				o[p]])), a = a.concat(R([o[h], u, o[h + 2]])), n.push(0, -t / 2, 0), n.push(o[h], o[h + 1],
					o[h + 2]), n.push(o[g], o[v], o[p]), a.push(0, -1, 0, 0, -1, 0, 0, -1, 0)
	} return o = null, {
		position: n, normal: a
	}
} function B() {
	var e, t, o, n, a, s, u, c, f = 0 < arguments.length
		&& void 0 !== arguments[0] ? arguments[0] : 1, r = 1 < arguments.length && void 0
			!== arguments[1] ? arguments[1] : 15, l = [], d = [], h = []; for (t = 0; t <= r; t++) for (s = t * de /
				r, c = f * ce(s), n = f * fe(s), e = 0; e <= r; e++) u = 2 * e * de / r, o = ce(u) * c, a = fe(u) * c,
					l.push(o, n, a); for (t = 0; t < r; < r; { var m=t * (r + 1) + e, g = m + r + 1; d.push(l[3 *
						m], l[3 * m + 1], l[3 * m + 2]), d.push(l[3 * g], l[3 * g + 1], l[3 * g + 2]), d.push(l[3 *
							(m + 1)], l[3 * (m + 1) + 1], l[3 * (m + 1) + 2]), d.push(l[3 * (m + 1)], l[3 * (m + 1) +
								1], l[3 * (m + 1) + 2]), d.push(l[3 * g], l[3 * g + 1], l[3 * g + 2]), d.push(l[3 * (g +
									1)], l[3 * (g + 1) + 1], l[3 * (g + 1) + 2]), h = h.concat(R([l[3 * m], l[3 * m + 1], l[3 * m
										+ 2]])), h = h.concat(R([l[3 * g], l[3 * g + 1], l[3 * g + 2]])), h = h.concat(R([l[3 * (m +
											1)], l[3 * (m + 1) + 1], l[3 * (m + 1) + 2]])), h = h.concat(R([l[3 * (m + 1)], l[3 * (m + 1)
												+ 1], l[3 * (m + 1) + 2]])), h = h.concat(R([l[3 * g], l[3 * g + 1], l[3 * g + 2]])),
						h = h.concat(R([l[3 * (g + 1)], l[3 * (g + 1) + 1], l[3 * (g + 1) + 2]]))
} return l = null, {
	position: d, normal: h
} } function C() {
	return {
		position: [- 1, 1, 0, -1, -1, 0, 1, 1,
			0, 1, 1, 0, -1, -1, 0, 1, -1, 0], texcoord: [0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0]
	}
}
function R(t) {
	var i = t[0], r = t[1], o = t[2], e = he(i * i + r * r + o * o); return e ? 1 == e ?
		t : (e = 1 / e, t[0] = i * e, t[1] = r * e, t[2] = o * e, t) : (t[0] = 0, t[1] = 0, t[2] = 0, t)
} function
	F(e, t, i) {
		return t in e ? Object.defineProperty(e, t, {
			value: i, enumerable: !0,
			configurable: !0, writable: !0
		}) : e[t] = i, e
} function M(e, i) {
	return be ||
		(be = e.createTexture()), i instanceof be.constructor
} function O(e) {
	return !!
		e.texStorage2D
} function G(e) {
	var t = e.name; return t.startsWith("gl_") ||
		t.startsWith("webgl_")
} function q(e, t) {
	ct(e, 0); var i = e.getExtension(t); if (i) {
		var
		r = {}, o = ft.exec(t)[1]; for (var n in i) {
			var a = i[n], s = "function" == typeof a, l = s ? o : "_" +
				o, u = n; n.endsWith(l) && (u = n.substring(0, n.length - l.length)), e[u] === void 0 ? s ?
					e[u] = function (e) { return function () { return e.apply(i, arguments) } }(a) : (e[u] = a,
						r[u] = a) : !s && e[u] !== a && console.warn(u, e[u], a, n)
		} r.constructor = {
			name:
				i.constructor.name
		}, ct(r, 0)
	} return i
} function I(e, t) {
	for (var r = 0; r < t.length; {
		for(var t = arguments.length, i=Array(1 < t ? <t; {
			for (var e, t, i, r, o = [],
				n = arguments.length, a = Array(n), s = 0; s < n; { e && o.push(e) }); for (var l, u = 0, c = o; u <
					c.length; {
						if(l = c[u], i = document.getElementById(l), !i) throw new Error("Can't find script
							element " + l);
											if(r = i.type, !r) throw new Error(" Script element type undefined"); 0 <= r.indexOf("vert") && (e = i.text),
			0 <= r.indexOf("frag") && (t = i.text)
		} if (!e) throw new Error("VERTEX_SHADER String not
							exist"); if (!t) throw new Error("FRAGMENT_SHADER String not exist"); return [e, t] }
							function X(e) {
				for (var t = arguments.length, i = Array(1 < t ? <t; {
					var
							l = e.getProgramInfoLog(a); throw e.deleteProgram(a), e.deleteShader(n), e.deleteShader(o),
					new Error("Failed to link program: " + l.toString())
				}
										return a
			}
									function k(e, t, i) {
				var r = e.createShader(t);
				if (!r) throw new Error(" Unable to create shader"); e.shaderSource(r, i), e.compileShader(r); var
					o = e.getShaderParameter(r, 35713); if (!o) {
						var n = e.getShaderInfoLog(r); throw
						e.deleteShader(r), new Error("Failed to compile shader: " + n.toString())
					}
				return r
			}
									function V(e) {
				for (var t = arguments.length,
					i = Array(1 < t ? <t; < i[{
						" )?X(e,i):W(e,i),n=j(e,o),a=H(e,o);return{program:o,uniformSetters:n,attribSetters:a}}function
							H(e, t){
						for(var
							r, o={}, n=e.getProgramParameter(t, 35721), a=0; a<n;a++)if (r = e.getActiveAttrib(t, a), !G(r)) {
						var
						s = e.getAttribLocation(t, r.name), l = rt[r.type], u = l.setter(e, s, l); u.location = s, o[r.name] = u
					} return
				o
			}function j(e, t) {
				function r(t, i) {
					var r = e.getUniformLocation(t, i.name), o = 1 < i.size && " [0] {
					var u = n; n += i.size, l = o ? s.arraySetter(e, a, u, r, i.size) : s.setter(e, a, u, r, i.size)
				} else l = s.arraySetter && o ? s.arraySetter(e, r) : s.setter(e, r); return l.location = r, l
			}
							for (var o, n = 0, a = {}, s = e.getProgramParameter(t, 35718), l = 0; l < s; {
		var
							u = o.name; "[0]"=== u.substr(- 3) && (u = u.substr(0, u.length - 3)); var c = r(t, o); a[u]= c
	}
							return a
} function U(e, t) {
	for (var i in e = e.uniformSetters || e, t) {
		var r = e[i]; r &&
			r(t[i])
	}
} function Y(e, t, i) {
	t.vertexArrayObject ?
	e.bindVertexArray(t.vertexArrayObject) : (J(i.attribSetters || i, t.attribs), t.indices &&
		e.bindBuffer(34963, t.indices))
} function J(e, t) {
	for (var i in e = e.attribSetters || e,
		t) { var r = e[i]; r && r(t[i]) }
} function K(e, t) {
	var i = { attribs: Q(e, t) },
	r = t.indices; if (r) {
		var o = ie(r, Uint16Array); i.indices = Z(e, o, 34963), i.count = r.count ||
			o.length, i.indexType = r.type || 5123
	} else i.count = te(t); return i
} function Q(e, t) {
	var
	i = {}; for (var r in t) if (!at(r)) {
		var o = t[r], n = ie(o), a = o.name || o.attrName || nt(r);
		i[a] = {
			buffer: Z(e, n, void 0, o.drawType), size: o.size || ee(a), type: o.type, normalize:
				re(n), stride: o.stride || 0, offset: o.offset || 0, divisor: o.divisor, drawType:
				o.drawType || 35044
		}
	} return e.bindBuffer(34962, null), i
} function Z(e, t, i, r) {
	i = i
	|| 34962; var o = e.createBuffer(); return e.bindBuffer(i, o), e.bufferData(i, t, r || 35044),
		o
} function $(e, t, i) {
	var r = e.createVertexArray(); return e.bindVertexArray(r), t.length
		|| (t = [t]), t.forEach(function (t) { Y(e, i, t) }), e.bindVertexArray(null), {
			count:
				i.count, indexType: i.indexType, vertexArrayObject: r
	}
} function ee(e, t) {
	var i; if
		(i = dt.test(e) ? 2 : ht.test(e) ? 4 : 3, 0 < t % i) throw new Error("Can not guess size for
							attribute ".concat(e, ".Tried ").concat(i, " but ").concat(t, " values is not evenly
							divisible by ").concat(i, ".You should specify it.")); return i } function te(e) { for
			(var t, i = Object.keys(e), r = i[0], o = 0, n = i; o < n.length; { r = t; break } var a = e[r],
				s = a.count || (a.data ? a.data : a).length, l = a.size || ee(r, s); if (0 < s % l) throw new
					Error("numComponents ".concat(l, " not correct for length ").concat(s));
	return s / l
}
function ie(e, t) {
	if (st(e)) return e;
	if (st(e.data)) return e.data;
	Array.isArray(e) && (e = {
		data: e
	});
	var i = e.type || t || Float32Array;
	return new i(e.data)
}
function re(e) {
	return !!(e instanceof Int8Array) || !!(e instanceof Uint8Array)
}
function oe(e, t, i, r, o) {
	i = i || 4,
		r = r || t.count,
		o = o || 0;
	var n = t.indexType;
	n ? e.drawElements(i, r, n, o) : e.drawArrays(i, o, r)
}
function ne(t, r, o, n) {
	o = o || t.drawingBufferWidth,
		n = n || t.drawingBufferHeight;
	var a = t.createFramebuffer();
	if (!a) throw new Error(" Failed to create frame buffer object"); t.bindFramebuffer(36160, a); var s = {
		framebuffer: a, textures: [], width: o, height: n
	}, l = r.texs || 1, u = !!r.depth;
	r.wrapT = r.wrapS = 33071; for (var c, f = 0; f < l; {
		var d = t.createRenderbuffer(); if(!d) throw
							new Error("Failed to create renderbuffer object"); t.bindRenderbuffer(36161, d),
		t.renderbufferStorage(36161, 33189, o, n), t.framebufferRenderbuffer(36160, 36096, 36161, d)
	} var h = t.checkFramebufferStatus(36160); if (36053 !== h) throw new Error("Frame buffer
							object is incomplete: " + h.toString());
										return t.bindFramebuffer(36160, null), t.bindTexture(3553, null), u && t.bindRenderbuffer(36161, null), s
}
function ae(e, t, i) {
	i = i || 36160,
		t ? (e.bindFramebuffer(i, t.framebuffer), e.viewport(0, 0, t.width, t.height)) : (e.bindFramebuffer(i, null), e.viewport(0, 0, e.drawingBufferWidth, e.drawingBufferHeight))
}
function se(e, t, i, r) {
	var o = e.createTexture();
	if (!o) throw new Error(" Failed to create texture object"); var n = t.target || 3553, a = t.format || 6408,
		s = t.informat || a, l = t.type || 5121; return e.bindTexture(n, o), i && r && e.texImage2D(n,
			0, s, i, r, 0, a, l, null), e.texParameteri(n, 10241, t.min || 9729), e.texParameteri(n,
				10240, t.mag || 9729), e.texParameteri(n, 10243, t.wrapT || 10497), e.texParameteri(n,
					10242, t.wrapS || 10497), o
} var me, ge, ve, pe, xe, be, _e = Float32Array, ye = Float32Array,
	Te = F, Ee = 33984, Le = 34962, ze = 5126, Pe = 35664, Se = 35665, we = 35666, Ae = 5124, De = 35667,
	Be = 35668, Ce = 35669, Re = 35670, Fe = 35671, Me = 35672, Oe = 35673, Ge = 35674, qe = 35675, Ie = 35676,
	We = 5125, Ne = 36294, Xe = 36295, ke = 36296, Ve = function (e, t) {
		return function (i) {
			e.uniform1i(t, i)
		}
	}, He = function (e, t) { return function (i) { e.uniform1iv(t, i) } },
	je = function (e, t) { return function (i) { e.uniform2iv(t, i) } }, Ue = function (e, t) {
		return
		function(i) { e.uniform3iv(t, i) }
	}, Ye = function (e, t) {
		return function (i) {
			e.uniform4iv(t, i)
		}
	}, Je = function (e) { return Ze[e].bindPoint }, Ke = function (e, t, i, r) {
		var o = Je(t); return O(e) ? function (t) {
			var n, a; M(e, t) ? (n = t, a = null) : (n = t.texture,
				a = t.sampler), e.uniform1i(r, i), e.activeTexture(Ee + i), e.bindTexture(o, n),
				e.bindSampler(i, a)
		} : function (t) {
			e.uniform1i(r, i), e.activeTexture(Ee + i),
			e.bindTexture(o, t)
		}
	}, Qe = function (e, t, r, o, n) {
		for (var a = Je(t), s = new Int32Array(n),
			l = 0; l < n; {
				e.uniform1iv(o, s), t.forEach(function (t, i) {
					e.activeTexture(Ee + s[i]); var
						o, n; M(e, t) ? (o = t, n = null) : (o = t.texture, n = t.sampler), e.bindSampler(r, n),
							e.bindTexture(a, o)
				})
			}: function(t) {
				e.uniform1iv(o, s), t.forEach(function (t, i) {
					e.activeTexture(Ee + s[i]), e.bindTexture(a, t)
				})
			}
	}, Ze = (pe = {}, Te(pe, ze, {
		Type:
			Float32Array, size: 4, setter: function (e, t) { return function (i) { e.uniform1f(t, i) } },
		arraySetter: function (e, t) { return function (i) { e.uniform1fv(t, i) } }
	}), Te(pe, Pe, {
		Type: Float32Array, size: 8, setter: function (e, t) {
			return function (i) {
				e.uniform2fv(t,
					i)
			}
		}
	}), Te(pe, Se, {
		Type: Float32Array, size: 12, setter: function (e, t) {
			return
			function(i) { e.uniform3fv(t, i) }
		}
	}), Te(pe, we, {
		Type: Float32Array, size: 16, setter:
			function (e, t) { return function (i) { e.uniform4fv(t, i) } }
	}), Te(pe, Ae, {
		Type:
			Int32Array, size: 4, setter: Ve, arraySetter: He
	}), Te(pe, De, {
		Type: Int32Array, size: 8,
		setter: je
	}), Te(pe, Be, { Type: Int32Array, size: 12, setter: Ue }), Te(pe, Ce, {
		Type:
			Int32Array, size: 16, setter: Ye
	}), Te(pe, We, {
		Type: Uint32Array, size: 4, setter:
			function (e, t) { return function (i) { e.uniform1ui(t, i) } }, arraySetter: function (e, t) {
				return function (i) { e.uniform1uiv(t, i) }
			}
	}), Te(pe, Ne, {
		Type: Uint32Array, size: 8,
		setter: function (e, t) { return function (i) { e.uniform2uiv(t, i) } }
	}), Te(pe, Xe, {
		Type:
			Uint32Array, size: 12, setter: function (e, t) { return function (i) { e.uniform3uiv(t, i) } }
	}), Te(pe, ke, {
		Type: Uint32Array, size: 16, setter: function (e, t) {
			return function (i) {
				e.uniform4uiv(t, i)
			}
		}
	}), Te(pe, Re, {
		Type: Uint32Array, size: 4, setter: Ve,
		arraySetter: He
	}), Te(pe, Fe, { Type: Uint32Array, size: 8, setter: je }), Te(pe, Me, {
		Type: Uint32Array, size: 12, setter: Ue
	}), Te(pe, Oe, {
		Type: Uint32Array, size: 16,
		setter: Ye
	}), Te(pe, Ge, {
		Type: Float32Array, size: 16, setter: function (e, t) {
			return
			function(i) { e.uniformMatrix2fv(t, !1, i) }
		}
	}), Te(pe, qe, {
		Type: Float32Array, size:
			36, setter: function (e, t) { return function (i) { e.uniformMatrix3fv(t, !1, i) } }
	}),
		Te(pe, Ie, {
			Type: Float32Array, size: 64, setter: function (e, t) {
				return function (i) {
					e.uniformMatrix4fv(t, !1, i)
				}
			}
		}), Te(pe, 35685, {
			Type: Float32Array, size: 24, setter:
				function (e, t) { return function (i) { e.uniformMatrix2x3fv(t, !1, i) } }
		}), Te(pe, 35686, {
			Type: Float32Array, size: 32, setter: function (e, t) {
				return function (i) {
					e.uniformMatrix2x4fv(t, !1, i)
				}
			}
		}), Te(pe, 35687, {
			Type: Float32Array, size: 24, setter:
				function (e, t) { return function (i) { e.uniformMatrix3x2fv(t, !1, i) } }
		}), Te(pe, 35688, {
			Type: Float32Array, size: 48, setter: function (e, t) {
				return function (i) {
					e.uniformMatrix3x4fv(t, !1, i)
				}
			}
		}), Te(pe, 35689, {
			Type: Float32Array, size: 32, setter:
				function (e, t) { return function (i) { e.uniformMatrix4x2fv(t, !1, i) } }
		}), Te(pe, 35690, {
			Type: Float32Array, size: 48, setter: function (e, t) {
				return function (i) {
					e.uniformMatrix4x3fv(t, !1, i)
				}
			}
		}), Te(pe, 35678, {
			Type: null, size: 0, setter: Ke,
			arraySetter: Qe, bindPoint: 3553
		}), Te(pe, 35680, {
			Type: null, size: 0, setter: Ke,
			arraySetter: Qe, bindPoint: 34067
		}), Te(pe, 35679, {
			Type: null, size: 0, setter: Ke,
			arraySetter: Qe, bindPoint: 32879
		}), Te(pe, 36289, {
			Type: null, size: 0, setter: Ke,
			arraySetter: Qe, bindPoint: 35866
		}), pe), $e = function (e, t) {
			return function (i) {
				if
					(i.value) switch (e.disableVertexAttribArray(t), i.value.length) {
						case 4:
							e.vertexAttrib4fv(t, i.value); break; case 3: e.vertexAttrib3fv(t, i.value); break; case 2:
							e.vertexAttrib2fv(t, i.value); break; case 1: e.vertexAttrib1fv(t, i.value); break; default:
							throw new Error("the length of a float constant value must be between 1 and 4!");
					} else
					e.bindBuffer(Le, i.buffer), e.enableVertexAttribArray(t), e.vertexAttribPointer(t, i.size,
						i.type || ze, i.normalize || !1, i.stride || 0, i.offset || 0), void 0 !== i.divisor &&
						e.vertexAttribDivisor(t, i.divisor)
			}
		}, et = function (e, t) {
			return function (i) {
				if
					(!i.value) e.bindBuffer(Le, i.buffer), e.enableVertexAttribArray(t),
						e.vertexAttribIPointer(t, i.size, i.type || Ae, i.stride || 0, i.offset || 0), void 0
						!== i.divisor && e.vertexAttribDivisor(t, i.divisor); else if (e.disableVertexAttribArray(t),
							4 === i.value.length) e.vertexAttrib4iv(t, i.value); else throw new Error("The length of an
							integer constant value must be 4!") } }, tt=function(e, t) { return function(i) { if
								(!i.value) e.bindBuffer(Le, i.buffer), e.enableVertexAttribArray(t),
								e.vertexAttribIPointer(t, i.size, i.type || We, i.stride || 0, i.offset || 0), void 0
								!== i.divisor && e.vertexAttribDivisor(t, i.divisor); else if (e.disableVertexAttribArray(t),
									4 === i.value.length) e.vertexAttrib4uiv(t, i.value); else throw new Error("The length of an
							unsigned integer constant value must be 4!") } }, it=function(e, t, r) { return function(o)
							{
											var n = o.count || r.size, a=r.count; e.bindBuffer(Le, o.buffer); for(var s = o.type || ze,
											l=Ze[s].size * n, u=o.normalize || !1, c=o.offset || 0, f=0; f<a; {}, Te(xe, ze, {
												size:
													4, setter: $e
											}), Te(xe, Pe, { size: 8, setter: $e }), Te(xe, Se, { size: 12, setter: $e }),
										Te(xe, we, { size: 16, setter: $e }), Te(xe, Ae, { size: 4, setter: et }), Te(xe, De, {
											size: 8, setter: et
										}), Te(xe, Be, { size: 12, setter: et }), Te(xe, Ce, {
											size: 16, setter:
												et
										}), Te(xe, We, { size: 4, setter: tt }), Te(xe, Ne, { size: 8, setter: tt }), Te(xe, Xe,
											{ size: 12, setter: tt }), Te(xe, ke, { size: 16, setter: tt }), Te(xe, Re, {
												size: 4,
												setter: et
											}), Te(xe, Fe, { size: 8, setter: et }), Te(xe, Me, { size: 12, setter: et }),
										Te(xe, Oe, { size: 16, setter: et }), Te(xe, Ge, { size: 4, setter: it, count: 2 }), Te(xe,
											qe, { size: 9, setter: it, count: 3 }), Te(xe, Ie, { size: 16, setter: it, count: 4 }), xe),
									ot = { addExtensionsToContext: !0 }, nt = function (e) {
										return "a" + e[0].toUpperCase() +
											e.substr(1)
									}, at = function (e) { return "indices" === e }, st = "undefined" == typeof
										SharedArrayBuffer ? function (e) { return e && e.buffer && e.buffer instanceof ArrayBuffer } :
										function (e) {
											return e && e.buffer && (e.buffer instanceof ArrayBuffer || e.buffer
												instanceof SharedArrayBuffer)
										}, lt = ["ANGLE_instanced_arrays", "EXT_blend_minmax"
											, "EXT_color_buffer_float", "EXT_color_buffer_half_float", "EXT_disjoint_timer_query"
											, "EXT_disjoint_timer_query_webgl2", "EXT_frag_depth", "EXT_sRGB"
											, "EXT_shader_texture_lod", "EXT_texture_filter_anisotropic", "OES_element_index_uint"
											, "OES_standard_derivatives", "OES_texture_float", "OES_texture_float_linear"
											, "OES_texture_half_float", "OES_texture_half_float_linear", "OES_vertex_array_object"
											, "WEBGL_color_buffer_float", "WEBGL_compressed_texture_atc"
											, "WEBGL_compressed_texture_etc1", "WEBGL_compressed_texture_pvrtc"
											, "WEBGL_compressed_texture_s3tc", "WEBGL_compressed_texture_s3tc_srgb"
											, "WEBGL_depth_texture", "WEBGL_draw_buffers"],
									ut = ["EXT_color_buffer_float", "EXT_color_buffer_half_float"
										, "EXT_disjoint_timer_query_webgl2", "EXT_texture_filter_anisotropic"
										, "OES_texture_float_linear", "OES_vertex_array_object", "WEBGL_color_buffer_float"
										, "WEBGL_compressed_texture_atc", "WEBGL_compressed_texture_etc1"
										, "WEBGL_compressed_texture_pvrtc", "WEBGL_compressed_texture_s3tc"
										, "WEBGL_compressed_texture_s3tc_srgb"], ct = function () {
											function e(e) {
												var
												r = e.constructor.name; if (!t[r]) {
													for (var o in e) if ("number" == typeof e[o]) {
														var
														n = i[e[o]]; i[e[o]] = n ? "".concat(n, " | ").concat(o) : o
													} t[r] = !0
												}
											} var t = {}, i = {};
											return function (t, r) { return e(t), i[r] || "0x" + r.toString(16) }
										}(), ft = /^(.*?)_/,
									dt = /coord|texture/i, ht = /color|colour/i, mt = /position/i,
									gt = document.getElementById("canvas"), vt = function (e, t) {
										for (var i, r = ["webgl2", "webgl"
											, "experimental-webgl"], o = null, n = 0, a = r; n < a.length; {
												"webgl2"=== i &&
													ot.addExtensionsToContext && I(o, ut), "webgl"=== i && ot.addExtensionsToContext && I(o, lt);
												break } return o
									}(gt); (function () {
										if (!vt) throw new Error("Failed to get the rendering
							context for WebGL"); for (var e=ne(vt, { informat: vt.RGBA16F, type: vt.FLOAT, texs: 3,
							depth: !0
									}, 2 * gt.width, 2 * gt.height),
										t = V(vt, "#version 300 es\n#define GLSLIFY 1\nin vec4 aPosition;\nin vec4 aNormal;\nuniform mat4 modelMatrix;\nuniform mat4 vpMatrix;\nout vec3 vPosition;\nout vec3 vNormal;\n\nvoid main() {\n\tgl_Position = vpMatrix * modelMatrix * aPosition;\n\tvNormal = vec3(transpose(inverse(modelMatrix)) * aNormal);\n\tvPosition = vec3(modelMatrix * aPosition);\n}"
											, "#version 300 es\nprecision highp float;\n#define GLSLIFY 1\nlayout (location = 0) out vec3 gPosition;\nlayout (location = 1) out vec3 gNormal;\nlayout (location = 2) out vec4 gColor;\n\nuniform vec4 color;\nin vec3 vPosition;\nin vec3 vNormal;\n\nvoid main() {    \n  // Store the fragment position vector in the first gbuffer texture\n  gPosition = vPosition;\n  // Also store the per-fragment normals into the gbuffer\n  gNormal = normalize(vNormal);\n  gColor = color;\n}"
										),
										o = V(vt, "#version 300 es\n#define GLSLIFY 1\nin vec3 aPosition;\nin vec2 aTexcoord;\nout vec2 texcoord;\n\nvoid main() {\n  texcoord = aTexcoord;\n  gl_Position = vec4(aPosition, 1.0);\n}"
											, "#version 300 es\nprecision highp float;\n#define GLSLIFY 1\nuniform vec3 viewPosition;\nuniform vec3 lightDirection;\nuniform vec3 lightColor;\nuniform vec3 ambientColor;\nuniform float shininess;\nuniform sampler2D gPosition;\nuniform sampler2D gNormal;\nuniform sampler2D gColor;\n\nstruct PointLight { \n\tvec3 position; \n\tvec3 color; \n\tfloat shininess; \n\tfloat line;\n\tfloat quad;\n};\nuniform PointLight pointLights[10];\n\nstruct SpotLight { \n\tvec3 position; \n\tvec3 direction; \n\tvec3 color;\n\tfloat outerRad; \n\tfloat innerRad;\n\tfloat shininess;\n}; \nuniform SpotLight spotLights[3];\n\nin vec2 texcoord;\nout vec4 FragColor;\n\n/*\n * \u70B9\u5149\u6E90\n */\nvec3 getPointLights(vec3 fragPos, vec3 normal, vec3 color, vec3 viewDir) {\n\tvec3 ret = vec3(0.0);\n\tfor(int i = 0; i < 10; i++) {\n\t\tvec3 lightPos = pointLights[i].position;\n\t\tvec3 lightColor = pointLights[i].color;\n\t\tfloat lightShininess = pointLights[i].shininess;\n\n\t\tvec3 lightDir = normalize(lightPos - fragPos);\n\t\tfloat cosTheta = max(dot(lightDir, normal), 0.0);\n\t\tvec3 diffuse = lightColor * color * cosTheta;\n\t\t// \u9AD8\u5149\n\t\tvec3 halfwayDir = normalize(lightDir + viewDir);\n\t\tfloat specularIntensity = pow(max(dot(normal, halfwayDir), 0.0), lightShininess);\n\t\tvec3 specular = lightColor * specularIntensity;\n\t\t// \u5149\u5F3A\u8870\u51CF\n\t\tfloat dis = distance(lightPos, fragPos);\n\t\tfloat att = 1.0 / (1.0 + pointLights[i].line * dis + pointLights[i].quad * (dis * dis));\n\n\t\tret += (diffuse + specular) * att;\n\t}\n\treturn ret;\n}\n\n/*\n * \u805A\u5149\u706F\n */\nvec3 getSpotLights(vec3 fragPos, vec3 normal, vec3 color, vec3 viewDir) {\n\tvec3 ret = vec3(0.0);\n\tfor(int i = 0; i < 3; i++) {\n\t\tvec3 lightPos = spotLights[i].position;\n\t\tvec3 lightColor = spotLights[i].color;\n\t\tfloat lightShininess = spotLights[i].shininess;\n\t\tvec3 lightDir = normalize(spotLights[i].direction);\n\t\tfloat outerLimit = cos(spotLights[i].outerRad); //\u7167\u5C04\u8303\u56F4\u89D2\u5EA6|\u6A21\u7CCA\u5916\u5F84\u89D2\u5EA6\n\t\tfloat innerLimit = cos(spotLights[i].innerRad); //\u6A21\u7CCA\u5185\u5F84\u89D2\u5EA6\n\n\t\tvec3 surToLightDir = normalize(lightPos - fragPos); // \u70B9\u5149\u6E90\u53CD\u5411 \u5149\u6E90\u4F4D\u7F6E-\u9876\u70B9\u4F4D\u7F6E\n\t\tfloat dotFromDirection = dot(surToLightDir, lightDir); //\u5149\u6E90\u65B9\u5411\u4E0E\u8868\u9762\u5149\u7EBF\u65B9\u5411\u7684\u5939\u89D2\n\t\tfloat inlightBloom = smoothstep(outerLimit, innerLimit, dotFromDirection); //\u805A\u5149\u706F\u8303\u56F4 + \u8FB9\u7F18\u6A21\u7CCA\n\t\tfloat cosTheta = max(dot(surToLightDir, normal), 0.0); // \u5149\u7EBF\u65B9\u5411\u548C\u6CD5\u5411\u91CF\u7684\u5939\u89D2\uFF0C\u5B83\u4EEC\u7684\u70B9\u79EF\u5373\u53EF\u6C42\u51FA\u5939\u89D2\u4F59\u5F26\u503C(\u8303\u56F40-90\u5EA6)\n\t\tvec3 diffuse = lightColor * color * cosTheta * inlightBloom;\n\t\t// \u9AD8\u5149\n\t\tvec3 halfwayDir = normalize(surToLightDir + viewDir);\n\t\tfloat specularIntensity = pow(max(dot(normal, halfwayDir), 0.0), lightShininess);\n\t\tvec3 specular = lightColor * specularIntensity * inlightBloom;\n\n\t\tret += (diffuse + specular);\n\t}\n\treturn ret;\n}\n\nvoid main() {\n  vec3 fragPos = texture(gPosition, texcoord).rgb;\n  vec3 normal = texture(gNormal, texcoord).rgb;\n  vec3 color = texture(gColor, texcoord).rgb;\n \n\tvec3 viewDir = normalize(viewPosition - fragPos); //\u89C6\u70B9\u65B9\u5411 \n\tvec3 lightDir = normalize(lightDirection); // \u5E73\u884C\u5149\u65B9\u5411\n\t// vec3 lightDir = normalize(lightPos - fragPos); // \u70B9\u5149\u65B9\u5411\n\tfloat cosTheta = max(dot(lightDir, normal), 0.0); // \u5149\u7EBF\u65B9\u5411\u548C\u6CD5\u5411\u91CF\u5939\u89D2\n\t// \u73AF\u5883\u5149\n\tvec3 ambient = ambientColor * color;\n\t// \u6F2B\u53CD\u5C04\n\tvec3 diffuse = lightColor * color * cosTheta;\n\t// \u9AD8\u5149\n\t// vec3 halfwayDir = normalize(lightDir + viewDir);\n\t// float specularIntensity = pow(max(dot(normal, halfwayDir), 0.0), shininess);\n\t// vec3 specular = lightColor * specularIntensity;\n\n\tFragColor = vec4(ambient + diffuse + getPointLights(fragPos, normal, color, viewDir) + getSpotLights(fragPos, normal, color, viewDir), 1.0);\n}"
										), n = $(vt, t, K(vt, S(40))), a = [$(vt, t, K(vt, B(1.6, 20))), $(vt, t, K(vt, w(1.6))), $(vt,
											t, K(vt, D(1.6, 3.2, 40))), $(vt, t, K(vt, A(1.6, 3.2, 30)))], s = $(vt, o, K(vt, C())), g = [],
										v = 0; 60 > v; v++) g.push({
											position: [le(100 * (25 * ce(2 * (Math.random() * de)))) / 100, le(100 * (20 * ce(2 *
												(Math.random() * de)))) / 100, le(100 * (25 * ce(2 * (Math.random() * de)))) / 100],
											color: y(x())
										});
				for (var p = [], b = 0; 10 > b; b++) {
					var _ = 8 * Math.random() + 30,
						r = 2 * (Math.random() * de),
						T = P(ue(10 * Math.random() + 80));
					p.push({
						position: [le(100 * (fe(r) * _)) / 100, le(100 * (20 * ce(2 * (Math.random() * de)))) / 100
							+ 10, le(100 * (ce(r) * _)) / 100],
						color: y(x()).slice(0, 3),
						line: T.l,
						quad: T.q,
						shininess: 30
					})
				}
				var L = [{
					position: [- 40, 40, 0],
					direction: [- 10, 30, 0],
					color: y(x()).slice(0, 3),
					outerRad: 20 * (de / 180),
					innerRad: 18 * (de / 180),
					shininess: 30
				},
				{
					position: [40, 40, -20],
					direction: [10, 30, -15],
					color: y(x()).slice(0, 3),
					outerRad: 16 * (de / 180),
					innerRad: 14 * (de / 180),
					shininess: 30
				},
				{
					position: [0, 40, 40],
					direction: [0, 40, 32],
					color: y(x()).slice(0, 3),
					outerRad: 16 * (de / 180),
					innerRad: 14 * (de / 180),
					shininess: 30
				}],
					R = {
						lightDirection: [- 20, -30, -40],
						lightColor: [.7, .7, .7],
						ambientColor: [.1, .1, .1],
						shininess: 30,
						gPosition: e.textures[0],
						gNormal: e.textures[1],
						gColor: e.textures[2]
					};
				p.forEach(function (e, t) {
					for (var i in e) R["pointLights[".concat(t, "].").concat(i)] = e[i]
				}),
					L.forEach(function (e, t) {
						Object.keys(e).forEach(function (i) {
							R["spotLights[".concat(t, "].").concat(i)] = e[i]
						})
					});
				var F = l(),
					M = f(de / 3, gt.width / gt.height, .5, 200),
					O = z(gt, [24, 60, 80], 1, 80),
					G = 0;
				vt.clearColor(0, 0, 0, 1),
					vt.enable(vt.DEPTH_TEST),
					vt.enable(vt.CULL_FACE),
					E(gt),
					function i() {
						G += de / 180,
							G %= 2 * de;
						var r = O(),
							f = d(r, [0, 0, 0], [0, 1, 0]);
						c(M, u(f), F),
							ae(vt, e),
							vt.clear(vt.COLOR_BUFFER_BIT | vt.DEPTH_BUFFER_BIT),
							vt.useProgram(t.program),
							vt.drawBuffers([vt.COLOR_ATTACHMENT0, vt.COLOR_ATTACHMENT1, vt.COLOR_ATTACHMENT2]),
							U(t, {
								vpMatrix: F,
								modelMatrix: l(),
								color: [.7, .7, .7, 1]
							}),
							Y(vt, n),
							oe(vt, n),
							g.forEach(function (e, r) {
								var i = a[r % a.length],
									o = m(G);
								h(o, e.position, o),
									U(t, {
										modelMatrix: o,
										color: e.color
									}),
									Y(vt, i),
									oe(vt, i)
							}),
							vt.bindVertexArray(null),
							ae(vt, null),
							vt.clear(vt.COLOR_BUFFER_BIT | vt.DEPTH_BUFFER_BIT),
							vt.useProgram(o.program),
							R.viewPosition = r,
							U(o, R),
							Y(vt, s),
							oe(vt, s),
							vt.bindVertexArray(null),
							requestAnimationFrame(i)
					}()
			}) ()
		})();