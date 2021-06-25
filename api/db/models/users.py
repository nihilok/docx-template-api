import os

from passlib.context import CryptContext
from tortoise import fields, Tortoise
from tortoise.models import Model
from tortoise.contrib.pydantic import pydantic_model_creator
from ...document_automation.constants import template_path

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class Premises(Model):
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=100)

    async def save(self, **kwargs):
        if not os.path.exists(template_path + str(self.id)):
            os.makedirs(template_path + str(self.id))
        await super().save(**kwargs)


class User(Model):
    id = fields.IntField(pk=True)
    name = fields.CharField(100, unique=True)
    password_hash = fields.CharField(128)
    premises = fields.ForeignKeyField('models.Premises', related_name='users')

    class Meta:
        unique_together = ('name', 'premises_id')

    @classmethod
    async def get_user(cls, name, **kwargs):
        return cls.get(name=name)

    def verify_password(self, password):
        return pwd_context.verify(password, self.password_hash)


Tortoise.init_models(["api.db.models.users", "api.db.models.letter_templates"], "models")

PremisesPydantic = pydantic_model_creator(Premises, name='Premises')
PremisesPydanticIn = pydantic_model_creator(Premises, name='PremisesIn', exclude_readonly=True)

UserPydantic = pydantic_model_creator(User, name='User')
UserPydanticIn = pydantic_model_creator(User, name='UserIn', exclude_readonly=True)
