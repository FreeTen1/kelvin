from excel_func import parsing_file_for_struct
from models import Depot, Measure, Train, User
from my_engine import session_scope
from datetime import datetime

def formation_general_struct(file, login: str) -> dict:
    """
    Создание общей структуры на день:
    - Номера маршрутов;
    - Поезда и номера вагонов
    """
    with session_scope() as session:
        access, = session.query(User.access).filter(User.ad_login == login).first() or (None, )
        if not access:
            return {"status": 400, "message": f"Пользователь '{login}' не найден"}
        elif access != 3:
            return {"status": 400, "message": f"У вас нет прав на добавление поездов и их маршрутов"}

        depo_id, = session.query(Depot.id).\
            join(User).filter(User.ad_login == login).one()

        # Парсинг файла
        parse_file = parsing_file_for_struct(file)
        if parse_file["status"] != 200:
            return parse_file
        else:
            data_file = parse_file["data"]

        if depo_id != data_file["depo_id"]:
            message = "Ваше депо и депо из файла не совпадают. "
            message += f"Вы привязаны к депо: {session.query(Depot).get(depo_id).name}, "
            message += f"а в файле указано депо: {session.query(Depot).get(data_file['depo_id']).name}"
            return {"status": 400, "message": message}

        current_routes = session.query(Train.route_number, Train.date_placement).all()
        for train in data_file["trains"]:
            if not (train["route_number"], datetime.strptime(data_file["date_placements"], "%Y-%m-%d").date()) in current_routes:
                new_train: Train = Train(depo_id=depo_id, type_id=train["type_id"], count_wagons=train["count_wagons"],
                                        route_number=train["route_number"], date_placement=data_file["date_placements"])
                session.add(new_train)
                session.commit()

                session.add(Measure(train_id=new_train.id, wagon_numbers={"wagon_numbers": train["wagon_numbers"]}))

    return {"status": 200}
