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
    <link rel="stylesheet" href="style/table_style.css">
    <link rel="stylesheet" href="style/general_style/footer.css">
    
    <link rel="stylesheet" href="style/enter_data_style.css">
    <link rel="stylesheet" href="style/apply_edit.css">
    <title>Кельвин просмотр</title>
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
                <script src="scripts/single_measure.js"></script>
                <script src="scripts/draw_struct.js"></script>
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
                <a href="index.php"><li>Эксплуатационный осмотр подвижного состава</li></a>
                <li> <img class="next" src="img/person_info/navNext.svg"> </li>
                <li>Просмотр данных</li>
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
                        <p id="head_depo_name">Депо</p>
                        <p id="head_roue_number">Маршрут: №</p>
                        <p id="head_date_measure">Дата измерений: </p>
                        <p id="head_date_placement">Дата выезда: </p>
                        <p id="head_train_type_name">Тип состава: <span id="type_name_span"></span></p>
                        <div id="users_div">
                            <p id="head_user_full_name">Внёс данные: </p>
                            <p id="head_user_full_name_edit">Отредактировал данные: </p>
                            <p id="head_user_full_name_master">Подтвердил данные: </p>
                        </div>
                    </div>
                    <p id="head_temp_ambient">Температура О. С.: <span class="edit_td" id="temp_ambient_span"></span>°C</p>
                    
                </div>

                <div id="main_table_div">
                    <table id="table" border="1">
                        
                    </table>
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