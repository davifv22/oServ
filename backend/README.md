# Backend - FastAPI

**Install init:**
pip install fastapi[standard]

**Init app:**

uvicorn src.main:app --reload

**Bancos:**

alembic init bancos/migrations

alembic revision --autogenerate -m "Add initial tables"

alembic upgrade head

**Reset libs:**

pip freeze > requirementstmp.txt

pip uninstall -r requirementstmp.txt -y
