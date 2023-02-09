function get_roues() {
    queryAPI_get(`get_route_numbers?login=${login}&date=${date_route_input.value}`).then(i => {
        let response = JSON.parse(i)
        if (response["status"] == 200) {
            $("#rout_select").innerHTML = make_option(response["routes"], response["routes"])
        } else {
            response["message"] ? errorWinOk(response["message"]) : errorWinOk("Неизвестная ошибка, сообщите о ней обязательно!")
        }
    })
}

function clear_all() {
    document.querySelector("#file_data_input").value = "" // Сброс файла
    document.querySelector("#head_temp_ambient").innerHTML = "" // Сброс окружающей температуры
    document.querySelector("#type_train_name_filter").innerHTML = "" // Сброс типа состава
    document.querySelector("table").innerHTML = '' // Сброс значений в таблице
}
