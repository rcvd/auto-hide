import {OnloadArgs} from "roamjs-components/types";

function setTopbarBackground(extensionAPI, topbarBackgroundColor) {
    let bgColor = "var(--bc-topbar, " + topbarBackgroundColor + ");";

    console.log(bgColor);

    if (document.getElementById("auto-hide")) {
        document.getElementById("auto-hide").remove();
    }

    const head = document.getElementsByTagName("head")[0];
    const style = document.createElement("style");
    style.id = "auto-hide";
    style.textContent = `.rm-topbar { background-color: ${bgColor} !important;}`;
    head.appendChild(style);
}

function showTopBar(topbar1: HTMLElement, topbar2: HTMLElement) {
    if (topbar1 && topbar2) {
        topbar1.style.top = '0px';
        topbar2.style.opacity = '1';
    }
}

function hideTopBar(topbar1: HTMLElement, topbar2: HTMLElement) {
    if (topbar1 && topbar2) {
        topbar1.style.top = '-50px';
        topbar2.style.opacity = '0';
    }
}

function showOrHide(extensionAPI) {
    const element = document.querySelector<HTMLElement>(".rm-article-wrapper");
    const topbar1 = document.querySelector<HTMLElement>(".rm-files-dropzone");
    const topbar2 = document.querySelector<HTMLElement>(".rm-topbar");
    const findOrCreateInput = document.getElementById("find-or-create-input");
    const main = document.querySelector<HTMLElement>(".roam-body-main");

    if (!element || !topbar1 || !topbar2 || !findOrCreateInput || !main) {
        console.error('One or more elements could not be found');
        return;
    }

    let isHidden = false;
    let oldY = 0;

    topbar1.style.zIndex = "100";
    element.style.paddingTop = '50px';
    main.style.flex = '0 0 100%';

    topbar1.onmouseover = function () {
        showTopBar(topbar1, topbar2);
        isHidden = false;
    }

    findOrCreateInput.onfocus = function () {
        showTopBar(topbar1, topbar2);
        oldY = element.scrollTop;
        isHidden = false;
    }

    element.onscroll = function () {
        if (!isHidden) {
            hideTopBar(topbar1, topbar2);
            isHidden = true;
        }
        if (element.scrollTop < oldY && extensionAPI.settings.get("showOnScrollUp")) {
            showTopBar(topbar1, topbar2);
            isHidden = false;
        }
        oldY = element.scrollTop;
    }
}

function handleMutations() {
    showOrHide();
}

function setSettingDefault(extensionAPI: any, settingId: any, settingDefault: any) {
    let storedSetting = extensionAPI.settings.get(settingId);
    if (null == storedSetting)
        extensionAPI.settings.set(settingId, settingDefault);
    return storedSetting || settingDefault;
}

function onload({extensionAPI}: OnloadArgs) {
    const observer = new MutationObserver(handleMutations);
    const targetElements = document.querySelectorAll('.roam-main');

    setSettingDefault(extensionAPI, "showOnScrollUp", false);
    setSettingDefault(extensionAPI, "topbarBackgroundColor", "#fff");

    extensionAPI.settings.panel.create({
        tabTitle: "Auto Hide",
        settings: [
            {
                id: "showOnScrollUp",
                name: "Show on scroll up",
                description:
                    "Shows the topbar when scrolling up",
                action: {
                    type: "switch",
                },
            },
            {
                id: "topbarBackgroundColor",
                name: "Topbar background color",
                description:
                    "Sets the background color of the topbar (not needed for RoamStudio)",
                action: {
                    type: "input",
                    placeholder: "#fff",
                    onChange: (evt) => {
                        setTopbarBackground(extensionAPI, evt.target.value);
                    }
                }
            },
        ]
    });
    setTopbarBackground(extensionAPI, extensionAPI.settings.get("topbarBackgroundColor"));

    if (!targetElements || targetElements.length === 0) {
        console.error('Target elements could not be found');
        return;
    }

    targetElements.forEach((targetElement) => {
        const config = {attributes: false, childList: true, subtree: false};
        observer.observe(targetElement, config);
    });

    showOrHide(extensionAPI);
}

function onunload() {
    if (document.getElementById("auto-hide")) {
        document.getElementById("auto-hide").remove();
    }
}

export default {
    onload: onload,
    onunload: onunload
};