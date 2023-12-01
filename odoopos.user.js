// ==UserScript==
// @name         Odoo Storage Sync
// @namespace    http://tampermonkey.net/
// @version      1.05
// @description  Save localstorage data fo later import.
// @author       Eslam Tiffa
// @match        *://*/web*
// @match        *://*/pos*
// @connect      *
// @grant        unsafeWindow
// @grant        GM_openInTab
// @grant        GM.openInTab
// @grant        GM_getValue
// @grant        GM.getValue
// @grant        GM_setValue
// @grant        GM.setValue
// @grant        GM_deleteValue
// @grant        GM.deleteValue
// @grant        GM_xmlhttpRequest
// @grant        GM.xmlHttpRequest
// @grant        GM_download
// @run-at       document-start
// @downloadURL       https://github.com/eslamsidereel/odoo-pos-sync/raw/main/odoopos.user.js
// @updateURL       https://github.com/eslamsidereel/odoo-pos-sync/raw/main/odoopos.user.js
// ==/UserScript==

(function() {
    'use strict';
    document.addEventListener("DOMContentLoaded", function(event){
        setTimeout(() => {
            var store_orders_key, store_unpaid_key, store_orders, store_unpaid, stored_orders, stored_unpaid, stored_ip;
            var current_ip = document.domain;
            stored_ip = GM_getValue("stored_ip", null);
            console.log(current_ip, stored_ip)
            stored_orders = GM_getValue("stored_orders", null);
            stored_unpaid = GM_getValue("stored_unpaid", null);

            const checkip = setInterval(ipchecker, 1000);

            async function ipchecker() {
                var ids = Object.keys(unsafeWindow.localStorage).filter(x => x.endsWith('_pos_session_id'));
                if (ids.length > 0) {
                    ids = ids[0].replace('_pos_session_id','');
                    store_orders_key = ids+"_orders";
                    store_unpaid_key = ids+"_unpaid_orders";

                    GM_setValue("store_orders_key", store_orders_key);
                    GM_setValue("store_unpaid_key", store_unpaid_key);

                    if (stored_ip == current_ip) {
                        clearInterval(checkip);
                    } else {
                        if (stored_orders !== null) {
                            if (store_orders_key) {
                                unsafeWindow.localStorage.setItem(store_orders_key, stored_orders);
                            }
                        }
                        if (stored_unpaid !== null) {
                            if (store_unpaid_key) {
                                unsafeWindow.localStorage.setItem(store_unpaid_key, stored_unpaid);
                            }
                        }
                        GM_setValue("stored_ip", current_ip);
                        window.location.reload(true);
                        clearInterval(checkip);
                    }
                }
            }

            checkip;

            if (window.location.href.indexOf("/pos/") > -1) {
                setInterval(async () => {
                    stored_orders = GM_getValue("stored_orders", null);
                    stored_unpaid = GM_getValue("stored_unpaid", null);
                    Object.keys(unsafeWindow.localStorage).forEach(key => {
                        if (key == store_orders_key) {
                            store_orders = unsafeWindow.localStorage.getItem(key);
                        }
                        if (key == store_unpaid_key) {
                            store_unpaid = unsafeWindow.localStorage.getItem(key);
                        }
                    });

                    if (stored_ip == current_ip) {
                        if (store_orders) {
                            if (store_orders == '[]') {
                                if (stored_orders !== null) {
                                    GM_setValue("stored_orders", null);
                                    console.log('updated')
                                }
                            } else {
                                if (stored_orders !== store_orders) {
                                    GM_setValue("stored_orders", store_orders);
                                    console.log('updated')
                                }
                            }
                        }
                        if (store_unpaid) {
                            if (store_unpaid == '[]') {
                                if (stored_unpaid !== null) {
                                    GM_setValue("stored_unpaid", null);
                                    console.log('updated')
                                }
                            } else {
                                if (stored_unpaid !== store_unpaid) {
                                    var data = JSON.parse(store_unpaid);
                                    if (data.length > 1) {
                                        data.forEach(function (i) {
                                            if (i.data.lines.length > 0) {
                                                GM_setValue("stored_unpaid", store_unpaid);
                                                console.log('updated')
                                            } else {
                                                if (stored_unpaid !== null) {
                                                    GM_setValue("stored_unpaid", null);
                                                    console.log('updated')
                                                }

                                            }
                                        });
                                    } else {
                                        if (data[0].data.lines.length > 0) {
                                            GM_setValue("stored_unpaid", store_unpaid);
                                            console.log('updated')
                                        } else {
                                            if (stored_unpaid !== null) {
                                                GM_setValue("stored_unpaid", null);
                                                console.log('updated')
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }, 1000);
            }
        }, "5000");
    });
})();
