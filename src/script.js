const passageDataRegex = /^== ?(?:\[(.*?)\] ?)?(?:([^,\n]*),? ?)?(?:prompt ?= ?"(.*?)",? ?)?(?:save_to ?= ?"(.*?)",? ?)?(?:next ?= ?"(.*?)")?/m //add save_to
const linkRegex = /\[\[(.*?)(?:\|(.*?))?\]\]/gm
const altLinkRegex = /^-- ?\[ ?(.*?) ?\] -> "(.*)"/gm
const dialogRegex = /([A-Z]+):( ?.*)$/gm

window.hideBlinker = false
window.nextPassage = ""

window.info = {}
window.save_to = ""

window.choices = []

window.gotoPassage = (passage) => {
    if (passage) {
        let hidden = $(document.createElement('a'));
        hidden
            .css("display", "none")
            .attr("href","")
            .attr("data-passage", passage)
            .append(".")
            .appendTo("#passage")
            .trigger("click");
    } else {
        alert('No passage name provided to goto()');
    }
}

window.setPrompt = (prompt) => {

    if ($("#input-panel").length) {
        
        $("#input-panel input[type=\"text\"").attr("placeholder", prompt || "...");

    } else {

        console.log("Not currently getting input.")

    }

}

window.killInput = () => {

    window.hideBlinker = false
    $("#input-panel").remove()

}

window.getInput = (prompt, callback) => {

    window.hideBlinker = true

    if ($("#input-panel").length) {
        
        console.log("Already getting input!")
        return

    }
    
    $("#spinner").before("<div id=\"input-panel\"><div class=\"left-bracket\" /><form><input type=\"text\" name=\"parser\" /></form><div class=\"right-bracket\" /></div>")
    $("#input-panel input[type=\"text\"").attr("placeholder", prompt || "...");

    $("#input-panel form").on("submit", (e) => {

        e.preventDefault();

        if (window.save_to) window.info[save_to] = $("#input-panel input").val()

        if (callback(e,$("#input-panel input").val()) === false) killInput()

    })

}

window.advance = () => {

    if (window.nextPassage) {

        gotoPassage(window.nextPassage)

    } else {

        console.log("Nothing to advance to!")

    }

}

$(document).ready(() => {

    $("body").prepend("<div id=\"color-background\"/>")
    $("body").prepend("<div id=\"story-info\" />")
    $("#story-info").append($("#ptitle"))
    $("#story-info").append($("#psub"))

    $("body").append("<div id=\"spinner\" />")

    setInterval(() => {

        let alpha = $("#spinner").css("opacity")

        $("#spinner").css("opacity",-(alpha-1))

        if (hideBlinker) $("#spinner").css("opacity",0)
        else { $("#spinner").css("opacity",-(alpha-1)) }

    }, 500)

})

$(document).on("click",(e) => {

    if (e.which === 1 && e.target.name !== "parser") advance()

})

$(document).on("keydown",(e) => {

    if (e.key == "Tab") advance()

})

$(document).on("showpassage", (e, passage) => {

    let _color = ""
    let _choices = []
    let _prompt = ""
    let _save_to = ""
    let _next = ""

    let _src = passage.passage.source

    _src = _src.replace(dialogRegex,(match,p1,p2,i,str) => `<span class="${p1.toLowerCase()}">${p1}:${p2}</span>`)

    _src = _src.replace(passageDataRegex,(match,p1,p2,p3,p4,p5,i,str) => {

        if (p1) _color = p1
        if (p3) _prompt = p3
        if (p4) _save_to = p4
        if (p5) _next = p5

        if (p2) return `<div class="title" style="background: ${p1}">${p2}</div>`
        else { return "" }

    })

    _src = _src.replace(linkRegex,(match,p1,p2,i,str) => {

        _choices.push({"key": p1, "value": p2})
        return `<span class="fake-link">${p1}</span>`

    })

    _src = _src.replace(altLinkRegex,(match,p1,p2,i,str) => {

        p1 = p1.split(",")
        p1.forEach((tx,i) => {
            _choices.push({"key": tx.trim().substr(1,tx.length-2), "value": p2})
        })
        return ""

    })

    window.prompt = _prompt
    window.save_to = _save_to
    window.nextPassage = _next

    window.choices = _choices

    let tags = ""
    if (passage.passage.tags) tags = passage.passage.tags.join(" ")

    $("body").removeClass()
    $("body").addClass(tags)

    if (_color.length) passage.passage.source = `<div class="${tags}">${_src}<div class="left-bracket" style="border-color: ${_color};" /><div class="right-bracket" style="border-color: ${_color};" /></div>`
    else { passage.passage.source = `<div class="${tags}">${_src}<div class="left-bracket" /><div class="right-bracket" /></div>` }

})

$(document).on("showpassage:after", (e, passage) => {

    if (window.choices.length || window.save_to) {

        let _p = (window.prompt) ? window.prompt : "..."
        
        getInput(_p, (e,v) => {

            if (!window.choices.length) advance()

            for (let i = 0; i < window.choices.length; i++) {

                if (window.choices[i]["key"].toLowerCase() == v.toLowerCase()) {

                    gotoPassage(window.choices[i]["value"])
                    return false

                } else {

                    advance()

                }

            }

        })

    } else {

        killInput()

    }

    let tags = ""
    if (passage.passage.tags) tags = passage.passage.tags.join(" ")

    if (tags.includes("cls") || tags.includes("clear") || tags.includes("reset")) $("#phistory").html("")

})