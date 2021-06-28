import asyncio
import datetime
import os
import pickle
import time
from typing import Optional

from jinja2.exceptions import TemplateSyntaxError
from docx import Document
from fastapi import APIRouter, Depends, File, UploadFile, Form, HTTPException
from docxtpl import DocxTemplate
from fastapi.responses import FileResponse
from .constants import template_path
from .templating_engine.templating_engine import get_sorted_variables, generate_report
from ..authentication import get_current_active_user
from ..db.models import Letter, LetterPydantic, LetterVariable, VariablesOut, VariablesIn, ResponsesIn
from ..db.models.users import UserPydantic, User

router = APIRouter()


@router.get('/all-templates/', response_model=list[LetterPydantic])
async def get_templates(user: UserPydantic = Depends(get_current_active_user)):
    user_obj = await User.get(id=user.id)
    letters = await LetterPydantic.from_queryset(
        Letter.filter(premises_id=user_obj.premises_id))
    return letters


@router.post('/create-template/', response_model=VariablesOut)
async def create_new_template(name: str = Form(...),
                              file: UploadFile = Form(...),
                              user: UserPydantic = Depends(get_current_active_user)):
    user_obj = await User.get(id=user.id)
    letter_obj = await Letter.create(premises_id=user_obj.premises_id, name=name)
    await letter_obj.add_binary(file)
    return await get_variables(letter_obj.id, user)


@router.delete('/delete-template/')
async def delete_template(letter_id: int,
                          user: UserPydantic = Depends(get_current_active_user)):
    letter = await Letter.get(id=letter_id)
    path = letter.filename
    await letter.delete()
    os.remove(path)
    return {}


@router.put('/update-template-file/', response_model=LetterPydantic)
async def update_template_file(letter_id: int, file: UploadFile = File(...),
                               user: UserPydantic = Depends(get_current_active_user)):
    letter = await Letter.get(id=letter_id)
    await letter.add_binary(file)
    letter.variables = None
    await letter.save()
    return await LetterPydantic.from_tortoise_orm(letter)


# TODO: template rendering endpoint
@router.get('/get-variables/', response_model=VariablesOut)
async def get_variables(letter_id: int,
                        user: UserPydantic = Depends(get_current_active_user)):
    letter = await Letter.get(id=letter_id)
    if letter.variables:
        return VariablesOut(variables=pickle.loads(letter.variables),
                            letter_id=letter_id)
    try:
        ordered_vars = await get_sorted_variables(letter)
        return VariablesOut(variables=[LetterVariable(var_name=variable)
                                       for variable in ordered_vars],
                            letter_id=letter_id)
    except TemplateSyntaxError as e:
        await letter.delete()
        raise HTTPException(status_code=400,
                            detail=f"Template formatted incorrectly: {e}")


@router.put('/set-variables/')
async def set_variables(variables: VariablesIn,
                        user: UserPydantic = Depends(get_current_active_user)):
    letter = await Letter.get(id=variables.letter_id)
    if letter.variables:
        letter.variables = None
    await letter.add_variables(variables)
    return {'message': 'variables set'}


@router.post('/render-template/')
async def render_template(letter_id: int,
                          responses: ResponsesIn,
                          user: UserPydantic = Depends(get_current_active_user),
                          local_time: Optional[str] = None):
    letter = await Letter.get(id=letter_id)
    new_path = await generate_report(letter, responses.responses, local_time, user.premises.id)
    return FileResponse(new_path)


@router.get('/fetch-template/')
async def fetch_template(letter_id: int):
    letter = await Letter.get(id=letter_id)
    return FileResponse(letter.filename)
