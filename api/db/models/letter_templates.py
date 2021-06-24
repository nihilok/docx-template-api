import pickle
from typing import Union, Optional, Any

from fastapi import UploadFile, File
from pydantic import BaseModel
from tortoise import fields, Tortoise
from tortoise.models import Model
from tortoise.contrib.pydantic import pydantic_model_creator

from api.document_automation.constants import template_path


class LetterVariable(BaseModel):
    var_name: str
    var_prompt: Optional[str] = None


class VariablesOut(BaseModel):
    letter_id: int
    variables: list[LetterVariable]


class VariablesIn(BaseModel):
    letter_id: int
    variables: list[LetterVariable]


class ResponseIn(BaseModel):
    var_name: str
    var_prompt: Optional[str] = None
    response: str


class ResponsesIn(BaseModel):
    responses: list[ResponseIn]


class Letter(Model):
    id = fields.IntField(pk=True)
    name = fields.CharField(100)
    filename = fields.CharField(128, null=True)
    template_file = fields.BinaryField(null=True)
    variables = fields.BinaryField(null=True)
    premises = fields.ForeignKeyField('models.Premises', related_name='letters')

    class Meta:
        unique_together = ('name', 'premises_id')

    async def add_variables(self, variables: VariablesIn):
        var_list = pickle.loads(self.variables) if self.variables else []
        var_list += variables.variables
        print(var_list)
        self.variables = pickle.dumps(var_list)
        await self.save()

    async def add_binary(self, file: UploadFile = File(...)):
        self.template_file = pickle.dumps(file)
        self.filename = self.template_path + self.name + '.docx'
        await self.save()
        with open(self.filename, 'wb') as f:
            f.write(file.file.read())

    @property
    def template_path(self):
        return template_path + str(self.premises_id) + '/'


LetterPydantic = pydantic_model_creator(Letter, name='Letter', exclude=("template_file", "variables"))
LetterPydanticIn = pydantic_model_creator(Letter, name='LetterIn', exclude_readonly=True)
