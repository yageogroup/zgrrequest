sap.ui.define(["sap/m/MessageToast"], function(e) {
    "use strict";
    var t = false;
    var n = "zgrrequest::ZP_GR_REQUEST_HEADObjectPage--fe::ObjectPage";
    var r = {
        parent: {},
        domRef: {}
    };
    var i = "/sap/opu/odata4/sap/zui_gr_request/srvd/sap/zsd_gr_request/0001/" + "ZI_ZGR_REQ_SRCIMG";
    var o = "/sap/opu/odata4/sap/zui_gr_request/srvd/sap/zsd_gr_request/0001/" + "ZI_ZGR_FLDINFO";
    var a = null;
    var l = null;
    var s = null;

    function d(e, t) {
        var n = i + "?$filter=Grrequest eq '" + e + "'" + "&$select=Pgnum" + "&$format=json";
        fetch(n, {
            credentials: "include"
        }).then(function(e) {
            return e.json()
        }).then(function(e) {
            var n = e.value || [];
            var r = 1;
            n.forEach(function(e) {
                var t = parseInt(e.Pgnum, 10);
                if (!isNaN(t) && t > r) {
                    r = t
                }
            });
            t(null, n.length > 0 ? r : 1)
        }).catch(function(e) {
            t(e, 1)
        })
    }

    function c(e, t, n) {
        var r = i + "(Grrequest='" + encodeURIComponent(e) + "'" + ",Pgnum=" + t + ")" + "?$select=Imgcontent,Mimetype" + "&$format=json";
        fetch(r, {
            credentials: "include"
        }).then(function(e) {
            return e.json()
        }).then(function(e) {
            var t = e.Mimetype || "image/jpeg";
            var r = e.Imgcontent || "";
            if (!r) {
                n(new Error("No image content"), null);
                return
            }
            r = r.replace(/-/g, "+").replace(/_/g, "/");
            var i = r.length % 4;
            if (i === 2) {
                r += "=="
            } else if (i === 3) {
                r += "="
            }
            n(null, "data:" + t + ";base64," + r)
        }).catch(function(e) {
            n(e, null)
        })
    }

    function u(e, t, n) {
        var r = o + "?$filter=Grrequest eq '" + e + "'" + " and Slsordreqsourceimagepagenumber eq " + t + "&$format=json";
        fetch(r, {
            credentials: "include"
        }).then(function(e) {
            return e.json()
        }).then(function(e) {
            n(null, e.value || [])
        }).catch(function(e) {
            n(e, [])
        })
    }

    function p(e) {
        if (!e) {
            return ""
        }
        return e.replace(/([A-Z])/g, " $1").replace(/^./, function(e) {
            return e.toUpperCase()
        }).trim()
    }

    function f(e, t) {
        var n = e.getBoundingClientRect();
        var r = t.getBoundingClientRect();
        if (!n.width || !n.height) {
            return null
        }
        return {
            left: n.left - r.left + t.scrollLeft,
            top: n.top - r.top + t.scrollTop,
            width: n.width,
            height: n.height
        }
    }

    function g(e, t, n, r, i) {
        var o = n.querySelector("#doxHighlightLayer");
        if (o) {
            o.remove()
        }
        var a = f(t, n);
        if (!a) {
            return
        }
        var l = document.createElement("div");
        l.id = "doxHighlightLayer";
        l.style.cssText = "position:absolute;" + "left:" + a.left + "px;" + "top:" + a.top + "px;" + "width:" + a.width + "px;" + "height:" + a.height + "px;" + "pointer-events:none;z-index:10;overflow:visible;";
        e.forEach(function(e) {
            var t = parseFloat(e.Fieldhorizontalaxisvalue);
            var n = parseFloat(e.Fieldverticalaxisvalue);
            var o = parseFloat(e.Fieldboundingboxwidthvalue);
            var a = parseFloat(e.Fieldboundingboxheightvalue);
            if (isNaN(t) || isNaN(n) || isNaN(o) || isNaN(a) || t < 0 || t > 1 || n < 0 || n > 1 || o <= 0 || a <= 0) {
                return
            }
            var s = parseInt(e.Extracteditemindex, 10) === 0;
            var d = s ? "rgba(0,112,177," : "rgba(255,140,0,";
            var c = document.createElement("div");
            c.style.cssText = "position:absolute;" + "left:" + t * 100 + "%;" + "top:" + n * 100 + "%;" + "width:" + o * 100 + "%;" + "height:" + Math.max(a * 100, .8) + "%;" + "background:" + d + "0.20);" + "border:1.5px solid " + d + "0.85);" + "border-radius:2px;box-sizing:border-box;";
            var u = p(e.Extractedfieldname);
            var f = e.Extractedfieldvalue || "";
            c.title = u + ": " + f;
            var g = s ? r : i;
            if (g) {
                var v = document.createElement("div");
                v.textContent = u;
                v.style.cssText = "position:absolute;left:0;top:-12px;" + "background:" + d + "0.95);" + "color:#fff;font-size:8px;line-height:10px;" + "padding:0px 3px;border-radius:2px;white-space:nowrap;" + "max-width:max-content;box-shadow:0 1px 2px rgba(0,0,0,0.35);" + "pointer-events:none;z-index:11;";
                c.appendChild(v)
            }
            l.appendChild(c)
        });
        n.appendChild(l)
    }

    function v(e, t) {
        var n = {};
        t.forEach(function(t) {
            n[t] = e.style[t] || ""
        });
        return n
    }

    function h(e, t) {
        Object.keys(t).forEach(function(n) {
            e.style[n] = t[n]
        })
    }

    function x() {
        if (a) {
            window.removeEventListener("hashchange", a);
            a = null
        }
        if (l && s) {
            try {
                s.detachRouteMatched(l)
            } catch (e) {}
            l = null;
            s = null
        }
    }

    function y(n, i) {
        var o = n.getDomRef();
        if (!o) {
            e.show("DOM not found.");
            return
        }
        var p = i ? i.getProperty("Grrequest") : "";
        if (!p) {
            e.show("No GR Request key found.");
            return
        }
        var f = o.parentElement;
        var h = ["display", "flexDirection", "width", "height", "overflow"];
        var y = ["flexBasis", "flexGrow", "flexShrink", "minWidth", "width", "height", "overflowY", "overflow"];
        r.parent = v(f, h);
        r.domRef = v(o, y);
        f.style.display = "flex";
        f.style.flexDirection = "row";
        f.style.width = "100%";
        f.style.height = "calc(100vh - 3rem)";
        f.style.overflow = "hidden";
        o.style.flexBasis = "55%";
        o.style.flexGrow = "0";
        o.style.flexShrink = "0";
        o.style.minWidth = "300px";
        o.style.height = "100%";
        o.style.overflowY = "auto";
        o.style.overflow = "auto";
        var b = document.createElement("div");
        b.id = "splitterBar";
        b.style.width = "10px";
        b.style.cursor = "col-resize";
        b.style.background = "#b0b0b0";
        b.style.flexShrink = "0";
        b.style.height = "100%";
        b.style.zIndex = "9999";
        var w = document.createElement("div");
        w.id = "splitRightPanel";
        w.style.flex = "1";
        w.style.minWidth = "300px";
        w.style.height = "100%";
        w.style.display = "flex";
        w.style.flexDirection = "column";
        w.style.borderLeft = "1px solid #ccc";
        w.style.boxSizing = "border-box";
        w.style.overflow = "hidden";
        var E = document.createElement("div");
        E.style.cssText = "display:flex;align-items:center;justify-content:space-between;" + "padding:8px 16px;background:#f7f7f7;border-bottom:1px solid #ccc;" + "flex-shrink:0;gap:12px;";
        E.innerHTML = '<span style="font-weight:bold;font-size:15px;">Source File</span>' + '<span style="font-size:12px;display:flex;gap:12px;align-items:center;flex:1;justify-content:flex-end;">' + '<span id="legendHeaderToggle" style="cursor:pointer;padding:2px 6px;border-radius:3px;border:1px solid transparent;user-select:none;">' + '<span style="display:inline-block;width:12px;height:12px;background:rgba(0,112,177,0.3);border:1.5px solid #0070b1;border-radius:2px;margin-right:4px;vertical-align:middle;"></span>Header</span>' + '<span id="legendItemToggle" style="cursor:pointer;padding:2px 6px;border-radius:3px;border:1px solid transparent;user-select:none;">' + '<span style="display:inline-block;width:12px;height:12px;background:rgba(255,140,0,0.3);border:1.5px solid orange;border-radius:2px;margin-right:4px;vertical-align:middle;"></span>Line Items</span>' + '<span id="pageNavContainer" style="display:flex;align-items:center;gap:4px;">' + '<button id="pagePrevBtn" style="cursor:pointer;border:1px solid #ccc;background:#fff;border-radius:3px;width:20px;height:22px;font-size:12px;line-height:1;display:flex;align-items:center;justify-content:center;">&#8249;</button>' + '<select id="pageSelect" style="font-size:12px;height:22px;border:1px solid #ccc;border-radius:3px;background:#fff;padding:0 2px;"></select>' + '<span id="pageTotalLabel" style="font-size:12px;color:#555;">/ 1</span>' + '<button id="pageNextBtn" style="cursor:pointer;border:1px solid #ccc;background:#fff;border-radius:3px;width:20px;height:22px;font-size:12px;line-height:1;display:flex;align-items:center;justify-content:center;">&#8250;</button>' + "</span></span>" + '<button id="splitCloseBtn" style="cursor:pointer;border:none;background:none;font-size:20px;">\u2715</button>';
        var C = document.createElement("div");
        C.id = "imageContainerWrapper";
        C.style.cssText = "position:relative;flex:1;overflow:auto;background:#888;" + "display:flex;align-items:flex-start;justify-content:flex-start;";
        var L = document.createElement("img");
        L.id = "grSourceImage";
        L.style.cssText = "display:none;width:100%;height:auto;";
        L.src = "";
        var k = document.createElement("span");
        k.id = "imageLoadingText";
        k.style.color = "#eee";
        k.style.fontSize = "14px";
        k.style.padding = "16px";
        k.textContent = "Loading image...";
        C.appendChild(k);
        C.appendChild(L);
        w.appendChild(E);
        w.appendChild(C);
        f.appendChild(b);
        f.appendChild(w);
        var z = [];
        var S = false;
        var q = false;
        var R = E.querySelector("#legendHeaderToggle");
        var I = E.querySelector("#legendItemToggle");

        function _() {
            R.style.background = S ? "rgba(0,112,177,0.15)" : "transparent";
            R.style.borderColor = S ? "#0070b1" : "transparent";
            I.style.background = q ? "rgba(255,140,0,0.15)" : "transparent";
            I.style.borderColor = q ? "orange" : "transparent"
        }

        function T() {
            g(z, L, C, S, q)
        }
        R.addEventListener("click", function() {
            S = !S;
            _();
            T()
        });
        I.addEventListener("click", function() {
            q = !q;
            _();
            T()
        });
        _();
        var B = null;
        window.addEventListener("resize", T);
        C.addEventListener("scroll", T);
        if (window.ResizeObserver) {
            B = new ResizeObserver(T);
            B.observe(C)
        }
        w._cleanup = function() {
            window.removeEventListener("resize", T);
            if (B) {
                B.disconnect();
                B = null
            }
        };
        var N = E.querySelector("#pagePrevBtn");
        var j = E.querySelector("#pageNextBtn");
        var F = E.querySelector("#pageSelect");
        var M = E.querySelector("#pageTotalLabel");
        var P = 1;
        var G = 1;

        function H() {
            N.disabled = P <= 1;
            j.disabled = P >= G;
            N.style.opacity = N.disabled ? "0.4" : "1";
            j.style.opacity = j.disabled ? "0.4" : "1";
            N.style.cursor = N.disabled ? "default" : "pointer";
            j.style.cursor = j.disabled ? "default" : "pointer";
            F.disabled = G <= 1
        }

        function D(e) {
            u(p, e, function(e, t) {
                z = !e ? t : [];
                T()
            })
        }

        function O(e) {
            if (e < 1 || e > G) {
                return
            }
            P = e;
            F.value = String(e);
            L.src = "";
            L.style.display = "none";
            k.style.display = "";
            k.textContent = "Loading image...";
            z = [];
            var t = C.querySelector("#doxHighlightLayer");
            if (t) {
                t.remove()
            }
            H();
            c(p, P, function(e, t) {
                if (e || !t) {
                    k.textContent = "No image found.";
                    return
                }
                L.onload = function() {
                    k.style.display = "none";
                    L.style.display = "block";
                    T()
                };
                L.onerror = function() {
                    k.textContent = "Image failed to render."
                };
                L.src = t
            });
            D(P)
        }
        N.addEventListener("click", function() {
            O(P - 1)
        });
        j.addEventListener("click", function() {
            O(P + 1)
        });
        F.addEventListener("change", function() {
            O(parseInt(F.value, 10))
        });
        d(p, function(e, t) {
            G = e ? 1 : t;
            F.innerHTML = "";
            for (var n = 1; n <= G; n++) {
                var r = document.createElement("option");
                r.value = r.textContent = String(n);
                F.appendChild(r)
            }
            M.textContent = "/ " + G;
            O(1)
        });
        var $ = false,
            Z = null,
            U = null;
        b.addEventListener("mouseenter", function() {
            if (!$) {
                b.style.background = "#666"
            }
        });
        b.addEventListener("mouseleave", function() {
            if (!$) {
                b.style.background = "#b0b0b0"
            }
        });
        b.addEventListener("mousedown", function() {
            $ = true;
            document.body.style.cursor = "col-resize";
            document.body.style.userSelect = "none";
            b.style.background = "#444"
        });
        document.addEventListener("mousemove", function(e) {
            if (!$) {
                return
            }
            var t = f.getBoundingClientRect();
            var n = Math.min(Math.max(e.clientX - t.left, 300), t.width - 300);
            Z = n;
            if (!U) {
                U = requestAnimationFrame(function() {
                    o.style.flexBasis = Z + "px";
                    U = null;
                    T()
                })
            }
        });
        document.addEventListener("mouseup", function() {
            if (!$) {
                return
            }
            $ = false;
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
            b.style.background = "#666";
            T()
        });
        E.querySelector("#splitCloseBtn").addEventListener("click", function() {
            m(n)
        });
        t = true;
        document.body.classList.add("gr-split-active");
        x();
        a = function() {
            if (t) {
                m(n)
            }
            x()
        };
        window.addEventListener("hashchange", a);
        try {
            var W = sap.ui.core.UIComponent.getRouterFor(n);
            if (W) {
                s = W;
                l = function() {
                    if (t) {
                        m(n)
                    }
                    x()
                };
                s.attachRouteMatched(l)
            }
        } catch (e) {}
    }

    function m(e) {
        var n = e.getDomRef();
        if (!n) {
            return
        }
        var i = n.parentElement;
        document.body.classList.remove("gr-split-active");
        x();
        var o = document.getElementById("splitRightPanel");
        if (o) {
            if (typeof o._cleanup === "function") {
                o._cleanup()
            }
            o.remove()
        }
        var a = document.getElementById("splitterBar");
        if (a) {
            a.remove()
        }
        h(i, r.parent);
        h(n, r.domRef);
        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";
        setTimeout(function() {
            window.dispatchEvent(new Event("resize"));
            if (e && e.invalidate) {
                e.invalidate()
            }
        }, 50);
        t = false
    }
    return {
        viewfilehandler: function(r) {
            var i = sap.ui.getCore().byId(n);
            if (!i) {
                e.show("Object Page not found");
                return
            }
            var o = r ? r.getBindingContext ? r.getBindingContext() : r : null;
            if (t) {
                m(i)
            } else {
                y(i, o)
            }
        }
    }
});