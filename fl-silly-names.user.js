// ==UserScript==
// @name 		Fallen London Silly Names
// @namespace	shadenexus
// @version		0.1
// @description	A script that replaces a bunch of stuff in Fallen London as a goof
// @author		Gwyndolyn Marchant
// @match		https://www.fallenlondon.com/*
// @icon		https://www.google.com/s2/favicons?domain=fallenlondon.com
// @grant		GM.getResourceUrl
//
// @require		https://ajax.googleapis.com/ajax/libs/jquery/1.4.4/jquery.min.js
// @require     https://gist.github.com/raw/2625891/waitForKeyElements.js
//
// @resource 	boneMachine	https://upload.wikimedia.org/wikipedia/en/7/7d/TomWaits-BoneMachine.jpg
//
// ==/UserScript==

let index = {
	"items" : {
		"Device for the Duplication of Bones": {
            "name" : "Evil Bone Machine",
            "icon" : "boneMachine"
        },
        "Irrigo-filled Mirrorcatch Box": {
        	"name" : "I don't actually remember what I put in here"
        }
	},
    "qualities" : {
        "Mithridacy": "Lying",
        "Occasionally Seen at Mr Wines' Revels": "Mr. Wines Owes Me Twenty Dollars"
    }
}

async function replace_inner(element, substr, newstr) {
	element.innerHTML = element.innerHTML.replace(substr, newstr);
}

async function sleep_out(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const possessions_item_prefix = "div.icon > div[aria-label^='"
const jq_suffix = "']";

async function content_replace() {
    // Item name replacement
	for (var name in index.items) {
        const change_img = "icon" in index.items[name];
        const img_url = await GM.getResourceUrl(index.items[name].icon);
        let selector = possessions_item_prefix + name + jq_suffix;
        console.log("Going to grab: " + selector);
        waitForKeyElements(selector, (items) => {
            // Changing the icon
            if (change_img) items[0].children[0].src = img_url;
            // Changing the popup
            items[0].addEventListener("mouseover", async (event) => {
                let it = 0;
                for (;it < 15; it++) {
                    var tooltip_id = items[0].children[0].attributes["aria-describedby"];
                    console.log("Tooltip?" + tooltip_id);
                    if (!tooltip_id) {
                        console.log("No tooltip!");
                        console.log(items[0].children[0]);
                        await sleep_out(150);
                    } else {
                        console.log(tooltip_id.value);
                        break;
                    }
                }
                if (it < 15) {
                    //success!
                    console.log("Item moused over! Tooltip id: " + tooltip_id.value);
                    waitForKeyElements("#"+tooltip_id.value, async (tooltip) => {
                        if (change_img) {
                            $(tooltip[0]).find(".icon > img")[0].src = img_url;
                        }
                        replace_inner($(tooltip[0]).find(".item__name")[0], name, index.items[name].name);
                    });
                } else {
                    console.log("Uh-oh, couldn't load it!");
                }
            });
        });
	}
}


(async function() {
    await content_replace();
})();