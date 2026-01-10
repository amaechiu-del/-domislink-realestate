module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/Desktop/domislink-empire_1/domislink-empire/apps/realestate/src/app/listings/create/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Create
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$domislink$2d$empire_1$2f$domislink$2d$empire$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/domislink-empire_1/domislink-empire/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$domislink$2d$empire_1$2f$domislink$2d$empire$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/domislink-empire_1/domislink-empire/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
function Create() {
    const [f, setF] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$domislink$2d$empire_1$2f$domislink$2d$empire$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        title: "",
        price: "",
        loc: "",
        type: "sale"
    });
    const [ready, setReady] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$domislink$2d$empire_1$2f$domislink$2d$empire$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$domislink$2d$empire_1$2f$domislink$2d$empire$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const script = document.createElement("script");
        script.src = "https://js.paystack.co/v1/inline.js";
        script.onload = ()=>setReady(true);
        document.body.appendChild(script);
    }, []);
    const pay = ()=>{
        if (!ready) {
            alert("Loading payment...");
            return;
        }
        const handler = window.PaystackPop.setup({
            key: "pk_test_beb2d6a31e76b83149985e1085496275698b2755     ",
            email: "test@domislink.com",
            amount: 500000,
            currency: "NGN",
            ref: "DL" + Date.now(),
            callback: (r)=>{
                alert("Payment Success! Ref: " + r.reference);
            },
            onClose: ()=>{
                alert("Payment cancelled");
            }
        });
        handler.openIframe();
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$domislink$2d$empire_1$2f$domislink$2d$empire$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            background: "#0a0a0f",
            color: "white",
            minHeight: "100vh",
            padding: "40px"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$domislink$2d$empire_1$2f$domislink$2d$empire$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                style: {
                    textAlign: "center",
                    fontSize: "32px"
                },
                children: [
                    "Post ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$domislink$2d$empire_1$2f$domislink$2d$empire$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            color: "#EEFF00"
                        },
                        children: "Property"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/domislink-empire_1/domislink-empire/apps/realestate/src/app/listings/create/page.tsx",
                        lineNumber: 31,
                        columnNumber: 61
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/domislink-empire_1/domislink-empire/apps/realestate/src/app/listings/create/page.tsx",
                lineNumber: 31,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$domislink$2d$empire_1$2f$domislink$2d$empire$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    maxWidth: "450px",
                    margin: "24px auto",
                    background: "#16161d",
                    padding: "24px",
                    borderRadius: "12px"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$domislink$2d$empire_1$2f$domislink$2d$empire$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        placeholder: "Property Title",
                        onChange: (e)=>setF({
                                ...f,
                                title: e.target.value
                            }),
                        style: {
                            width: "100%",
                            padding: "14px",
                            marginBottom: "12px",
                            background: "#0a0a0f",
                            border: "1px solid #333",
                            borderRadius: "8px",
                            color: "white",
                            boxSizing: "border-box"
                        }
                    }, void 0, false, {
                        fileName: "[project]/Desktop/domislink-empire_1/domislink-empire/apps/realestate/src/app/listings/create/page.tsx",
                        lineNumber: 33,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$domislink$2d$empire_1$2f$domislink$2d$empire$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        placeholder: "Price (₦)",
                        type: "number",
                        onChange: (e)=>setF({
                                ...f,
                                price: e.target.value
                            }),
                        style: {
                            width: "100%",
                            padding: "14px",
                            marginBottom: "12px",
                            background: "#0a0a0f",
                            border: "1px solid #333",
                            borderRadius: "8px",
                            color: "white",
                            boxSizing: "border-box"
                        }
                    }, void 0, false, {
                        fileName: "[project]/Desktop/domislink-empire_1/domislink-empire/apps/realestate/src/app/listings/create/page.tsx",
                        lineNumber: 34,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$domislink$2d$empire_1$2f$domislink$2d$empire$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        placeholder: "Location",
                        onChange: (e)=>setF({
                                ...f,
                                loc: e.target.value
                            }),
                        style: {
                            width: "100%",
                            padding: "14px",
                            marginBottom: "12px",
                            background: "#0a0a0f",
                            border: "1px solid #333",
                            borderRadius: "8px",
                            color: "white",
                            boxSizing: "border-box"
                        }
                    }, void 0, false, {
                        fileName: "[project]/Desktop/domislink-empire_1/domislink-empire/apps/realestate/src/app/listings/create/page.tsx",
                        lineNumber: 35,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$domislink$2d$empire_1$2f$domislink$2d$empire$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        onChange: (e)=>setF({
                                ...f,
                                type: e.target.value
                            }),
                        style: {
                            width: "100%",
                            padding: "14px",
                            marginBottom: "24px",
                            background: "#0a0a0f",
                            border: "1px solid #333",
                            borderRadius: "8px",
                            color: "white",
                            boxSizing: "border-box"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$domislink$2d$empire_1$2f$domislink$2d$empire$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "sale",
                                children: "For Sale"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/domislink-empire_1/domislink-empire/apps/realestate/src/app/listings/create/page.tsx",
                                lineNumber: 37,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$domislink$2d$empire_1$2f$domislink$2d$empire$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "rent",
                                children: "For Rent"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/domislink-empire_1/domislink-empire/apps/realestate/src/app/listings/create/page.tsx",
                                lineNumber: 38,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$domislink$2d$empire_1$2f$domislink$2d$empire$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "shortlet",
                                children: "Shortlet"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/domislink-empire_1/domislink-empire/apps/realestate/src/app/listings/create/page.tsx",
                                lineNumber: 39,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/domislink-empire_1/domislink-empire/apps/realestate/src/app/listings/create/page.tsx",
                        lineNumber: 36,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$domislink$2d$empire_1$2f$domislink$2d$empire$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: {
                            color: "#888",
                            marginBottom: "12px"
                        },
                        children: [
                            "Listing Fee: ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$domislink$2d$empire_1$2f$domislink$2d$empire$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    color: "#EEFF00",
                                    fontWeight: "bold"
                                },
                                children: "₦5,000"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/domislink-empire_1/domislink-empire/apps/realestate/src/app/listings/create/page.tsx",
                                lineNumber: 41,
                                columnNumber: 68
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/domislink-empire_1/domislink-empire/apps/realestate/src/app/listings/create/page.tsx",
                        lineNumber: 41,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$domislink$2d$empire_1$2f$domislink$2d$empire$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: pay,
                        style: {
                            width: "100%",
                            padding: "16px",
                            background: "#EEFF00",
                            color: "black",
                            borderRadius: "8px",
                            fontWeight: "bold",
                            border: "none",
                            cursor: "pointer"
                        },
                        children: "Pay & Post Property"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/domislink-empire_1/domislink-empire/apps/realestate/src/app/listings/create/page.tsx",
                        lineNumber: 42,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/domislink-empire_1/domislink-empire/apps/realestate/src/app/listings/create/page.tsx",
                lineNumber: 32,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$domislink$2d$empire_1$2f$domislink$2d$empire$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    textAlign: "center",
                    marginTop: "24px"
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$domislink$2d$empire_1$2f$domislink$2d$empire$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                    href: "/",
                    style: {
                        color: "#EEFF00"
                    },
                    children: "← Back Home"
                }, void 0, false, {
                    fileName: "[project]/Desktop/domislink-empire_1/domislink-empire/apps/realestate/src/app/listings/create/page.tsx",
                    lineNumber: 44,
                    columnNumber: 56
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/domislink-empire_1/domislink-empire/apps/realestate/src/app/listings/create/page.tsx",
                lineNumber: 44,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/domislink-empire_1/domislink-empire/apps/realestate/src/app/listings/create/page.tsx",
        lineNumber: 30,
        columnNumber: 5
    }, this);
}
}),
"[project]/Desktop/domislink-empire_1/domislink-empire/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    else {
        if ("TURBOPACK compile-time truthy", 1) {
            if ("TURBOPACK compile-time truthy", 1) {
                module.exports = __turbopack_context__.r("[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)");
            } else //TURBOPACK unreachable
            ;
        } else //TURBOPACK unreachable
        ;
    }
} //# sourceMappingURL=module.compiled.js.map
}),
"[project]/Desktop/domislink-empire_1/domislink-empire/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/Desktop/domislink-empire_1/domislink-empire/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].ReactJsxDevRuntime; //# sourceMappingURL=react-jsx-dev-runtime.js.map
}),
"[project]/Desktop/domislink-empire_1/domislink-empire/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/Desktop/domislink-empire_1/domislink-empire/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].React; //# sourceMappingURL=react.js.map
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__23cd317b._.js.map