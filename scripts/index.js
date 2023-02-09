if ([1, 2].includes(Number(access))) {
    let a = document.createElement("a")
    a.href = "enter_data.php"
    a.innerHTML = `<div class="button" style="margin: 10px 0;">Внести данные</div>`
    document.querySelector("#main_content").appendChild(a)
}

if ([3].includes(Number(access))) {
    let li = document.createElement("li")
    li.classList.add("navmenu")
    li.title = "Загрузить расстановку"
    li.setAttribute("data-name", "container")
    li.innerHTML = `
    <img src="img/sidebar/arrangement.svg" title="Загрузить расстановку">
    <p>Загрузить расстановку</p><img src="img/sidebar/right.svg" class="right">
    <input id="arrangement" type="file" name="name" style="display: none;" accept=".xls"/>
    `
    document.querySelector("#navmenu").appendChild(li)
    
    arrangement.addEventListener("change", e => {
        e.preventDefault
        let obj = new FormData()
        obj.append("file_routes", arrangement.files[0])
        obj.append("login", login)
        
        queryAPI_post_file(obj, "upload_file_struct").then(i => {
            let response = JSON.parse(i)
            if(response["status"] == 200) {
                successfullyWin("Файл загружен")
            } else {
                response["message"] ? errorWinOk(response["message"]) : errorWinOk("Неизвестная ошибка!")
            }
        })
        document.querySelector("#arrangement").value = ""
    })

    li.addEventListener("click", () => {
        document.querySelector("#arrangement").click()
    })

}

if (Number(access) == 4) {
    queryAPI_get(`get_lists?login=${login}&access=${access}`).then(i => {
        let response = JSON.parse(i)
        if (response["status"] == 200) {
            document.querySelector("#filter_depots_select").innerHTML = `<option value=''></option>${make_option(response["depots"], response["depots"])}`
        } else
            response["message"] ? errorWin(response["message"]) : errorWin("Неизвестная ошибка")
    })
}

document.querySelector("#apply_filter").addEventListener("click", () => {
    let depo = document.querySelector("#filter_depots_select")
    depo = depo.options[depo.selectedIndex].textContent
    queryAPI_get(`get_completed_trains?login=${login}&date_from=${date_from.value}&date_end=${date_end.value}${depo ? "&depo_name="+depo : ""}`).then(i => {
        let response = JSON.parse(i)
        if (response["status"] == 200) {
            let html_str = ``
            let table_scroll_div = document.querySelector("#table_scroll_div")
            response["result"].forEach(row => {
                html_str += `
                <tr measure_id="${row["measure_id"]}">
                    <td class="date_placement_row" id="date_placement">${row["date_placement"]}</td>
                    <td class="date_measure_row" id="date_measure">${row["date_measure"]}</td>
                    <td class="time_measure_row" id="time_measure">${row["time_measure"]}</td>
                    <td class="depo_name_row" id="depo_name">${row["depo_name"]}</td>
                    <td class="route_number_row ${row["is_rainbow"] ? "is_rainbow" : ''}" id="route_number"><img src="img/route_number.svg" alt="" style="margin-right: 5px;">${row["route_number"]}</td>
                    <td class="type_name_row" id="type_name">${row["type_name"]}</td>
                    <td class="count_wagons_row" id="count_wagons">${row["count_wagons"]}</td>
                    <td class="count_measure_row" id="count_measure">${row["count_measure"]}</td>
                    <td class="count_extreme_row" id="count_extreme">
                        <div class="flex_full_center gap-10">
                            ${row["count_extreme"] ? ('<div class="flex_full_center min-w-35"><img src="img/warning.svg" alt="">' + row["count_extreme"]) + '</div>' : ''}
                            ${row["count_cold"] ? '<div class="flex_full_center min-w-35"><img src="img/cold.svg" alt=""></div>' : ''}
                            ${row["count_unknown"] ? '<div class="flex_full_center min-w-35"><img src="img/unknown.svg" alt=""></div>' : ''}
                            ${row["count_heat"] ? ('<div class="flex_full_center min-w-35"><img src="img/heat.svg" alt="">' + row["count_heat"]) : ''}
                        </div>
                    </td>
                    <td class="is_edited_row" id="is_edited">${row["is_edited"] ? '<img src="img/edited.svg" alt="edited" title="Отредактировал: ' + row["user_edit"] + '">' : ""}</td>
                    <td class="user_name_row" id="user_name">${row["user_name"]}</td>
                </tr>
                `
                table_scroll_div.querySelector("table").innerHTML = html_str
            })
            
            table_scroll_div.querySelectorAll("tr").forEach(tr => {
                tr.onmousedown = (e) => {
                    // ЛКМ
                    if (e.button == 0) {
                        location.href = `single_measure.php?measure_id=${tr.getAttribute("measure_id")}`
                    } else if (e.button == 1) {
                        window.open(url=`single_measure.php?measure_id=${tr.getAttribute("measure_id")}`, '_blank')
                    }
                }
                // tr.addEventListener("click", e => {
                //     location.href = `single_measure.php?measure_id=${e.currentTarget.getAttribute("measure_id")}`
                // })
            })

        } else {
            response["message"] ? errorWin(response["message"]) : errorWin("Неизвестная ошибка")
        }
    })
})
document.querySelector("#apply_filter").click() // отрисовка данных