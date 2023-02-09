
from ldap3 import Connection, Server, NTLM, ALL, IP_V4_PREFERRED
from config import LDAP

def get_user_by_mail(mail):
    ''' Подключение и проверка пользователя в АД '''
    server = Server(LDAP['server'], get_info=ALL, mode=IP_V4_PREFERRED)
    conn = Connection(server, user=LDAP['user'], password=LDAP['password'], authentication=NTLM)
    conn.bind()
    conn.search(LDAP['root_dc'], search_filter = '(&(objectClass=person)(mail={}))'.format(mail), attributes=['name', 'sAMAccountName'])
    
    if conn.entries:
        conn.closed()
        return {"ad_user": str(conn.entries[0]['sAMAccountName']), "email": mail, "fio": str(conn.entries[0]['name'])}
    
    conn.closed()
    return None


def get_user_by_login(login):
    ''' Подключение и проверка пользователя в АД '''
    server = Server(LDAP['server'], get_info=ALL, mode=IP_V4_PREFERRED)
    conn = Connection(server, user=LDAP['user'], password=LDAP['password'], authentication=NTLM)
    conn.bind()
    conn.search(LDAP['root_dc'], search_filter = '(&(objectClass=person)(sAMAccountName={}))'.format(login), attributes=['*'])
    
    if conn.entries:
        conn.closed()
        return {"ad_user": login, "email": str(conn.entries[0]['mail']), "fio": str(conn.entries[0]['name'])}
    conn.closed()
    return None


# if __name__ == "__main__": 
#     server = Server(LDAP['server'], get_info=ALL, mode=IP_V4_PREFERRED)
#     conn = Connection(server, user="MOSMETRO.RU\\torchkov-mv", password="Freeten563610", authentication=NTLM)
#     print(conn.bind()) # True, False
