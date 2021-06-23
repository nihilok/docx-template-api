import os
from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from tortoise.contrib.fastapi import register_tortoise
from fastapi.middleware.cors import CORSMiddleware
from . import document_automation
from . import authentication


# Create ASGI app:
app = FastAPI(root_path='/msword')
app.include_router(authentication.router, prefix='/msword')
app.include_router(document_automation.router)



# CORS Permissions:
app.add_middleware(
    CORSMiddleware,
    allow_origins=authentication.constants.origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="Clinical Reports API",
        version="0.0.1",
        description="For generating clinical reports from templates.",
        routes=app.routes,
    )
    openapi_schema["info"]["x-logo"] = {
        "url": "https://www.freeiconspng.com/thumbs/report-icon/report-icon-20.png"
    }
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi


# Register tortoise-orm models:
register_tortoise(
    app,
    db_url=f'sqlite://{os.path.abspath(os.getcwd())}/db.sqlite3',
    modules={'models': ['api.db.models.users', 'api.db.models.letter_templates']},
    generate_schemas=True,
    add_exception_handlers=True
)
