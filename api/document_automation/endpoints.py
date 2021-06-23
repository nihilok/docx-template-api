import datetime
import pickle

from docx import Document
from fastapi import APIRouter, Depends, File, UploadFile, Form
from docx.shared import Cm
from docxtpl import DocxTemplate, InlineImage
from fastapi.responses import FileResponse
from .constants import template_path
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
    await letter.delete()
    return {}


@router.put('/update-template-file/', response_model=LetterPydantic)
async def update_template_file(letter_id: int, file: UploadFile = File(...),
                               user: UserPydantic = Depends(get_current_active_user)):
    letter = await Letter.get(id=letter_id)
    await letter.add_binary(file)
    return await LetterPydantic.from_tortoise_orm(letter)


async def get_full_text(filename) -> str:
    doc = Document(filename)
    full_text = []
    for para in doc.paragraphs:
        full_text.append(para.text)
    return ' '.join(full_text)


async def sort_vars(check_text, template_variables) -> list:
    ordered_vars = []
    for word in check_text.split(' '):
        if word[2:-2] in template_variables:
            ordered_vars.append(word[2:-2])
    return ordered_vars


# TODO: template rendering endpoint
@router.get('/get-variables/', response_model=VariablesOut)
async def get_variables(letter_id: int,
                        user: UserPydantic = Depends(get_current_active_user)):
    letter = await Letter.get(id=letter_id)
    if letter.variables:
        return VariablesOut(variables=pickle.loads(letter.variables),
                            letter_id=letter_id)
    defaults = {'time', 'year', 'month', 'day'}
    template = DocxTemplate(letter.filename)
    check_text = await get_full_text(letter.filename)
    template_variables = [v for v in template.undeclared_template_variables if v not in defaults]
    ordered_vars = await sort_vars(check_text, template_variables)
    return VariablesOut(variables=[LetterVariable(var_name=variable)
                                   for variable in ordered_vars],
                        letter_id=letter_id)


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
                          user: UserPydantic = Depends(get_current_active_user)):
    letter = await Letter.get(id=letter_id)
    template = DocxTemplate(letter.filename)
    context = {
        'day': datetime.datetime.now().strftime('%d'),
        'month': datetime.datetime.now().strftime('%b'),
        'year': datetime.datetime.now().strftime('%Y'),
        'time': datetime.datetime.now().strftime('%H:%M'),
    }
    for r in responses.responses:
        context[r.var_name] = r.response

    template.render(context)
    new_path = (template_path + str(user.premises.id) + '/generated_documents/' +
                f"{context['year']}-{context['month']}-{context['day']} - {context['time']}" + '.docx')
    template.save(new_path)
    return FileResponse(new_path)


"""This is a paragraph that you can add blank lines to if you want to create a second paragraph. The formatting with be the same as the variable in the template.

Here, for example I have created a new paragraph, within the same paragraph variable."""
