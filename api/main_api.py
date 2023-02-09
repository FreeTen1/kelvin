from flask import Flask, Response, json, send_file
from flask_restful import Api, Resource, reqparse
from excel_func import get_count_measurement, get_data_from_file
from auth import auth, get_locksmiths
from config import API
from werkzeug.datastructures import FileStorage
from day_struct import formation_general_struct

from dropdown_lists import get_lists_for_viewers, get_route_numbers

from flask.wrappers import Request

from train_func import create_measure, edit_measure, get_completed_trains, get_measured_train, get_train


class AnyJsonRequest(Request):
    def on_json_loading_failed(self, e):
        if e is not None:
            return super().on_json_loading_failed(e)


app = Flask(__name__)
api = Api(app, prefix='')
app.request_class = AnyJsonRequest


class _Resource(Resource):
    parser = reqparse.RequestParser(trim=True)
    #parser.add_argument('parser', type=str, default=False, required=True, choices=('M', 'F'), help='Bad choice: {error_msg}')

    def return_json(self, body, status):
        return Response(json.dumps(body, ensure_ascii=False), mimetype='application/json', status=status)

    def return_status(self, status):
        return Response(status=status)


class Auth(_Resource):
    """Авторизация"""
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('login', type=str, required=True)

    def post(self):
        args: dict = self.parser.parse_args()
        body = auth(**args)
        return self.return_json(body, body["status"])


class GetListsForViewers(_Resource):
    """Получить список депо для зрителей"""
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('login', type=str, required=True)
    parser.add_argument('access', type=str, required=True)

    def get(self):
        args: dict = self.parser.parse_args()
        body = get_lists_for_viewers(**args)
        return self.return_json(body, body["status"])


class FileStruct(_Resource):
    """Обработать файл со структурой"""
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('file_routes', type=FileStorage, location="files", store_missing=False, required=True)
    parser.add_argument('login', type=str, location="values", required=True)

    def post(self):
        args: dict = self.parser.parse_args()
        file_routes: FileStorage = args.pop('file_routes')
        login = args.pop('login')
        body = formation_general_struct(file_routes, login)
        return self.return_json(body, body["status"])


class GetRouteNumbers(_Resource):
    """Получить номера маршрутов и поезда для депо относительно даты"""
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('login', type=str, required=True)
    parser.add_argument('date', type=str, required=True)

    def get(self):
        args: dict = self.parser.parse_args()
        body = get_route_numbers(**args)
        return self.return_json(body, body["status"])


class GetTrain(_Resource):
    """Получить конкретный поезд по номеру маршрута, дате (логин) и депо"""
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('login', type=str, required=True)
    parser.add_argument('date', type=str, required=True)
    parser.add_argument('route_number', type=str, required=True)

    def get(self):
        args: dict = self.parser.parse_args()
        body = get_train(**args)
        return self.return_json(body, body["status"])


class UploadData(_Resource):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('file_data', type=FileStorage, location="files", store_missing=False, required=True)
    parser.add_argument('login', location="values", type=str, required=True)
    parser.add_argument('date', location="values", type=str, required=True)
    parser.add_argument('route_number', location="values", type=str, required=True)

    def post(self):
        """Загрузить данные из файла и отправка их в верном формате в таблицу (на фронт)"""
        args: dict = self.parser.parse_args()
        body = get_data_from_file(**args)
        return self.return_json(body, body["status"])


class GetLocksmiths(_Resource):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('login', type=str, required=True)

    def get(self):
        """Получить список слесарей в конкретном депо (узнаём по логину)"""
        args: dict = self.parser.parse_args()
        body = get_locksmiths(login=args["login"])
        return self.return_json(body, body["status"])


class CreateMeasure(_Resource):
    """
    Params: 
    - locksmith_login - логин слесаря
    - locksmiths_pass - пароль от AD слесаря
    """
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('locksmith_login', type=str, required=True)
    parser.add_argument('locksmith_pass', type=str, required=True)
    parser.add_argument('data', type=str, required=True)
    parser.add_argument('date', type=str, required=True)
    parser.add_argument('route_number', type=str, required=True)
    parser.add_argument('wagons', type=str, required=True)
    parser.add_argument('temp_ambient', type=int, required=True)

    def post(self):
        """Загрузить измерения нужно подтверждение слесаря access = 1"""
        args: dict = self.parser.parse_args()
        body = create_measure(**args)
        return self.return_json(body, body["status"])


class GetCompletedTrains(_Resource):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('login', type=str, required=True)
    parser.add_argument('date_from', type=str, required=True)
    parser.add_argument('date_end', type=str, required=True)
    parser.add_argument('depo_name', type=str)

    def get(self):
        """Получить список измеренных поездов"""
        args: dict = self.parser.parse_args()
        body = get_completed_trains(**args)
        return self.return_json(body, body["status"])


class GetMeasuredTrain(_Resource):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('login', type=str, required=True)
    parser.add_argument('measured_train_id', type=str, required=True)

    def get(self):
        """получить данные об измеренном поезде"""
        args: dict = self.parser.parse_args()
        body = get_measured_train(**args)
        return self.return_json(body, body["status"])


class EditMeasure(_Resource):
    """
    Params: 
    - locksmith_login - логин слесаря
    - locksmiths_pass - пароль от AD слесаря
    - master_login - логин мастера
    - master_pass - пароль от AD мастера
    """
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('master_login', type=str, required=True)
    parser.add_argument('master_pass', type=str, required=True)
    parser.add_argument('locksmith_pass', type=str, required=True)
    parser.add_argument('locksmith_login', type=str, required=True)
    parser.add_argument('data', type=str, required=True)
    parser.add_argument('wagons', type=str, required=True)
    parser.add_argument('measured_train_id', type=str, required=True)
    parser.add_argument('temp_ambient', type=int, required=True)

    def put(self):
        """Отредактировать измерения"""
        args: dict = self.parser.parse_args()
        body = edit_measure(**args)
        return self.return_json(body, body["status"])


class GetCountMeasurement(_Resource):
    """
    Получить данные о количестве замеров всех вагонов
    в период с 11.09.2022 по сегодняшний день
    Params: 
    """
    parser = reqparse.RequestParser(trim=True)
    # parser.add_argument('master_login', type=str, required=True)

    def get(self):
        # args: dict = self.parser.parse_args()
        body = get_count_measurement()
        if body["status"] == 200:
            return send_file(body["path"])
        else:
            return self.return_json(body, body["status"])


api.add_resource(Auth, '/auth')
api.add_resource(GetListsForViewers, '/get_lists')
api.add_resource(FileStruct, '/upload_file_struct')
api.add_resource(GetRouteNumbers, '/get_route_numbers')
api.add_resource(GetTrain, '/get_train')
api.add_resource(UploadData, '/get_data_from_file')
api.add_resource(GetLocksmiths, '/get_locksmiths')
api.add_resource(CreateMeasure, '/create_measure')
api.add_resource(GetCompletedTrains, '/get_completed_trains')
api.add_resource(GetMeasuredTrain, '/get_measured_train')
api.add_resource(EditMeasure, '/edit_measure')
api.add_resource(GetCountMeasurement, '/get_count_measurement')


if __name__ == '__main__':
    app.run(host=API.get('host'),
            port=API.getint('port'),
            debug=API.getboolean('debug'))
