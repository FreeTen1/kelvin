document.querySelector("#go_to_index").addEventListener("click", () => {
    location.href = "index.php"
})

function make_option(value, inner_text) {
    let options = ``
    for (let i = 0; i < value.length; i++) {
        options += `<option value="${value[i]}">${inner_text[i] ? inner_text[i] : ''}</option>`
    }
    return options
}

function collect_measurement_data() {
    // Сбор данных об измерениях
    let train_type = document.querySelector("#type_name_span").textContent
    let temp_ambient = Number(document.querySelector("#temp_ambient_span").textContent)
    let body = {}
    if (train_type == "81-740/741") {
        let trs_list = document.querySelectorAll("tr")
        for (let i = 4; i < trs_list.length; i++) {
            let tds = trs_list[i].querySelectorAll("td")
            body[i+1] = []
            if (["tr5", "tr6"].includes(trs_list[i].className)) {
                for (let j = 1; j < tds.length; j++) {
                    body[i+1].push({"value": tds[j].textContent, "heat": eval(tds[j].getAttribute("heat")),"extreme": eval(tds[j].getAttribute("extreme")), "change": eval(tds[j].getAttribute("change"))})
                }
            } else if (["tr7", "tr8", "tr9", "tr10", "tr11", "tr12", "tr13"].includes(trs_list[i].className)) {
                for (let j = 1; j < tds.length; j++) {
                    body[i+1].push({"value": tds[j].textContent, "extreme": eval(tds[j].getAttribute("extreme")), "change": eval(tds[j].getAttribute("change"))})
                }
            } else if (["tr14"].includes(trs_list[i].className)) {
                for (let j = 1; j < tds.length; j++) {
                    body[i+1].push({"value": tds[j].textContent, "extreme": eval(tds[j].getAttribute("extreme")), "change": eval(tds[j].getAttribute("change"))})
                }
            } else if (["tr15"].includes(trs_list[i].className)) {
                for (let j = 1; j < tds.length; j++) {
                    body[i+1].push({"value": tds[j].textContent, "extreme": eval(tds[j].getAttribute("extreme")), "change": eval(tds[j].getAttribute("change"))})
                }
            } else if (["tr18"].includes(trs_list[i].className)) {
                for (let j = 1; j < tds.length; j++) {
                    body[i+1].push({"value": tds[j].textContent, "extreme": eval(tds[j].getAttribute("extreme")), "change": eval(tds[j].getAttribute("change"))})
                }
            } else {
                for (let j = 1; j < tds.length; j++) {
                    body[i+1].push({"value": tds[j].textContent, "extreme": false})
                }
            }
        }
    } else if (train_type == "81-717/717") {
        errorWinOk("это 81-717/717 поезд, данные будут нулевые ЗАГЛУШКА")// Заглушка
    }
    return body
}

function collect_wagon_numbers() {
    // Сбор данных о вагонах
    let wagon_numbers = document.querySelectorAll(".wagon_number_span")

    let result = {"wagon_numbers": []}
    wagon_numbers.forEach(item => {
        result["wagon_numbers"].push({"wagon_number": item.textContent, "reverse": eval(item.parentElement.querySelector("img").getAttribute("reverse"))})
    })
    return result
}

function draw_apply_div_save(options_logins) {
    // Отрисовка окна подтверждения сохранения
    let newData = document.createElement('div')
    newData.id = "preloader"
    newData.innerHTML = `
    <div id="apply_save_div">
        <div id="head_apply_save_div">
            <p>Подтверждение записи</p>
            <img src="img/close_button.svg" alt="Закрыть" title="Закрыть">
        </div>
        <p>Подтвердите сохранение данных</p>
        <div id="paradox">
            <div class="niching">
                <label for="locksmith_login">Логин</label>
                <select id="locksmith_login">
                    ${options_logins}
                </select>
            </div>
            <div class="niching">
                <label for="locksmith_pass">Пароль</label>
                <input class="input_text" type="password" id="locksmith_pass">
            </div>

            <div class="button">Сохранить</div>
        </div>
    </div>
    `
    document.querySelector('#main_content').appendChild(newData)
    $("#apply_save_div").querySelector("img").addEventListener("click", () => {
        newData.remove()
    })
    
    $("#apply_save_div").querySelector(".button").addEventListener("click", () => {
        // Сохранение новых данных
        if (!locksmith_pass.value) {
            errorWin("заполните поле \"Пароль\"")
        } else {
            let sel_login = document.querySelector("#locksmith_login")
            let locksmith_login = sel_login.options[sel_login.selectedIndex].value
            let route_select = document.querySelector("#rout_select")
            let route_number = route_select.options[route_select.selectedIndex].value
            if (!document.querySelector("#temp_ambient_span")) {
                errorWin("Файл не выбран")
            }
            body = {
                "locksmith_login": locksmith_login,
                "locksmith_pass": locksmith_pass.value,
                "data": collect_measurement_data(),
                "date": date_route_input.value,
                "route_number": route_number,
                "wagons": collect_wagon_numbers(),
                "temp_ambient": Number(document.querySelector("#temp_ambient_span").textContent)
            }
            queryAPI_post(body, "create_measure").then(i => {
                let response = JSON.parse(i)
                if (response["status"] == 200) {
                    successfullyWin("Данные сохранены")
                    newData.remove()
                    get_roues()
                    clear_all()
                    document.location.href = 'index.php'
                } else {
                    response["message"] ? errorWin(response["message"]) : errorWinOk("Неизвестная ошибка!")
                }
            })
        }
    })
}

function draw_apply_div_edit(options_logins_locksmith, options_logins_master, measure_id) {
    // Отрисовка окна подтверждения редактирования
    let newData = document.createElement('div')
    newData.id = "preloader"
    newData.innerHTML = `
    <div id="apply_edit_div">
        <div id="head_edit_save_div">
            <p>Подтверждение</p>
            <img src="img/close_button.svg" alt="Закрыть" title="Закрыть">
        </div>

        <p>Подтвердите изменение данных</p>
        <div id="paradox">
            <div class="niching">
                <label for="locksmith_login">Логин слесаря</label>
                <select id="locksmith_login">
                    ${options_logins_locksmith}
                </select>
            </div>
            <div class="niching">
                <label for="locksmith_pass">Пароль слесаря</label>
                <input class="input_text" type="password" id="locksmith_pass">
            </div>
            <hr>
            <div class="niching">
                <label for="master_login">Логин мастера</label>
                <select id="master_login">
                    ${options_logins_master}
                </select>
            </div>
            <div class="niching">
                <label for="master_pass">Пароль мастера</label>
                <input class="input_text" type="password" id="master_pass">
            </div>

            <div class="button" id="apply_edit">Сохранить</div>
        </div>
    </div>
    `
    document.querySelector('#main_content').appendChild(newData)
    $("#apply_edit_div").querySelector("img").addEventListener("click", () => {
        newData.remove()
    })
    
    $("#apply_edit_div").querySelector(".button").addEventListener("click", () => {
        // Сохранение новых данных
        if (!locksmith_pass.value || !master_pass.value) {
            errorWin("заполните все поля")
        } else {
            let sel_login = document.querySelector("#locksmith_login")
            let locksmith_login = sel_login.options[sel_login.selectedIndex].value

            let sel_login_master = document.querySelector("#master_login")
            let master_login = sel_login_master.options[sel_login_master.selectedIndex].value
            body = {
                "locksmith_login": locksmith_login,
                "locksmith_pass": locksmith_pass.value,
                "master_pass": master_pass.value,
                "master_login": master_login,
                "data": collect_measurement_data(),
                "wagons": collect_wagon_numbers(),
                "measured_train_id": measure_id,
                "temp_ambient": Number(document.querySelector("#temp_ambient_span").textContent)
            }
            console.log(body);
            queryAPI_put(body, "edit_measure").then(i => {
                let response = JSON.parse(i)
                if (response["status"] == 200) {
                    location.reload()
                } else {
                    response["message"] ? errorWin(response["message"]) : errorWinOk("Неизвестная ошибка!")
                }
            })
        }
    })
}

function get_all_wagon_points(count_dots) {
    // функция отдаёт словарь с самими td (которые можно менять) и значения в этих td в числовом формате
    let res_list = []
    for (let n=5; n<7; n++) {
        let tr = document.querySelector(`.tr${n}`)
        let tds = Array.from(tr.querySelectorAll(".edit_td"))
        let count_wagons = document.querySelectorAll(".wagon").length
        
        if (tr.className == "tr5") {
            for (let i=0; i < count_wagons; i++) {
                res_list.push(tds.slice(i * count_dots, i == 0 ? count_dots : (i + 1) * count_dots))
            }
        } else {
            for (let i=0; i < count_wagons; i++) {
                let new_list = tds.slice(i * count_dots, i == 0 ? count_dots : (i + 1) * count_dots)
                for (let j=0 ; j < count_dots ; j++) {
                    res_list[i].push(new_list[j])
                }
            }
        }
    }
    let result_numbers = []
    for (let i = 0; i < res_list.length; i++) {
        let single_number = []
        for (let j = 0; j < res_list[i].length; j++) {
            single_number.push(Number(res_list[i][j].textContent))
        }
        result_numbers.push(single_number)
    }
    return {"tds": res_list, "numbers": result_numbers}
}

function paint_cold_temperature(tds, temp_ambient) {
    tds.forEach(td => {
        if (Number(td.textContent) <= temp_ambient) {
            td.style.backgroundColor = "#00fff3"
        } else {
            td.style.backgroundColor ? '' : td.style.backgroundColor = ''
        }
    })
}

function paint_extreme_temperature(tds, temp_ambient, max) {
    for (let i = 0; i < tds.length; i++) {
        if (tds[i] != 'Н') {
            if (Number(tds[i].textContent) > temp_ambient + max) {
                tds[i].style.backgroundColor = "#F7A2A2"
                tds[i].setAttribute("extreme", "true")
            } else {
                // экстремальная температура
                tds[i].removeAttribute("style")
                tds[i].setAttribute("extreme", "false")
            }
            if (eval(tds[i].getAttribute("change"))) {
                // отредактированные значения
                tds[i].style.color = "#1252F6"
                tds[i].style.fontWeight  = "800"
            }
        }
    }
}

function paint_extreme_temperature_next(all_dots) {
    all_dots["tds"].forEach(wagon => {
        wagon.forEach(td => {
            if (wagon.filter(other_td => {return Number(td.textContent) >= Number(other_td.textContent) + 10}).length) {
                console.log("Значение: " + td.textContent + " перегрев т.к. больше на 10 чем "+wagon.filter(other_td => {return Number(td.textContent) >= Number(other_td.textContent) + 10}).map(num => {return num.textContent}))
                td.style.backgroundColor ? "" : td.style.backgroundColor = "yellow"
                eval(td.getAttribute("extreme")) ? td.setAttribute("heat", "false") : td.setAttribute("heat", "true")
                
            } else {
                td.style.backgroundColor ? "" : td.style.backgroundColor = ""
                td.setAttribute("heat", "false")
            }
        }) 
    })

    // ниже сравнение между соседями
    // for (let i = 0; i < all_dots["numbers"].length; i++) {
    //     for (let j = 0; j < all_dots["numbers"][i].length; j++) {
    //         if (j == 0) {
    //             // для первого
    //             if (all_dots["numbers"][i][j] > all_dots["numbers"][i][j+1] + 10) {
    //                 all_dots["tds"][i][j].style.backgroundColor ? "" : all_dots["tds"][i][j].style.backgroundColor = "yellow"
    //                 eval(all_dots["tds"][i][j].getAttribute("extreme")) ? all_dots["tds"][i][j].setAttribute("heat", "false") : all_dots["tds"][i][j].setAttribute("heat", "true")
    //             } else {
    //                 all_dots["tds"][i][j].style.backgroundColor ? "" : all_dots["tds"][i][j].style.backgroundColor = ""
    //                 all_dots["tds"][i][j].setAttribute("heat", "false")
    //             }
    //         } else if (j == all_dots["numbers"][i].length - 1) {
    //             // для последнего
    //             if (all_dots["numbers"][i][j] > all_dots["numbers"][i][j-1] + 10) {
    //                 all_dots["tds"][i][j].style.backgroundColor ? "" : all_dots["tds"][i][j].style.backgroundColor = "yellow"
    //                 eval(all_dots["tds"][i][j].getAttribute("extreme")) ? all_dots["tds"][i][j].setAttribute("heat", "false") : all_dots["tds"][i][j].setAttribute("heat", "true")
    //             } else {
    //                 all_dots["tds"][i][j].style.backgroundColor ? "" : all_dots["tds"][i][j].style.backgroundColor = ""
    //                 all_dots["tds"][i][j].setAttribute("heat", "false")
    //             }
    //         } else {
    //             // для остальных
    //             if (all_dots["numbers"][i][j] > all_dots["numbers"][i][j-1] + 10 || all_dots["numbers"][i][j] > all_dots["numbers"][i][j+1] + 10) {
    //                 all_dots["tds"][i][j].style.backgroundColor ? "" : all_dots["tds"][i][j].style.backgroundColor = "yellow"
    //                 eval(all_dots["tds"][i][j].getAttribute("extreme")) ? all_dots["tds"][i][j].setAttribute("heat", "false") : all_dots["tds"][i][j].setAttribute("heat", "true")
    //             } else {
    //                 all_dots["tds"][i][j].style.backgroundColor ? "" : all_dots["tds"][i][j].style.backgroundColor = ""
    //                 all_dots["tds"][i][j].setAttribute("heat", "false")
    //             }
    //         }
    //     }
    // }
}

function check_extreme_temperature() {
    // Проверка на повышенную температуру
    let train_type = document.querySelector("#type_name_span").textContent
    let temp_ambient = Number(document.querySelector("#temp_ambient_span").textContent)
    if (train_type == "81-740/741") {
        // сравнение с температурой окружающей среды
        let trs_list = document.querySelectorAll("tr")
        trs_list.forEach(tr => {
            let tds = tr.querySelectorAll(".edit_td")
            if (["tr5", "tr6"].includes(tr.className)) {
                paint_extreme_temperature(tds, temp_ambient, 35)
                paint_cold_temperature(tds, temp_ambient) // проверка на температуру ниже окр. среды
            } else if (["tr7", "tr8", "tr9", "tr10", "tr11", "tr12", "tr13"].includes(tr.className)) {
                paint_extreme_temperature(tds, temp_ambient, 35)
            } else if (["tr14"].includes(tr.className)) {
                paint_extreme_temperature(tds, temp_ambient, 80)
            } else if (["tr15"].includes(tr.className)) {
                paint_extreme_temperature(tds, temp_ambient, 55)
            } else if (["tr18"].includes(tr.className)) {
                paint_extreme_temperature(tds, temp_ambient, 40)
            }
        })
        // выделение жирным знаки вопроса
        Array.from(document.querySelectorAll(".left_axle_box")).forEach(item => {
            item.textContent == '?' ? item.style.fontWeight = '800' : item.style.fontWeight = '400'
        })
        Array.from(document.querySelectorAll(".right_axle_box")).forEach(item => {
            item.textContent == '?' ? item.style.fontWeight = '800' : item.style.fontWeight = '400'
        })
        // сравнение между точками
        paint_extreme_temperature_next(get_all_wagon_points(6))
    } else if (train_type == "81-717/717") {
        // Заглушка
    }
}

function parseURL() {
    // функция парсинга GET строки
    url = location.search
    var parts = url.split('?');
        link = parts.length > 1 ? parts.shift() : '';
        gets = parts.join('?').split('&'),
        data = {};
  
    for(var index = 0; index < gets.length; index++) {
      parts = gets[index].split('=');
      assignValue(data, decodeURIComponent(parts.shift()), decodeURIComponent(parts.join('=')));
    }
  
    function assignValue(data, key, value) {
      var parts = key.replace(/\[(.*?)\]/g, '.$1').split(/\./);
      key = parts.shift();
      if (parts.length === 0) {
        data[key] = value;
      } else {
        assignValue(key in data ? data[key] : (data[key] = {}), parts.join('.'), value);
      }
    }
    return data
}

// Регулярное выражение на пропуск регулярного выражения
function only_regex(elem, reg) {
    elem.value = elem.value.match(reg) ? elem.value.match(reg).join('') : ''
}

// Регулярное выражение на исключение регулярного выражения
function not_regex(elem, reg) {
    let letter = elem.value.match(reg) ? elem.value.match(reg)[0] : null
    elem.value = letter ? elem.value.replace(letter, '') : elem.value
}
