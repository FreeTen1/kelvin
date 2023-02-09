# update date: 2022-08-11 13:47
from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, JSON, String, Table, text
from sqlalchemy.dialects.mysql import INTEGER, TINYINT, VARCHAR
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()
metadata = Base.metadata


class Access(Base):
    __tablename__ = 'accesses'
    __table_args__ = {'comment': 'Таблица прав доступа'}

    id = Column(INTEGER, primary_key=True, comment='id прав доступа')
    name = Column(String(255), nullable=False, comment='Наименование прав доступа')


class Depot(Base):
    __tablename__ = 'depot'
    __table_args__ = {'comment': 'Таблица депо'}

    id = Column(INTEGER, primary_key=True, comment='id депо')
    name = Column(String(255), nullable=False, comment='название депо')
    status = Column(TINYINT(1), nullable=False, comment='доступность в ресурсе')

    users = relationship('User', secondary='available_depots')


class Train717Header(Base):
    __tablename__ = 'train717_headers'

    id = Column(INTEGER, primary_key=True)
    name = Column(VARCHAR(255))
    title = Column(String(255))


class Train740Header(Base):
    __tablename__ = 'train740_headers'

    id = Column(INTEGER, primary_key=True)
    name = Column(VARCHAR(255))
    title = Column(String(255))


class Type(Base):
    __tablename__ = 'types'
    __table_args__ = {'comment': 'Таблица типов'}

    id = Column(INTEGER, primary_key=True, comment='id типа')
    name = Column(String(255), nullable=False, comment='название типа')
    dots = Column(JSON, nullable=False, comment='структура типа')


class Train(Base):
    __tablename__ = 'trains'
    __table_args__ = {'comment': 'Таблица составов'}

    id = Column(INTEGER, primary_key=True, comment='id состава')
    depo_id = Column(ForeignKey('depot.id', onupdate='CASCADE'), nullable=False, index=True, comment='id депо')
    type_id = Column(ForeignKey('types.id', onupdate='CASCADE'), nullable=False, index=True, comment='id типа')
    count_wagons = Column(INTEGER, nullable=False, comment='кол-во вагонов')
    route_number = Column(String(10), nullable=False, comment='номер маршрута')
    date_placement = Column(Date, nullable=False, comment='дата расстановки')
    datetime_created = Column(DateTime, nullable=False, server_default=text("CURRENT_TIMESTAMP"), comment='Дата и время создания состава')

    depo = relationship('Depot')
    type = relationship('Type')


class User(Base):
    __tablename__ = 'users'
    __table_args__ = {'comment': 'Таблица пользователей'}

    id = Column(INTEGER, primary_key=True, comment='id пользователя')
    ad_login = Column(String(255), nullable=False, comment='login пользователя')
    full_name = Column(String(255), comment='ФИО')
    depo_id = Column(ForeignKey('depot.id', onupdate='CASCADE'), index=True, comment='id депо')
    access = Column(ForeignKey('accesses.id', onupdate='CASCADE'), nullable=False, index=True, comment='права доступа')

    access1 = relationship('Access')
    depo = relationship('Depot')


t_available_depots = Table(
    'available_depots', metadata,
    Column('user_id', ForeignKey('users.id', onupdate='CASCADE'), primary_key=True, nullable=False),
    Column('depo_id', ForeignKey('depot.id', onupdate='CASCADE'), primary_key=True, nullable=False, index=True),
    comment='Таблица доступных депо для конкретного пользователя'
)


class Measure(Base):
    __tablename__ = 'measure'
    __table_args__ = {'comment': 'Таблица измерений для состава'}

    id = Column(INTEGER, primary_key=True, comment='id изменения')
    train_id = Column(ForeignKey('trains.id', ondelete='CASCADE', onupdate='CASCADE'), nullable=False, index=True, comment='id состава')
    wagon_numbers = Column(JSON, nullable=False, comment='JSON данные о номерах вагонов')
    data = Column(JSON, comment='данные об измерениях')
    temp_ambient = Column(Integer, comment='Температура окружающей среды')
    user_id = Column(ForeignKey('users.id', onupdate='CASCADE'), index=True, comment='id пользователя')
    datetime_created = Column(DateTime, nullable=False, server_default=text("CURRENT_TIMESTAMP"), comment='дата и время занесения информации')
    datetime_measure = Column(DateTime)
    is_edited = Column(TINYINT(1), nullable=False, server_default=text("'0'"), comment='редактировалось ли поле')
    user_edit = Column(ForeignKey('users.id', ondelete='RESTRICT', onupdate='CASCADE'), index=True, comment='id пользователя который редактировал')
    master_edit = Column(ForeignKey('users.id', ondelete='RESTRICT', onupdate='CASCADE'), index=True)

    user = relationship('User', primaryjoin='Measure.master_edit == User.id')
    train = relationship('Train')
    user1 = relationship('User', primaryjoin='Measure.user_edit == User.id')
    user2 = relationship('User', primaryjoin='Measure.user_id == User.id')


class MeasureHistory(Base):
    __tablename__ = 'measure_history'
    __table_args__ = {'comment': 'Таблица логирования измерений'}

    id = Column(INTEGER, primary_key=True, comment='id лога')
    train_id = Column(ForeignKey('trains.id', ondelete='CASCADE', onupdate='CASCADE'), nullable=False, index=True, comment='id состава')
    wagon_numbers = Column(JSON, nullable=False, comment='JSON данные о номерах вагонов')
    user_master = Column(ForeignKey('users.id', onupdate='CASCADE'), nullable=False, index=True, comment='id пользователя мастер')
    user_redactor = Column(ForeignKey('users.id', onupdate='CASCADE'), nullable=False, index=True, comment='id пользователя слесарь')
    data = Column(JSON, nullable=False, comment='данные об измерениях')
    datetime_logs = Column(DateTime, nullable=False, server_default=text("CURRENT_TIMESTAMP"), comment='дата и время логирования')

    train = relationship('Train')
    user = relationship('User', primaryjoin='MeasureHistory.user_master == User.id')
    user1 = relationship('User', primaryjoin='MeasureHistory.user_redactor == User.id')
