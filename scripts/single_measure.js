const measure_id = Number(parseURL()["measure_id"])
if (!measure_id) {
    errorWin("Поезд не передан")
} else {
    queryAPI_get(`get_measured_train?login=${login}&measured_train_id=${measure_id}`).then(i => {
        let response = JSON.parse(i)
        if (response["status"] == 200) {
            document.querySelector("#head_depo_name").innerHTML = response["depo_name"]
            document.querySelector("#head_roue_number").innerHTML = `Маршрут: №<span>${response["route_number"]}</span>`
            document.querySelector("#head_date_measure").innerHTML = `Дата измерений: ${response["date_measure"]}`
            document.querySelector("#head_date_placement").innerHTML = `Дата выезда: <span date="${response["date_placement_eng"]}">${response["date_placement"]}</span>`
            document.querySelector("#type_name_span").innerHTML = response["train_struct"]["dots"]["type_name"]
            document.querySelector("#head_user_full_name").innerHTML = `Внёс данные: ${response["user_name"]}`
            document.querySelector("#head_user_full_name_edit").innerHTML = `Отредактировал данные: ${response["user_edit"] ? response["user_edit"] : ''}`
            document.querySelector("#head_user_full_name_master").innerHTML = `Подтвердил данные: ${response["master_edit"] ? response["master_edit"] : ''}`
            document.querySelector("#temp_ambient_span").innerHTML = response["temp_ambient"]
            draw_struct(response)

            Object.keys(response["current_data"]).forEach(key => {
                let tr = document.querySelector(`.tr${key}`)
                let trs_list = Array.from(tr.querySelectorAll("td")).slice(1)
                for (let i = 0; i < trs_list.length; i++) {
                    trs_list[i].innerHTML = response["current_data"][key][i]["value"]
                    response["current_data"][key][i]["change"] != null ? trs_list[i].setAttribute("change", response["current_data"][key][i]["change"]) : ''
                }
            })
            check_extreme_temperature()
        } else {
            response["message"] ? errorWin(response["message"]) : errorWinOk("Неизвестная ошибка!")
        }
    })
}

if (['1', '2'].includes(access)) {
    let change_button = document.createElement("div")
    change_button.classList.add("button")
    change_button.id = "change_data"
    change_button.innerHTML = "Изменить данные"
    document.querySelector("#filter_div").appendChild(change_button)
    change_button.addEventListener("click", () => {
        can_change()

        // Создание <input type="file">
        document.querySelector("#file_data_input") ? document.querySelector("#file_data_input").remove() : ''
        let = input_file = document.createElement("input")
        input_file.setAttribute("type", "file")
        input_file.setAttribute("name", "file_kelvin")
        input_file.setAttribute("accept", ".csv")
        input_file.id = "file_data_input"
        document.querySelector("#filter_div").appendChild(input_file)

        // Отрисовка данных из файла с кельвина
        input_file.addEventListener("change", e => {
            let route_number = document.querySelector("#head_roue_number").querySelector("span").textContent
            let date = document.querySelector("#head_date_placement").querySelector("span").getAttribute("date")
            
            e.preventDefault
            let obj = new FormData()
            obj.append("file_data", input_file.files[0])
            obj.append("login", login)
            obj.append("date", date)
            obj.append("route_number", route_number)
            queryAPI_post_file(obj, "get_data_from_file").then(i => {
                let response = JSON.parse(i)
                if (response["status"] == 200) {
                    response["message"] ? errorWinOk(response["message"]) : successfullyWin("Успешно!") // Часто будет ошибка из=за несоответствия кол-ва замеров
                    document.querySelector("#temp_ambient_span").innerHTML = response["temp_ambient"]
                    for (item of response["values"]) {
                        let classes = document.querySelectorAll(`.${item["html_class_name"]}`)
                        classes.forEach(item => {item.innerHTML = 'Н'})
                        for (let i = 0; i < item["values"].length; i++) {
                            try {
                                classes[i].innerHTML = item["values"][i]["single_value"]
                            } catch {
                            
                            }
                        }
                    }
                    check_extreme_temperature()
                } else {
                    if (typeof response["message"] != 'object') {
                        response["message"] ? errorWinOk(response["message"]) : errorWinOk("Неизвестная ошибка!")
                    } else {
                        errorWin("Выберите файл")
                    }
                }
            })
        })
        // Событие на кнопку "сохранить"
        document.querySelector("#save_button") ? document.querySelector("#save_button").remove() : ''
        let save_button = document.createElement("div")
        save_button.classList.add("button")
        save_button.id = "save_button"
        save_button.innerHTML = "Сохранить"
        document.querySelector("#main_content").appendChild(save_button)
        save_button.addEventListener("click", () => {
            document.querySelector("#file_data_input") ? document.querySelector("#file_data_input").remove() : ''
            queryAPI_get(`get_locksmiths?login=${login}`).then(i => {
                let response = JSON.parse(i)
                if (response["status"] == 200) {
                    let options_logins_locksmith = make_option(response["locksmiths"], response["locksmiths"])
                    let options_logins_master = make_option(response["masters"], response["masters"])
                    draw_apply_div_edit(options_logins_locksmith, options_logins_master, measure_id)
                } else {
                    response["message"] ? errorWin(response["message"]) : errorWinOk("Неизвестная ошибка!")
                }
            })
        })
    })
}