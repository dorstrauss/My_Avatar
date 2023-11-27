FROM python:3.11

ENV PYTHONUNBUFFERED 1

WORKDIR /app

COPY . /app/

RUN pip install poetry

RUN poetry install

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

