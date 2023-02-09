<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="shortcut icon" href="img/title/ico.png" type="image/png">
    <link rel="stylesheet" href="style/general_style/person_info.css">
    <link rel="stylesheet" href="style/general_style/loading.css">
    <link rel="stylesheet" href="style/general_style/sidebar.css">
    <link rel="stylesheet" href="style/general_style/main_style.css">
    <link rel="stylesheet" href="style/general_style/footer.css">
    <link rel="stylesheet" href="style/index.css">
    <link rel="stylesheet" href="style/index_table.css">

    <link rel="stylesheet" href="style/enter_data_style.css">
    <link rel="stylesheet" href="style/apply.css">
    <title>Кельвин</title>
</head>
<body>
<?php
    $curl = curl_init();
    // $login = "torchkov-mv";
    // $ip = "1.1.1.1";
    $login = @$_SERVER['REMOTE_USER'];
    $ip = @$_SERVER['REMOTE_ADDR'];
    curl_setopt_array($curl, array(
        CURLOPT_URL => 'http://localhost:5002/auth',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => '',
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 0,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => 'POST',
        CURLOPT_POSTFIELDS =>'{
            "login": "'.$login.'"
        }',
        CURLOPT_HTTPHEADER => array(
        'Content-Type: application/json'
        ),
    ));
    
    $response = curl_exec($curl);
    
    curl_close($curl);
    $response = json_decode($response);
    if ($response) {
        if ($response->status == 200) {
            $depo_name = $response->user_info->depo_name;
            echo '
            <script type="text/javascript">
                const login = "'.$login.'"
                const full_name = "'.$response->user_info->full_name.'"
                const access = "'.$response->user_info->access.'"
                const depo_id = "'.$response->user_info->depo_id.'"
                const depo_name = `'.$response->user_info->depo_name.'`
            </script>
            ';

            $scripts = '
            <script src="scripts/eWindow.js"></script>
            <script src="scripts/sidebar.js"></script>
            <script src="scripts/connect.js"></script>
            <script src="scripts/general_functions.js"></script>
            <script src="scripts/app.js"></script>
            <script src="scripts/index.js"></script>
            ';
        } else {
            echo '
            <script src="scripts/eWindow.js"></script>
            <script>errorWinOk("У вас нет доступа на эту страницу")</script>
            ';
            exit();
        };
    } else {
        echo '
        <script src="scripts/eWindow.js"></script>
        <script>errorWinOk("Нет соединения с сервером(((((((((((((((((((((")</script>
        ';
        exit();
    }
    
?>
    <!-- sidebar -->
    <aside class="w71">
        <div id=aside>
            <header>
                <img src="img/sidebar/mmlogo.svg" id=logo><img src="img/sidebar/logoline.svg" id=logoline>
            </header>

            <ul id="navmenu">
                <li  class="navmenu" title="Главная" data-name="container" id="go_to_index">
                    <img src="img/go_to_index.svg">
                    <p>Главная</p><img src="img/sidebar/right.svg" class="right">
                </li>
            </ul>

            <div id="nav">
                <img src="img/sidebar/navOpen.svg" alt="">
            </div>

            <footer>
                <img src="img/sidebar/cmappLogo.svg">
                <p id=feedback>Обратная связь</p>
            </footer>
        </div>
    </aside>

    <section>
        <!-- Хедер с информацией из АД -->
        <nav>
            <ul>
                <li>Эксплуатационный осмотр подвижного состава</li>
                <!-- <li> <img class="next" src="img/person_info/navNext.svg"> </li>
                <li>Ещё что-то</li> -->
            </ul>
            <div id=profil>
                <div id=userName>Иванов Иван Иванович</div>
                <div id=userPhoto><img src="img/person_info/profil.png"></div>
            </div>
            <!-- Основной контейнер -->
        </nav>

        <div id="content_and_footer">
            <div id="main_content">
                <div id="filter_div">
                    <div id="div1">
                        <div>
                            <label for="filter_depots_select">Поиск:</label>
                            <select id="filter_depots_select">
                                <option value='<?php echo $depo_name?>'><?php echo $depo_name?></option>
                            </select>
                        </div>

                        <div>
                            <label for="date_placement_input">Выбор даты  с:</label>
                            <input class="date_input" id="date_from" type="date" value="<?php echo date("Y-m-d"); ?>">
                        </div>

                        <div>
                            <label for="date_placement_input">по:</label>
                            <input class="date_input" id="date_end" type="date" value="<?php echo date("Y-m-d", strtotime(date("Y-m-d").'+ 1 days')); ?>">
                        </div>

                        <div class="button" id="apply_filter">Найти</div>

                    </div>
                    <div class="button" id="reset_filter">Очистить фильтр</div>
                </div>

                <div id="index_table_div">
                    <div id="head_table">
                        <table>
                                <tr>
                                    <td class="date_placement_row" id="date_placement">Дата выезда поезда</td>
                                    <td class="date_measure_row" id="date_measure">Дата измерений</td>
                                    <td class="time_measure_row" id="time_measure">Время измерений</td>
                                    <td class="depo_name_row" id="depo_name">Депо</td>
                                    <td class="route_number_row" id="route_number">Номер маршрута</td>
                                    <td class="type_name_row" id="type_name">Тип состава</td>
                                    <td class="count_wagons_row" id="count_wagons">Количество вагонов</td>
                                    <td class="count_measure_row" id="count_measure">Количество измерений</td>
                                    <td class="count_extreme_row" id="count_extreme">Отклонения при измерениях</td>
                                    <td class="is_edited_row" id="is_edited">Редактировалось</td>
                                    <td class="user_name_row" id="user_name">Внес данные ФИО</td>
                                </tr>
                        </table>
                    </div>

                    <div id="table_scroll_div">
                        <table>
                                <!-- <tr>
                                    <td class="date_placement_row" id="date_placement">26.04.2021</td>
                                    <td class="date_measure_row" id="date_measure">26.04.2021</td>
                                    <td class="time_measure_row" id="time_measure">14:53</td>
                                    <td class="depo_name_row" id="depo_name">ТЧ-8  “Варшавское”</td>
                                    <td class="route_number_row" id="route_number">001</td>
                                    <td class="type_name_row" id="type_name">81-717/714</td>
                                    <td class="count_wagons_row" id="count_wagons">8</td>
                                    <td class="count_measure_row" id="count_measure">528</td>
                                    <td class="count_extreme_row" id="count_extreme">2</td>
                                    <td class="is_edited_row" id="is_edited">DA</td>
                                    <td class="user_name_row" id="user_name">Сидоров Иван Иванович </td>
                                </tr> -->
                        </table>
                    </div>

                </div>

            </div>

            <div id="footer">
                <div id="instructions">
                    <img src="img/footer/info_logo.svg" alt="">
                    <p>Инструкция</p>
                </div>
                <img src="img/footer/footer_logo.svg" alt="">
            </div>
        </div>

    </section>
    <?php
        echo $scripts;
    ?>
</body>
</html>