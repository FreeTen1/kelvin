from models import Depot, User
from my_engine import session_scope


def auth(login: str) -> dict:
    with session_scope() as session:
        user_info = session.query(User.full_name, User.access, Depot.name.label("depo_name"), User.depo_id).\
            outerjoin(Depot).filter(User.ad_login == login).first()

    if user_info:
        return {"status": 200, "user_info": dict(user_info)}
    else:
        return {"status": 400, "message": f"Пользователь {login} не найден"}


def get_locksmiths(login: str) -> dict:
    with session_scope() as session:
        locksmiths_logins = session.query(User.ad_login).filter(User.access == 1,
                                                     User.depo_id == session.query(User.depo_id).filter(User.ad_login == login)).all()
        
        master_logins = session.query(User.ad_login).filter(User.access == 2,
                                                     User.depo_id == session.query(User.depo_id).filter(User.ad_login == login)).all()

    if not locksmiths_logins:
        return {"status": 404, "message": "Слесаря в вашем депо не найдены"}

    return {"status": 200, "locksmiths": [_ for _, in locksmiths_logins], "masters": [_ for _, in master_logins]}
