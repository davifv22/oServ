"""empty message

Revision ID: cf9f6b85180a
Revises: d3da68d80073
Create Date: 2024-03-18 21:27:02.047806

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'cf9f6b85180a'
down_revision = 'd3da68d80073'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('empresa', schema=None) as batch_op:
        batch_op.add_column(sa.Column('cidade', sa.String(length=50), nullable=False))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('empresa', schema=None) as batch_op:
        batch_op.drop_column('cidade')

    # ### end Alembic commands ###