import asyncio
import os
import time
from datetime import datetime

from docx import Document
from docxtpl import DocxTemplate

from api.document_automation.constants import template_path
from api.document_automation.content.paragraph_options import choices, multiple_choices


async def get_full_text(filename) -> str:
    doc = Document(filename)
    full_text = []
    for para in doc.paragraphs:
        full_text.append(para.text)
    return ' '.join(full_text)


async def sort_vars(check_text, template_variables) -> list:
    ordered_vars = []
    for word in check_text.split(' '):
        if word[2:-2] in template_variables and word[2:-2] not in ordered_vars:
            ordered_vars.append(word[2:-2])
    return ordered_vars


async def get_sorted_variables(letter):
    defaults = {'time', 'year', 'month', 'day'}
    template = DocxTemplate(letter.filename)
    check_text = await get_full_text(letter.filename)
    template_variables = [v for v in template.undeclared_template_variables
                          if v not in defaults]
    template_ordered_vars = await sort_vars(check_text, template_variables)
    return template_ordered_vars


def delete_old_letters(filepath: str):
    time.sleep(10)
    os.remove(filepath)
    print('letter deleted')


async def parse_var_name(response):
    v = response.var_name
    if not v.startswith('__'):
        return response.response
    if v.startswith('__choice_'):
        section = v[len('__choice_'):]
        return choices[section][response.response]
    if v.startswith('__multi_'):
        section = v[len('__multi_'):]
        return ', '.join([choice for choice in multiple_choices[section]
                          if multiple_choices[section].index(choice) in response.response])


async def create_context(responses, local_time: str):
    if local_time:
        local_time = datetime.strptime(local_time, '%Y-%m-%d %H:%M')
    else:
        local_time = datetime.now()
    context = {
        'day': local_time.strftime('%d'),
        'month': local_time.strftime('%b'),
        'year': local_time.strftime('%Y'),
        'time': local_time.strftime('%H:%M')
    }
    for r in responses:
        context[r.var_name] = await parse_var_name(r)
    return context


async def generate_report(letter, responses: list, local_time: str, premises_id: int) -> str:
    template = DocxTemplate(letter.filename)
    context = await create_context(responses, local_time)
    template.render(context)
    new_path = (template_path + str(premises_id) + '/generated_documents/' +
                f"{context['year']}-{context['month']}-{context['day']} - {context['time']}"
                + '.docx')
    template.save(new_path)
    loop = asyncio.get_event_loop()
    loop.call_later(10, delete_old_letters, new_path)
    return new_path
