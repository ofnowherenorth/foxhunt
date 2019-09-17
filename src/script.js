const titleRegex = /== ?(?:\[(.*?)\])? ?(?:\[(.*?)\])? ?(.+)?/

$(document).on("showpassage", (e, passage) => {

    let _style = ""

    passage.passage.source = passage.passage.source.replace(titleRegex,(match,p1,p2,p3,i,str) => {

        _style = ""

        if (p1) {

            _style = p1
            
        }

        if (p3) {

            return `<div class="title" style="background: ${p1}; color: ${p2};">${p3}</div>`

        } else {

            return ``

        }

    })

    let tags = ""
    if (passage.passage.tags) tags = passage.passage.tags.join(" ")

    if (tags.includes("thought")) passage.passage.source = `<div class="${_style} ${tags}"><div class="left-bracket" style="border-color: ${_style};" />${passage.passage.source}<div class="right-bracket" style="border-color: ${_style};" /></div>`
    else { passage.passage.source = `<div class="${_style} ${tags}">${passage.passage.source}<div class="shadow" style="border-color: ${_style};" /></div>` }

})