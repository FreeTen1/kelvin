import re
from dropdown_lists import get_lists_for_viewers
from my_engine import session_scope
from models import Depot, Measure, Train, Train717Header, Train740Header, Type, User, t_available_depots
from sqlalchemy.orm import aliased

def get_train(login: str, date: str, route_number: str, viewer: bool = False) -> dict:
    """Функция для получения конкретного поезда по номеру маршрута, дате и логину (по нему узнаем депо)"""
    with session_scope() as session:
        if viewer:
            data = session.query(Type.dots,
                                 Train.type_id,
                                 Train.count_wagons,
                                 Measure.wagon_numbers,
                                 Measure.id.label("measure_id")).join(Type).join(Measure).\
                                   filter(Train.route_number == route_number,
                                          Train.date_placement == date,
                                          Train.depo_id.in_(tuple(_ for _, in session.query(t_available_depots.c.depo_id).join(User).filter(User.ad_login == login).all()))).first()
                                          
        else:
            data = session.query(Type.dots,
                                 Train.type_id,
                                 Train.count_wagons,
                                 Measure.wagon_numbers,
                                 Measure.id.label("measure_id")).join(Type).join(Measure).\
                                   filter(Train.route_number == route_number,
                                          Train.date_placement == date,
                                          Train.depo_id == session.query(User.depo_id).filter(User.ad_login == login).one()[0]).first()

        if data:
            if data.type_id == 1:
                headers_text = dict((id, {"name": name, "title": title}) for id, name, title in session.query(Train717Header.id, Train717Header.name, Train717Header.title).all())
            elif data.type_id == 2:
                headers_text = dict((id, {"name": name, "title": title}) for id, name, title in session.query(Train740Header.id, Train740Header.name, Train740Header.title).all())

            for item in data.dots["head_td"]:
                item["td_head_name"] = headers_text[item["td_head_name_id"]]["name"]
                item["td_head_title"] = headers_text[item["td_head_name_id"]]["title"]
            
            data = dict(data)
            data["wagon_numbers"] = data["wagon_numbers"]["wagon_numbers"]
            return {"status": 200, "train_struct": data}
        else:
            message = f"Поезд по маршруту '{route_number}', "
            message += f"за дату '{date}' в депо {session.query(Depot.name).join(User).filter(User.ad_login == login).one()[0]} не найден!"
            return {"status": 400, "message": message}


def create_measure(locksmith_login: str, locksmith_pass: str, data: str, date: str, route_number: str, wagons: str, temp_ambient: int) -> dict:
    try:
        data = eval(data)
        wagons = eval(wagons)
        if not data:
            return {"status": 400, "message": "Нет данных об измерениях"}
        if not wagons:
            return {"status": 400, "message": "Нет данных о вагонах"}
    except:
        return {"status": 400, "message": "Некорректные данные в функции create_measure(). Обратитесь к разработчикам"}
    # Проверка совпадения логина из АД и пароля слесаря
    #################
    with session_scope() as session:
        depot_id, = session.query(User.depo_id).filter(User.ad_login == locksmith_login).one()
        
        train_id = session.query(Train.id).filter(Train.depo_id == depot_id, 
                                                  Train.date_placement == date, 
                                                  Train.route_number == route_number)

        session.query(Measure).filter(Measure.train_id == train_id).update({
            "temp_ambient": temp_ambient,
            "data": data,
            "user_id": session.query(User.id).filter(User.ad_login == locksmith_login),
            "wagon_numbers": wagons
        }, synchronize_session='fetch')

    return {"status": 200}


def edit_measure(master_login: str, master_pass: str, locksmith_login: str, locksmith_pass: str, data: str, wagons: str, measured_train_id: int, temp_ambient: int):
    try:
        measured_train_id = int(measured_train_id)
    except:
        return {"status": 400, "message": f"Некорректное значение {measured_train_id}"}
    
    # Проверка совпадения master_login из АД и master_pass мастера и слесаря
    #################

    with session_scope() as session:
        try:
            route_number, date, train_id = session.query(Train.route_number, Train.date_placement, Train.id).\
                join(Measure, Measure.train_id == Train.id).filter(Measure.id == measured_train_id).one()
        except:
            return {"status": 400, "message": f"Поезд с id {measured_train_id} не найден"}
        
        if not session.query(Measure.data).filter(Measure.id == measured_train_id).one()[0]:
            return {"status": 400, "message": f"Для данного поезда не делались замеры"}
        
        depot_id, = session.query(User.depo_id).filter(User.ad_login == locksmith_login).one()
        
        train_id = session.query(Train.id).filter(Train.depo_id == depot_id, 
                                                Train.date_placement == date, 
                                                Train.route_number == route_number)

        session.query(Measure).filter(Measure.train_id == train_id).\
            update({
                "temp_ambient": temp_ambient,
                "data": eval(data),
                "user_edit": session.query(User.id).filter(User.ad_login == locksmith_login),
                "master_edit": session.query(User.id).filter(User.ad_login == master_login),
                "wagon_numbers": eval(wagons),
                "is_edited": 1
            },
            synchronize_session='fetch')

    return {"status": 200}


def get_completed_trains(login: str, date_from: str, date_end: str, depo_name: str = None) -> dict:
    user_created = aliased(User)
    user_edit = aliased(User)
    if depo_name:
        with session_scope() as session:
            trains = session.query(Train.route_number.label("route_number"),
                                   Measure.datetime_measure.label("datetime_measure"),
                                   Train.date_placement.label("date_placement"),
                                   Measure.id.label("measure_id"),
                                   Depot.name.label("depo_name"),
                                   Type.name.label("type_name"),
                                   Train.count_wagons.label("count_wagons"),
                                   Measure.data.label("data"),
                                   Measure.is_edited.label("is_edited"),
                                   user_created.full_name.label("user_name"),
                                   user_edit.full_name.label("user_edit"),
                                   Measure.wagon_numbers,
                                   Measure.temp_ambient).\
                                    join(Depot, Depot.id == Train.depo_id).\
                                    join(Type, Type.id == Train.type_id).\
                                    join(Measure, Measure.train_id == Train.id).\
                                    join(user_created, user_created.id == Measure.user_id).\
                                    outerjoin(user_edit, user_edit.id == Measure.user_edit).filter(Train.date_placement >= date_from,
                                                                                                   Train.date_placement < date_end,
                                                                                                   Depot.name == depo_name).all()
    else:
        with session_scope() as session:
            trains = session.query(Train.route_number.label("route_number"),
                                   Measure.datetime_measure.label("datetime_measure"),
                                   Train.date_placement.label("date_placement"),
                                   Measure.id.label("measure_id"),
                                   Depot.name.label("depo_name"),
                                   Type.name.label("type_name"),
                                   Train.count_wagons.label("count_wagons"),
                                   Measure.data.label("data"),
                                   Measure.is_edited.label("is_edited"),
                                   user_created.full_name.label("user_name"),
                                   user_edit.full_name.label("user_edit"),
                                   Measure.wagon_numbers,
                                   Measure.temp_ambient).\
                                    join(Depot, Depot.id == Train.depo_id).\
                                    join(Type, Type.id == Train.type_id).\
                                    join(Measure, Measure.train_id == Train.id).\
                                    join(user_created, user_created.id == Measure.user_id).\
                                    outerjoin(user_edit, user_edit.id == Measure.user_edit).filter(Train.date_placement >= date_from, 
                                                                                                   Train.date_placement < date_end,
                                                                                                   Depot.name.in_(get_lists_for_viewers(login, 4)["depots"])).all()
    
    # заполнение значений для холодных и вопросительных букс
    for train in trains:
        for info5, info6 in zip(train.data['5'], train.data['6']):
            if str(info5["value"]).isdigit():
                info5["cold"] = True if int(info5["value"]) <= train.temp_ambient else False
                info5["unknown"] = False
            else:
                info5["cold"] = False
                info5["unknown"] = True
            
            if str(info6["value"]).isdigit():
                info6["cold"] = True if int(info6["value"]) <= train.temp_ambient else False
                info6["unknown"] = False
            else:
                info6["cold"] = False
                info6["unknown"] = True

    if not trains:
        return {"status": 404, "message": "Замеренные поезда не найдены"}
    else:
        return {"status": 200,
                "result": [{
                        "count_wagons": row.count_wagons,
                        "date_measure": row.datetime_measure.strftime("%d.%m.%Y"),
                        "time_measure": row.datetime_measure.strftime("%H:%M"),
                        "depo_name": row.depo_name,
                        "measure_id": row.measure_id,
                        "route_number": row.route_number,
                        "type_name": row.type_name,
                        "user_name": row.user_name,
                        "user_edit": row.user_edit,
                        "is_edited": True if row.is_edited else False,
                        "count_measure": sum([len(v) for v in row.data.values()]) - len(re.findall("'value': '-'", str(row.data))),
                        "count_extreme": len(re.findall("'extreme': True", str(row.data))),
                        "count_cold": len(re.findall("'cold': True", str(row.data))),
                        "count_unknown": len(re.findall("'unknown': True", str(row.data))),
                        "count_heat": len(re.findall("'heat': True", str(row.data))),
                        "date_placement": row.date_placement.strftime("%d.%m.%Y"),
                        "is_rainbow": all(['05079' in ';'.join([_["wagon_number"] for _ in row.wagon_numbers['wagon_numbers']]),
                                           '05577' in ';'.join([_["wagon_number"] for _ in row.wagon_numbers['wagon_numbers']]),
                                           '05576' in ';'.join([_["wagon_number"] for _ in row.wagon_numbers['wagon_numbers']]),
                                           '05575' in ';'.join([_["wagon_number"] for _ in row.wagon_numbers['wagon_numbers']]),
                                           '05078' in ';'.join([_["wagon_number"] for _ in row.wagon_numbers['wagon_numbers']])])
                    } for row in trains]
                }


def get_measured_train(login: str, measured_train_id: int) -> dict:
    try:
        measured_train_id = int(measured_train_id)
    except:
        return {"status": 400, "message": f"Некорректное значение {measured_train_id}"}
    
    with session_scope() as session:
        try:
            user_depo = session.query(User.depo_id).filter(User.ad_login == login).one()
            if not user_depo[0]:
                user_depo = tuple(_ for _, in session.query(t_available_depots.c.depo_id).join(User).filter(User.ad_login == login).all())
            
            train_depo, current_data, datetime_measure = session.query(Train.depo_id, Measure.data, Measure.datetime_measure).\
                join(Measure, Measure.train_id == Train.id).filter(Measure.id == measured_train_id).one()
        except:
            return {"status": 400, "message": f"Поезд с id {measured_train_id} не найден"}
        
        if not current_data:
            return {"status": 400, "message": f"Данный поезд ещё не замерялся"}

        if train_depo not in user_depo:
            return {"status": 400, "message": f"У вас нет прав на редактирование данного поезда, вы привязаны к другому депо"}

        user_name_obj = aliased(User)
        user_edit_obj = aliased(User)
        master_edit_obj = aliased(User)
        route_number, date_placement, user_name, user_edit, master_edit, depo_name, temp_ambient = session.query(Train.route_number,
                                                                                                    Train.date_placement,
                                                                                                    user_name_obj.full_name,
                                                                                                    user_edit_obj.full_name,
                                                                                                    master_edit_obj.full_name,
                                                                                                    Depot.name,
                                                                                                    Measure.temp_ambient).\
                                                                                                      join(Measure, Measure.train_id == Train.id).\
                                                                                                      join(user_name_obj, user_name_obj.id == Measure.user_id).\
                                                                                                      outerjoin(user_edit_obj, user_edit_obj.id == Measure.user_edit).\
                                                                                                      outerjoin(master_edit_obj, master_edit_obj.id == Measure.master_edit).\
                                                                                                      join(Depot, Depot.id == Train.depo_id).\
                                                                                                          filter(Measure.id == measured_train_id).one()

    train_struct = get_train(login, date_placement, route_number) if session.query(User.depo_id).\
        filter(User.ad_login == login).one()[0] else get_train(login,
                                                               date_placement,
                                                               route_number, 
                                                               True)
    
    if train_struct["status"] == 200:
        train_struct = train_struct["train_struct"]
    else:
        return train_struct


    return {"status": 200, 
            "train_struct": train_struct, 
            "current_data": current_data, 
            "date_measure": datetime_measure.strftime("%d.%m.%Y"),
            "user_name": user_name,
            "user_edit": user_edit,
            "master_edit": master_edit,
            "depo_name": depo_name,
            "route_number": route_number,
            "date_placement": date_placement.strftime("%d.%m.%Y"),
            "date_placement_eng": date_placement.strftime("%Y-%m-%d"),
            "temp_ambient": temp_ambient
        }
