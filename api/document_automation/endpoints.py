import pickle

from fastapi import APIRouter, Depends, File, UploadFile, Form
from docx.shared import Cm
from docxtpl import DocxTemplate, InlineImage
from ..authentication import get_current_active_user
from ..db.models import Letter, LetterPydantic, LetterVariable, VariablesOut, VariablesIn
from ..db.models.users import UserPydantic, User

router = APIRouter()
template_path = './letter_templates/'


@router.get('/all-templates/')
async def get_templates(user: UserPydantic = Depends(get_current_active_user)) -> list:
    user_obj = await User.get(id=user.id)
    letters = await LetterPydantic.from_queryset(Letter.filter(premises_id=user_obj.premises_id))
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
    await letter.delete()
    return {}


@router.put('/update-template-file/')
async def update_template_file(letter_id: int, file: UploadFile = File(...),
                               user: UserPydantic = Depends(get_current_active_user)):
    letter = await Letter.get(id=letter_id)
    await letter.add_binary(file)
    return await LetterPydantic.from_tortoise_orm(letter)


# TODO: template rendering endpoint
@router.get('/get-variables/', response_model=VariablesOut)
async def get_variables(letter_id: int, user: UserPydantic = Depends(get_current_active_user)):
    letter = await Letter.get(id=letter_id)
    template = DocxTemplate(letter.filename)
    template_variables = {v for v in template.undeclared_template_variables}
    if letter.variables:
        return VariablesOut(variables=pickle.loads(letter.variables), letter_id=letter_id)
    return VariablesOut(variables=[LetterVariable(var_name=variable) for variable in template_variables],
                        letter_id=letter_id)


@router.put('/set-variables/')
async def set_variables(variables: VariablesIn, user: UserPydantic = Depends(get_current_active_user)):
    letter = await Letter.get(id=variables.letter_id)
    if letter.variables:
        letter.variables = None
    await letter.add_variables(variables)
    return {'message': 'variables set'}




