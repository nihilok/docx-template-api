import os
from fastapi import FastAPI
# from starlette.staticfiles import StaticFiles
from tortoise.contrib.fastapi import register_tortoise
from fastapi.middleware.cors import CORSMiddleware
from . import document_automation
from . import authentication


# Create ASGI app:
app = FastAPI(root_path='/msword')
app.include_router(authentication.router)
app.include_router(document_automation.router)
# app.mount('/letter_templates', StaticFiles(directory='letter_templates'), name="templates")



# CORS Permissions:
app.add_middleware(
    CORSMiddleware,
    allow_origins=authentication.constants.origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register tortoise-orm models:
register_tortoise(
    app,
    db_url=f'sqlite://{os.path.abspath(os.getcwd())}/db.sqlite3',
    modules={'models': ['api.db.models.users', 'api.db.models.letter_templates']},
    generate_schemas=True,
    add_exception_handlers=True
)
