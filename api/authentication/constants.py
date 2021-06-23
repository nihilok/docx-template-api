TESTING = True      # Uses benign heating system when True
# API will fail if no heating system in place when False

origins = [
    'https://localhost:4000',
]

origins = origins + ['*'] if TESTING else origins
SECRET_KEY = "SomeTHiNGsupERsEcReT!!"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 240
GUEST_IDS = [4]
SUPER_USERS = [1]
