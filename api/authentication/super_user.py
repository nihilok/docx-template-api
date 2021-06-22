import getpass
import sqlite3
from .authentication import get_password_hash


def create_superuser():
    username = input('Username: ')
    password = get_password_hash(getpass.getpass('Password: '))
    premises_id = 1
    try:
        conn = sqlite3.connect('db.sqlite3')
        c = conn.cursor()
        c.execute('''INSERT INTO premises (id) VALUES (1)''')
        c.execute('''INSERT INTO user (name, password_hash, premises_id) 
    VALUES (?, ?, ?)''', (username, password, premises_id))
        c.close()
        conn.commit()
        conn.close()
    except Exception as e:
        print('Somthing went wrong')
        raise e
    print(f'Superuser with {username=} created successfully')


if __name__ == '__main__':
    create_superuser()