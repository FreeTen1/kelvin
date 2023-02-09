function draw_struct(response) {
    // Отрисовка структуры в зависимости от кол-ва вагонов
    for (element of response["train_struct"]["dots"]["head_td"]) {
        let new_tr = document.createElement("tr")
        new_tr.classList.add(`tr${element["td_head_name_id"]}`)
        let head_td = document.createElement("td")
        head_td.innerHTML = element["td_head_name"]
        head_td.classList.add("head_td")
        element["td_head_title"] ? head_td.title = element["td_head_title"] : ''
        new_tr.appendChild(head_td)
        for (let i = 0; i < response["train_struct"]["count_wagons"]; i++) {
            for (let curr_td of element["td"]) {
                let new_td = document.createElement("td")
                new_td.setAttribute("colspan", `${curr_td["colspan"]}`)
                new_td.className = curr_td["class"]
                "change" in curr_td ? new_td.setAttribute("change", curr_td["change"]) : ''
                new_td.innerHTML = curr_td["default_text"]
                new_tr.appendChild(new_td)
            }
        }
        document.querySelector("#table").appendChild(new_tr)
    }
    
    // Заполнение номеров вагонов
    for (let i = 0; i < response["train_struct"]["wagon_numbers"].length; i++) {
        let wagons = document.querySelectorAll(".wagon")
        wagons[i].innerHTML = `${i + 1} вагон №<span class="wagon_number_span edit_td">${response["train_struct"]["wagon_numbers"][i]["wagon_number"]}</span> <img src="img/turn.svg" index="${i}" class="turn_img" reverse="${response["train_struct"]["wagon_numbers"][i]["reverse"]}"></img>`
    }
    
    // Заполнение строки "колёсная пара" числами
    let max_count_column = response["train_struct"]["dots"]["max_count_column"]
    response["train_struct"]["wagon_numbers"].forEach(item => {
        let pair_of_wheels = Array.from(document.querySelectorAll(".pair_of_wheels")).filter(elem => !Boolean(elem.textContent))
        if (item["reverse"]) {
            for (let i = max_count_column - 1; i >= 0; i--)
                pair_of_wheels[i].innerHTML = max_count_column - i 
        } else {
            for (let i = 0; i < max_count_column; i++)
                pair_of_wheels[i].innerHTML = i + 1
        }
    })

    // разворот значений букс
    reverseValues = i => {
        let temp = get_all_wagon_points(6)
        let tds = temp["tds"][i]
        let values = temp["numbers"][i]
        let new_values = values.slice(values.length/2).concat(values.slice(0, values.length/2))
        for (let i = 0; i < tds.length; i++) {
            tds[i].innerHTML = new_values[i]
        }
    }
    // кнопки разворота вагона
    let reverse_buttons = document.querySelectorAll(".turn_img")
    for (let i = 0; i < reverse_buttons.length; i++) {
        reverse_buttons[i].addEventListener("click", () => {
            let curr_reverse = eval(reverse_buttons[i].getAttribute("reverse"))
            let pair_of_wheels = document.querySelectorAll(".pair_of_wheels")
            reverseValues(reverse_buttons[i].getAttribute("index"))
            check_extreme_temperature()
            if (curr_reverse) {
                reverse_buttons[i].setAttribute("reverse", "false")
                n = 1
                for (let j = max_count_column * i; j < max_count_column * i + max_count_column; j++) {
                    pair_of_wheels[j].innerHTML = n
                    n++
                }
            } else {
                reverse_buttons[i].setAttribute("reverse", "true")
                n = max_count_column
                for (let j = max_count_column * i; j < max_count_column * i + max_count_column; j++) {
                    pair_of_wheels[j].innerHTML = n
                    n--
                }
            }
        })
    }
}

function can_change() {
    let edit_tds = document.querySelectorAll(".edit_td")
    edit_tds.forEach(element => {
        element.addEventListener("dblclick", e => {
            let elem = e.currentTarget
            let current_value = elem.textContent
            elem.innerHTML = `<input type="text" class="change_value_inputs" id="change_value" autocomplete="off" oninput="only_regex(this, /[0-9]|^Н{1}/g)">`
            document.onclick = function (em) {
                try {
                    if (em.target.className != "change_value_inputs") {
                        if (change_value.value) {
                            document.location.pathname.indexOf("single_measure") != -1 ? elem.setAttribute("change", "true") : ''
                            elem.innerHTML = change_value.value
                        } else {
                            elem.innerHTML = current_value
                        }
                        check_extreme_temperature()
                    }
                } catch {}
            }
        })
    })
}
