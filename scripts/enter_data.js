get_roues()

// Обновление маршрутов при изменении даты
document.querySelector("#date_route_input").addEventListener("change", () => {
    if (!document.querySelector("#date_route_input").value) {
        errorWin("Введите полную дату")
    } else {
        get_roues()
    }
})

// Поиск поезда и отрисовка его структуры
document.querySelector("#apply_filter").addEventListener("click", () => {
    clear_all()
    let date = document.querySelector("#date_route_input").value
    let route_select = document.querySelector("#rout_select")
    let route_number = route_select.options[route_select.selectedIndex].value
    if (!route_number || !date) {
        errorWin("Выберете маршрут и введите дату!")
    } else {
        queryAPI_get(`get_train?login=${login}&date=${date}&route_number=${route_number}`).then(i => {
            let response = JSON.parse(i)
            if (response["status"] == 200) {
                window.count_wagons = response["train_struct"]["count_wagons"]
                window.count_dots = response["train_struct"]["dots"]["max_count_column"]
                document.querySelector("#table").innerHTML = ''
                draw_struct(response)
                document.querySelector("#type_train_name_filter").innerHTML = `Тип состава: <span id="type_name_span">${response["train_struct"]["dots"]["type_name"]}</span>`
                can_change()
                document.querySelector("#temp_ambient_span") ? check_extreme_temperature() : ''
            } else {
                response["message"] ? errorWinOk(response["message"]) : errorWinOk("Неизвестная ошибка!")
            }
        })
    }
})

// Отрисовка данных из файла с кельвина
document.querySelector("#file_data_input").addEventListener("change", e => {
    let route_number = document.querySelector("#rout_select").options[document.querySelector("#rout_select").selectedIndex].value
    let date = document.querySelector("#date_route_input").value
    
    if (!route_number || !date) {
        errorWin("Введите номер маршрута и дату")
        clear_all()
    } else {
        e.preventDefault
        let obj = new FormData()
        obj.append("file_data", file_data_input.files[0])
        obj.append("login", login)
        obj.append("date", date)
        obj.append("route_number", route_number)
    
        queryAPI_post_file(obj, "get_data_from_file").then(i => {
            let response = JSON.parse(i)
            if (response["status"] == 200) {
                response["message"] ? errorWinOk(response["message"]) : successfullyWin("Успешно!") // Часто будет ошибка из=за несоответствия кол-ва замеров
                document.querySelector("#head_temp_ambient").innerHTML = `Температура О. С.: <span id="temp_ambient_span">${response["temp_ambient"]}</span>°C`
                for (item of response["values"]) {
                    let classes = document.querySelectorAll(`.${item["html_class_name"]}`)
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
    }
})

// Кнопка сохранить, открывает окно подтверждения
document.querySelector("#save_button").addEventListener("click", () => {
    let my_table = document.querySelector("#table")
    if (my_table.childElementCount == 0) {
        errorWin("Данные некорректны")
    } else {
        queryAPI_get(`get_locksmiths?login=${login}`).then(i => {
            let response = JSON.parse(i)
            if (response["status"] == 200) {
                let options_logins = make_option(response["locksmiths"], response["locksmiths"])
                draw_apply_div_save(options_logins)
                
            } else {
                response["message"] ? errorWin(response["message"]) : errorWinOk("Неизвестная ошибка!")
            }
        })
    }
})
