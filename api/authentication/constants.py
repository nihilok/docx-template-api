TESTING = True

origins = [
    'https://localhost:4000',
]

origins = origins + ['*'] if TESTING else origins
SECRET_KEY = "SomeTHiNGsupERsEcReT!!"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 240
GUEST_IDS = []
SUPER_USERS = [1]
