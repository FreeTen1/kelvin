from models import Depot, Measure, Train, User, t_available_depots
from my_engine import session_scope


def get_lists_for_viewers(login: str, access: int) -> dict:
    """Получить списки всех депо"""
    try:
        access = int(access)
    except:
        return {"status": 400, "message": "Некорректное значение прав доступа"}
    
    if access == 4:
        with session_scope() as session:
            depots = session.query(Depot.name, t_available_depots).\
                join(User, User.id == t_available_depots.c["user_id"]).\
                join(Depot, Depot.id == t_available_depots.c["depo_id"]).\
                filter(User.ad_login == login).all()

            return {"status": 200, "depots": [_[0] for _ in depots]}
    else:
        return {"status": 400, "message": "Права не соответствуют, данная функция только для viewer'ов"}


def get_route_numbers(login: str, date: str) -> dict:
    """Получить номера маршрутов за текущую дату на конкретном депо"""
    with session_scope() as session:
        try:
            depo_id, = session.query(Depot.id).join(User).filter(User.ad_login == login).first()
        except:
            return {"status": 400, "message": "Депо не найдено! Не верный ad_login"}

        rote_list = [_ for _, in session.query(Train.route_number).join(Measure).filter(Train.depo_id == depo_id, Train.date_placement == date, Measure.data == None).all()]
    
    return {"status": 200, "routes": rote_list} if rote_list else {"status": 404, "message": f"Маршруты на {date} число не найдены"}
