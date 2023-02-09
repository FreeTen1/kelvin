async function queryAPI_get(query) {
    let res = await fetch(`/kelvin_api/${query}`, {
        method: "GET",
    })
    return await res.text()
}

async function queryAPI_post(data, query) {
    let res = await fetch(`/kelvin_api/${query}`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    return await res.text()
}

async function queryAPI_delete(data, query) {
    let res = await fetch(`/kelvin_api/${query}`, {
        method: "DELETE",
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    return await res.text()
}

async function queryAPI_put(data, query) {
    let res = await fetch(`/kelvin_api/${query}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    return await res.text()
}

async function fileAPI(data={menu:"kelvin_api",session:1},url='query/fileController.php'){
    let res = await fetch(url, {
                method:"POST",
                body:data,
                processData: false,
                contentType: false
    });
    return await res.text();
}

// ф-ия запроса к API
async function php_query(data, url='query/JSAPI.php'){
    let res = await fetch(url, {
        method:"POST",
        body:JSON.stringify(data) 
    })
    return await res.text()
}

// Функция для отправки файла
async function queryAPI_post_file(data, query) {
    let res = await fetch(`/kelvin_api/${query}`, {
        method: "POST",
        body: data
    })
    return await res.text()
}

// Функция для отправки файла
async function queryAPI_put_file(data, query) {
    let res = await fetch(`/kelvin_api/${query}`, {
        method: "PUT",
        body: data
    })
    return await res.text()
}

// Пример отправки объекта с файлом через 2 функции выше
// document.querySelector("#file_routes_button").addEventListener("click", e => {
//     e.preventDefault
//     let obj = new FormData()
//     obj.append("file_routes", file_routes_input.files[0])
//     obj.append("login", 'inj_pto')
//     queryAPI_post_file(obj, "upload_file_struct").then(i => {
//         let response = JSON.parse(i)
//         console.log(response)
//     })
// })